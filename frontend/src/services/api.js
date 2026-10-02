/**
 * WebGuard AI — Frontend API Service
 * frontend/src/services/api.js
 *
 * Step 9: Hardened Client-Side Communication & Resilient Error Handling
 *
 * Capabilities:
 *  - Communicates with backend /api/health and /api/analyze
 *  - Distinguishes between network outages vs valid HTTP error responses (400, 413, 429, 500)
 *  - Never masks server validation errors with heuristic client fallbacks
 *  - Fully validates protocols in offline fallback mode
 */

// Configurable API Base URL for local development and production deployments.
// In production, configure VITE_API_BASE_URL (e.g. in Vercel/Netlify dashboard).
const BACKEND_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : 'https://web-guardian-seven.vercel.app'
).replace(/\/+$/, '');

const FORBIDDEN_SCHEMES = [
  'javascript:',
  'data:',
  'file:',
  'ftp:',
  'chrome:',
  'chrome-extension:',
  'about:',
  'blob:',
  'vbscript:',
  'ws:',
  'wss:',
  'tel:',
  'mailto:'
];

/**
 * Check backend health & readiness state.
 * @returns {Promise<{ online: boolean, tiConfigured: boolean, analysisMode: string, readiness?: object }>}
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      method : 'GET',
      signal : AbortSignal.timeout(4000)
    });
    if (!res.ok) {
      return { online: false, tiConfigured: false, analysisMode: 'local' };
    }
    const data = await res.json();
    const isOnline = data.success === true && (data.status === 'ok' || data.status === 'healthy');
    return {
      online       : isOnline,
      tiConfigured : !!data.tiConfigured,
      analysisMode : data.analysisMode || 'local',
      readiness    : data.readiness || {
        backend           : isOnline ? 'connected' : 'disconnected',
        threatIntelligence: data.tiConfigured ? 'configured' : 'unavailable',
        localAnalysis     : 'available'
      }
    };
  } catch {
    return {
      online       : false,
      tiConfigured : false,
      analysisMode : 'local',
      readiness    : {
        backend           : 'disconnected',
        threatIntelligence: 'unavailable',
        localAnalysis     : 'available'
      }
    };
  }
}

/**
 * Submit a URL for security analysis.
 * Handles HTTP 400, 413, 429, 500 error responses properly.
 * Only falls back to client heuristics when backend is completely unreachable over the network.
 *
 * @param {string} url - Target URL to analyze
 * @returns {Promise<object>}
 */
