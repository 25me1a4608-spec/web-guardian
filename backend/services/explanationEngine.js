/**
 * WebGuard AI — Explanation Engine (Step 4)
 * backend/services/explanationEngine.js
 *
 * Generates structured, human-readable explanations from the full
 * hybrid analysis result (local indicators + TI + ML prediction).
 *
 * Design principles (per spec):
 *  - Never claim certainty: use "appears", "contains indicators", etc.
 *  - Never fabricate ML stats: use "feature-based prediction" not "AI confirmed"
 *  - Never say "100% safe" or "100% phishing"
 *  - The generateExplanation() interface is the plug-in point for a future AI API.
 */

const RECOMMENDATIONS = {
  HIGH      : 'Do not visit or interact with this URL — it contains indicators strongly associated with phishing. Report it if it was sent to you.',
  SUSPICIOUS: 'Exercise caution — verify this URL through a trusted channel before entering any credentials or personal data.',
  LOW       : 'This URL appears safe based on structural and feature analysis. Always confirm you are on the intended website before providing sensitive information.'
};

// ─── Summary builder ─────────────────────────────────────────────────────────
function buildSummary(score, riskLevel, indicators, threatIntel, mlPrediction) {
  const hasTiMalicious  = threatIntel?.available  && threatIntel?.knownMalicious;
  const hasTiSuspicious = threatIntel?.available  && threatIntel?.suspicious && !hasTiMalicious;
  const hasMlHigh       = mlPrediction?.available && mlPrediction?.prediction === 'HIGH';
  const hasMlMedium     = mlPrediction?.available && mlPrediction?.prediction === 'MEDIUM';

  const tiPhrase = hasTiMalicious
    ? ' Additionally, this URL was confirmed as known malicious by an external threat intelligence provider.'
    : hasTiSuspicious
    ? ' An external threat intelligence check also flagged this URL as suspicious.'
    : '';

  const mlPhrase = hasMlHigh
    ? ' The feature-based prediction identified a high-risk pattern in the URL characteristics.'
    : hasMlMedium
    ? ' The feature-based prediction flagged a moderate-risk pattern.'
    : '';

  if (riskLevel === 'HIGH') {
    const top = indicators[0]?.description?.toLowerCase() ?? 'multiple high-risk structural signals were detected';
    return `This URL contains indicators strongly associated with phishing or malicious activity (risk score: ${score}/100). `
      + `The primary concern is that it ${top}.${tiPhrase}${mlPhrase} `
      + `Avoid visiting this link.`;
  }

  if (riskLevel === 'SUSPICIOUS') {
    const count = indicators.length;
    return `This URL appears suspicious and warrants caution (risk score: ${score}/100). `
      + `${count} security indicator${count !== 1 ? 's were' : ' was'} detected that may suggest deceptive intent.${tiPhrase}${mlPhrase} `
      + `Verify the link before proceeding.`;
  }

  // LOW
  if (indicators.length === 0 && !hasMlHigh && !hasMlMedium) {
    return `No major suspicious indicators were detected in this URL's structure (risk score: ${score}/100). `
      + `It appears consistent with typical legitimate web addresses. Note that structural analysis alone cannot guarantee content safety.`;
  }

  return `This URL shows no critical risk signals (risk score: ${score}/100). `
    + `${indicators.length > 0 ? `${indicators.length} minor structural note${indicators.length > 1 ? 's were' : ' was'} recorded. ` : ''}`
    + `None rise to a level of significant concern based on available heuristics.`;
}

