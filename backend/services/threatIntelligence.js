/**
 * WebGuard AI — Threat Intelligence Service
 * backend/services/threatIntelligence.js
 *
 * Provider-based architecture. Each provider is an isolated module that
 * implements the same interface:
 *
 *   async check(url, hostname) → ThreatIntelResult
 *
 * ThreatIntelResult shape:
 * {
 *   available        : boolean
 *   provider         : string | null
 *   knownMalicious   : boolean
 *   suspicious       : boolean
 *   detections       : number
 *   totalEngines     : number | null
 *   message          : string
 *   scoreContribution: number   // how many risk points to add (0 if unavailable)
 * }
 *
 * SECURITY:
 *  - Provider failures NEVER crash URL analysis.
 *  - API keys are read from process.env only (never from frontend).
 *  - URL is only submitted to official reputation APIs — never fetched/rendered.
 *  - "API unavailable" does NOT add risk points or imply maliciousness.
 */

// ─── Simple in-memory cache (prevents repeated TI calls for the same URL) ─────
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key, value) {
  // Prevent unbounded growth during testing
  if (cache.size > 500) cache.clear();
  cache.set(key, { ts: Date.now(), value });
}

// ─── Common "unavailable" response ───────────────────────────────────────────
const UNAVAILABLE = (providerName = null, reason = 'Threat intelligence service is not configured.') => ({
  available        : false,
  provider         : providerName,
  knownMalicious   : false,
  suspicious       : false,
  detections       : 0,
  totalEngines     : null,
  message          : reason,
  scoreContribution: 0      // NEVER penalize for unavailability
});

// ─── VirusTotal Provider ──────────────────────────────────────────────────────
async function checkVirusTotal(rawUrl) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null; // Signal: not configured

  const cacheKey = 'vt:' + rawUrl;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // VT v3 URL submission: base64url-encode the URL (no padding)
    const urlId = Buffer.from(rawUrl).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey },
      signal : controller.signal
    });
    clearTimeout(timeout);

    if (res.status === 404) {
      // URL not in VT database — no result, not malicious
      const result = {
        available        : true,
        provider         : 'VirusTotal',
        knownMalicious   : false,
        suspicious       : false,
        detections       : 0,
        totalEngines     : null,
        message          : 'URL not found in VirusTotal database — no known reputation.',
        scoreContribution: 0
      };
      setCache(cacheKey, result);
      return result;
    }

    if (!res.ok) {
      throw new Error(`VirusTotal API returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const stats = json?.data?.attributes?.last_analysis_stats || {};
    const malicious  = stats.malicious  || 0;
    const suspicious = stats.suspicious || 0;
    const total      = Object.values(stats).reduce((a, b) => a + b, 0);

    let knownMalicious = malicious >= 2;
    let isSuspicious   = !knownMalicious && (malicious >= 1 || suspicious >= 3);

    // Score contribution: proportional but capped
    let scoreContribution = 0;
    if (knownMalicious)   scoreContribution = 40;
    else if (isSuspicious) scoreContribution = 15;

    const result = {
      available        : true,
      provider         : 'VirusTotal',
      knownMalicious,
      suspicious       : isSuspicious,
      detections       : malicious,
      totalEngines     : total,
      message          : knownMalicious
        ? `Flagged as malicious by ${malicious} of ${total} security engines.`
        : isSuspicious
        ? `Flagged as suspicious by ${suspicious} engines.`
        : `No malicious reputation detected (${total} engines checked).`,
      scoreContribution
    };
    setCache(cacheKey, result);
    return result;

  } catch (err) {
    console.warn('[ThreatIntel] VirusTotal check failed:', err.message);
    return UNAVAILABLE('VirusTotal', 'VirusTotal check failed — continuing with local analysis.');
  }
}

// ─── Google Safe Browsing Provider ───────────────────────────────────────────
async function checkGoogleSafeBrowsing(rawUrl) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null; // Signal: not configured

  const cacheKey = 'gsb:' + rawUrl;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const body = {
      client: { clientId: 'webguard-ai', clientVersion: '2.0.0' },
      threatInfo: {
        threatTypes     : ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
        platformTypes   : ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries   : [{ url: rawUrl }]
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Safe Browsing API returned HTTP ${res.status}`);

    const json = await res.json();
    const matches = json?.matches || [];
    const knownMalicious = matches.length > 0;

    const threatTypes = [...new Set(matches.map(m => m.threatType))].join(', ');

    const result = {
      available        : true,
      provider         : 'Google Safe Browsing',
      knownMalicious,
      suspicious       : false,
      detections       : matches.length,
      totalEngines     : null,
      message          : knownMalicious
        ? `Flagged by Google Safe Browsing: ${threatTypes}`
        : 'Not listed as a threat by Google Safe Browsing.',
      scoreContribution: knownMalicious ? 40 : 0
    };
    setCache(cacheKey, result);
    return result;

  } catch (err) {
    console.warn('[ThreatIntel] Google Safe Browsing check failed:', err.message);
    return UNAVAILABLE('Google Safe Browsing', 'Google Safe Browsing check failed — continuing with local analysis.');
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────
/**
 * Run all configured threat-intelligence providers in parallel.
 * Returns the first successful positive match, or an unavailable response.
 *
 * @param {string} rawUrl    - The original URL string
 * @param {string} hostname  - Pre-parsed hostname (for filtering/logging)
 * @returns {Promise<ThreatIntelResult>}
 */
export async function checkThreatIntelligence(rawUrl, hostname) {
  try {
    // Run providers in parallel; null means "not configured"
    const [vtResult, gsbResult] = await Promise.all([
      checkVirusTotal(rawUrl),
      checkGoogleSafeBrowsing(rawUrl)
    ]);

    // Collect configured results
    const results = [vtResult, gsbResult].filter(r => r !== null);

    if (results.length === 0) {
      // No providers configured → demo/local mode
      return UNAVAILABLE(null, 'No threat intelligence provider is configured. Running in local analysis mode.');
    }

    // If any provider reports malicious, return that (highest priority)
    const malicious = results.find(r => r.knownMalicious);
    if (malicious) return malicious;

    // If any reports suspicious, return that
    const suspicious = results.find(r => r.suspicious);
    if (suspicious) return suspicious;

    // All checked — all clean
    const first = results[0];
    return {
      ...first,
      knownMalicious   : false,
      suspicious       : false,
      scoreContribution: 0,
      message          : `No threats detected. Checked via ${results.map(r => r.provider).join(' & ')}.`
    };

  } catch (err) {
    console.error('[ThreatIntel] Unexpected error in checkThreatIntelligence:', err.message);
    return UNAVAILABLE(null, 'Threat intelligence check failed unexpectedly — local analysis only.');
  }
}