export async function analyzeUrl(url) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/analyze`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ url }),
      signal : AbortSignal.timeout(15000)
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: 'Invalid response from security server.' };
    }

    // Explicit HTTP error handling
    if (!res.ok) {
      const errorMsg = data.error || (
        res.status === 429
          ? 'Too many requests. Please try again later.'
          : res.status === 413
          ? 'URL or payload exceeds size limit.'
          : res.status === 400
          ? 'Invalid URL or unsupported protocol.'
          : 'Analysis could not be completed.'
      );

      return {
        success: false,
        error: errorMsg,
        status: res.status
      };
    }

    return data;

  } catch (err) {
    // Distinguish abort timeout from offline
    if (err.name === 'TimeoutError') {
      return {
        success: false,
        error: 'Analysis timed out. Please try again.'
      };
    }

    console.warn('[WebGuard] Backend unreachable, running safe client-side fallback:', err.message);
    return runClientFallback(url);
  }
}

/**
 * Client-side fallback heuristic analysis (only used when backend server is offline).
 * Implements strict scheme filtering so malformed or dangerous protocols are never treated as valid.
 */
function runClientFallback(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { success: false, error: 'Please enter a URL to analyze.' };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { success: false, error: 'Please enter a URL to analyze.' };
  }

  if (trimmed.length > 2048) {
    return { success: false, error: 'URL is too long (maximum 2048 characters).' };
  }

  const lower = trimmed.toLowerCase();
  for (const scheme of FORBIDDEN_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return { success: false, error: 'Invalid protocol. Only HTTP and HTTPS URLs are supported.' };
    }
  }

  const schemeMatch = lower.match(/^([a-z0-9+.-]+):/i);
  if (schemeMatch && schemeMatch[1].toLowerCase() !== 'http' && schemeMatch[1].toLowerCase() !== 'https') {
    return { success: false, error: 'Invalid protocol. Only HTTP and HTTPS URLs are supported.' };
  }

  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    if (normalized.includes('://')) {
      return { success: false, error: 'Please enter a valid HTTP or HTTPS URL.' };
    }
    normalized = 'http://' + normalized;
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return { success: false, error: 'Please enter a valid HTTP or HTTPS URL.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { success: false, error: 'Invalid protocol. Only HTTP and HTTPS URLs are supported.' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || /\s/.test(hostname)) {
    return { success: false, error: 'The URL does not contain a valid hostname.' };
  }

  const isIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6 = hostname.startsWith('[') && hostname.endsWith(']');
  const isLocalhost = hostname === 'localhost';
  const hasDot = hostname.includes('.');

  if (!isIpv4 && !isIpv6 && !isLocalhost && !hasDot) {
    return { success: false, error: 'The URL does not contain a valid top-level domain or hostname.' };
  }

  const full = (hostname + parsed.pathname + parsed.search).toLowerCase();
  const indicators = [];
  let score = 0;

  const add = (id, name, description, severity, points) => {
    indicators.push({ id, name, description, severity, points });
    score += points;
  };

  // 1. Protocol check
  if (parsed.protocol !== 'https:') {
    add('NO_HTTPS', 'No HTTPS Encryption', 'URL uses unencrypted HTTP protocol.', 'high', 18);
  }

  // 2. IP address host
  if (isIpv4) {
    add('IP_HOST', 'Direct IP Address Host', 'Connects directly to an IP address instead of a domain name.', 'high', 25);
  }

  // 3. Suspicious keywords
  const KW = ['login', 'verify', 'account', 'secure', 'password', 'update', 'bank', 'payment', 'confirm', 'signin'];
  const hits = KW.filter(k => new RegExp(`(^|[-_./?&=])${k}([-_./?&=]|$)`, 'i').test(full));
  if (hits.length >= 3) {
    add('KEYWORDS_MULTI', 'Multiple Phishing Keywords', `Contains keywords: ${hits.slice(0, 4).join(', ')}.`, 'high', 22);
  } else if (hits.length >= 1) {
    add('KEYWORD_FOUND', 'Credential Keyword', `Contains sensitive keyword: "${hits[0]}".`, 'medium', 12);
  }

  // 4. Brand impersonation
  const BRANDS = ['paypal', 'apple', 'microsoft', 'amazon', 'netflix', 'google', 'chase'];
  const SAFE   = {
    paypal: 'paypal.com',
    apple: 'apple.com',
    microsoft: 'microsoft.com',
    amazon: 'amazon.com',
    netflix: 'netflix.com',
    google: 'google.com',
    chase: 'chase.com'
  };

  for (const b of BRANDS) {
    if (hostname.includes(b) && !hostname.endsWith(SAFE[b])) {
      add('BRAND_SPOOF', `Brand Lookalike (${b})`, `Hostname mimics "${b}" but is not an official domain.`, 'critical', 30);
      break;
    }
  }

  // 5. Length checks
  if (trimmed.length > 100) {
    add('LONG_URL', 'Unusually Long URL', `URL length is ${trimmed.length} characters.`, 'medium', 15);
  } else if (trimmed.length > 75) {
    add('MODERATE_LENGTH', 'Long URL', `URL length is ${trimmed.length} characters.`, 'low', 8);
  }

  const bounded = Math.max(0, Math.min(100, score));
  let riskLevel, riskBadgeColor;
  if (bounded >= 71) {
    riskLevel = 'HIGH';
    riskBadgeColor = '#ef4444';
  } else if (bounded >= 31) {
    riskLevel = 'SUSPICIOUS';
    riskBadgeColor = '#f59e0b';
  } else {
    riskLevel = 'LOW';
    riskBadgeColor = '#22c55e';
  }

  const tiUnavailable = {
    available    : false,
    provider     : null,
    knownMalicious: false,
    suspicious   : false,
    detections   : 0,
    totalEngines : null,
    message      : 'Threat intelligence service is temporarily unavailable.'
  };

  const RECS = {
    HIGH      : ['Do NOT visit this URL or enter credentials.', 'Report the link to your security administrator.'],
    SUSPICIOUS: ['Exercise caution. Verify the sender through a trusted alternative channel.', 'Avoid entering passwords.'],
    LOW       : ['Appears safe based on local structural analysis.', 'Always verify before entering credentials.']
  };

  const explanation = indicators.length > 0
    ? `This URL contains indicators associated with ${riskLevel.toLowerCase()} risk activity (score: ${bounded}/100). Local analysis only — based on available security signals.`
    : `No major suspicious indicators detected in this URL's structure (score: ${bounded}/100). Local analysis only.`;

  return {
    success            : true,
    url                : trimmed,
    normalizedUrl      : normalized,
    score              : bounded,
    riskLevel,
    riskBadgeColor,
    indicators,
    indicatorCount     : indicators.length,
    explanation,
    whyThisScore       : 'Score is based on local structural analysis only.',
    keyFindings        : indicators.map(i => i.description),
    keyFactors         : indicators.map(i => i.description),
    recommendation     : RECS[riskLevel][0],
    recommendations    : RECS[riskLevel],
    threatIntelligence : tiUnavailable,
    mlPrediction       : {
      available : true,
      modelType : 'feature-based-risk-model',
      prediction: riskLevel,
      confidence: 'MEDIUM',
      note      : 'Feature-based heuristic predictor (local mode).'
    },
    details: {
      protocol              : parsed.protocol,
      hostname,
      apexDomain            : hostname.split('.').slice(-2).join('.'),
      hasHttps              : parsed.protocol === 'https:',
      usesIpAddress         : isIpv4,
      subdomainCount        : Math.max(0, hostname.split('.').length - 2),
      isShortenedUrl        : false,
      urlLength             : trimmed.length,
      brandImpersonation    : null,
      suspiciousKeywordsFound: hits
    },
    analysisMode : 'local',
    analyzedAt   : new Date().toISOString()
  };
}

/**
 * Perform visual comparison against original website using Puppeteer
 * @param {string} url
 * @param {string|null} [screenshot]
 * @returns {Promise<object|null>}
 */
export async function fetchVisualVerification(url, screenshot = null) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/visual-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, screenshot }),
      signal: AbortSignal.timeout(20000)
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}
