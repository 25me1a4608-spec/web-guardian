/**
 * WebGuard AI — URL Feature Extractor
 * backend/services/urlAnalyzer.js
 *
 * Accepts a raw URL string + its pre-parsed URL object.
 * Returns a structured feature object used by the Risk Engine.
 *
 * SECURITY: This module NEVER fetches, renders, visits, or executes the URL.
 *           All analysis is purely text / lexical.
 */

// ─── Configurable suspicious-keyword list ────────────────────────────────────
// A match here contributes points — it does NOT alone prove phishing.
export const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'sign-in',
  'verify', 'verification',
  'account', 'accounts',
  'secure', 'security',
  'password', 'passwd',
  'update',
  'confirm',
  'bank', 'banking',
  'payment', 'pay',
  'wallet',
  'invoice',
  'support',
  'recover', 'recovery',
  'authenticate', 'auth',
  'credential'
];

// ─── Known URL-shortening services ───────────────────────────────────────────
const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd',
  'buff.ly', 'adf.ly', 'bit.do', 'rb.gy', 'shorte.st', 'cutt.ly',
  'trib.al', 'qr.ae', 't.ly', 'short.io'
]);

// ─── Ports that are non-standard for web traffic ─────────────────────────────
const SUSPICIOUS_PORTS = new Set([
  21, 22, 23, 25, 110, 143, 161, 389, 445, 1080, 3306, 3389,
  4444, 5900, 6379, 8080, 8443, 9200
]);

// ─── Regex: IPv4 ──────────────────────────────────────────────────────────────
const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

/**
 * Extract all security-relevant features from a URL.
 *
 * @param {string} rawUrl  - Original URL string as submitted
 * @param {URL}    parsed  - Pre-parsed URL object (from urlValidation.js)
 * @returns {object}       - Feature object consumed by riskEngine.js
 */
export function extractFeatures(rawUrl, parsed) {
  const hostname   = parsed.hostname.toLowerCase();
  const pathname   = parsed.pathname || '/';
  const search     = parsed.search   || '';
  const port       = parsed.port;    // empty string if not specified
  const protocol   = parsed.protocol;

  // ── 1. HTTPS ────────────────────────────────────────────────────────────────
  const isHttps = protocol === 'https:';

  // ── 2. IP address as hostname ───────────────────────────────────────────────
  const usesIpAddress = IPV4_RE.test(hostname);

  // ── 3. Lengths ──────────────────────────────────────────────────────────────
  const urlLength      = rawUrl.length;
  const hostnameLength = hostname.length;

  // ── 4. Subdomains ───────────────────────────────────────────────────────────
  // Strip the apex domain (last two labels) and count what remains.
  const labels = hostname.split('.').filter(Boolean);
  const subdomainCount = usesIpAddress ? 0 : Math.max(0, labels.length - 2);

  // ── 5. @ symbol in URL (credential-spoofing trick) ─────────────────────────
  const hasAtSymbol = rawUrl.includes('@');

  // ── 6. Punycode / IDN ───────────────────────────────────────────────────────
  const hasPunycode = hostname.includes('xn--');

  // ── 7. URL shortener ────────────────────────────────────────────────────────
  const apexDomain     = labels.slice(-2).join('.');
  const isShortenedUrl = SHORTENERS.has(hostname) || SHORTENERS.has(apexDomain);

  // ── 8. Suspicious keywords ──────────────────────────────────────────────────
  const scanTarget = (hostname + pathname + search).toLowerCase();
  const suspiciousKeywords = SUSPICIOUS_KEYWORDS.filter(kw => {
    // Match keyword bounded by common delimiters so "banking" matches "bank"
    // but avoids false positives inside random words.
    const re = new RegExp(`(^|[-_./?&=#/])${kw}([-_./?&=#/]|$)`, 'i');
    return re.test(scanTarget);
  });

  // ── 9. Suspicious port ──────────────────────────────────────────────────────
  const portNum      = port ? parseInt(port, 10) : null;
  const suspiciousPort = portNum !== null && SUSPICIOUS_PORTS.has(portNum);

  // ── 10. Special characters in path+query ───────────────────────────────────
  const specialCharCount = (pathname + search).replace(/[a-z0-9/_.?=&%-]/gi, '').length;

  // ── 11. Double-slash obfuscation in path ────────────────────────────────────
  const hasDoubleSlashPath = pathname.includes('//');

  // ── 12. Hyphen abuse in hostname ────────────────────────────────────────────
  const hyphenCount = (hostname.match(/-/g) || []).length;

  // ── 13. Excessive hostname length (brand-baiting trick) ─────────────────────
  const longHostname = hostnameLength > 30;

  // ── 14. High-risk TLD ──────────────────────────────────────────────────────
  const HIGH_RISK_TLDS = new Set([
    'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'cc', 'buzz',
    'club', 'work', 'click', 'icu', 'rest', 'link', 'monster', 'surf'
  ]);
  const tld            = labels[labels.length - 1] || '';
  const isHighRiskTld  = HIGH_RISK_TLDS.has(tld);

  // ── 15. Brand look-alike detection ─────────────────────────────────────────
  const BRAND_MAP = {
    paypal:    ['paypal.com', 'paypal.me'],
    apple:     ['apple.com', 'icloud.com'],
    google:    ['google.com', 'gmail.com', 'google.co.in'],
    microsoft: ['microsoft.com', 'live.com', 'office.com', 'outlook.com'],
    amazon:    ['amazon.com', 'amazon.in', 'amazon.co.uk'],
    netflix:   ['netflix.com'],
    facebook:  ['facebook.com', 'instagram.com', 'meta.com'],
    chase:     ['chase.com'],
    wellsfargo:['wellsfargo.com'],
    binance:   ['binance.com'],
    steam:     ['steampowered.com', 'steamcommunity.com']
  };

  let brandImpersonation = null;
  if (!usesIpAddress && !isShortenedUrl) {
    for (const [brand, legitDomains] of Object.entries(BRAND_MAP)) {
      if (hostname.includes(brand)) {
        const isLegit = legitDomains.some(
          d => hostname === d || hostname.endsWith('.' + d)
        );
        if (!isLegit) {
          brandImpersonation = brand;
          break;
        }
      }
    }
  }

  // ── 16. Unusual URL / Path Structure ───────────────────────────────────────
  // Detects nested/chained sensitive authentication and verification segments in the path
  const authKeywords = ['login', 'verify', 'verification', 'account', 'signin', 'auth', 'confirm', 'update', 'password', 'secure', 'recover'];
  const pathSegments = pathname.toLowerCase().split('/').filter(Boolean);
  let sensitiveSegmentCount = 0;
  for (const seg of pathSegments) {
    if (authKeywords.some(kw => seg.includes(kw))) {
      sensitiveSegmentCount++;
    }
  }
  const unusualUrlStructure = sensitiveSegmentCount >= 2 || (pathSegments.length >= 2 && /(login|signin|auth|recover)/i.test(pathname) && /(verify|account|confirm|update|secure|password)/i.test(pathname));

  return {
    // Core fields per spec
    isHttps,
    usesIpAddress,
    urlLength,
    hostnameLength,
    subdomainCount,
    hasAtSymbol,
    hasPunycode,
    isShortenedUrl,
    suspiciousKeywords,
    suspiciousPort,
    specialCharCount,
    // Extended fields
    protocol,
    hostname,
    apexDomain,
    tld,
    port: portNum,
    pathname,
    hyphenCount,
    longHostname,
    isHighRiskTld,
    hasDoubleSlashPath,
    brandImpersonation,  // string | null
    unusualUrlStructure
  };
}
