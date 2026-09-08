import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Play,
  RotateCcw,
  Info,
  Sliders
} from 'lucide-react';

export const DEMO_SCENARIOS = [
  {
    id: 'demo-low',
    name: 'LOW RISK DEMO',
    label: 'Scenario 1: Clean Baseline',
    url: 'https://example.com',
    expectedCategory: 'LOW RISK',
    badgeClass: 'low',
    icon: ShieldCheck,
    description: 'Safe, standard HTTPS destination with clean structural baseline and no suspicious indicators.',
    highlights: ['Standard HTTPS protocol', 'Zero suspicious keywords', 'Normal apex domain structure']
  },
  {
    id: 'demo-suspicious',
    name: 'SUSPICIOUS DEMO',
    label: 'Scenario 2: Caution Signals',
    url: 'https://example.com/login/verify-account',
    expectedCategory: 'SUSPICIOUS',
    badgeClass: 'suspicious',
    icon: AlertTriangle,
    description: 'Harmless synthetic URL containing sensitive auth keywords and an unusual nested path structure.',
    highlights: ['Multiple sensitive keywords (login, verify, account)', 'Unusual chained path structure', 'Cautionary recommendation']
  },
  {
    id: 'demo-high',
    name: 'HIGH RISK DEMO',
    label: 'Scenario 3: Multi-Signal Threat',
    url: 'http://192.0.2.10/login/verify-account?secure=true',
    expectedCategory: 'HIGH RISK',
    badgeClass: 'high',
    icon: ShieldAlert,
    description: 'Harmless synthetic URL with multiple risk signals: unencrypted HTTP, direct IP host (RFC 5737 test space), and auth keywords.',
    highlights: ['Raw IP address (RFC 5737 documentation space)', 'Insecure HTTP protocol', 'Chained authentication query & path']
  }
];

export default function DemoScenarios({
  isDemoMode,
  onToggleDemoMode,
  onRunDemo,
  onResetDemo,
  activeScenarioId = null
}) {
  return (
    <section className="demo-scenarios-section" id="demo-scenarios-container">
      {/* Demo Mode Header Bar */}
      <div className="demo-mode-banner">
        <div className="demo-banner-left">
          <div className="demo-icon-badge">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="demo-title-row">
              <span className="demo-title">Try Demo Scenarios</span>
              <span className="demo-mode-pill">
                {isDemoMode ? 'Demo Mode Active' : 'Demo Mode Available'}
              </span>
            </div>
            <p className="demo-disclaimer">
              Demo Mode — Results may use predefined test scenarios. Built for live hackathon presentation reliability.
            </p>
          </div>
        </div>

        <div className="demo-banner-actions">
          <button
            type="button"
            className={`btn-demo-toggle ${isDemoMode ? 'active' : ''}`}
            onClick={onToggleDemoMode}
            title={isDemoMode ? 'Turn off Demo Mode' : 'Enable Demo Mode for presentation'}
          >
            <Sliders size={14} />
            <span>{isDemoMode ? 'Demo Mode: ON' : 'Enable Demo Mode'}</span>
          </button>

          {isDemoMode && (
            <button
              type="button"
              className="btn-demo-reset"
              onClick={onResetDemo}
              title="Reset Demo state to standard mode"
            >
              <RotateCcw size={14} />
              <span>Reset Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Scenario Cards */}
      <div className="demo-cards-grid">
        {DEMO_SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isActive = activeScenarioId === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`demo-card ${scenario.badgeClass} ${isActive ? 'active-scenario' : ''}`}
            >
              <div className="demo-card-top">
                <div className={`demo-category-badge ${scenario.badgeClass}`}>
                  <Icon size={14} />
                  <span>{scenario.name}</span>
                </div>
                <span className="expected-pill">Expected: {scenario.expectedCategory}</span>
              </div>

              <h4 className="demo-scenario-label">{scenario.label}</h4>

              <div className="demo-url-box" title={scenario.url}>
                <span className="demo-url-text">{scenario.url}</span>
              </div>

              <p className="demo-card-desc">{scenario.description}</p>

              <div className="demo-highlights">
                {scenario.highlights.map((h, idx) => (
                  <div key={idx} className="demo-highlight-item">
                    <span className="bullet">&bull;</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="demo-card-footer">
                <button
                  type="button"
                  className={`btn-run-demo ${scenario.badgeClass}`}
                  onClick={() => onRunDemo(scenario)}
                  id={`run-demo-${scenario.id}`}
                >
                  <Play size={14} fill="currentColor" />
                  <span>Run Demo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="demo-safety-note">
        <Info size={14} />
        <span>
          <strong>Data Safety Guarantee:</strong> All demo scenarios use harmless synthetic targets or reserved test documentation IP space (RFC 5737). No real credentials, malware, or malicious infrastructure are ever contacted or simulated.
        </span>
      </div>
    </section>
  );
}
