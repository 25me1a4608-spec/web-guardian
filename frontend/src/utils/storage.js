/**
 * WebGuard AI — Local Storage & Analytics Utilities
 * Step 8: Dashboard, Analytics & Scan History Polish
 */

const STORAGE_KEY = 'webguard_scan_history';

// Clearly labeled Hackathon Demo dataset (only loaded when user explicitly clicks "Load Demo Data")
export const HACKATHON_DEMO_SCANS = [
  {
    id: 'demo-1',
    url: 'https://paypal.com@verify-account-update.xyz/login',
    score: 78,
    riskLevel: 'HIGH RISK',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    indicators: [
      { id: 'AT_SYMBOL', severity: 'high', name: '@ Symbol Masking', description: 'URL contains "@" symbol — browsers ignore everything before it.' },
      { id: 'MANY_KEYWORDS', severity: 'high', name: 'Sensitive Keywords', description: 'Contains multiple keywords like login, verify, account.' },
      { id: 'HIGH_RISK_TLD', severity: 'medium', name: 'High-Abuse TLD', description: '.xyz top-level domain frequently associated with phishing.' }
    ],
    threatIntelligence: { available: false, provider: null, message: 'No TI provider configured. Using heuristic engine.' },
    mlPrediction: { available: true, prediction: 'HIGH', confidence: 'HIGH', modelType: 'feature-based-risk-model' },
    explanation: 'High-risk credential masking detected. The @ symbol obscures the true destination hostname, which uses a high-abuse TLD.',
    recommendation: 'Do NOT visit this URL or enter credentials. Immediately report the link.',
    isDemo: true
  },
  {
    id: 'demo-2',
    url: 'http://account-verification-notice.net/auth',
    score: 45,
    riskLevel: 'SUSPICIOUS',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    indicators: [
      { id: 'NO_HTTPS', severity: 'high', name: 'Insecure HTTP', description: 'Connection is unencrypted HTTP.' },
      { id: 'MANY_KEYWORDS', severity: 'medium', name: 'Security Keywords', description: 'Keywords matching credential verification.' }
    ],
    threatIntelligence: { available: false, provider: null, message: 'Threat intelligence running in local analysis mode.' },
    mlPrediction: { available: true, prediction: 'MEDIUM', confidence: 'MEDIUM', modelType: 'feature-based-risk-model' },
    explanation: 'This link lacks HTTPS encryption while requesting account verification.',
    recommendation: 'Exercise caution. Do not input passwords, financial details, or download files.',
    isDemo: true
  },
  {
    id: 'demo-3',
    url: 'https://github.com/torvalds/linux',
    score: 0,
    riskLevel: 'LOW RISK',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    indicators: [],
    threatIntelligence: { available: false, provider: null, message: 'Local analysis mode.' },
    mlPrediction: { available: true, prediction: 'LOW', confidence: 'LOW', modelType: 'feature-based-risk-model' },
    explanation: 'Website structure follows standard industry security standards with verified HTTPS.',
    recommendation: 'This URL appears safe based on structural analysis.',
    isDemo: true
  }
];

/**
 * Get stored scan history safely.
 * Returns empty array [] if no records exist or if JSON is corrupt.
 * Never auto-seeds fake data.
 */
export function getScanHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[WebGuard] Malformed history in localStorage. Resetting to [].');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed;
  } catch (err) {
    console.error('[WebGuard] Failed parsing localStorage scan history. Recovering with empty state:', err);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    return [];
  }
}

/**
 * Save an analysis result to localStorage.
 * Deduplicates by URL and stores full security payload.
 */
export function saveScanToHistory(scanResult, isDemo = false) {
  if (!scanResult || !scanResult.url) return getScanHistory();

  try {
    const current = getScanHistory();
    
    // Normalize risk level to ensure consistent uppercase string
    let riskLevel = (scanResult.riskLevel || '').toUpperCase();
    if (!riskLevel) {
      const s = scanResult.score || 0;
      riskLevel = s <= 30 ? 'LOW RISK' : s <= 70 ? 'SUSPICIOUS' : 'HIGH RISK';
    }

    const newEntry = {
      id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      url: scanResult.url,
      score: typeof scanResult.score === 'number' ? scanResult.score : 0,
      riskLevel,
      timestamp: scanResult.analyzedAt || new Date().toISOString(),
      indicators: scanResult.indicators || [],
      threatIntelligence: scanResult.threatIntelligence || null,
      mlPrediction: scanResult.mlPrediction || null,
      explanation: typeof scanResult.explanation === 'string'
        ? scanResult.explanation
        : (scanResult.explanation?.summary || scanResult.whyThisScore || 'URL security analysis completed.'),
      recommendation: typeof scanResult.recommendation === 'string'
        ? scanResult.recommendation
        : (scanResult.recommendations?.[0] || 'Follow safe web browsing practices.'),
      isDemo: !!(isDemo || scanResult.isDemo),
      // Preserve full result for 1-click loading into the analysis result component
      fullResult: {
        ...scanResult,
        isDemo: !!(isDemo || scanResult.isDemo)
      }
    };

    // Filter out duplicate identical URL if scanned previously
    const filtered = current.filter(item => item.url !== newEntry.url);
    const updated = [newEntry, ...filtered].slice(0, 50); // store up to 50 recent scans

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('[WebGuard] Failed saving scan to localStorage:', err);
    return getScanHistory();
  }
}

