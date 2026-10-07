/**
 * WebGuard AI — Risk Scoring Engine
 * backend/services/riskEngine.js
 *
 * Consumes the feature object produced by urlAnalyzer.js and outputs:
 *  - score        : 0–100  (higher = more dangerous)
 *  - riskLevel    : 'LOW' | 'SUSPICIOUS' | 'HIGH'
 *  - indicators   : weighted list of fired rules with descriptions
 *  - recommendations : actionable strings
 *
 * Every scoring decision is EXPLICIT and TRANSPARENT.
 * No black boxes — each rule has a name, description, and weight.
 */

// ─── Risk thresholds ─────────────────────────────────────────────────────────
const THRESHOLD = {
  HIGH       : 71,   // ≥ 71 → HIGH RISK
  SUSPICIOUS : 31,   // ≥ 31 → SUSPICIOUS
  // < 31           → LOW RISK
};

// ─── Scoring rules ────────────────────────────────────────────────────────────
// Each rule: { id, weight, severity, description }
// severity: 'high' | 'medium' | 'low'  (used in the UI badge)
//
// weight is added to score when the rule fires.
// Negative weight = score bonus (e.g. HTTPS).
const RULES = {
  // ── Protocol ──────────────────────────────────────────────────────────────
  NO_HTTPS: {
    id: 'NO_HTTPS',
    name: 'No HTTPS',
    weight: 18,
    severity: 'high',
    description: 'URL uses unencrypted HTTP — data exchanged is not protected.'
  },
  HTTPS_BONUS: {
    id: 'HTTPS_BONUS',
    name: 'HTTPS Encrypted',
    weight: -5,
    severity: 'low',
    description: 'URL uses HTTPS — connection is encrypted.'
  },

  // ── Verified & Local Development ──────────────────────────────────────────
  LOCAL_DEV: {
    id: 'LOCAL_DEV',
    name: 'Local Development Address',
    weight: 0,
    severity: 'low',
    description: 'Local development address (localhost / loopback) — safe for local development.'
  },
  VERIFIED_DOMAIN: {
    id: 'VERIFIED_DOMAIN',
    name: 'Verified Legitimate Domain',
    weight: 0,
    severity: 'low',
    description: 'Verified legitimate domain matching approved authentic registry.'
  },

  // ── IP Address ─────────────────────────────────────────────────────────────
  IP_ADDRESS: {
    id: 'IP_ADDRESS',
    name: 'IP Address Used',
    weight: 25,
    severity: 'high',
    description: 'URL uses a raw IP address instead of a domain name — common in phishing attacks.'
  },

  // ── URL / Hostname Length ─────────────────────────────────────────────────
  VERY_LONG_URL: {
    id: 'VERY_LONG_URL',
    name: 'Very Long URL',
    weight: 15,
    severity: 'medium',
    description: 'URL is unusually long (>100 chars), which may indicate obfuscation.'
  },
  LONG_URL: {
    id: 'LONG_URL',
    name: 'Long URL',
    weight: 8,
    severity: 'low',
    description: 'URL is longer than typical (>75 chars).'
  },
  LONG_HOSTNAME: {
    id: 'LONG_HOSTNAME',
    name: 'Long Hostname',
    weight: 10,
    severity: 'medium',
    description: 'Hostname is unusually long (>30 chars), often seen in brand-baiting domains.'
  },

  // ── Subdomains ──────────────────────────────────────────────────────────
  MANY_SUBDOMAINS: {
    id: 'MANY_SUBDOMAINS',
    name: 'Excessive Subdomains',
    weight: 20,
    severity: 'high',
    description: 'URL contains 4+ subdomain levels — a strong phishing signal.'
  },
  SOME_SUBDOMAINS: {
    id: 'SOME_SUBDOMAINS',
    name: 'Multiple Subdomains',
    weight: 10,
    severity: 'medium',
    description: 'URL has 3 subdomain levels — moderately suspicious.'
  },

  // ── Suspicious keywords ─────────────────────────────────────────────────
  MANY_KEYWORDS: {
    id: 'MANY_KEYWORDS',
    name: 'Multiple Suspicious Keywords',
    weight: 22,
    severity: 'high',
    description: 'URL contains multiple sensitive keywords (login, verify, bank, etc.).'
  },
  SOME_KEYWORDS: {
    id: 'SOME_KEYWORDS',
    name: 'Suspicious Keyword',
    weight: 12,
    severity: 'medium',
    description: 'URL contains at least one sensitive keyword commonly used in phishing.'
  },

  // ── @ symbol ────────────────────────────────────────────────────────────
  AT_SYMBOL: {
    id: 'AT_SYMBOL',
    name: 'AT Symbol in URL',
    weight: 22,
    severity: 'high',
    description: 'URL contains an "@" symbol — browsers ignore everything before it, masking the real destination.'
  },

  // ── Special characters ──────────────────────────────────────────────────
  MANY_SPECIAL_CHARS: {
    id: 'MANY_SPECIAL_CHARS',
    name: 'Excessive Special Characters',
    weight: 14,
    severity: 'medium',
    description: 'URL contains many unusual special characters — possible obfuscation.'
  },

  // ── Punycode / IDN ──────────────────────────────────────────────────────
  PUNYCODE: {
    id: 'PUNYCODE',
    name: 'Punycode Domain',
    weight: 20,
    severity: 'high',
    description: 'URL contains Punycode (xn--) — may be disguising a look-alike domain in another script.'
  },

  // ── URL shortener ───────────────────────────────────────────────────────
  SHORTENED_URL: {
    id: 'SHORTENED_URL',
    name: 'URL Shortener',
    weight: 15,
    severity: 'medium',
    description: 'URL uses a shortening service — the real destination is hidden.'
  },

  // ── Suspicious port ─────────────────────────────────────────────────────
  SUSPICIOUS_PORT: {
    id: 'SUSPICIOUS_PORT',
    name: 'Non-Standard Port',
    weight: 20,
    severity: 'high',
    description: 'URL uses a non-standard port that is unusual for web traffic.'
  },

  // ── TLD ─────────────────────────────────────────────────────────────────
  HIGH_RISK_TLD: {
    id: 'HIGH_RISK_TLD',
    name: 'High-Risk TLD',
    weight: 12,
    severity: 'medium',
    description: 'URL uses a top-level domain (TLD) frequently associated with phishing and spam.'
  },

  // ── Brand impersonation ─────────────────────────────────────────────────
  BRAND_IMPERSONATION: {
    id: 'BRAND_IMPERSONATION',
    name: 'Brand Impersonation',
    weight: 30,
    severity: 'high',
    description: 'URL appears to impersonate a well-known brand — a hallmark of phishing.'
  },

  // ── Hyphen abuse ─────────────────────────────────────────────────────────
  HYPHEN_ABUSE: {
    id: 'HYPHEN_ABUSE',
    name: 'Excessive Hyphens',
    weight: 8,
    severity: 'low',
    description: 'Domain name contains an unusual number of hyphens (≥3), often used to mimic legitimate brands.'
  },

  // ── Path obfuscation ─────────────────────────────────────────────────────
  DOUBLE_SLASH_PATH: {
    id: 'DOUBLE_SLASH_PATH',
    name: 'Double Slash in Path',
    weight: 8,
    severity: 'low',
    description: 'URL contains double slashes in the path — may be an obfuscation technique.'
  },

  // ── Unusual URL structure ───────────────────────────────────────────────
  UNUSUAL_URL_STRUCTURE: {
    id: 'UNUSUAL_URL_STRUCTURE',
    name: 'Unusual URL Structure',
    weight: 18,
    severity: 'medium',
    description: 'URL path contains chained authentication and verification segments, typical of phishing paths.'
  },

  // ── Free tunnel / temporary hosting abuse ──────────────────────────────
  FREE_TUNNEL_HOST: {
    id: 'FREE_TUNNEL_HOST',
    name: 'Free Tunnel / Temporary Hosting',
    weight: 35,
    severity: 'high',
    description: 'URL is hosted on a free tunnel or temporary hosting platform (e.g. trycloudflare.com, ngrok) — these are heavily abused to serve phishing pages with legitimate-looking HTTPS.'
  }
};

