/**
 * WebGuard AI — Hybrid Risk Signal Combiner + Analyze Route (Step 4)
 * backend/routes/analyzeRoutes.js
 *
 * 7-stage pipeline:
 *   1. Validate & sanitize input
 *   2. Extract structural/lexical features (urlAnalyzer)
 *   3. Local rule-based risk scoring (riskEngine) — 60% weight
 *   4. Threat intelligence lookup (threatIntelligence) — 25% weight cap
 *   5. ML feature-based prediction (mlRiskEngine) — 15% weight cap
 *   6. combineRiskSignals() → final hybrid score [0–100]
 *   7. Generate human-readable explanation (explanationEngine)
 *
 * ─── HYBRID WEIGHTING ───────────────────────────────────────────────────────
 *   Local URL analysis:        up to 60 pts  (primary signal)
 *   Threat intelligence:       up to 25 pts  (TI score contribution, capped)
 *   ML feature prediction:     up to 15 pts  (ml scoreContribution, capped)
 *
 * Special rule: if TI confirms "knownMalicious", final score → at least 80.
 * Final score is always clamped to [0, 100].
 */

import express from 'express';
import { validateUrl }             from '../utils/urlValidation.js';
import { extractFeatures }         from '../services/urlAnalyzer.js';
import { calculateRisk }           from '../services/riskEngine.js';
import { checkThreatIntelligence } from '../services/threatIntelligence.js';
import { predictRisk }             from '../services/mlRiskEngine.js';
import { generateExplanation }     from '../services/explanationEngine.js';

const router = express.Router();

// ─── Recommendations per risk tier ────────────────────────────────────────────
const RECS = {
  HIGH: [
    'Do NOT click or visit this URL.',
    'Report this link to your IT security team or email provider.',
    'If received in an email, mark it as phishing.',
    'Never enter credentials, payment info, or personal data on this page.',
    'Alert others in your organization if the URL was shared internally.'
  ],
  SUSPICIOUS: [
    'Treat this URL with caution — it shows suspicious patterns.',
    'Verify the link directly with the supposed sender through a trusted channel.',
    'Do not enter credentials or sensitive information.',
    'Consider checking the URL on VirusTotal before visiting.'
  ],
  LOW: [
    'This URL appears safe based on structural analysis.',
    'Always verify you are on the intended website before entering any credentials.',
    'Keep your browser and security software up to date.'
  ]
};

/**
 * Combine local, TI, and ML risk signals into a final 0–100 score.
 *
 * @param {number} localScore       - from riskEngine (0–100)
 * @param {object} threatIntel      - from checkThreatIntelligence
 * @param {object} mlPrediction     - from predictRisk
 * @returns {{ finalScore, breakdown }}
 */
function combineRiskSignals(localScore, threatIntel, mlPrediction) {
  const tiAvailable = !!threatIntel?.available;

  // ── Local score (primary) ────────────────────────────────────────────────
  // When TI is active, local is weighted to 60 pts leaving 25 pts for TI.
  // When TI is unavailable (offline / local mode), local analysis represents
  // the full baseline (1.0 weight) so calibrated rules preserve their exact tier.
  const localWeight = tiAvailable ? 0.60 : 1.0;
  const localContribution = Math.round(localScore * localWeight);

  // ── TI contribution (capped at 25 pts) ───────────────────────────────────
  const tiRaw          = threatIntel?.scoreContribution || 0;
  const tiContribution = tiAvailable ? Math.min(25, tiRaw) : 0;

  // ── ML contribution (capped at 15 pts) ───────────────────────────────────
  const mlRaw          = mlPrediction?.scoreContribution || 0;
  const mlContribution = Math.min(15, mlRaw);

  let rawCombined = tiAvailable
    ? localContribution + tiContribution + mlContribution
    : Math.min(100, localContribution + mlContribution);

  // ── Special override: confirmed malicious → floor at 80 ──────────────────
  if (threatIntel?.knownMalicious) {
    rawCombined = Math.max(rawCombined, 80);
  }

  const finalScore = Math.max(0, Math.min(100, rawCombined));

  return {
    finalScore,
    breakdown: {
      localContribution,
      tiContribution,
      mlContribution,
      rawBeforeClamp: rawCombined
    }
  };
}

// ─── GET /api/health ──────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  const vtConfigured = !!process.env.VIRUSTOTAL_API_KEY?.trim();
  const gsbConfigured = !!process.env.GOOGLE_SAFE_BROWSING_API_KEY?.trim();
  const tiConfigured = vtConfigured || gsbConfigured;

  res.json({
    success     : true,
    status      : 'ok',
    service     : 'WebGuard AI',
    version     : '6.0.0',
    readiness   : {
      backend           : 'connected',
      threatIntelligence: tiConfigured ? 'configured' : 'unavailable',
      localAnalysis     : 'available',
      mlPredictor       : 'available'
    },
    analysisMode: tiConfigured ? 'full' : 'local',
    tiConfigured,
    mlAvailable : true,      // feature-based predictor always available
    timestamp   : new Date().toISOString()
  });
});

