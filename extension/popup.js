/**
 * WebGuard AI — Chrome Extension Popup Logic (Manifest V3)
 * extension/popup.js
 *
 * Step 7: Real-Time Browser Protection & Warning Workflow
 *
 * Capabilities:
 * - Active tab URL & domain detection (zero auto-analysis by default)
 * - 3 Dedicated Protection states:
 *     LOW RISK    → Clean reassuring confirmation
 *     SUSPICIOUS  → Dedicated caution card with "Go Back" + "View Details"
 *     HIGH RISK   → Strong warning card with "Go Back" + "View Details"
 * - "Go Back (Safe Exit)" active tab navigation via background worker
 * - Settings view with Browser Protection toggle (ON/OFF)
 * - Local Protection Log synchronization and 1-click clearing
 */

import { CONFIG } from './config.js';

// ─── DOM References ──────────────────────────────────────────────────────────
const statusDot              = document.getElementById('statusDot');
const statusLabel            = document.getElementById('statusLabel');
const toggleHistoryBtn       = document.getElementById('toggleHistoryBtn');
const toggleSettingsBtn      = document.getElementById('toggleSettingsBtn');

const urlBar                 = document.getElementById('urlBar');
const domainDisplay          = document.getElementById('domainDisplay');
const currentUrlDisplay      = document.getElementById('currentUrlDisplay');
const urlExpandBtn           = document.getElementById('urlExpandBtn');
const restrictedWarning      = document.getElementById('restrictedWarning');

const idleState              = document.getElementById('idleState');
const idleTitle              = document.getElementById('idleTitle');
const idleSub                = document.getElementById('idleSub');
const analyzeCurrentBtn      = document.getElementById('analyzeCurrentBtn');
const pasteUrlBtn            = document.getElementById('pasteUrlBtn');
const protectionPill         = document.getElementById('protectionPill');
const protDot                = document.getElementById('protDot');
const protText               = document.getElementById('protText');

const manualInputState       = document.getElementById('manualInputState');
const manualUrlInput         = document.getElementById('manualUrlInput');
const manualInputError       = document.getElementById('manualInputError');
const analyzeManualBtn       = document.getElementById('analyzeManualBtn');
const cancelManualBtn        = document.getElementById('cancelManualBtn');

const scanningState          = document.getElementById('scanningState');
const scanningText           = document.getElementById('scanningText');
const steps                  = [
  document.getElementById('step1'),
  document.getElementById('step2'),
  document.getElementById('step3'),
  document.getElementById('step4')
];

// Result & Warning DOM
const resultState            = document.getElementById('resultState');
const warningHeroCard        = document.getElementById('warningHeroCard');
const warningIconBox         = document.getElementById('warningIconBox');
const warningHeroBadge       = document.getElementById('warningHeroBadge');
const warningScoreVal        = document.getElementById('warningScoreVal');
const warningHeroMsg         = document.getElementById('warningHeroMsg');
const warningActionsBar      = document.getElementById('warningActionsBar');
const warningGoBackBtn       = document.getElementById('warningGoBackBtn');
const warningToggleDetailsBtn= document.getElementById('warningToggleDetailsBtn');
const resultDetailsArea      = document.getElementById('resultDetailsArea');

const resultUrl              = document.getElementById('resultUrl');
const resultUrlToggle        = document.getElementById('resultUrlToggle');
const explanationText        = document.getElementById('explanationText');
const mlCard                 = document.getElementById('mlCard');
const mlRow                  = document.getElementById('mlRow');
const indicatorCount         = document.getElementById('indicatorCount');
const indicatorsList         = document.getElementById('indicatorsList');
const tiBadge                = document.getElementById('tiBadge');
const recommendCard          = document.getElementById('recommendCard');
const recommendText          = document.getElementById('recommendText');
const scanAnotherBtn         = document.getElementById('scanAnotherBtn');
const openWebappBtn          = document.getElementById('openWebappBtn');

