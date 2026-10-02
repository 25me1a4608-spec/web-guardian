import React, { useState } from 'react';
import {
  Puzzle, ShieldCheck, ShieldAlert, AlertTriangle, Copy, Check,
  Laptop, Layers, ArrowRight, X, Lock, ExternalLink, RefreshCw, Zap, Download
} from 'lucide-react';

export default function ExtensionGuide({ isBackendOnline, onScanUrl }) {
  const [copied, setCopied]               = useState(false);
  const [showBlockDemo, setShowBlockDemo] = useState(false);
  const extensionPath = 'D:\\Fake Website Detector\\code\\extension';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(extensionPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wg-page-wrap">
      {/* Sub Hero */}
      <section className="wg-sub-hero">
        <div className="wrap">
          <div className="wg-sub-hero-inner">
            <div className="wg-badge">
              <Puzzle size={14} color="#0891B2" />
              <span>Chrome Extension (Manifest V3)</span>
            </div>
            <h1 className="wg-sub-hero-title">CyberAware Chrome Shield</h1>
            <p className="wg-sub-hero-desc">
              Real-time active tab monitoring. Automatically detects dangerous phishing links in your browser search & stops access before credentials can be stolen.
            </p>
          </div>
        </div>
      </section>

      {/* Main Extension Guide */}
      <section className="wg-section">
        <div className="wrap">
          {/* Status Row */}
          <div className="wg-ext-status-card">
            <div className="status-item">
              <span className={`status-dot ${isBackendOnline ? 'online' : 'ready'}`} />
              <span>{isBackendOnline ? 'ML Detection API: Online (Port 5000)' : 'Detection Engine: Active'}</span>
            </div>
            <div className="status-item">
              <ShieldCheck size={16} color="#16A34A" />
              <span>Manifest V3 Compliant</span>
            </div>
            <div className="status-item">
              <Lock size={16} color="#0891B2" />
              <span>Zero-Log Privacy Guard</span>
            </div>

            <button
              type="button"
              className="wg-btn wg-btn-primary wg-btn-sm"
              onClick={() => setShowBlockDemo(true)}
            >
              <ShieldAlert size={14} />
              <span>Test Interception Shield Screen</span>
            </button>
            <a
              href="/web guardian extension.zip"
              download
              className="wg-btn wg-btn-primary wg-btn-sm"
              style={{ backgroundColor: '#059669', borderColor: '#059669', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={14} />
              <span>Download Extension (.zip)</span>
            </a>
          </div>

          {/* Installation Steps */}
          <div className="wg-section-header margin-top">
            <span className="wg-section-tag">INSTALLATION GUIDE</span>
            <h2 className="wg-section-title">Installing CyberAware Shield in Chrome</h2>
            <p className="wg-section-sub">Follow these 5 simple steps to enable real-time phishing protection in Google Chrome.</p>
          </div>

          <div className="wg-ext-steps-grid">
            <div className="ext-step-card">
              <div className="step-num">1</div>
              <h3>Download & Extract</h3>
              <p>Download the <strong>web guardian extension.zip</strong> file using the button above and extract its contents to a folder on your computer.</p>
            </div>

            <div className="ext-step-card">
              <div className="step-num">2</div>
              <h3>Open Chrome Extensions</h3>
              <p>Type <code>chrome://extensions</code> into your Chrome address bar or open <strong>Menu (⋮) &gt; Extensions &gt; Manage Extensions</strong>.</p>
            </div>

            <div className="ext-step-card">
              <div className="step-num">3</div>
              <h3>Enable Developer Mode</h3>
              <p>Toggle the <strong>Developer mode</strong> switch in the upper right-hand corner of the Extensions page to <strong>ON</strong>.</p>
            </div>

            <div className="ext-step-card">
              <div className="step-num">4</div>
              <h3>Click "Load unpacked"</h3>
              <p>Click <strong>Load unpacked</strong> and browse to the extracted folder. Select the root folder that contains the <code>manifest.json</code> file.</p>
            </div>

            <div className="ext-step-card">
              <div className="step-num">5</div>
              <h3>Pin & Auto-Protect</h3>
              <p>Pin <strong>CyberAware Shield</strong> to your browser toolbar. As you search or browse, high-risk links are automatically blocked!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Auto Detection & Interception Feature Showcase */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">AUTOMATED INTERCEPTION</span>
            <h2 className="wg-section-title">How Auto-Detection Stops Attackers</h2>
            <p className="wg-section-sub">
              When a user navigates to or searches a high-risk URL, CyberAware Shield instantly interrupts the web request before the malicious page loads.
            </p>
          </div>

          <div className="wg-interception-showcase-grid">
            <div className="showcase-card">
              <div className="showcase-icon cyan">
                <Laptop size={22} color="#0891B2" />
              </div>
              <h3>1. Active Tab URL Monitoring</h3>
              <p>Monitors background web navigation requests in real time using Chrome’s isolated declarativeNetRequest API.</p>
            </div>

            <div className="showcase-card">
              <div className="showcase-icon warning">
                <AlertTriangle size={22} color="#F59E0B" />
              </div>
              <h3>2. Instant AI Risk Evaluation</h3>
              <p>Runs sub-50ms lexical heuristic scoring against domain age, SSL status, and brand spoofing signatures.</p>
            </div>

            <div className="showcase-card">
              <div className="showcase-icon danger">
                <ShieldAlert size={22} color="#DC2626" />
              </div>
              <h3>3. Automatic Interception Block</h3>
              <p>Instantly replaces malicious page content with an enterprise red <strong>ACCESS BLOCKED</strong> warning screen to protect credentials.</p>
            </div>
          </div>

          <div className="wg-center-cta-wrap margin-top">
            <button
              type="button"
              className="wg-btn wg-btn-primary wg-btn-lg"
              onClick={() => setShowBlockDemo(true)}
            >
              <ShieldAlert size={18} />
              <span>Preview Live Interception Block Screen</span>
            </button>
          </div>
        </div>
      </section>

      {/* INTERCEPTION SCREEN DEMO MODAL */}
      {showBlockDemo && (
        <div className="wg-modal-backdrop" onClick={() => setShowBlockDemo(false)}>
          <div className="wg-interception-modal" onClick={(e) => e.stopPropagation()}>
            <div className="interception-banner">
              <div className="interception-shield-icon">
                <ShieldAlert size={48} color="#DC2626" />
              </div>
              <span className="interception-badge">CYBERAWARE AUTO-PROTECTION ACTIVE</span>
              <h2 className="interception-title">ACCESS BLOCKED — MALICIOUS PHISHING DETECTED</h2>
              <p className="interception-sub">
                CyberAware Shield automatically intercepted your browser navigation request to prevent credential theft.
              </p>
            </div>

            <div className="interception-body">
              <div className="blocked-url-box">
                <span className="lbl">Blocked Target Host:</span>
                <code>http://verify-appleid-security-update.account-notice.net/login</code>
              </div>

              <div className="interception-reasons-grid">
                <div className="reason-item">
                  <strong>🚨 Brand Impersonation:</strong> Deceptive spoofing of Apple ID authentication portal.
                </div>
                <div className="reason-item">
                  <strong>🚨 High Risk Score:</strong> Evaluated at 94/100 Threat Severity by AI detection.
                </div>
                <div className="reason-item">
                  <strong>🚨 Disposable Domain:</strong> Host registered 2 days ago via suspicious TLD.
                </div>
              </div>
            </div>

            <div className="interception-footer">
              <button
                type="button"
                className="wg-btn wg-btn-primary wg-btn-lg full-w"
                onClick={() => setShowBlockDemo(false)}
              >
                <span>Return to Safety (Close Block Screen)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