// ─── POST /api/analyze ────────────────────────────────────────────────────────
router.post('/analyze', async (req, res) => {
  try {
    // ── Pre-flight body validation ──────────────────────────────────────────
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request payload format.'
      });
    }

    const { url } = req.body;

    // ── Stage 1: Validate & Sanitize ────────────────────────────────────────
    const validation = validateUrl(url);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    // ── Stage 2: Feature extraction ────────────────────────────────────────
    const features = extractFeatures(validation.url, validation.parsed);

    // ── Stage 3: Local risk scoring ────────────────────────────────────────
    const localRisk = calculateRisk(features);

    // ── Stage 4: Threat intelligence (non-blocking) ────────────────────────
    let threatIntel;
    try {
      threatIntel = await checkThreatIntelligence(validation.url, features.hostname);
    } catch {
      threatIntel = {
        available: false, provider: null,
        knownMalicious: false, suspicious: false,
        detections: 0, totalEngines: null,
        message: 'Threat intelligence service is temporarily unavailable.',
        scoreContribution: 0
      };
    }

    // ── Stage 5: ML feature-based prediction (non-blocking) ───────────────
    let mlPrediction;
    try {
      mlPrediction = predictRisk(features);
    } catch {
      mlPrediction = {
        available: false, modelType: 'feature-based-risk-model',
        prediction: null, confidence: null,
        confidenceScore: null, scoreContribution: 0, featureMap: {},
        note: 'ML prediction unavailable — falling back to local engine.'
      };
    }

    // ── Stage 6: Hybrid score combination ─────────────────────────────────
    const { finalScore, breakdown } = combineRiskSignals(
      localRisk.score, threatIntel, mlPrediction
    );

    let riskLevel, riskBadgeColor;
    if      (finalScore >= 71) { riskLevel = 'HIGH';       riskBadgeColor = '#ef4444'; }
    else if (finalScore >= 31) { riskLevel = 'SUSPICIOUS'; riskBadgeColor = '#f59e0b'; }
    else                       { riskLevel = 'LOW';        riskBadgeColor = '#22c55e'; }

    // ── Stage 7: Explanation ───────────────────────────────────────────────
    const explanation = generateExplanation({
      score          : finalScore,
      riskLevel,
      indicators     : localRisk.indicators,
      threatIntel,
      mlPrediction,
      features,
      scoreBreakdown : {
        localAnalysis     : breakdown.localContribution,
        threatIntelligence: breakdown.tiContribution,
        mlPrediction      : breakdown.mlContribution,
        total             : finalScore
      }
    });

    // ── Response ───────────────────────────────────────────────────────────
    return res.json({
      success        : true,
      url            : validation.url,
      normalizedUrl  : validation.normalized,

      score          : finalScore,
      riskLevel,
      riskBadgeColor,

      indicators     : localRisk.indicators,
      indicatorCount : localRisk.indicators.length,

      // Step 4: features block (for UI visualization)
      features: {
        urlLength             : features.urlLength,
        hostnameLength        : features.hostnameLength,
        subdomainCount        : features.subdomainCount,
        usesIpAddress         : features.usesIpAddress,
        isHttps               : features.isHttps,
        hasAtSymbol           : features.hasAtSymbol,
        hasPunycode           : features.hasPunycode,
        isShortenedUrl        : features.isShortenedUrl,
        suspiciousKeywordCount: features.suspiciousKeywords?.length || 0,
        specialCharCount      : features.specialCharCount,
        suspiciousPort        : features.suspiciousPort,
        hyphenCount           : features.hyphenCount,
        isHighRiskTld         : features.isHighRiskTld,
        brandImpersonation    : features.brandImpersonation
      },

      // Explanation
      explanation    : explanation.summary,
      whyThisScore   : explanation.whyThisScore,
      keyFindings    : explanation.keyFindings,
      keyFactors     : explanation.keyFindings,
      recommendation : explanation.recommendation,
      recommendations: RECS[riskLevel],

      // Threat intelligence
      threatIntelligence: {
        available        : threatIntel.available,
        provider         : threatIntel.provider,
        knownMalicious   : threatIntel.knownMalicious,
        suspicious       : threatIntel.suspicious,
        detections       : threatIntel.detections,
        totalEngines     : threatIntel.totalEngines ?? null,
        message          : threatIntel.message,
        scoreContribution: threatIntel.scoreContribution ?? 0
      },

      // Step 4: ML prediction block
      mlPrediction: {
        available    : mlPrediction.available,
        modelType    : mlPrediction.modelType,
        modelLabel   : mlPrediction.modelLabel,
        prediction   : mlPrediction.prediction,
        confidence   : mlPrediction.confidence,
        // confidenceScore intentionally NOT exposed — avoids misleading "87% probability" claims
        featureMap   : mlPrediction.featureMap,
        note         : mlPrediction.note
      },

      // Hybrid score breakdown (for UI signal visualization)
      scoreBreakdown: {
        localAnalysis     : breakdown.localContribution,
        threatIntelligence: breakdown.tiContribution,
        mlPrediction      : breakdown.mlContribution,
        total             : finalScore
      },

      // Technical details
      details: {
        protocol              : features.protocol,
        hostname              : features.hostname,
        apexDomain            : features.apexDomain,
        hasHttps              : features.isHttps,
        usesIpAddress         : features.usesIpAddress,
        subdomainCount        : features.subdomainCount,
        isShortenedUrl        : features.isShortenedUrl,
        urlLength             : features.urlLength,
        brandImpersonation    : features.brandImpersonation,
        suspiciousKeywordsFound: features.suspiciousKeywords
      },

      analysisMode: threatIntel.available ? 'full' : 'local',
      analyzedAt  : new Date().toISOString()
    });

  } catch (err) {
    console.error('[WebGuard Internal /api/analyze error]:', err.message);
    return res.status(500).json({
      success: false,
      error  : 'Analysis could not be completed. Please try again.'
    });
  }
});

export default router;
