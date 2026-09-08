/**
 * WebGuard AI — Chrome Extension Background Service Worker (Manifest V3)
 * extension/background.js
 *
 * Step 7: Real-Time Browser Protection & Warning Workflow
 *
 * Responsibilities:
 * - Central communication bridge to WebGuard AI backend API (port 5001)
 * - Safe optional real-time browser protection (when enabled in settings)
 * - Chrome notification dispatch for verified high-risk URLs
 * - Chrome tab navigation management ("Go Back" safe exit)
 * - In-memory LRU cache to eliminate duplicate or aggressive network calls
 * - Zero content injection, zero credential tracking, zero DOM inspection
 */

import { CONFIG } from './config.js';

// Cache recent analyses in-memory to prevent repeated network requests
const urlAnalysisCache = new Map(); // url -> { result, timestamp }
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

// Lifecycle initialization
chrome.runtime.onInstalled.addListener(() => {
  console.log('[WebGuard AI] Background Service Worker initialized (Step 7).');
  chrome.action.setBadgeText({ text: '' });
  
  // Set default protection toggle to false (OFF) if not set
  chrome.storage.local.get([CONFIG.STORAGE_KEYS.BROWSER_PROTECTION], (res) => {
    if (res[CONFIG.STORAGE_KEYS.BROWSER_PROTECTION] === undefined) {
      chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.BROWSER_PROTECTION]: false });
    }
  });
});

// Clear badge on tab switch
chrome.tabs.onActivated?.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});

// ─── Safe Browser Protection Listener ────────────────────────────────────────
// Only active when user enables "Browser Protection" toggle in settings
chrome.tabs.onUpdated?.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab || !tab.url || !tab.active) return;

  const url = tab.url;
  // Only inspect standard public web schemes
  if (!/^https?:\/\//i.test(url)) return;

  // Check if user has enabled Browser Protection
  chrome.storage.local.get([CONFIG.STORAGE_KEYS.BROWSER_PROTECTION], async (storage) => {
    const isProtectionOn = !!storage[CONFIG.STORAGE_KEYS.BROWSER_PROTECTION];
    if (!isProtectionOn) return;

    // Check cache
    const cached = urlAnalysisCache.get(url);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      updateToolbarBadge(cached.result.riskLevel, cached.result.score);
      return;
    }

    try {
      const response = await handleAnalyzeUrl(url, false); // don't notify twice
      if (response && response.success && response.data) {
        urlAnalysisCache.set(url, { result: response.data, timestamp: Date.now() });
        updateToolbarBadge(response.data.riskLevel, response.data.score);

        // If High Risk, notify user immediately
        const level = String(response.data.riskLevel || '').toUpperCase();
        if (level.includes('HIGH')) {
          triggerHighRiskNotification(url, response.data.score);
        }
      }
    } catch (err) {
      // Silently fail on background check to never disrupt browsing
    }
  });
});

// ─── Central Message Dispatcher ──────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return false;

  switch (message.type) {
    case 'CHECK_HEALTH':
      handleHealthCheck()
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ online: false, error: err.message }));
      return true; // async response

    case 'ANALYZE_URL':
      handleAnalyzeUrl(message.payload?.url, true)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // async response

    case 'SAFE_GO_BACK':
      handleSafeGoBack(sender.tab?.id)
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true;

    case 'UPDATE_BADGE':
      updateToolbarBadge(message.payload?.riskLevel, message.payload?.score);
      sendResponse({ success: true });
      return false;

    case 'CLEAR_BADGE':
      chrome.action.setBadgeText({ text: '' });
      sendResponse({ success: true });
      return false;

    default:
      return false;
  }
});

/**
 * Health Check Handler
 * Verifies backend availability on configured BACKEND_URL
 */
async function handleHealthCheck() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { online: true, data };
    }
    return { online: false, status: res.status };
  } catch (err) {
    clearTimeout(timer);
    return { online: false, error: 'WebGuard backend is unavailable.' };
  }
}