/**
 * Reset only demo scans from history while keeping authentic user scans.
 */
export function resetDemoScans() {
  try {
    const current = getScanHistory();
    const cleaned = current.filter(item => !item.isDemo && !item.id?.startsWith('demo-'));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch (err) {
    console.error('[WebGuard] Failed resetting demo scans:', err);
    return getScanHistory();
  }
}

/**
 * Clear all stored scan history.
 */
export function clearScanHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.error('[WebGuard] Failed clearing scan history:', err);
    return [];
  }
}

/**
 * Explicit Hackathon Demo loader (only triggered on user action).
 */
export function loadDemoScanData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(HACKATHON_DEMO_SCANS));
    return HACKATHON_DEMO_SCANS;
  } catch (err) {
    console.error('[WebGuard] Failed loading demo scans:', err);
    return [];
  }
}

/**
 * Compute real-time dashboard analytics and insights from actual scan history.
 */
export function getDashboardStats(history = []) {
  const totalScans = history.length;
  let lowRisk = 0;
  let suspicious = 0;
  let highRisk = 0;
  let totalScore = 0;
  let latestScan = null;

  if (totalScans > 0) {
    latestScan = history[0]; // newest scan is always first
  }

  history.forEach(item => {
    const score = typeof item.score === 'number' ? item.score : 0;
    totalScore += score;
    const level = (item.riskLevel || '').toUpperCase();

    if (level.includes('HIGH')) {
      highRisk++;
    } else if (level.includes('SUSP')) {
      suspicious++;
    } else {
      lowRisk++;
    }
  });

  const avgScore = totalScans > 0 ? Math.round(totalScore / totalScans) : 0;
  const lowRiskPercent = totalScans > 0 ? Math.round((lowRisk / totalScans) * 100) : 0;
  const suspiciousPercent = totalScans > 0 ? Math.round((suspicious / totalScans) * 100) : 0;
  const highRiskPercent = totalScans > 0 ? Math.round((highRisk / totalScans) * 100) : 0;

  // Generate dynamic, real security insights
  const insights = [];
  if (totalScans === 0) {
    insights.push('Analyze a URL to generate live security findings and telemetry.');
  } else {
    if (highRisk > 0) {
      insights.push(`${highRisk} high-risk URL${highRisk === 1 ? ' was' : 's were'} detected in your scan history (${highRiskPercent}% of all scans).`);
    }
    if (suspicious > 0) {
      insights.push(`${suspicious} suspicious URL${suspicious === 1 ? ' was' : 's were'} flagged with cautionary structural indicators.`);
    }
    if (latestScan) {
      insights.push(`Most recent scan (${truncateDomain(latestScan.url)}) was classified as ${latestScan.riskLevel} (${latestScan.score}/100).`);
    }
    if (lowRiskPercent >= 60) {
      insights.push(`${lowRiskPercent}% of analyzed links met standard safe structural baselines.`);
    }
  }

  const demoScansCount = history.filter(item => item.isDemo || item.id?.startsWith('demo-')).length;
  const realScansCount = totalScans - demoScansCount;

  return {
    totalScans,
    lowRisk,
    suspicious,
    highRisk,
    avgScore,
    lowRiskPercent,
    suspiciousPercent,
    highRiskPercent,
    latestScan,
    insights,
    demoScansCount,
    realScansCount
  };
}

export function truncateDomain(urlStr) {
  if (!urlStr) return '';
  try {
    return new URL(urlStr).hostname;
  } catch (_) {
    return urlStr.length > 25 ? urlStr.substring(0, 25) + '...' : urlStr;
  }
}