// Error DOM
const errorState             = document.getElementById('errorState');
const errorTitle             = document.getElementById('errorTitle');
const errorMsg               = document.getElementById('errorMsg');
const retryBtn               = document.getElementById('retryBtn');
const errorBackBtn           = document.getElementById('errorBackBtn');

// History / Protection Log DOM
const historyDrawer          = document.getElementById('historyDrawer');
const closeHistoryBtn        = document.getElementById('closeHistoryBtn');
const historyList            = document.getElementById('historyList');
const clearHistoryBtn        = document.getElementById('clearHistoryBtn');

// Settings DOM
const settingsState          = document.getElementById('settingsState');
const closeSettingsBtn       = document.getElementById('closeSettingsBtn');
const browserProtectionToggle= document.getElementById('browserProtectionToggle');
const settingsBackendDesc    = document.getElementById('settingsBackendDesc');
const settingsBackendStatus  = document.getElementById('settingsBackendStatus');
const testBackendBtn         = document.getElementById('testBackendBtn');
const settingsLogCount       = document.getElementById('settingsLogCount');
const settingsClearLogBtn    = document.getElementById('settingsClearLogBtn');
const backToScannerBtn       = document.getElementById('backToScannerBtn');

// State Variables
let currentTabUrl            = '';
let activeAnalyzedUrl        = '';
let isUrlExpanded            = false;
let isResultUrlExpanded      = false;
let areDetailsVisible        = false;
let stepInterval             = null;
let currentRiskLevel         = 'LOW RISK';

// ─── Lifecycle Initialization ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadProtectionSetting();
  await checkBackendStatus();
  await loadActiveTab();
});

// ─── View Controller ─────────────────────────────────────────────────────────
function showView(targetView) {
  [idleState, manualInputState, scanningState, resultState, errorState, settingsState].forEach(view => {
    if (view) view.classList.add('hidden');
  });
  if (targetView) targetView.classList.remove('hidden');
}

// ─── Browser Protection Setting ──────────────────────────────────────────────
async function loadProtectionSetting() {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

  chrome.storage.local.get([CONFIG.STORAGE_KEYS.BROWSER_PROTECTION], (res) => {
    const isEnabled = !!res[CONFIG.STORAGE_KEYS.BROWSER_PROTECTION];
    if (browserProtectionToggle) {
      browserProtectionToggle.checked = isEnabled;
    }
    updateProtectionPillUI(isEnabled);
  });
}

function updateProtectionPillUI(isEnabled) {
  if (protDot) {
    protDot.className = `prot-dot ${isEnabled ? 'on' : 'off'}`;
  }
  if (protText) {
    protText.textContent = isEnabled ? 'Browser Protection: ON' : 'Browser Protection: OFF';
  }
  if (protectionPill) {
    protectionPill.className = `protection-indicator-pill ${isEnabled ? 'active' : ''}`;
  }
}

// ─── Backend Status Check ────────────────────────────────────────────────────
async function checkBackendStatus() {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'CHECK_HEALTH' }, (res) => {
        const isOnline = res && res.online;
        updateStatusBadge(isOnline);
      });
    } else {
      const res = await fetch(`${CONFIG.BACKEND_URL}/api/health`);
      updateStatusBadge(res.ok);
    }
  } catch (e) {
    updateStatusBadge(false);
  }
}

function updateStatusBadge(online) {
  if (statusDot) {
    statusDot.className = `status-dot ${online ? 'online' : 'offline'}`;
  }
  if (statusLabel) {
    statusLabel.textContent = online ? 'Online' : 'Offline';
  }
  if (settingsBackendStatus) {
    settingsBackendStatus.className = `status-pill-small ${online ? 'online' : 'offline'}`;
    settingsBackendStatus.textContent = online ? 'Connected' : 'Offline';
  }
  if (settingsBackendDesc) {
    settingsBackendDesc.textContent = `${CONFIG.BACKEND_URL} (${online ? 'Active' : 'Unreachable'})`;
  }
}

// ─── Tab URL Detection ───────────────────────────────────────────────────────
async function loadActiveTab() {
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        currentTabUrl = tab.url;
        handleTabUrl(currentTabUrl);
        return;
      }
    }
  } catch (err) {
    console.warn('[WebGuard AI] Could not query tab:', err);
  }

  currentTabUrl = window.location.href;
  handleTabUrl(currentTabUrl);
}