/**
 * Analyze URL Handler
 * Sends URL to backend, validates response structure, updates badge
 * Optionally dispatches high-risk notification if user requested
 */
async function handleAnalyzeUrl(rawUrl, isUserInitiated = true) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { success: false, error: 'Please enter a valid HTTP or HTTPS URL.' };
  }

  const trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return { success: false, error: 'Please enter a valid HTTP or HTTPS URL.' };
  }

  // Check cache first
  const cached = urlAnalysisCache.get(trimmed);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    updateToolbarBadge(cached.result.riskLevel, cached.result.score);
    return { success: true, data: cached.result, cached: true };
  }

  // Fetch from Backend with Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${CONFIG.BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url: trimmed }),
      signal: controller.signal
    });
  } catch (networkErr) {
    clearTimeout(timeoutId);
    if (networkErr.name === 'AbortError') {
      return { success: false, error: 'Analysis timed out. Please try again.' };
    }
    return { success: false, error: 'WebGuard backend is unavailable.' };
  }

  clearTimeout(timeoutId);

  if (!response.ok) {
    let errMsg = 'WebGuard could not complete the analysis.';
    try {
      const errJson = await response.json();
      if (errJson.error && typeof errJson.error === 'string') {
        errMsg = errJson.error;
      }
    } catch (_) {}
    return { success: false, error: errMsg };
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    return { success: false, error: 'Received an unexpected response from the server.' };
  }

  // Strict Schema Validation
  if (
    !data ||
    data.success !== true ||
    typeof data.score !== 'number' ||
    data.score < 0 ||
    data.score > 100 ||
    typeof data.riskLevel !== 'string' ||
    (data.indicators !== undefined && !Array.isArray(data.indicators))
  ) {
    return { success: false, error: 'Received an unexpected response from the server.' };
  }

  // Save to in-memory cache
  urlAnalysisCache.set(trimmed, { result: data, timestamp: Date.now() });

  // Update Toolbar Badge
  updateToolbarBadge(data.riskLevel, data.score);

  // If High Risk and user initiated, send Chrome notification
  const level = String(data.riskLevel).toUpperCase();
  if (level.includes('HIGH') && isUserInitiated) {
    triggerHighRiskNotification(trimmed, data.score);
  }

  return { success: true, data };
}

/**
 * Update Toolbar Badge
 */
function updateToolbarBadge(riskLevel, score) {
  if (!riskLevel) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  const level = String(riskLevel).toUpperCase();
  let badgeText = '';
  let badgeColor = '#64748b';

  if (level.includes('HIGH')) {
    badgeText = '!';
    badgeColor = '#ef4444';
  } else if (level.includes('SUSP')) {
    badgeText = '?';
    badgeColor = '#f59e0b';
  } else {
    badgeText = '✓';
    badgeColor = '#10b981';
  }

  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

/**
 * High Risk Notification Dispatcher
 */
function triggerHighRiskNotification(urlStr, score) {
  if (typeof chrome !== 'undefined' && chrome.notifications && chrome.notifications.create) {
    let hostname = urlStr;
    try {
      hostname = new URL(urlStr).hostname;
    } catch (_) {}

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'WebGuard AI — High Risk Warning',
      message: `WebGuard AI detected a high-risk URL on ${hostname} (Score: ${score}/100). Avoid entering passwords or sensitive information.`,
      priority: 2
    });
  }
}

/**
 * Safe Tab Go-Back Handler
 * Safely navigates the user's active tab away from the dangerous website
 */
async function handleSafeGoBack(tabId) {
  try {
    let targetTabId = tabId;
    if (!targetTabId && chrome.tabs && chrome.tabs.query) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      targetTabId = activeTab?.id;
    }

    if (targetTabId && chrome.tabs.goBack) {
      await chrome.tabs.goBack(targetTabId);
    }
  } catch (e) {
    // If no back history exists, navigate to blank/safe newtab
    try {
      if (chrome.tabs && chrome.tabs.update) {
        chrome.tabs.update({ url: 'chrome://newtab' });
      }
    } catch (_) {}
  }
}
