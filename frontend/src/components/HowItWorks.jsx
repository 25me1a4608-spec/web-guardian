import React from 'react';
import {
  Layers,
  Search,
  Cpu,
  Shield,
  HelpCircle,
  Zap,
  Globe,
  Database,
  Lock,
  ArrowDown,
  ArrowRight,
  Puzzle,
  Server,
  Brain,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function HowItWorks({ setActiveTab }) {
  return (
    <div className="how-it-works-container">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="architecture-header">
        <div className="arch-badge">
          <Layers size={14} />
          <span>System Overview &amp; Architecture</span>
        </div>
        <h2 className="arch-title">How WebGuard AI Works</h2>
        <p className="arch-subtitle">
          "Don't just detect the threat. Understand it."
        </p>
        <p className="arch-tagline-sub">
          A transparent, multi-stage cybersecurity analysis system engineered for explainable URL defense.
        </p>
      </div>

      {/* ── 1. Visual Flow: How It Works (Requirement 11) ─────────────── */}
      <div className="architecture-card how-it-works-flow-card">
        <div className="card-header-badge-row">
          <span className="badge-pill cyan">Analysis Pipeline</span>
          <span className="step-count-pill">7 Core Stages</span>
        </div>
        <h3 className="card-section-title">End-to-End Analysis Workflow</h3>
        <p className="card-section-desc">
          How an unvetted link travels from initial input to plain-English security guidance:
        </p>

        <div className="stages-flow-grid">
          {/* Step 1 */}
          <div className="flow-stage-card">
            <div className="stage-num">01</div>
            <div className="stage-icon-box blue"><Globe size={20} /></div>
            <h4>URL Input</h4>
            <p>Target URL is validated, normalized, and checked against protocol allowlists (HTTP/HTTPS only).</p>
          </div>

          <div className="flow-arrow-separator">&rarr;</div>

          {/* Step 2 */}
          <div className="flow-stage-card">
            <div className="stage-num">02</div>
            <div className="stage-icon-box cyan"><Search size={20} /></div>
            <h4>Feature Extraction</h4>
            <p>Extracts 18 lexical and structural attributes: subdomains, IP hosts, keywords, and path structures.</p>
          </div>

          <div className="flow-arrow-separator">&rarr;</div>

          {/* Step 3 */}
          <div className="flow-stage-card">
            <div className="stage-num">03</div>
            <div className="stage-icon-box purple"><Database size={20} /></div>
            <h4>Threat Intelligence</h4>
            <p>Queries external reputation feeds (e.g. VirusTotal/Google Safe Browsing) or falls back to local engine.</p>
          </div>

          <div className="flow-arrow-separator">&rarr;</div>

          {/* Step 4 */}
          <div className="flow-stage-card">
            <div className="stage-num">04</div>
            <div className="stage-icon-box pink"><Brain size={20} /></div>
            <h4>Risk Prediction</h4>
            <p>ML-ready feature-based risk model predicts threat probability using normalized vector weights.</p>
          </div>

          <div className="flow-arrow-separator">&rarr;</div>

          {/* Step 5 */}
          <div className="flow-stage-card">
            <div className="stage-num">05</div>
            <div className="stage-icon-box amber"><Cpu size={20} /></div>
            <h4>Risk Engine</h4>
            <p>Synthesizes local indicators, TI, and ML signals into an explainable 0–100 threat score.</p>
          </div>

          <div className="flow-arrow-separator">&rarr;</div>

          {/* Step 6 */}
          <div className="flow-stage-card">
            <div className="stage-num">06</div>
            <div className="stage-icon-box green"><HelpCircle size={20} /></div>
            <h4>AI Explanation</h4>
            <p>Translates heuristic telemetry into clear, human-readable reasons explaining WHY the score was assigned.</p>
          </div>

          <div className="flow-arrow-separator">&rarr;</div>

          {/* Step 7 */}
          <div className="flow-stage-card highlight">
            <div className="stage-num">07</div>
            <div className="stage-icon-box green-bright"><ShieldCheck size={20} /></div>
            <h4>Security Recommendation</h4>
            <p>Delivers prioritized, actionable steps advising the user on safe browsing decisions.</p>
          </div>
        </div>
      </div>

      {/* ── 2. System Architecture Visual (Requirement 12) ─────────────── */}
      <div className="architecture-card system-architecture-card">
        <div className="card-header-badge-row">
          <span className="badge-pill purple">System Architecture</span>
          <span className="engine-badge-center">Central Engine: WebGuard Backend</span>
        </div>
        <h3 className="card-section-title">Component Hierarchy &amp; Data Flow</h3>
        <p className="card-section-desc">
          <strong>The backend is the central analysis engine.</strong> The web app and Chrome Extension both interface with the same secure REST API endpoints:
        </p>

        <div className="architecture-flow-diagram">
          {/* Row 1: Clients */}
          <div className="arch-layer-row clients">
            <div className="arch-layer-label">CLIENT INTERFACES</div>
            <div className="arch-boxes-group">
              <div className="arch-box client-box">
                <Puzzle size={22} className="box-icon" />
                <div className="box-text">
                  <h5>Chrome Extension</h5>
                  <span>Manifest V3 Active Tab Monitor</span>
                </div>
              </div>
              <div className="arch-box client-box">
                <Globe size={22} className="box-icon" />
                <div className="box-text">
                  <h5>WebGuard Web App</h5>
                  <span>Interactive Scanner &amp; Dashboard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="arch-pipe-down">
            <ArrowDown size={20} />
            <span className="pipe-label">HTTP POST /api/analyze</span>
          </div>

          {/* Row 2: Central Backend Engine */}
          <div className="arch-layer-row core-backend">
            <div className="arch-layer-label highlight">CENTRAL BACKEND ENGINE (Node.js / Express)</div>
            <div className="core-engine-container">
              <div className="engine-banner">
                <Server size={18} />
                <span>WebGuard Backend — Port 5001</span>
                <span className="engine-note">Strict Input Validation • Rate Limiter • Safe Logging</span>
              </div>

              <div className="internal-services-grid">
                <div className="service-node">
                  <Search size={16} />
                  <h6>URL Analyzer</h6>
                  <span>18 Structural Lexical Features</span>
                </div>
                <div className="service-node">
                  <Database size={16} />
                  <h6>Threat Intelligence</h6>
                  <span>External Feeds / Fallback</span>
                </div>
                <div className="service-node">
                  <Brain size={16} />
                  <h6>ML-Ready Predictor</h6>
                  <span>Feature-based Model</span>
                </div>
                <div className="service-node">
                  <Cpu size={16} />
                  <h6>Risk Engine</h6>
                  <span>Transparent Scoring (0–100)</span>
                </div>
                <div className="service-node">
                  <HelpCircle size={16} />
                  <h6>Explanation Engine</h6>
                  <span>Plain-English Reasoning</span>
                </div>
              </div>
            </div>
          </div>

          <div className="arch-pipe-down">
            <ArrowDown size={20} />
            <span className="pipe-label">Structured JSON Telemetry &amp; Recommendations</span>
          </div>

          {/* Row 3: Output & Warning */}
          <div className="arch-layer-row output">
            <div className="arch-layer-label">USER OUTCOMES</div>
            <div className="arch-boxes-group">
              <div className="arch-box outcome-box">
                <ShieldCheck size={20} className="box-icon green" />
                <div className="box-text">
                  <h5>Dashboard Analytics</h5>
                  <span>Scan Telemetry &amp; Insights</span>
                </div>
              </div>
              <div className="arch-box outcome-box">
                <AlertTriangle size={20} className="box-icon amber" />
                <div className="box-text">
                  <h5>Real-Time Warning</h5>
                  <span>Caution / Safe Exit Guidance</span>
                </div>
              </div>
              <div className="arch-box outcome-box">
                <ShieldAlert size={20} className="box-icon red" />
                <div className="box-text">
                  <h5>Credential Defense</h5>
                  <span>Prevent Phishing Losses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Hackathon Value: Why WebGuard AI? (Requirement 13) ──────── */}
      <div className="architecture-card why-webguard-card">
        <div className="card-header-badge-row">
          <span className="badge-pill amber">Core Innovations</span>
          <span className="step-count-pill">Hackathon Value</span>
        </div>
        <h3 className="card-section-title">Why WebGuard AI?</h3>
        <p className="card-section-desc">
          Modern phishing exploits human cognitive blindspots. WebGuard AI combines transparent telemetry with user empowerment:
        </p>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon cyan"><HelpCircle size={20} /></div>
            <h4>Explainable Risk Scoring</h4>
            <p>Scores are never opaque black boxes. Every point is tied to verified lexical, structural, and behavioral indicators.</p>
          </div>

          <div className="why-card">
            <div className="why-icon purple"><Search size={20} /></div>
            <h4>Multiple Security Indicators</h4>
            <p>18 distinct indicators inspect brand impersonation, punycode lookalikes, IP hosts, and chained authentication paths.</p>
          </div>

          <div className="why-card">
            <div className="why-icon blue"><Database size={20} /></div>
            <h4>Threat Intelligence Integration</h4>
            <p>Seamlessly integrates external reputation providers with resilient local fallback when offline.</p>
          </div>

          <div className="why-card">
            <div className="why-icon pink"><Brain size={20} /></div>
            <h4>ML-Ready Architecture</h4>
            <p>Normalized 18-dimension feature vector cleanly decouples heuristic scoring from future neural or tree models.</p>
          </div>

          <div className="why-card">
            <div className="why-icon green"><Puzzle size={20} /></div>
            <h4>Browser Extension Integration</h4>
            <p>Brings enterprise-grade protection directly into the browser workflow via Manifest V3 active tab inspection.</p>
          </div>

          <div className="why-card">
            <div className="why-icon amber"><Shield size={20} /></div>
            <h4>Security Awareness First</h4>
            <p>Educates users at the moment of risk with actionable context rather than cryptic technical error codes.</p>
          </div>

          <div className="why-card">
            <div className="why-icon teal"><Lock size={20} /></div>
            <h4>Privacy-Conscious URL Analysis</h4>
            <p>Never executes untrusted scripts, renders untrusted DOM, or exposes private tokens to external trackers.</p>
          </div>
        </div>
      </div>

      {/* ── 4. Limitations Section (Requirement 14) ────────────────────── */}
      <div className="architecture-card limitations-card">
        <div className="card-header-badge-row">
          <span className="badge-pill red">Technical Boundaries</span>
          <span className="step-count-pill">Engineering Rigor</span>
        </div>
        <h3 className="card-section-title">Current Limitations</h3>
        <p className="card-section-desc">
          Responsible cybersecurity requires transparent disclosure of operational constraints and technical assumptions:
        </p>

        <div className="limitations-grid">
          <div className="limitation-item">
            <AlertCircle size={18} className="limitation-icon" />
            <div>
              <h5>Risk assessment is not an absolute guarantee</h5>
              <p>Sophisticated zero-day adversaries may construct technically compliant URLs on newly registered reputable domains.</p>
            </div>
          </div>

          <div className="limitation-item">
            <AlertCircle size={18} className="limitation-icon" />
            <div>
              <h5>Threat-intelligence coverage depends on configured providers</h5>
              <p>Reputation checks are limited to the coverage and freshness of active API providers (e.g. VirusTotal/Google Safe Browsing).</p>
            </div>
          </div>

          <div className="limitation-item">
            <AlertCircle size={18} className="limitation-icon" />
            <div>
              <h5>Current ML layer is feature-based unless a trained model is connected</h5>
              <p>The prediction module uses transparent weighted heuristic vectors and does not claim trained deep-learning accuracy.</p>
            </div>
          </div>

          <div className="limitation-item">
            <AlertCircle size={18} className="limitation-icon" />
            <div>
              <h5>Some browser-internal pages cannot be analyzed</h5>
              <p>Browser security boundaries restrict extensions from inspecting internal URLs like <code>chrome://</code>, <code>about:blank</code>, and Web Store pages.</p>
            </div>
          </div>

          <div className="limitation-item">
            <AlertCircle size={18} className="limitation-icon" />
            <div>
              <h5>External API availability may affect reputation checks</h5>
              <p>Network connectivity disruptions or API quotas automatically trigger graceful fallback to local heuristic evaluation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <div className="architecture-cta-strip">
        <div className="cta-left">
          <h4>Ready to test WebGuard AI?</h4>
          <p>Analyze any web link or run harmless predefined demo scenarios.</p>
        </div>
        <button
          type="button"
          className="btn-primary-compact"
          onClick={() => setActiveTab('scanner')}
        >
          <span>Open Link Scanner</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