function isRestrictedScheme(urlStr) {
  if (!urlStr) return true;
  const lower = urlStr.toLowerCase();
  return (
    lower.startsWith('chrome://') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('about:') ||
    lower.startsWith('data:') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('blob:') ||
    lower.startsWith('devtools://') ||
    lower.startsWith('view-source:') ||
    lower.startsWith('file://')
  );
}

function handleTabUrl(url) {
  if (isRestrictedScheme(url)) {
    if (domainDisplay) domainDisplay.textContent = 'Internal Browser Page';
    if (currentUrlDisplay) currentUrlDisplay.textContent = url;
    if (restrictedWarning) restrictedWarning.classList.remove('hidden');
    if (analyzeCurrentBtn) {
      analyzeCurrentBtn.disabled = true;
      analyzeCurrentBtn.classList.add('disabled');
      analyzeCurrentBtn.title = 'Internal browser pages cannot be analyzed.';
    }
    if (urlExpandBtn) urlExpandBtn.classList.add('hidden');
    return;
  }

  if (restrictedWarning) restrictedWarning.classList.add('hidden');
  if (analyzeCurrentBtn) {
    analyzeCurrentBtn.disabled = false;
    analyzeCurrentBtn.classList.remove('disabled');
    analyzeCurrentBtn.title = '';
  }

  try {
    const parsed = new URL(url);
    if (domainDisplay) domainDisplay.textContent = parsed.hostname || url;
  } catch (_) {
    if (domainDisplay) domainDisplay.textContent = url;
  }

  if (currentUrlDisplay) currentUrlDisplay.textContent = url;

  if (url && url.length > 38 && urlExpandBtn) {
    urlExpandBtn.classList.remove('hidden');
  }
}

