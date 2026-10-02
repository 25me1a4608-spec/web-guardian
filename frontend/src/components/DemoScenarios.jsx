import React from 'react';
import { Play, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, RefreshCw, Zap } from 'lucide-react';

export const DEMO_SCENARIOS = [
  {
    id: 'demo-low',
    name: 'LOW RISK',
    label: 'Scenario 1: Clean Baseline',
    url: 'https://example.com',
    expectedCategory: 'LOW RISK',
    badgeClass: 'safe',
    icon: <CheckCircle2 size={16} color="#16A34A" />,
    description: 'Safe HTTPS destination with clean structural baseline and no suspicious indicators.',
    highlights: ['Standard HTTPS protocol', 'Zero suspicious keywords', 'Normal apex domain structure'],
  },
  {
    id: 'demo-suspicious',
    name: 'SUSPICIOUS',
    label: 'Scenario 2: Caution Signals',
    url: 'https://example.com/login/verify-account',
    expectedCategory: 'SUSPICIOUS',
    badgeClass: 'warn',
    icon: <AlertTriangle size={16} color="#F59E0B" />,
    description: 'Synthetic URL with sensitive auth keywords and unusual nested path structure.',
    highlights: ['Multiple sensitive keywords', 'Unusual chained path', 'Cautionary recommendation'],
  },
  {
    id: 'demo-high',
    name: 'HIGH RISK',
    label: 'Scenario 3: Multi-Signal Threat',
    url: 'http://192.0.2.10/login/verify-account?secure=true',
    expectedCategory: 'HIGH RISK',
    badgeClass: 'high',
    icon: <ShieldAlert size={16} color="#DC2626" />,
    description: 'Synthetic URL with multiple risk signals: HTTP, raw IP, and auth keywords.',
    highlights: ['Raw IP address (RFC 5737)', 'Insecure HTTP protocol', 'Chained auth query & path'],
  },
];

export default function DemoScenarios({
  isDemoMode = false,
  onToggleDemoMode,
  onRunDemo,
  onResetDemo,
  activeScenarioId = null,
  isScanning = false,
}) {
  return (
    <div className="wg-demo-section-card" id="demo-scenarios-container">
      <div className="demo-card-header">
        <div className="demo-header-left">
          <div className="demo-sparkle-icon">
            <Zap size={16} color="#0891B2" />
          </div>
          <div>
            <h4 className="demo-header-title">Interactive Threat Workbench</h4>
            <p className="demo-header-sub">Click a test scenario below to execute live pipeline analysis</p>
          </div>
        </div>

        <div className="demo-header-actions">
          {isDemoMode && (
            <button
              type="button"
              className="wg-btn wg-btn-outline wg-btn-sm"
              onClick={onResetDemo}
            >
              <RefreshCw size={12} />
              <span>Reset Demos</span>
            </button>
          )}
        </div>
      </div>

      <div className="demo-card-body">
        <div className="demo-scenarios-grid">
          {DEMO_SCENARIOS.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                className={`demo-scenario-tile ${scenario.badgeClass} ${isActive ? 'active' : ''}`}
                onClick={() => onRunDemo(scenario)}
                disabled={isScanning}
                id={`run-demo-${scenario.id}`}
              >
                <div className="tile-top">
                  <div className="tile-badge-wrap">
                    {scenario.icon}
                    <span className={`tile-sev-badge ${scenario.badgeClass}`}>
                      {scenario.name}
                    </span>
                  </div>
                  <span className="tile-play-btn">
                    {isActive && isScanning ? (
                      <RefreshCw size={14} className="spin-icon" color="#0891B2" />
                    ) : (
                      <Play size={12} fill="currentColor" />
                    )}
                  </span>
                </div>

                <div className="tile-content">
                  <div className="tile-title">{scenario.label}</div>
                  <code className="tile-url">{scenario.url}</code>
                </div>

                <div className="tile-footer">
                  <span className="tile-hint">
                    {isActive ? '▶ Running Analysis...' : 'Click to test threat score →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="demo-footer-disclaimer">
          <span className="info-icon">ℹ</span>
          <span>
            All benchmark scenarios utilize isolated test vectors & reserved RFC 5737 addresses. No real malicious infrastructure is accessed.
          </span>
        </div>
      </div>
    </div>
  );
}
