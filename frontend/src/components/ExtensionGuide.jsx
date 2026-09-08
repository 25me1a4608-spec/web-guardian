import React, { useState } from 'react';
import {
  Puzzle,
  ShieldCheck,
  AlertTriangle,
  Laptop,
  Layers,
  Copy,
  Check
} from 'lucide-react';

export default function ExtensionGuide({ isBackendOnline, onScanUrl }) {
  const [copied, setCopied] = useState(false);
  const extensionPath = '/Users/achantiabhishek/fack web site detector AN/extension';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(extensionPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="extension-guide-container">
      {/* Banner */}
      <div className="arch-badge">
        <Puzzle size={14} />
        <span>Step 5 — Chrome Extension (Manifest V3)</span>
      </div>

      <div className="extension-hero">
        <h2 className="arch-title">WebGuard AI for Chrome</h2>
        <p className="arch-subtitle">
          Bring real-time phishing detection directly to your browser toolbar.
          Analyze any visited page or paste untrusted links before opening them.
        </p>

        <div className="extension-status-pill-row">
          <div className={`status-pill ${isBackendOnline ? 'online' : 'offline'}`}>
            <span className="dot" />
            <span>{isBackendOnline ? 'Backend API Ready (Port 5001)' : 'Backend Offline — start node server.js'}</span>
          </div>
          <div className="status-pill v3">
            <span>Manifest V3 Compliant</span>
          </div>
          <div className="status-pill privacy">
            <span>Minimal Permissions (activeTab only)</span>
          </div>
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="extension-steps-grid">
        <div className="ext-step-card">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Open Chrome Extensions</h3>
            <p>In Google Chrome, navigate to the extension management page by typing:</p>
            <div className="code-snippet-box">
              <code>chrome://extensions</code>
            </div>
            <p className="subtext">Or click Chrome Menu (⋮) &gt; Extensions &gt; Manage Extensions.</p>
          </div>
        </div>

        <div className="ext-step-card">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Enable Developer Mode</h3>
            <p>Look at the top-right corner of the Extensions page and toggle the <strong>Developer mode</strong> switch to ON.</p>
            <div className="guide-chip">Enables "Load unpacked" button</div>
          </div>
        </div>

        <div className="ext-step-card">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Click "Load unpacked"</h3>
            <p>Click the <strong>Load unpacked</strong> button in the top-left toolbar and select the folder below:</p>
            <div className="path-copy-box">
              <span className="path-text">{extensionPath}</span>
              <button className="copy-btn" onClick={handleCopyPath} title="Copy path">
                {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="ext-step-card">
          <div className="step-number">4</div>
          <div className="step-content">
            <h3>Pin to Toolbar &amp; Inspect</h3>
            <p>Click the Chrome puzzle icon in the toolbar, pin <strong>WebGuard AI</strong>, and click it on any webpage to analyze!</p>
            <div className="guide-chip success">✓ Ready to protect</div>
          </div>
        </div>
      </div>

      {/* Protection While You Browse Section (Step 7) */}
      <div className="extension-protection-banner">
        <div className="prot-banner-header">
          <ShieldCheck size={22} className="prot-banner-icon" />
          <div>
            <h3 className="prot-banner-title">Protection while you browse</h3>
            <p className="prot-banner-desc">
              Use the WebGuard AI Chrome Extension to analyze suspicious links directly from your browser.
            </p>
          </div>
        </div>

        <div className="protection-states-row">
          <div className="prot-state-box low">
            <div className="state-badge">LOW RISK</div>
            <div className="state-msg">No major suspicious indicators were detected from the analyzed URL.</div>
            <div className="state-action">Reassuring safe status &bull; Full technical breakdown</div>
          </div>

          <div className="prot-state-box susp">
            <div className="state-badge">SUSPICIOUS</div>
            <div className="state-msg">This URL contains indicators that require caution.</div>
            <div className="state-action">"Go Back (Safe Exit)" &bull; Expandable indicators</div>
          </div>

          <div className="prot-state-box high">
            <div className="state-badge">HIGH RISK</div>
            <div className="state-msg">This URL contains multiple high-risk indicators. Avoid entering sensitive information.</div>
            <div className="state-action">Prompt "Go Back" retreat &bull; Threat notification alert</div>
          </div>
        </div>
      </div>

      {/* Extension Feature Highlights */}
      <div className="extension-features-section">
        <h3 className="section-title">Extension Capabilities &amp; Architecture</h3>

        <div className="features-subgrid">
          <div className="feature-box">
            <div className="feature-icon-wrap cyan">
              <Laptop size={20} />
            </div>
            <h4>Active Tab Auto-Detection</h4>
            <p>
              Instantly detects the URL in your active tab using Chrome's <code>activeTab</code> API without accessing your browsing history or background tabs.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap green">
              <ShieldCheck size={20} />
            </div>
            <h4>Shared Backend Pipeline</h4>
            <p>
              Connects directly to the existing Express backend on <code>localhost:5001</code> (or configured production API). Runs the same 18-feature vector extraction, heuristic risk engine, and ML model.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap amber">
              <AlertTriangle size={20} />
            </div>
            <h4>Safety Badge Indicators</h4>
            <p>
              Updates the toolbar badge in real-time with visual indicators: <span className="badge-preview safe">✓ Safe</span>, <span className="badge-preview susp">? Suspicious</span>, or <span className="badge-preview risk">! High Risk</span>.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap purple">
              <Layers size={20} />
            </div>
            <h4>Full Report Bridge</h4>
            <p>
              One click opens the complete WebGuard AI dashboard with detailed indicators, feature weights, and threat intelligence telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Test Links */}
      <div className="quick-test-section">
        <h4 className="quick-test-title">Quick Test Previews (Try in Web App):</h4>
        <div className="quick-test-buttons">
          <button
            className="test-chip clean"
            onClick={() => onScanUrl && onScanUrl('https://www.google.com')}
          >
            Safe: google.com
          </button>
          <button
            className="test-chip warn"
            onClick={() => onScanUrl && onScanUrl('https://verify-billing-secure-portal.xyz/update')}
          >
            Suspicious: verify-billing-secure-portal.xyz
          </button>
          <button
            className="test-chip danger"
            onClick={() => onScanUrl && onScanUrl('http://192.168.1.1/banking/login.php')}
          >
            High Risk: Raw IP Host
          </button>
          <button
            className="test-chip danger"
            onClick={() => onScanUrl && onScanUrl('http://paypal-security-update.com@login-verify.net/account')}
          >
            High Risk: @ Symbol Credential Spoof
          </button>
        </div>
      </div>
    </div>
  );
}