// ─── Recommendations per risk level ──────────────────────────────────────────
const RECS = {
  HIGH: [
    'Do NOT click or visit this URL.',
    'Report this link to your IT security team or email provider.',
    'If you received this in an email, mark it as phishing.',
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
 * Evaluate a feature object and return a full risk assessment.
 *
 * @param {object} features - Output of extractFeatures() from urlAnalyzer.js
 * @returns {{
 *   score: number,
 *   riskLevel: 'LOW'|'SUSPICIOUS'|'HIGH',
 *   riskBadgeColor: string,
 *   indicators: Array<{id, severity, description}>,
 *   recommendations: string[]
 * }}
 */
export function calculateRisk(features) {
  // ── 0. Local Development Handling ─────────────────────────────────────────
  if (features.isLocalDev) {
    return {
      score: 0,
      riskLevel: 'LOW',
      riskBadgeColor: '#22c55e',
      indicators: [
        {
          id: 'LOCAL_DEV',
          name: 'Local Development Address',
          severity: 'low',
          description: 'Local development address (localhost / loopback) — safe for local development and testing.'
        }
      ],
      recommendations: [
        'Local development address — safe for local development and testing.',
        'Keep local debugging configurations restricted to private environments.'
      ]
    };
  }

  // ── 0b. Verified Legitimate Official Domains ──────────────────────────────
  // If an authentic official domain is verified and has no credential-spoofing attacks (like @ symbol or double-slash obfuscation)
  if (features.isTrustedDomain && !features.hasAtSymbol && !features.hasDoubleSlashPath && !features.hasPunycode) {
    return {
      score: 0,
      riskLevel: 'LOW',
      riskBadgeColor: '#22c55e',
      indicators: [
        {
          id: 'VERIFIED_DOMAIN',
          name: 'Verified Legitimate Domain',
          severity: 'low',
          description: `Verified legitimate domain for ${features.trustedBrand || features.trustedDomain || features.hostname}.`
        }
      ],
      recommendations: [
        'Verified official domain — safe to visit.',
        'Always ensure your browser shows a secure connection before submitting credentials.'
      ]
    };
  }

  const fired = [];   // rules that matched
  let   score =  0;

  // ── Helper ────────────────────────────────────────────────────────────────
  const fire = (ruleId) => {
    const rule = RULES[ruleId];
    if (!rule) return;
    score += rule.weight;
    if (rule.weight > 0) {          // only add positive indicators to the list
      fired.push({
        id         : rule.id,
        name       : rule.name,
        severity   : rule.severity,
        description: rule.description
      });
    }
  };

  // ── Protocol ─────────────────────────────────────────────────────────────
  if (!features.isHttps) {
    fire('NO_HTTPS');
  } else {
    fire('HTTPS_BONUS');
  }

  // ── IP address ────────────────────────────────────────────────────────────
  if (features.usesIpAddress) fire('IP_ADDRESS');

  // ── URL Length ────────────────────────────────────────────────────────────
  if      (features.urlLength > 100) fire('VERY_LONG_URL');
  else if (features.urlLength > 75)  fire('LONG_URL');

  // ── Hostname Length ───────────────────────────────────────────────────────
  if (features.longHostname) fire('LONG_HOSTNAME');

  // ── Subdomains ────────────────────────────────────────────────────────────
  if      (features.subdomainCount >= 4) fire('MANY_SUBDOMAINS');
  else if (features.subdomainCount >= 3) fire('SOME_SUBDOMAINS');

  // ── Keywords ──────────────────────────────────────────────────────────────
  if      (features.suspiciousKeywords.length >= 3) fire('MANY_KEYWORDS');
  else if (features.suspiciousKeywords.length >= 1) fire('SOME_KEYWORDS');

  // ── @ symbol ──────────────────────────────────────────────────────────────
  if (features.hasAtSymbol) fire('AT_SYMBOL');

  // ── Special chars ─────────────────────────────────────────────────────────
  if (features.specialCharCount > 8) fire('MANY_SPECIAL_CHARS');

  // ── Punycode ──────────────────────────────────────────────────────────────
  if (features.hasPunycode) fire('PUNYCODE');

  // ── URL shortener ─────────────────────────────────────────────────────────
  if (features.isShortenedUrl) fire('SHORTENED_URL');

  // ── Port ──────────────────────────────────────────────────────────────────
  if (features.suspiciousPort) fire('SUSPICIOUS_PORT');

  // ── TLD ───────────────────────────────────────────────────────────────────
  if (features.isHighRiskTld) fire('HIGH_RISK_TLD');

  // ── Brand impersonation ───────────────────────────────────────────────────
  if (features.brandImpersonation) {
    // Enrich the description with the specific brand
    const rule = { ...RULES.BRAND_IMPERSONATION };
    rule.description = `URL appears to impersonate "${features.brandImpersonation}" — a hallmark of phishing.`;
    score += rule.weight;
    fired.push({ id: rule.id, name: rule.name, severity: rule.severity, description: rule.description });
  }

  // ── Hyphen abuse ──────────────────────────────────────────────────────────
  if (features.hyphenCount >= 3) fire('HYPHEN_ABUSE');

  // ── Double slash in path ──────────────────────────────────────────────────
  if (features.hasDoubleSlashPath) fire('DOUBLE_SLASH_PATH');

  // ── Unusual URL structure ────────────────────────────────────────────────
  if (features.unusualUrlStructure) fire('UNUSUAL_URL_STRUCTURE');

  // ── Free tunnel / temporary hosting abuse ──────────────────────────────
  if (features.freeTunnelHost) {
    // Enrich the description with the specific platform detected
    const rule = { ...RULES.FREE_TUNNEL_HOST };
    rule.description = `URL is hosted on "${features.freeTunnelHost}" — a free tunnel/hosting platform heavily abused for phishing. Exercise extreme caution.`;
    score += rule.weight;
    fired.push({ id: rule.id, name: rule.name, severity: rule.severity, description: rule.description });
  }

  // ── Clamp score to [0, 100] ───────────────────────────────────────────────
  score = Math.max(0, Math.min(100, score));

  // ── Classify ─────────────────────────────────────────────────────────────
  let riskLevel, riskBadgeColor;
  if (score >= THRESHOLD.HIGH) {
    riskLevel      = 'HIGH';
    riskBadgeColor = '#ef4444';   // red-500
  } else if (score >= THRESHOLD.SUSPICIOUS) {
    riskLevel      = 'SUSPICIOUS';
    riskBadgeColor = '#f59e0b';   // amber-500
  } else {
    riskLevel      = 'LOW';
    riskBadgeColor = '#22c55e';   // green-500
  }

  return {
    score,
    riskLevel,
    riskBadgeColor,
    indicators    : fired,
    recommendations: RECS[riskLevel]
  };
}
