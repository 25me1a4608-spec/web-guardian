/**
 * WebGuard AI — Central Extension Configuration
 * extension/config.js
 *
 * Single source of truth for backend endpoints, timeouts, and storage limits.
 * Easily toggle between local development and deployed production backends.
 */

// ─── Production Endpoint Constants ──────────────────────────────────────────
export const BACKEND_URL = 'https://web-guardian-seven.vercel.app';
export const WEBAPP_URL = 'https://web-guardian-jo5g.vercel.app';

// ─── Environment Selector ───────────────────────────────────────────────────
// Set to 'production' for live deployed backend and frontend.
export const ACTIVE_ENV = 'production'; // Options: 'development' | 'production'

// ─── Environment Configurations ─────────────────────────────────────────────
export const ENVIRONMENTS = {
  development: {
    BACKEND_URL,
    WEBAPP_URL
  },
  production: {
    BACKEND_URL,
    WEBAPP_URL
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
