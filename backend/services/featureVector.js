/**
 * WebGuard AI — Feature Vector Normalizer
 * backend/services/featureVector.js
 *
 * Converts the raw feature object from urlAnalyzer.js into a normalized
 * numeric vector [0.0 – 1.0] suitable for ML model consumption.
 *
 * Feature ordering is FIXED and documented below.
 * When a real model is trained, it must use the same ordering.
 *
 * ┌─────┬──────────────────────────────┬──────────────────────────────────────┐
 * │ idx │ Feature name                 │ Normalization                        │
 * ├─────┼──────────────────────────────┼──────────────────────────────────────┤
 * │  0  │ urlLength                    │ min-max: 0→0, 200→1.0                │
 * │  1  │ hostnameLength               │ min-max: 0→0, 75→1.0                 │
 * │  2  │ pathLength                   │ min-max: 0→0, 100→1.0                │
 * │  3  │ queryLength                  │ min-max: 0→0, 100→1.0                │
 * │  4  │ subdomainCount               │ min-max: 0→0, 6→1.0                  │
 * │  5  │ isHttps                      │ binary 0/1 (1 = safe)                │
 * │  6  │ usesIpAddress                │ binary 0/1 (1 = suspicious)          │
 * │  7  │ hasAtSymbol                  │ binary 0/1                           │
 * │  8  │ hasPunycode                  │ binary 0/1                           │
 * │  9  │ isShortenedUrl               │ binary 0/1                           │
 * │ 10  │ suspiciousKeywordCount       │ min-max: 0→0, 8→1.0                  │
 * │ 11  │ specialCharCount             │ min-max: 0→0, 20→1.0                 │
 * │ 12  │ suspiciousPort               │ binary 0/1                           │
 * │ 13  │ digitRatio                   │ [0,1] ratio of digits in hostname    │
 * │ 14  │ hyphenCount                  │ min-max: 0→0, 6→1.0                  │
 * │ 15  │ isHighRiskTld                │ binary 0/1                           │
 * │ 16  │ hasBrandImpersonation        │ binary 0/1                           │
 * │ 17  │ hasDoubleSlashPath           │ binary 0/1                           │
 * └─────┴──────────────────────────────┴──────────────────────────────────────┘
 *
 * TOTAL: 18 features
 */

export const FEATURE_NAMES = [
  'urlLength',
  'hostnameLength',
  'pathLength',
  'queryLength',
  'subdomainCount',
  'isHttps',
  'usesIpAddress',
  'hasAtSymbol',
  'hasPunycode',
  'isShortenedUrl',
  'suspiciousKeywordCount',
  'specialCharCount',
  'suspiciousPort',
  'digitRatio',
  'hyphenCount',
  'isHighRiskTld',
  'hasBrandImpersonation',
  'hasDoubleSlashPath'
];

/** Clamp a value between 0 and 1 */
const clamp = (v) => Math.max(0, Math.min(1, v));

/** Min-max normalize: value / maxVal, clamped to [0,1] */
const norm = (value, maxVal) => clamp(value / maxVal);

/** Binary: boolean → 0 or 1 */
const bin = (v) => (v ? 1 : 0);

/**
 * Build a normalized numeric feature vector from the raw feature object.
 *
 * @param {object} features - Output of extractFeatures() from urlAnalyzer.js
 * @returns {{ vector: number[], featureMap: object }}
 *   vector   – 18-element array [0.0–1.0] for model input
 *   featureMap – human-readable key→value mapping (for debug/display)
 */
export function buildFeatureVector(features) {
  const {
    urlLength      = 0,
    hostnameLength = 0,
    pathname       = '/',
    suspiciousKeywords = [],
    specialCharCount   = 0,
    subdomainCount     = 0,
    isHttps            = false,
    usesIpAddress      = false,
    hasAtSymbol        = false,
    hasPunycode        = false,
    isShortenedUrl     = false,
    suspiciousPort     = false,
    hyphenCount        = 0,
    isHighRiskTld      = false,
    brandImpersonation = null,
    hasDoubleSlashPath = false,
    hostname           = ''
  } = features;

  // Derived features
  const pathLength  = (pathname || '/').length;
  const queryLength = (features.search || '').length;
  const digitCount  = (hostname.match(/\d/g) || []).length;
  const digitRatio  = hostname.length > 0 ? digitCount / hostname.length : 0;
  const kwCount     = Array.isArray(suspiciousKeywords) ? suspiciousKeywords.length : 0;

  const vector = [
    norm(urlLength,  200),            // 0
    norm(hostnameLength, 75),         // 1
    norm(pathLength, 100),            // 2
    norm(queryLength, 100),           // 3
    norm(subdomainCount, 6),          // 4
    bin(isHttps),                     // 5
    bin(usesIpAddress),               // 6
    bin(hasAtSymbol),                 // 7
    bin(hasPunycode),                 // 8
    bin(isShortenedUrl),              // 9
    norm(kwCount, 8),                 // 10
    norm(specialCharCount, 20),       // 11
    bin(suspiciousPort),              // 12
    clamp(digitRatio),                // 13
    norm(hyphenCount, 6),             // 14
    bin(isHighRiskTld),               // 15
    bin(!!brandImpersonation),        // 16
    bin(hasDoubleSlashPath)           // 17
  ];

  // Human-readable map (useful for UI and debugging)
  const featureMap = Object.fromEntries(
    FEATURE_NAMES.map((name, i) => [name, +vector[i].toFixed(4)])
  );

  return { vector, featureMap };
}