// ─── "Why this score" builder ─────────────────────────────────────────────────
function buildWhyThisScore(score, indicators, threatIntel, mlPrediction, scoreBreakdown) {
  const parts = [];

  // Local analysis
  if (indicators.length === 0) {
    parts.push('No negative structural, lexical, or protocol indicators were detected by the URL analyzer.');
  } else {
    const high   = indicators.filter(i => i.severity === 'critical' || i.severity === 'high');
    const medium = indicators.filter(i => i.severity === 'medium');
    const low    = indicators.filter(i => i.severity === 'low');
    if (high.length > 0)   parts.push(`${high.length} high-severity structural indicator${high.length > 1 ? 's' : ''} were detected.`);
    if (medium.length > 0) parts.push(`${medium.length} medium-severity finding${medium.length > 1 ? 's' : ''} also raised the score.`);
    if (low.length > 0)    parts.push(`${low.length} low-severity signal${low.length > 1 ? 's' : ''} had a minor contribution.`);
  }

  // ML prediction
  if (mlPrediction?.available) {
    const conf = mlPrediction.confidence ? ` (confidence: ${mlPrediction.confidence})` : '';
    parts.push(`Feature-based prediction: ${mlPrediction.prediction}${conf}. This uses a hand-weighted model — not a trained ML classifier.`);
  } else {
    parts.push('Feature-based prediction was unavailable.');
  }

  // TI
  if (threatIntel?.available) {
    if (threatIntel.knownMalicious) {
      parts.push(`External reputation check (${threatIntel.provider}) confirmed this URL as known malicious — this applied a significant score boost.`);
    } else if (threatIntel.suspicious) {
      parts.push(`External reputation check (${threatIntel.provider}) flagged this URL as suspicious.`);
    } else {
      parts.push(`External reputation check (${threatIntel.provider}) found no known threats.`);
    }
  } else {
    parts.push('Threat intelligence was unavailable — score is based entirely on local structural analysis and feature-based prediction.');
  }

  // Breakdown
  if (scoreBreakdown) {
    parts.push(
      `Hybrid score breakdown — Local analysis: ${scoreBreakdown.localAnalysis} pts, ` +
      `Threat intelligence: ${scoreBreakdown.threatIntelligence} pts, ` +
      `Feature prediction: ${scoreBreakdown.mlPrediction} pts → Total: ${scoreBreakdown.total}/100.`
    );
  }

  return parts.join(' ');
}

// ─── Key findings builder ─────────────────────────────────────────────────────
function buildKeyFindings(indicators, threatIntel, mlPrediction) {
  const findings = [];

  // TI first (highest credibility if available)
  if (threatIntel?.available && (threatIntel.knownMalicious || threatIntel.suspicious)) {
    findings.push(threatIntel.message);
  }

  // High/medium indicator descriptions
  indicators
    .filter(i => i.severity === 'critical' || i.severity === 'high' || i.severity === 'medium')
    .slice(0, 4)
    .forEach(i => findings.push(i.description || i.name));

  // ML prediction finding
  if (mlPrediction?.available && mlPrediction.prediction !== 'LOW') {
    findings.push(`Feature-based prediction flagged this URL as ${mlPrediction.prediction} risk (confidence: ${mlPrediction.confidence}).`);
  }

  if (findings.length === 0) {
    findings.push('No significant risk indicators were detected in the URL structure, threat intelligence, or feature-based analysis.');
  }

  return findings.slice(0, 6);
}

// ─── Public API (pluggable interface) ─────────────────────────────────────────
/**
 * Generate a full structured explanation.
 *
 * This is the single extension point for a future AI API.
 * Replace the body to call OpenAI / Gemini / Anthropic while keeping
 * the same input/output contract.
 *
 * @param {object} analysisData
 * @param {number}   analysisData.score
 * @param {string}   analysisData.riskLevel      'LOW' | 'SUSPICIOUS' | 'HIGH'
 * @param {Array}    analysisData.indicators      from riskEngine
 * @param {object}   analysisData.threatIntel     from threatIntelligence
 * @param {object}   analysisData.mlPrediction    from mlRiskEngine
 * @param {object}   analysisData.features        from urlAnalyzer
 * @param {object}   [analysisData.scoreBreakdown] hybrid score parts
 *
 * @returns {{ summary, whyThisScore, keyFindings, recommendation }}
 */
export function generateExplanation({
  score,
  riskLevel,
  indicators    = [],
  threatIntel   = {},
  mlPrediction  = {},
  features      = {},
  scoreBreakdown = null
}) {
  return {
    summary       : buildSummary(score, riskLevel, indicators, threatIntel, mlPrediction),
    whyThisScore  : buildWhyThisScore(score, indicators, threatIntel, mlPrediction, scoreBreakdown),
    keyFindings   : buildKeyFindings(indicators, threatIntel, mlPrediction),
    recommendation: RECOMMENDATIONS[riskLevel] || RECOMMENDATIONS.LOW
  };
}
