import React, { useState, useRef } from 'react';
import DemoScenarios from './DemoScenarios';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Search, ArrowRight,
  RefreshCw, FileText, Lock, Globe, Server, Cpu, Check, AlertCircle, HelpCircle,
  ExternalLink, Activity, Sparkles, BarChart2, Shield, Eye
} from 'lucide-react';

const PRESET_EXAMPLES = [
  { name: 'Suspicious Apple Spoof', url: 'https://secure-appleid-verify.account-update.net/login', type: 'HIGH RISK', badgeClass: 'high' },
  { name: 'Direct IP Phishing',     url: 'http://192.168.1.100/paypal-security-update/login.php', type: 'HIGH RISK', badgeClass: 'high' },
  { name: 'Disposable Domain',      url: 'http://update-security-notice.xyz/login',                type: 'SUSPICIOUS', badgeClass: 'suspicious' },
  { name: 'Verified Benchmark',     url: 'https://accounts.google.com',                            type: 'LOW RISK', badgeClass: 'low' },
];

const FEATURES = [
  {
    icon: <Globe size={22} color="#0891B2" />,
    title: 'URL Reputation Analysis',
    desc: 'Submit any link for an instant structural, WHOIS, and lexical scan — no downloads or browser extensions required.',
  },
  {
    icon: <ShieldAlert size={22} color="#0891B2" />,
    title: 'Phishing Detection Engine',
    desc: 'Identify credential-harvesting pages, spoofed login forms, and lookalike domains before you enter sensitive information.',
  },
  {
    icon: <Server size={22} color="#0891B2" />,
    title: 'Domain Age & WHOIS Check',
    desc: 'Review registration age, hosting history, and prior abuse reports pulled from live threat intelligence feeds.',
  },
  {
    icon: <FileText size={22} color="#0891B2" />,
    title: 'Cyber Awareness Training',
    desc: 'Practical, real-world lessons on the scam patterns people actually encounter in email, SMS, and web browsing.',
  },
  {
    icon: <Activity size={22} color="#0891B2" />,
    title: 'Real-Time Threat Telemetry',
    desc: 'Every scan checks live threat feeds updated continuously across newly registered and reported malicious domains.',
  },
  {
    icon: <Eye size={22} color="#0891B2" />,
    title: 'Visual Risk Breakdown',
    desc: 'Clear visual scoring and color-coded indicator cards so technical and non-technical users can make safe decisions.',
  },
];

