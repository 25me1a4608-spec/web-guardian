/**
 * WebGuard AI — Central Extension Configuration
 * extension/config.js
 *
 * Single source of truth for backend endpoints, timeouts, and storage limits.
 * Easily toggle between local development and deployed production backends.
 */

// ─── Environment Selector ───────────────────────────────────────────────────
// Change to 'production' once your backend and frontend are deployed.
export const ACTIVE_ENV = 'production'; // Options: 'development' | 'production'

// ─── Environment Configurations ─────────────────────────────────────────────
export const ENVIRONMENTS = {
  development: {
    BACKEND_URL: 'https://web-guardian-seven.vercel.app',
    WEBAPP_URL: 'https://web-guardian-jo5g.vercel.app'
  },
  production: {
    BACKEND_URL: 'https://web-guardian-seven.vercel.app',
    WEBAPP_URL: 'https://web-guardian-jo5g.vercel.app'
  }
};

export const CONFIG = {
  // ─── Active API & Webapp Endpoints ─────────────────────────────────────────
  BACKEND_URL: ENVIRONMENTS[ACTIVE_ENV].BACKEND_URL,
  WEBAPP_URL:  ENVIRONMENTS[ACTIVE_ENV].WEBAPP_URL,

  // ─── Networking & Timeouts ──────────────────────────────────────────────────
  REQUEST_TIMEOUT_MS: 12000,
  VERSION: '1.0.0',

  // ─── Local Storage & History ────────────────────────────────────────────────
  STORAGE_KEYS: {
    SCAN_HISTORY: 'webguard_scan_history',
    LAST_SCAN: 'webguard_last_scan',
    BROWSER_PROTECTION: 'webguard_browser_protection'
  },
  MAX_HISTORY_ITEMS: 20,

  // ─── Risk Thresholds (Matches Backend & Web App strictly) ───────────────────
  THRESHOLDS: {
    LOW_MAX: 30,        // 0 – 30  : LOW RISK
    SUSPICIOUS_MAX: 70  // 31 – 70 : SUSPICIOUS
                        // 71 – 100: HIGH RISK
  }
};

// Also attach to global scope for flexibility
if (typeof globalThis !== 'undefined') {
  globalThis.WEGUARD_CONFIG = CONFIG;
  globalThis.WEGUARD_ENV = ACTIVE_ENV;
}
