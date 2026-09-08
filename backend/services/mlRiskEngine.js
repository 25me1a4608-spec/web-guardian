/**
 * WebGuard AI — ML Risk Engine
 * backend/services/mlRiskEngine.js
 *
 * ─── HONEST LABELING ────────────────────────────────────────────────────────
 * The current implementation is a "feature-based risk predictor" — a
 * deterministic weighted model built from the normalized feature vector.
 * It is NOT a trained machine-learning model and does NOT claim to be one.
 *
 * Labels used: "Feature-based prediction" / "ML-ready prediction"
 *
 * When a real trained model is available, replace the `_featureBasedPredict`
 * function body with calls to the model (ONNX, Python microservice, etc.)
 * while keeping the `predictRisk(features)` interface unchanged.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Output contract:
 * {
 *   available       : boolean
 *   modelType       : string
 *   prediction      : 'LOW' | 'MEDIUM' | 'HIGH'
 *   confidence      : 'LOW' | 'MEDIUM' | 'HIGH'   ← verbal, not a fake % prob
 *   confidenceScore : number  (0–1, internal only, not shown as "probability")
 *   scoreContribution: number  (0–35, added to hybrid score)
 *   featureMap      : object  (for UI/debug display)
 *   note            : string
 * }
 */

import { buildFeatureVector, FEATURE_NAMES } from './featureVector.js';

// ─── Feature weights (hand-tuned, NOT from training data) ────────────────────
// Positive = suspicious. Negative = safe signal. All weights are transparent.
// Order matches FEATURE_NAMES in featureVector.js.
const WEIGHTS = [
  0.30,   //  0  urlLength            (longer = more suspicious)
  0.25,   //  1  hostnameLength
  0.08,   //  2  pathLength
  0.05,   //  3  queryLength
  0.45,   //  4  subdomainCount
 -0.35,   //  5  isHttps              (HTTPS = safe signal, negative weight)
  0.90,   //  6  usesIpAddress
  0.85,   //  7  hasAtSymbol
  0.80,   //  8  hasPunycode
  0.50,   //  9  isShortenedUrl
  0.60,   // 10  suspiciousKeywordCount
  0.20,   // 11  specialCharCount
  0.75,   // 12  suspiciousPort
  0.30,   // 13  digitRatio
  0.20,   // 14  hyphenCount
  0.45,   // 15  isHighRiskTld
  1.00,   // 16  hasBrandImpersonation  (strongest signal)
  0.15    // 17  hasDoubleSlashPath
];

// Bias term — shifts the raw score so "no signals" → 0 raw score
const BIAS = -0.05;

// Thresholds for prediction label (on raw weighted sum)
const HIGH_THRESH   = 0.50;
const MEDIUM_THRESH = 0.20;

/**
 * Internal feature-based predictor.
 * Replace this function body to plug in a real trained model.
 *
 * @param {number[]} vector - normalized 18-element feature vector
 * @returns {{ rawScore: number, prediction: string, confidence: string, confidenceScore: number }}
 */
function _featureBasedPredict(vector) {
  // Weighted dot product + bias
  let rawScore = BIAS;
  for (let i = 0; i < vector.length; i++) {
    rawScore += vector[i] * (WEIGHTS[i] || 0);
  }

  // Clamp to [0, 1]
  const cs = Math.max(0, Math.min(1, rawScore));

  let prediction, confidence;

  if (cs >= HIGH_THRESH) {
    prediction = 'HIGH';
    confidence = cs >= 0.75 ? 'HIGH' : 'MEDIUM';
  } else if (cs >= MEDIUM_THRESH) {
    prediction = 'MEDIUM';
    confidence = cs >= 0.35 ? 'MEDIUM' : 'LOW';
  } else {
    prediction = 'LOW';
    confidence = 'LOW';
  }

  return { rawScore: cs, prediction, confidence, confidenceScore: cs };
}

/**
 * Public entry point — designed to be replaced by a real model.
 * Called by analyzeRoutes.js as part of the hybrid scoring pipeline.
 *
 * @param {object} features - Full feature object from extractFeatures()
 * @returns {object}        - ML prediction result block
 */
export function predictRisk(features) {
  try {
    const { vector, featureMap } = buildFeatureVector(features);
    const { rawScore, prediction, confidence, confidenceScore } = _featureBasedPredict(vector);

    // Score contribution to the hybrid final score (max 35 pts)
    // Only HIGH prediction contributes substantially; LOW contributes nothing.
    let scoreContribution = 0;
    if      (prediction === 'HIGH')   scoreContribution = Math.round(confidenceScore * 35);
    else if (prediction === 'MEDIUM') scoreContribution = Math.round(confidenceScore * 15);

    return {
      available        : true,
      modelType        : 'feature-based-risk-model',
      modelLabel       : 'ML-Ready Feature-Based Prediction',
      prediction,
      confidence,
      confidenceScore  : +confidenceScore.toFixed(3),
      scoreContribution,
      featureMap,
      note             : 'This prediction uses a hand-weighted feature model. It is NOT a trained ML model. No training data, accuracy, or precision metrics are claimed.'
    };

  } catch (err) {
    console.error('[mlRiskEngine] predictRisk failed:', err.message);
    // Never crash the pipeline
    return {
      available        : false,
      modelType        : 'feature-based-risk-model',
      modelLabel       : 'ML-Ready Feature-Based Prediction',
      prediction       : null,
      confidence       : null,
      confidenceScore  : null,
      scoreContribution: 0,
      featureMap       : {},
      note             : 'ML prediction layer encountered an error — falling back to local risk engine only.'
    };
  }
}