// ─── Event Listeners ─────────────────────────────────────────────────────────
function setupEventListeners() {
  // Analyze Current Page
  if (analyzeCurrentBtn) {
    analyzeCurrentBtn.addEventListener('click', () => {
      if (currentTabUrl && !isRestrictedScheme(currentTabUrl)) {
        triggerAnalysis(currentTabUrl);
      }
    });
  }

  // URL Expand Toggle in header bar
  if (urlExpandBtn) {
    urlExpandBtn.addEventListener('click', () => {
      isUrlExpanded = !isUrlExpanded;
      if (currentUrlDisplay) {
        currentUrlDisplay.classList.toggle('hidden', !isUrlExpanded);
      }
      urlExpandBtn.textContent = isUrlExpanded ? 'Hide full URL' : 'Show full URL';
    });
  }

  // Manual URL Mode
  if (pasteUrlBtn) {
    pasteUrlBtn.addEventListener('click', () => {
      showView(manualInputState);
      if (manualUrlInput) {
        manualUrlInput.value = '';
        manualUrlInput.focus();
      }
      if (manualInputError) manualInputError.classList.add('hidden');
    });
  }

  if (cancelManualBtn) {
    cancelManualBtn.addEventListener('click', () => {
      showView(idleState);
      if (manualInputError) manualInputError.classList.add('hidden');
    });
  }

  if (analyzeManualBtn) {
    analyzeManualBtn.addEventListener('click', () => {
      const raw = manualUrlInput ? manualUrlInput.value.trim() : '';
      if (!raw) {
        showManualError('Please enter a URL to inspect.');
        return;
      }
      let finalUrl = raw;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      triggerAnalysis(finalUrl);
    });
  }

  if (manualUrlInput) {
    manualUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') analyzeManualBtn?.click();
    });
  }

  // "Go Back (Safe Exit)" for Warning States
  if (warningGoBackBtn) {
    warningGoBackBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'SAFE_GO_BACK' });
      }
      // Return popup to idle state
      showView(idleState);
    });
  }

  // "View Details" Toggle on Warnings
  if (warningToggleDetailsBtn) {
    warningToggleDetailsBtn.addEventListener('click', () => {
      areDetailsVisible = !areDetailsVisible;
      if (resultDetailsArea) {
        resultDetailsArea.classList.toggle('hidden', !areDetailsVisible);
      }
      warningToggleDetailsBtn.textContent = areDetailsVisible ? 'Hide Details ▴' : 'View Details ▾';
    });
  }

  // Result URL expand toggle
  if (resultUrlToggle) {
    resultUrlToggle.addEventListener('click', () => {
      isResultUrlExpanded = !isResultUrlExpanded;
      if (resultUrl) {
        resultUrl.classList.toggle('expanded', isResultUrlExpanded);
      }
      resultUrlToggle.textContent = isResultUrlExpanded ? 'Compact' : 'Full URL';
    });
  }

  // Secondary result actions
  if (scanAnotherBtn) {
    scanAnotherBtn.addEventListener('click', () => {
      showView(idleState);
    });
  }

  if (openWebappBtn) {
    openWebappBtn.addEventListener('click', () => {
      const target = activeAnalyzedUrl || currentTabUrl || '';
      const destUrl = `${CONFIG.WEBAPP_URL}/?url=${encodeURIComponent(target)}`;
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: destUrl });
      } else {
        window.open(destUrl, '_blank');
      }
    });
  }

  // Error Actions
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (activeAnalyzedUrl) {
        triggerAnalysis(activeAnalyzedUrl);
      } else {
        showView(idleState);
      }
    });
  }

  if (errorBackBtn) {
    errorBackBtn.addEventListener('click', () => {
      showView(idleState);
    });
  }

  // Protection Log / History Drawer
  if (toggleHistoryBtn) {
    toggleHistoryBtn.addEventListener('click', () => {
      loadHistoryFromStorage();
      if (historyDrawer) historyDrawer.classList.toggle('hidden');
    });
  }

  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', () => {
      if (historyDrawer) historyDrawer.classList.add('hidden');
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      clearScanHistory();
    });
  }

  // Settings Screen Toggles
  if (toggleSettingsBtn) {
    toggleSettingsBtn.addEventListener('click', () => {
      updateSettingsMetrics();
      showView(settingsState);
    });
  }

  if (closeSettingsBtn || backToScannerBtn) {
    const handleCloseSettings = () => showView(idleState);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', handleCloseSettings);
    if (backToScannerBtn) backToScannerBtn.addEventListener('click', handleCloseSettings);
  }

  if (browserProtectionToggle) {
    browserProtectionToggle.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.BROWSER_PROTECTION]: isChecked }, () => {
        updateProtectionPillUI(isChecked);
      });
    });
  }

  if (testBackendBtn) {
    testBackendBtn.addEventListener('click', async () => {
      if (settingsBackendStatus) settingsBackendStatus.textContent = 'Testing...';
      await checkBackendStatus();
    });
  }

  if (settingsClearLogBtn) {
    settingsClearLogBtn.addEventListener('click', () => {
      clearScanHistory();
      if (settingsLogCount) settingsLogCount.textContent = '0 scans recorded locally';
    });
  }
}

function showManualError(msg) {
  if (manualInputError) {
    manualInputError.textContent = msg;
    manualInputError.classList.remove('hidden');
  }
}

// ─── Analysis Pipeline: Popup -> Background -> Backend ───────────────────────
function triggerAnalysis(url) {
  activeAnalyzedUrl = url;
  showView(scanningState);

  const stageLabels = [
    'Analyzing URL...',
    'Checking security indicators...',
    'Calculating risk...',
    'Generating explanation...'
  ];

  let currentStep = 0;
  function updateStepUI(idx) {
    steps.forEach((stepEl, i) => {
      if (!stepEl) return;
      stepEl.classList.remove('active', 'done');
      if (i < idx) stepEl.classList.add('done');
      else if (i === idx) stepEl.classList.add('active');
    });
    if (scanningText && stageLabels[idx]) {
      scanningText.textContent = stageLabels[idx];
    }
  }

  updateStepUI(0);
  if (stepInterval) clearInterval(stepInterval);
  stepInterval = setInterval(() => {
    currentStep++;
    if (currentStep < steps.length) updateStepUI(currentStep);
  }, 400);

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(
      { type: 'ANALYZE_URL', payload: { url } },
      (response) => handleAnalysisResponse(response)
    );
  } else {
    // Direct fallback
    directFetchAnalyze(url)
      .then(res => handleAnalysisResponse(res))
      .catch(err => handleAnalysisResponse({ success: false, error: err.message }));
  }
}

