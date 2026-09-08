import React, { useState, useRef } from 'react';
import {
  Search,
  Lock,
  ArrowRight,
  X,
  Zap,
  ExternalLink,
  Shield,
  History,
  Terminal,
  Layers,
  BookOpen,
  Sparkles,
  Loader2
} from 'lucide-react';

const PRESET_EXAMPLES = [
  {
    name: 'Suspicious Apple Spoof',
    url: 'https://secure-appleid-verify.account-update.net/login',
    type: 'HIGH RISK',
    badgeClass: 'high'
  },
  {
    name: 'Direct IP Phishing Trap',
    url: 'http://192.168.1.100/paypal-security-update/login.php?verify=account&pass=1',
    type: 'HIGH RISK',
    badgeClass: 'high'
  },
  {
    name: 'Disposable Domain Clone',
    url: 'http://update-security-notice.xyz/login',
    type: 'SUSPICIOUS',
    badgeClass: 'suspicious'
  },
  {
    name: 'Verified Safe Benchmark',
    url: 'https://accounts.google.com',
    type: 'LOW RISK',
    badgeClass: 'low'
  }
];

import DemoScenarios from './DemoScenarios';

export default function UrlScanner({
  onStartAnalysis,
  recentScans = [],
  onSelectHistoryItem,
  setActiveTab,
  isDemoMode = false,
  onToggleDemoMode,
  onRunDemo,
  onResetDemo,
  activeScenarioId = null,
  isScanning = false
}) {
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const handleDemoRun = (scenario) => {
    setInputUrl(scenario.url);
    setErrorMsg('');
    if (onRunDemo) {
      onRunDemo(scenario);
    } else {
      onStartAnalysis(scenario.url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isScanning) return; // Prevent duplicate requests
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setErrorMsg('Please enter or paste a website URL to evaluate.');
      if (inputRef.current) inputRef.current.focus();
      return;
    }
    setErrorMsg('');
    onStartAnalysis(trimmed);
  };

  const handleSelectExample = (url) => {
    if (isScanning) return;
    setInputUrl(url);
    setErrorMsg('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleClear = () => {
    if (isScanning) return;
    setInputUrl('');
    setErrorMsg('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="scanner-view-container">
      {/* Hero Section */}
      <section className="scanner-hero">
        <div className="hero-brand-badge">
          <Shield size={14} className="hero-shield-icon" />
          <span>WEBGUARD AI</span>
          <span className="dot-sep">&bull;</span>
          <span className="hero-mvp-pill">Cybersecurity MVP</span>
        </div>

        <div className="hero-eyebrow">
          <Zap size={14} />
          <span>Real-Time Phishing &amp; Spoofing Defense</span>
        </div>

        <h1 className="hero-headline">
          Is this link safe?
        </h1>

        <p className="hero-subheadline">
          Analyze suspicious links before you trust them.
        </p>

        <p className="hero-mission-quote">
          "Don't just detect the threat. Understand it."
        </p>

        <div className="hero-quick-actions">
          <button
            type="button"
            className="btn-hero-demo-quick"
            onClick={() => {
              const demoEl = document.getElementById('demo-scenarios-container');
              if (demoEl) demoEl.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Sparkles size={14} />
            <span>Try Demo Scenarios</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* Main Large URL Scanner Input */}
      <section className="search-stage-box">
        <div className="search-frame">
          <form onSubmit={handleSubmit}>
            <div className="url-input-wrapper">
              <div className="input-icon-lock" aria-hidden="true">
                <Lock size={18} />
              </div>

              <input
                ref={inputRef}
                type="text"
                className="main-url-input"
                placeholder="Paste a website URL (e.g. https://example.com)..."
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoComplete="off"
                spellCheck="false"
                id="url-input-box"
                disabled={isScanning}
              />

              {inputUrl && !isScanning && (
                <button
                  type="button"
                  className="input-clear-button"
                  onClick={handleClear}
                  title="Clear input"
                  aria-label="Clear URL input"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="submit"
                className={`main-analyze-button ${isScanning ? 'loading' : ''}`}
                id="analyze-url-button"
                disabled={isScanning}
                title={isScanning ? 'Analysis in progress...' : 'Analyze URL'}
              >
                {isScanning ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Analyze URL</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {errorMsg && (
          <div className="input-error-banner">
            <Terminal size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preset Example URLs for instant testing */}
        <div className="example-links-bar">
          <div className="example-links-title">
            <ExternalLink size={13} />
            <span>Try an example URL:</span>
          </div>
          <div className="example-chips-wrapper">
            {PRESET_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                className="example-btn-pill"
                onClick={() => handleSelectExample(ex.url)}
                title={`Test: ${ex.name}`}
              >
                <span className={`pill-badge ${ex.badgeClass}`}>{ex.type}</span>
                <span className="pill-url">{ex.url}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Try Demo Scenarios (Requirement 3) ─────────────────────────── */}
      <DemoScenarios
        isDemoMode={isDemoMode}
        onToggleDemoMode={onToggleDemoMode}
        onRunDemo={handleDemoRun}
        onResetDemo={onResetDemo}
        activeScenarioId={activeScenarioId}
      />

      {/* Recent Scans Strip */}
      {recentScans && recentScans.length > 0 && (
        <section className="recent-scans-strip">
          <div className="recent-strip-header">
            <div className="header-left">
              <History size={16} />
              <span>Recent Scans</span>
            </div>
            <button
              type="button"
              className="view-all-link"
              onClick={() => setActiveTab('history')}
            >
              View Full History &rarr;
            </button>
          </div>

          <div className="recent-cards-row">
            {recentScans.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="recent-scan-chip"
                onClick={() => {
                  if (item.fullResult) {
                    onSelectHistoryItem(item.fullResult);
                  } else {
                    handleSelectExample(item.url);
                  }
                }}
              >
                <div className="recent-chip-left">
                  <span className={`status-dot-sm ${item.riskLevel === 'HIGH RISK' ? 'red' : item.riskLevel === 'SUSPICIOUS' ? 'amber' : 'green'}`} />
                  <span className="recent-url">{item.url}</span>
                </div>
                <div className="recent-chip-right">
                  <span className="recent-score">{item.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two Column Quick Previews: Architecture & Awareness */}
      <section className="home-preview-grid">
        <div className="preview-card" onClick={() => setActiveTab('how-it-works')}>
          <div className="preview-card-header">
            <div className="preview-icon cyan">
              <Layers size={20} />
            </div>
            <div>
              <h3>How WebGuard Works</h3>
              <p>5-Tier Pipeline Architecture</p>
            </div>
          </div>
          <p className="preview-body">
            Detect 🔍 → Analyze 🤖 → Isolate 🧪 → Explain 💡 → Protect 🛡️
            <br />
            Multi-signal inspection evaluating lookalikes, keywords, subdomains, and threat feeds.
          </p>
          <span className="preview-action-link">Explore Architecture &rarr;</span>
        </div>

        <div className="preview-card" onClick={() => setActiveTab('awareness')}>
          <div className="preview-card-header">
            <div className="preview-icon purple">
              <BookOpen size={20} />
            </div>
            <div>
              <h3>Cyber Awareness</h3>
              <p>Understanding Phishing Psychology</p>
            </div>
          </div>
          <p className="preview-body">
            "Humans are often the weakest link because phishing attacks target human decisions, not just technology."
            Learn the telltale signs of modern deceptive domains.
          </p>
          <span className="preview-action-link">View Awareness Guide &rarr;</span>
        </div>
      </section>
    </div>
  );
}