const AWARENESS_CARDS = [
  {
    icon: <AlertTriangle size={20} color="#DC2626" />,
    risk: 'high', riskLabel: 'High Risk',
    title: 'Email Phishing & Spoofing',
    desc: 'Messages impersonating banks, employers, or vendors that push artificial urgency to get you to click a link or enter credentials.',
    tip: "Check the sender's full email address, not just the display name.",
  },
  {
    icon: <AlertTriangle size={20} color="#F59E0B" />,
    risk: 'medium', riskLabel: 'Rising Trend',
    title: 'QR Code Scams (Quishing)',
    desc: 'Malicious QR codes placed on parking meters, posters, or emails that redirect to fake payment or login pages.',
    tip: 'Preview the destination URL before opening any QR-code link.',
  },
  {
    icon: <ShieldAlert size={20} color="#DC2626" />,
    risk: 'high', riskLabel: 'High Risk',
    title: 'Fake Sign-In Pages',
    desc: 'Pixel-accurate clones of real sign-in pages designed to capture your username, password, and one-time codes in real time.',
    tip: 'Always verify the domain name matches exactly before entering credentials.',
  },
  {
    icon: <HelpCircle size={20} color="#0891B2" />,
    risk: 'medium', riskLabel: 'Common Vector',
    title: 'Social Engineering',
    desc: 'Attackers impersonate colleagues, IT support, or executives by phone or chat to pressure you into sharing access.',
    tip: 'Verify unusual requests through a separate, known communication channel.',
  },
];

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
  isScanning = false,
}) {
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef                = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isScanning) return;
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setErrorMsg('Please enter or paste a website URL to evaluate.');
      inputRef.current?.focus();
      return;
    }
    setErrorMsg('');
    onStartAnalysis(trimmed);
  };

  const handleSelectExample = (url) => {
    if (isScanning) return;
    setInputUrl(url);
    setErrorMsg('');
    inputRef.current?.focus();
  };

  const handleDemoRun = (scenario) => {
    setInputUrl(scenario.url);
    setErrorMsg('');
    onRunDemo ? onRunDemo(scenario) : onStartAnalysis(scenario.url);
  };

  return (
    <div className="wg-page-wrap">
      {/* ── HERO SECTION WITH INPUT SCANNER ───────────────────────────── */}
      <section className="wg-hero">
        <div className="wrap">
          <div className="wg-hero-grid">
            {/* Hero Left Content */}
            <div className="wg-hero-content">
              <div className="wg-badge">
                <ShieldCheck size={14} color="#0891B2" />
                <span>Trusted by 1,200+ Security Teams & Organizations</span>
              </div>
              <h1 className="wg-hero-headline">
                Protect Yourself From Phishing Attacks
              </h1>
              <p className="wg-hero-sub">
                Analyze suspicious websites, detect credential-harvesting attempts, and build safer browsing habits — backed by real-time threat intelligence and plain-language guidance.
              </p>

              {/* Main Scanner Input Box */}
              <form className="wg-hero-scanner-form" onSubmit={handleSubmit}>
                <div className="wg-input-group">
                  <span className="input-icon">
                    <Search size={18} color="#64748B" />
                  </span>
                  <input
                    ref={inputRef}
                    type="url"
                    className="wg-hero-input"
                    placeholder="Enter or paste suspicious URL (e.g. https://secure-appleid-verify.account-update.net)..."
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    disabled={isScanning}
                    required
                  />
                  <button
                    type="submit"
                    className="wg-btn wg-btn-primary"
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <span>Inspecting...</span>
                    ) : (
                      <>
                        <span>Analyze URL</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                {errorMsg && (
                  <div className="scanner-error-text">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </form>

              {/* Quick Presets */}
              <div className="wg-hero-trust-row">
                <span className="trust-label">Try Benchmark Examples:</span>
                {PRESET_EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="preset-chip"
                    onClick={() => handleSelectExample(ex.url)}
                    disabled={isScanning}
                  >
                    <span className="preset-name">{ex.name}</span>
                  </button>
                ))}
              </div>

              {/* CTAs */}
              <div className="wg-hero-actions margin-top">
                <button
                  type="button"
                  className="wg-btn wg-btn-outline"
                  onClick={() => setActiveTab('academy')}
                >
                  <Sparkles size={16} color="#0891B2" />
                  <span>Explore Cyber Academy</span>
                </button>
                <button
                  type="button"
                  className="wg-btn wg-btn-ghost"
                  onClick={() => setActiveTab('intelligence')}
                >
                  <Activity size={16} color="#CBD5E1" />
                  <span>View Threat Telemetry</span>
                </button>
              </div>
            </div>

            {/* Hero Right: Interactive Demo Workbench */}
            <div className="wg-hero-preview-col">
              <DemoScenarios
                onRunDemo={handleDemoRun}
                activeScenarioId={activeScenarioId}
                isScanning={isScanning}
                isDemoMode={isDemoMode}
                onToggleDemoMode={onToggleDemoMode}
                onResetDemo={onResetDemo}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES GRID ───────────────────────────────────── */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">CAPABILITIES</span>
            <h2 className="wg-section-title">Everything You Need To Detect Online Threats</h2>
            <p className="wg-section-sub">
              WebGuard AI combines automated WHOIS data, SSL certificate validation, lexical algorithms, and risk telemetry in one platform.
            </p>
          </div>

          <div className="wg-features-grid">
            {FEATURES.map((feat, idx) => (
              <div key={idx} className="wg-feature-card">
                <div className="feature-icon">{feat.icon}</div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREAT AWARENESS CARDS ───────────────────────────────────── */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">AWARENESS & EDUCATION</span>
            <h2 className="wg-section-title">Common Attack Vectors To Watch Out For</h2>
            <p className="wg-section-sub">
              Recognize the signature patterns used by threat actors to steal credentials and compromise accounts.
            </p>
          </div>

          <div className="wg-academy-grid">
            {AWARENESS_CARDS.map((card, idx) => (
              <div key={idx} className="wg-academy-card">
                <div className="feature-card-top">
                  <div className="academy-card-icon">{card.icon}</div>
                  <span className={`preset-tag ${card.risk}`}>{card.riskLabel}</span>
                </div>
                <h3 className="academy-card-title">{card.title}</h3>
                <p className="academy-card-desc">{card.desc}</p>
                <div className="preview-explanation-box">
                  <strong>Tip:</strong> {card.tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STATS & CTA ────────────────────────────────────────── */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-checklist-box">
            <div className="checklist-content">
              <div className="wg-badge">
                <ShieldCheck size={14} color="#16A34A" />
                <span>Enterprise Trust & Performance</span>
              </div>
              <h2>Built For Organizations, Universities & Security Teams</h2>
              <p>
                WebGuard AI protects users across enterprise endpoints, academic networks, and personal devices with zero data retention.
              </p>

              <div className="checklist-items-grid">
                <div className="check-item">✓ 1.2M+ Suspicious URLs Analyzed</div>
                <div className="check-item">✓ 99.4% Multi-Layer Precision Rate</div>
                <div className="check-item">✓ &lt; 50ms Real-Time Heuristic Engine</div>
                <div className="check-item">✓ Zero Data Retention / Privacy Compliant</div>
              </div>
            </div>

            <div className="checklist-action">
              <button
                type="button"
                className="wg-btn wg-btn-primary wg-btn-lg"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  inputRef.current?.focus();
                }}
              >
                <span>Analyze A URL Now</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