async function directFetchAnalyze(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error('WebGuard could not complete the analysis.');
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    clearTimeout(timer);
    return {
      success: false,
      error: err.name === 'AbortError'
        ? 'Analysis timed out. Please try again.'
        : 'WebGuard backend is unavailable.'
    };
  }
}

function handleAnalysisResponse(response) {
  if (stepInterval) clearInterval(stepInterval);

  if (!response || !response.success || !response.data) {
    const errorMsg = response?.error || 'WebGuard could not complete the analysis.';
    renderError(errorMsg);
    return;
  }

  steps.forEach(s => s && s.classList.add('done'));

  setTimeout(() => {
    renderResult(response.data);
    saveScanToStorage(response.data);
  }, 200);
}

// ─── Render Result / Warning Workflow (Step 7) ───────────────────────────────
function renderResult(data) {
  showView(resultState);

  const score = typeof data.score === 'number' ? data.score : 0;
  let riskLevel = (data.riskLevel || '').toUpperCase();
  if (!riskLevel) {
    if (score <= CONFIG.THRESHOLDS.LOW_MAX) riskLevel = 'LOW RISK';
    else if (score <= CONFIG.THRESHOLDS.SUSPICIOUS_MAX) riskLevel = 'SUSPICIOUS';
    else riskLevel = 'HIGH RISK';
  }
  currentRiskLevel = riskLevel;

  // 1. Hero Warning Banner & Icons
  if (warningHeroCard) {
    warningHeroCard.className = 'warning-hero-card';
    if (riskLevel.includes('HIGH')) {
      warningHeroCard.classList.add('high');
    } else if (riskLevel.includes('SUSP')) {
      warningHeroCard.classList.add('suspicious');
    } else {
      warningHeroCard.classList.add('low');
    }
  }

  if (warningHeroBadge) warningHeroBadge.textContent = riskLevel;
  if (warningScoreVal) warningScoreVal.textContent = `${score} / 100`;

  // Explicit Step 7 requirement messages
  if (warningHeroMsg) {
    if (riskLevel.includes('HIGH')) {
      warningHeroMsg.textContent = 'This URL contains multiple high-risk indicators. Avoid entering sensitive information.';
    } else if (riskLevel.includes('SUSP')) {
      warningHeroMsg.textContent = 'This URL contains indicators that require caution.';
    } else {
      warningHeroMsg.textContent = 'No major suspicious indicators were detected from the analyzed URL.';
    }
  }

  // Warning Icons
  if (warningIconBox) {
    if (riskLevel.includes('HIGH')) {
      warningIconBox.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>`;
    } else if (riskLevel.includes('SUSP')) {
      warningIconBox.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>`;
    } else {
      warningIconBox.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>`;
    }
  }

  // 2. Action bar behavior based on risk state
  if (riskLevel.includes('HIGH') || riskLevel.includes('SUSP')) {
    // Show Go Back & View Details buttons
    if (warningActionsBar) warningActionsBar.classList.remove('hidden');
    // Keep technical details collapsed by default to highlight warning
    areDetailsVisible = false;
    if (resultDetailsArea) resultDetailsArea.classList.add('hidden');
    if (warningToggleDetailsBtn) warningToggleDetailsBtn.textContent = 'View Details ▾';
  } else {
    // LOW RISK: Show details directly, hide Go Back bar
    if (warningActionsBar) warningActionsBar.classList.add('hidden');
    areDetailsVisible = true;
    if (resultDetailsArea) resultDetailsArea.classList.remove('hidden');
  }

  // Target URL display
  if (resultUrl) resultUrl.textContent = data.url || activeAnalyzedUrl;

  // Why this score?
  if (explanationText) {
    const summary = (typeof data.explanation === 'string' && data.explanation)
      || data.explanation?.summary
      || data.whyThisScore
      || data.summary
      || 'URL structure and security indicators analyzed.';
    explanationText.textContent = summary;
  }

  // AI Risk Analysis
  if (data.mlPrediction && mlRow) {
    const ml = data.mlPrediction;
    const predLevel = (ml.prediction || ml.predictedRisk || 'LOW').toUpperCase();
    const conf = typeof ml.confidence === 'string'
      ? ml.confidence
      : (ml.confidenceScore !== undefined ? `${Math.round(ml.confidenceScore * 100)}%` : 'MEDIUM');

    mlRow.innerHTML = `
      <div class="ml-stat">
        <span class="ml-stat-label">Model Assessment</span>
        <span class="ml-stat-val ${predLevel.includes('HIGH') ? 'danger' : (predLevel.includes('SUSP') || predLevel.includes('MED')) ? 'warn' : 'safe'}">${predLevel}</span>
      </div>
      <div class="ml-stat">
        <span class="ml-stat-label">Confidence</span>
        <span class="ml-stat-val">${escapeHtml(conf)}</span>
      </div>
      <div class="ml-stat">
        <span class="ml-stat-label">Prediction Type</span>
        <span class="ml-stat-val muted">Feature-based prediction</span>
      </div>
    `;
    if (mlCard) mlCard.classList.remove('hidden');
  } else if (mlCard) {
    mlCard.classList.add('hidden');
  }

  // Security Indicators
  const flags = data.indicators || data.flaggedFeatures || [];
  if (indicatorCount) indicatorCount.textContent = flags.length;

  if (indicatorsList) {
    if (flags.length === 0) {
      indicatorsList.innerHTML = `
        <div class="clean-indicators-msg">
          ✓ No suspicious structural indicators detected.
        </div>`;
    } else {
      indicatorsList.innerHTML = flags.slice(0, 4).map(flag => {
        const sev = (flag.severity || 'medium').toLowerCase();
        return `
          <div class="indicator-item ${sev}">
            <div>
              <div class="indicator-name">${escapeHtml(flag.name || flag.rule || 'Flagged Indicator')}</div>
              <div class="indicator-detail">${escapeHtml(flag.description || flag.reason || '')}</div>
            </div>
          </div>
        `;
      }).join('');

      if (flags.length > 4) {
        indicatorsList.innerHTML += `
          <div class="more-indicators-note">
            + ${flags.length - 4} more indicators (open Full Report to view all)
          </div>`;
      }
    }
  }

  // Threat Intelligence Status
  if (tiBadge) {
    const ti = data.threatIntelligence;
    if (ti && ti.available) {
      if (ti.knownMalicious) {
        tiBadge.innerHTML = `<span class="ti-status-pill threat">🚨 Known Malicious (${escapeHtml(ti.provider || 'TI Provider')})</span>`;
      } else if (ti.suspicious) {
        tiBadge.innerHTML = `<span class="ti-status-pill threat">⚠️ Suspicious Reputation (${escapeHtml(ti.provider || 'TI Provider')})</span>`;
      } else {
        tiBadge.innerHTML = `<span class="ti-status-pill clean">✓ No known malicious reputation detected (${escapeHtml(ti.provider || 'TI')})</span>`;
      }
    } else {
      tiBadge.innerHTML = `<span class="ti-status-pill unconfigured">Threat Intelligence unavailable — local analysis continues.</span>`;
    }
  }

  // Recommendation
  if (recommendText) {
    const rec = (typeof data.recommendation === 'string' && data.recommendation)
      || (data.recommendations && data.recommendations[0])
      || data.explanation?.recommendation
      || (riskLevel.includes('HIGH')
        ? 'Do NOT visit this website or enter credentials. High likelihood of credential theft or malware.'
        : riskLevel.includes('SUSP')
          ? 'Exercise caution. Do not input passwords, financial details, or download files.'
          : 'Website structure appears safe and follows standard domain practices.');
    recommendText.textContent = rec;
  }
}

// ─── Error Handling ──────────────────────────────────────────────────────────
function renderError(message) {
  showView(errorState);
  const isBackendDown = (message || '').toLowerCase().includes('backend') || (message || '').toLowerCase().includes('unavailable');
  if (errorTitle) {
    errorTitle.textContent = isBackendDown ? 'Backend unavailable.' : 'Analysis Failed';
  }
  if (errorMsg) {
    errorMsg.textContent = isBackendDown
      ? 'Start Backend with: cd backend && node server.js — or click Try Again.'
      : (message || 'WebGuard could not complete the analysis.');
  }
}

// ─── Storage & Scan History Synchronization ──────────────────────────────────
function saveScanToStorage(data) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

  const url = data.url || activeAnalyzedUrl;
  let domain = url;
  try {
    domain = new URL(url).hostname;
  } catch (_) {}

  const entry = {
    url,
    domain,
    score: data.score || 0,
    riskLevel: data.riskLevel || 'LOW RISK',
    timestamp: Date.now(),
    indicatorCount: (data.indicators || []).length
  };

  chrome.storage.local.get([CONFIG.STORAGE_KEYS.SCAN_HISTORY], (result) => {
    let history = result?.[CONFIG.STORAGE_KEYS.SCAN_HISTORY];
    if (!Array.isArray(history)) {
      history = [];
    }
    const filtered = history.filter(item => item && item.url && item.url !== url);
    filtered.unshift(entry);
    const trimmed = filtered.slice(0, CONFIG.MAX_HISTORY_ITEMS);
    chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.SCAN_HISTORY]: trimmed });
  });
}

function loadHistoryFromStorage() {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    if (historyList) historyList.innerHTML = '<div class="history-empty">No recent scans available.</div>';
    return;
  }

  chrome.storage.local.get([CONFIG.STORAGE_KEYS.SCAN_HISTORY], (result) => {
    let history = result?.[CONFIG.STORAGE_KEYS.SCAN_HISTORY];
    if (!Array.isArray(history)) {
      history = [];
      chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.SCAN_HISTORY]: [] });
    }
    if (!historyList) return;

    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No scans recorded in Protection Log.</div>';
      return;
    }

    historyList.innerHTML = history.map(item => {
      const level = (item.riskLevel || 'LOW').toUpperCase();
      const levelClass = level.includes('HIGH') ? 'danger' : level.includes('SUSP') ? 'warn' : 'safe';
      const timeAgo = formatTimeAgo(item.timestamp);
      return `
        <div class="history-item" data-url="${escapeHtml(item.url)}">
          <div class="history-item-top">
            <span class="history-domain">${escapeHtml(item.domain)}</span>
            <span class="history-score ${levelClass}">${item.score}/100</span>
          </div>
          <div class="history-item-bottom">
            <span class="history-time">${timeAgo}</span>
            <span class="history-chip ${levelClass}">${escapeHtml(item.riskLevel)}</span>
          </div>
        </div>
      `;
    }).join('');

    historyList.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const urlToScan = el.getAttribute('data-url');
        if (urlToScan) {
          if (historyDrawer) historyDrawer.classList.add('hidden');
          triggerAnalysis(urlToScan);
        }
      });
    });
  });
}

function clearScanHistory() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.remove([CONFIG.STORAGE_KEYS.SCAN_HISTORY], () => {
      loadHistoryFromStorage();
      if (settingsLogCount) settingsLogCount.textContent = '0 scans recorded locally';
    });
  }
}

function updateSettingsMetrics() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get([CONFIG.STORAGE_KEYS.SCAN_HISTORY], (res) => {
      const count = (res[CONFIG.STORAGE_KEYS.SCAN_HISTORY] || []).length;
      if (settingsLogCount) settingsLogCount.textContent = `${count} scan${count === 1 ? '' : 's'} recorded locally`;
    });
  }
}

function formatTimeAgo(ts) {
  if (!ts) return 'recently';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
