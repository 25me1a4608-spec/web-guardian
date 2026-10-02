import React, { useState } from 'react';
import {
  Puzzle,
  Server,
  Activity,
  ShieldCheck,
  Download,
  ExternalLink,
  Copy,
  Check,
  Laptop,
  Globe,
  ArrowDown,
  Layers,
  Lock,
  Cpu,
  Search,
  CheckCircle2
} from 'lucide-react';

const PRODUCTION_BACKEND_URL = 'https://web-guardian-seven.vercel.app';
const PRODUCTION_FRONTEND_URL = 'https://web-guardian-jo5g.vercel.app';
const EXTENSION_ZIP_PATH = '/web guardian extension.zip';

export default function ExtensionGuide({ isBackendOnline = true }) {
  const [copiedStep2, setCopiedStep2] = useState(false);

  const handleCopyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedStep2(true);
    setTimeout(() => setCopiedStep2(false), 2000);
  };

  const statusCards = [
    {
      title: 'WebGuard AI API',
      status: 'Online',
      statusClass: 'status-online',
      desc: 'Connected to the WebGuard AI production security backend.',
      icon: <Server size={20} className="status-icon" color="#16A34A" />
    },
    {
      title: 'Chrome Extension',
      status: 'Ready',
      statusClass: 'status-ready',
      desc: 'Lightweight browser protection that analyzes the current website.',
      icon: <Puzzle size={20} className="status-icon" color="#0891B2" />
    },
    {
      title: 'Real-Time URL Analysis',
      status: 'Active',
      statusClass: 'status-active',
      desc: 'Send the current tab URL to the WebGuard AI security engine for analysis.',
      icon: <Activity size={20} className="status-icon" color="#2563EB" />
    },
    {
      title: 'Privacy Protection',
      status: 'Protected',
      statusClass: 'status-protected',
      desc: 'Use the WebGuard AI security service without exposing sensitive page content unnecessarily.',
      icon: <ShieldCheck size={20} className="status-icon" color="#059669" />
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Download Extension',
      text: 'Download the WebGuard AI extension.',
      action: (
        <a
          href={EXTENSION_ZIP_PATH}
          download="web guardian extension.zip"
          className="wg-btn wg-btn-primary wg-btn-sm"
          style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={14} />
          <span>Download .zip</span>
        </a>
      )
    },
    {
      number: 2,
      title: 'Open Extensions Page',
      text: 'Open chrome://extensions in Google Chrome.',
      action: (
        <button
          type="button"
          onClick={handleCopyChromeUrl}
          className="wg-copy-chip"
          title="Click to copy chrome://extensions"
        >
          <code>chrome://extensions</code>
          {copiedStep2 ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
          <span>{copiedStep2 ? 'Copied!' : 'Copy'}</span>
        </button>
      )
    },
    {
      number: 3,
      title: 'Developer Mode',
      text: 'Enable Developer mode.'
    },
    {
      number: 4,
      title: 'Load Unpacked',
      text: 'Click Load unpacked and select the extracted WebGuard AI extension folder.'
    },
    {
      number: 5,
      title: 'Pin Toolbar Icon',
      text: 'Pin WebGuard AI to your Chrome toolbar.'
    },
    {
      number: 6,
      title: 'Analyze Any Website',
      text: 'Open any website and click the WebGuard AI extension to analyze the current tab.'
    }
  ];

  const architectureFlow = [
    {
      title: 'Chrome Browser',
      role: 'User Navigation & Active Tab',
      icon: <Globe size={22} color="#0891B2" />
    },
    {
      title: 'WebGuard AI Extension',
      role: 'Inspects Hostname & URL Context',
      icon: <Puzzle size={22} color="#0284C7" />
    },
    {
      title: 'Current Website URL',
      role: 'Extracted Clean Target Payload',
      icon: <Laptop size={22} color="#4F46E5" />
    },
    {
      title: 'WebGuard AI Production API',
      role: 'Production Endpoint via Vercel',
      icon: <Server size={22} color="#16A34A" />
    },
    {
      title: 'Security Analysis',
      role: '18 Lexical Heuristics + Threat Feeds',
      icon: <Cpu size={22} color="#D97706" />
    },
    {
      title: 'Risk Result',
      role: 'Scored 0–100 Threat Verdict & Badges',
      icon: <ShieldCheck size={22} color="#DC2626" />
    },
    {
      title: 'WebGuard AI Extension',
      role: 'Instant UI Display & Security Guidance',
      icon: <CheckCircle2 size={22} color="#059669" />
    }
  ];

  return (
    <div className="wg-page-wrap">
      {/* Sub Hero */}
      <section className="wg-sub-hero">
        <div className="wrap">
          <div className="wg-sub-hero-inner">
            <div className="wg-badge">
              <Puzzle size={14} color="#0891B2" />
              <span>WebGuard AI Extension</span>
            </div>
            <h1 className="wg-sub-hero-title">Install WebGuard AI</h1>
            <p className="wg-sub-hero-desc">
              Protect your browsing with WebGuard AI — detect suspicious websites and phishing threats before your credentials or sensitive information can be exposed.
            </p>

            {/* Action Buttons */}
            <div className="wg-ext-hero-actions">
              <a
                href={EXTENSION_ZIP_PATH}
                download="web guardian extension.zip"
                className="wg-btn wg-btn-primary wg-btn-lg"
                id="btn-download-extension"
              >
                <Download size={18} />
                <span>Download WebGuard AI Extension</span>
              </a>
              <a
                href={PRODUCTION_FRONTEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn wg-btn-secondary wg-btn-lg"
                id="btn-open-webguard"
              >
                <ExternalLink size={18} />
                <span>Open WebGuard AI</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Status Cards Section */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">SERVICE TELEMETRY</span>
            <h2 className="wg-section-title">System Status &amp; Readiness</h2>
            <p className="wg-section-sub">
              Live operational verification across WebGuard AI security components.
            </p>
          </div>

          <div className="wg-status-grid">
            {statusCards.map((card, idx) => (
              <div key={idx} className="wg-status-box-card">
                <div className="status-box-header">
                  <div className="status-box-icon-wrap">{card.icon}</div>
                  <span className={`wg-status-pill ${card.statusClass}`}>
                    <span className="status-pulse-dot" />
                    {card.status}
                  </span>
                </div>
                <h3 className="status-box-title">{card.title}</h3>
                <p className="status-box-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Guide Section */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">STEP-BY-STEP INSTRUCTIONS</span>
            <h2 className="wg-section-title">Install WebGuard AI in Chrome</h2>
            <p className="wg-section-sub">
              Follow these simple steps to activate real-time phishing protection in your Chrome browser.
            </p>
          </div>

          <div className="wg-steps-six-grid">
            {steps.map((st) => (
              <div key={st.number} className="wg-step-tile">
                <div className="wg-step-tile-top">
                  <div className="step-badge-number">Step {st.number}</div>
                </div>
                <h3 className="wg-step-tile-title">{st.title}</h3>
                <p className="wg-step-tile-text">{st.text}</p>
                {st.action && <div className="wg-step-tile-action">{st.action}</div>}
              </div>
            ))}
          </div>

          {/* Quick Action Reminder */}
          <div className="wg-install-cta-banner">
            <div className="cta-banner-text">
              <h3>Ready to secure your browsing experience?</h3>
              <p>Download the official extension package and load unpacked in seconds.</p>
            </div>
            <div className="cta-banner-actions">
              <a
                href={EXTENSION_ZIP_PATH}
                download="web guardian extension.zip"
                className="wg-btn wg-btn-primary"
              >
                <Download size={16} />
                <span>Download WebGuard AI Extension</span>
              </a>
              <a
                href={PRODUCTION_FRONTEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn wg-btn-outline"
              >
                <ExternalLink size={16} />
                <span>Open WebGuard AI</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">ARCHITECTURE &amp; DATA FLOW</span>
            <h2 className="wg-section-title">How WebGuard AI Works</h2>
            <p className="wg-section-sub">
              End-to-end telemetry pipeline from browser tab capture to security threat determination.
            </p>
          </div>

          <div className="wg-arch-flow-container">
            {architectureFlow.map((node, i) => (
              <React.Fragment key={i}>
                <div className="wg-arch-flow-node">
                  <div className="node-icon-bubble">{node.icon}</div>
                  <div className="node-content">
                    <span className="node-step-indicator">Stage {i + 1}</span>
                    <h4 className="node-title">{node.title}</h4>
                    <p className="node-role">{node.role}</p>
                  </div>
                </div>
                {i < architectureFlow.length - 1 && (
                  <div className="wg-arch-flow-arrow" aria-hidden="true">
                    <ArrowDown size={22} className="flow-down-icon" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
