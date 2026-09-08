import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Database,
  RotateCcw
} from 'lucide-react';
import { getDashboardStats, truncateDomain } from '../utils/storage';

export default function Dashboard({
  history = [],
  _onScanNewUrl,
  setActiveTab,
  onSelectHistoryItem,
  onLoadDemoData,
  onResetDemo
}) {
  const stats = getDashboardStats(history);
  const hasHistory = history.length > 0;
  const latest = stats.latestScan;

  return (
    <div className="dashboard-container">

      {/* ── Dashboard Header ─────────────────────────────────────────── */}
      <div className="dashboard-header-card">
        <div className="dash-header-left">
          <div className="dash-badge">
            <LayoutDashboard size={14} />
            <span>Telemetry &amp; Findings</span>
          </div>
          <h2 className="dash-title">Security Dashboard</h2>
          <p className="dash-subtitle">
            Monitor your URL analysis activity and security findings.
          </p>
        </div>

        <div className="dash-header-right">
          <div className="compact-status-pill">
            <span className="status-ping-dot" />
            <span className="brand-label">WebGuard AI</span>
            <span className="sep">&bull;</span>
            <span className="state-label">Protection Ready</span>
          </div>

          <button
            type="button"
            className="dash-scan-btn"
            onClick={() => setActiveTab('scanner')}
          >
            <span>Analyze URL</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Demo Data Notice Banner (Requirement 7) ──────────────────── */}
      {stats.demoScansCount > 0 && (
        <div className="demo-data-notice-bar">
          <div className="demo-notice-left">
            <Sparkles size={16} className="sparkle-icon" />
            <span>
              <strong>Demo Data Active:</strong> {stats.demoScansCount} of {stats.totalScans} entries are from test scenarios ({stats.realScansCount} live user scans).
            </span>
          </div>
          {onResetDemo && (
            <button
              type="button"
              className="btn-compact-reset-demo"
              onClick={onResetDemo}
              title="Remove demo test scans and retain real user scans"
            >
              <RotateCcw size={12} />
              <span>Reset Demo Scans</span>
            </button>
          )}
        </div>
      )}

      {/* ── Top Metrics Grid ─────────────────────────────────────────── */}
      <div className="metrics-grid">
        {/* Total Scans */}
        <div className="metric-card total">
          <div className="metric-icon-box cyan">
            <Activity size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">TOTAL SCANS</span>
            <span className="metric-value">{stats.totalScans}</span>
            <span className="metric-hint">Analyzed endpoints</span>
          </div>
        </div>

        {/* Low Risk */}
        <div className="metric-card low">
          <div className="metric-icon-box green">
            <ShieldCheck size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">LOW RISK (0–30)</span>
            <span className="metric-value">{stats.lowRisk}</span>
            <span className="metric-hint">
              {stats.totalScans > 0 ? `${stats.lowRiskPercent}% of total` : '0% of total'}
            </span>
          </div>
        </div>

        {/* Suspicious */}
        <div className="metric-card suspicious">
          <div className="metric-icon-box amber">
            <AlertTriangle size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">SUSPICIOUS (31–70)</span>
            <span className="metric-value">{stats.suspicious}</span>
            <span className="metric-hint">
              {stats.totalScans > 0 ? `${stats.suspiciousPercent}% caution flagged` : '0% caution flagged'}
            </span>
          </div>
        </div>

        {/* High Risk */}
        <div className="metric-card high">
          <div className="metric-icon-box red">
            <ShieldAlert size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">HIGH RISK (71–100)</span>
            <span className="metric-value">{stats.highRisk}</span>
            <span className="metric-hint">
              {stats.totalScans > 0 ? `${stats.highRiskPercent}% dangerous traps` : '0% dangerous traps'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Mid Section: Latest Scan Gauge & Risk Distribution ───────── */}
      <div className="dash-mid-grid">

        {/* Latest Scan Score Gauge (Requirement 12) */}
        <div className="dash-card latest-scan-card">
          <div className="dash-card-header">
            <div className="card-title-group">
              <Clock size={16} className="card-header-icon" />
              <h3>Latest Scan Finding</h3>
            </div>
            {latest && (
              <span className={`risk-pill-mini ${latest.riskLevel?.includes('HIGH') ? 'red' : latest.riskLevel?.includes('SUSP') ? 'amber' : 'green'}`}>
                {latest.riskLevel}
              </span>
            )}
          </div>

          {latest ? (
            <div className="latest-scan-content">
              <div className="gauge-score-display">
                <div className={`gauge-circle ${latest.riskLevel?.includes('HIGH') ? 'danger' : latest.riskLevel?.includes('SUSP') ? 'warn' : 'safe'}`}>
                  <span className="gauge-num">{latest.score}</span>
                  <span className="gauge-denom">/100</span>
                </div>
                <div className="gauge-meta">
                  <div className="gauge-url" title={latest.url}>
                    {truncateDomain(latest.url)}
                  </div>
                  <div className="gauge-time">
                    {formatTimestamp(latest.timestamp)}
                  </div>
                  <button
                    type="button"
                    className="gauge-view-btn"
                    onClick={() => {
                      if (latest.fullResult) onSelectHistoryItem(latest.fullResult);
                    }}
                  >
                    <span>Inspect Finding</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-gauge-state">
              <div className="empty-gauge-icon">?</div>
              <p className="empty-gauge-text">No scans recorded yet</p>
              <button
                type="button"
                className="empty-scan-link"
                onClick={() => setActiveTab('scanner')}
              >
                Scan a URL to see findings
              </button>
            </div>
          )}
        </div>

        {/* Risk Distribution Card (Requirement 3) */}
        <div className="dash-card distribution-card">
          <div className="dash-card-header">
            <div className="card-title-group">
              <TrendingUp size={16} className="card-header-icon" />
              <h3>Risk Ratio Distribution</h3>
            </div>
            <span className="dist-total-tag">{stats.totalScans} Total</span>
          </div>

          {hasHistory ? (
            <div className="dist-body">
              {/* Stacked Progress Bar */}
              <div className="multi-progress-bar">
                {stats.lowRiskPercent > 0 && (
                  <div
                    className="progress-segment low"
                    style={{ width: `${stats.lowRiskPercent}%` }}
                    title={`Low Risk: ${stats.lowRiskPercent}%`}
                  />
                )}
                {stats.suspiciousPercent > 0 && (
                  <div
                    className="progress-segment suspicious"
                    style={{ width: `${stats.suspiciousPercent}%` }}
                    title={`Suspicious: ${stats.suspiciousPercent}%`}
                  />
                )}
                {stats.highRiskPercent > 0 && (
                  <div
                    className="progress-segment high"
                    style={{ width: `${stats.highRiskPercent}%` }}
                    title={`High Risk: ${stats.highRiskPercent}%`}
                  />
                )}
              </div>

              {/* Distribution Legend */}
              <div className="dist-legend-grid">
                <div className="dist-stat-item">
                  <div className="dist-legend-dot green" />
                  <div>
                    <span className="dist-label">Low Risk</span>
                    <span className="dist-val">{stats.lowRisk} ({stats.lowRiskPercent}%)</span>
                  </div>
                </div>

                <div className="dist-stat-item">
                  <div className="dist-legend-dot amber" />
                  <div>
                    <span className="dist-label">Suspicious</span>
                    <span className="dist-val">{stats.suspicious} ({stats.suspiciousPercent}%)</span>
                  </div>
                </div>

                <div className="dist-stat-item">
                  <div className="dist-legend-dot red" />
                  <div>
                    <span className="dist-label">High Risk</span>
                    <span className="dist-val">{stats.highRisk} ({stats.highRiskPercent}%)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-dist-state">
              <p>Risk distribution will generate automatically from your scan findings.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Security Insights Section (Requirement 13) ──────────────── */}
      <div className="security-insights-card">
        <div className="insights-header">
          <Sparkles size={16} className="insights-icon" />
          <h3 className="insights-title">Security Insights</h3>
        </div>
        <div className="insights-list">
          {stats.insights.map((insight, idx) => (
            <div key={idx} className="insight-item">
              <span className="insight-bullet">&bull;</span>
              <span className="insight-text">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Scans Stream (Requirement 4 & 5) ─────────────────── */}
      <div className="dashboard-recent-card">
        <div className="recent-card-header">
          <div className="recent-title-group">
            <h3>Recent Scan Activity</h3>
            <span className="scans-source-tag">Web App Scans</span>
          </div>
          <button
            type="button"
            className="manage-history-link"
            onClick={() => setActiveTab('history')}
          >
            <span>Full History &amp; Filters</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {hasHistory ? (
          <div className="dash-stream-list">
            {history.slice(0, 6).map((item) => {
              const isHigh = item.riskLevel?.includes('HIGH');
              const isSusp = item.riskLevel?.includes('SUSP');
              const domain = truncateDomain(item.url);

              return (
                <div
                  key={item.id}
                  className="stream-item"
                  onClick={() => {
                    if (item.fullResult) onSelectHistoryItem(item.fullResult);
                  }}
                  title="Click to view full security report"
                >
                  <div className="stream-left">
                    <span className={`stream-pill ${isHigh ? 'red' : isSusp ? 'amber' : 'green'}`}>
                      {item.riskLevel}
                    </span>
                    {(item.isDemo || item.id?.startsWith('demo-')) && (
                      <span className="demo-pill-badge">Demo</span>
                    )}
                    <div className="stream-url-block">
                      <span className="stream-domain">{domain}</span>
                      <span className="stream-full-url" title={item.url}>{item.url}</span>
                    </div>
                  </div>

                  <div className="stream-right">
                    <span className="stream-indicators-chip">
                      {(item.indicators || []).length} signal{(item.indicators || []).length === 1 ? '' : 's'}
                    </span>
                    <span className={`stream-score-tag ${isHigh ? 'red' : isSusp ? 'amber' : 'green'}`}>
                      {item.score} / 100
                    </span>
                    <span className="stream-time-tag">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-stream-card">
            <ShieldCheck size={36} className="empty-stream-icon" />
            <h4>No scans yet.</h4>
            <p>Analyze a URL to start building your security history and telemetry.</p>
            <div className="empty-stream-actions">
              <button
                type="button"
                className="btn-primary-compact"
                onClick={() => setActiveTab('scanner')}
              >
                Analyze URL
              </button>
              {onLoadDemoData && (
                <button
                  type="button"
                  className="btn-demo-link"
                  onClick={onLoadDemoData}
                >
                  <Database size={13} />
                  <span>Load Demo Data (Hackathon Demo)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'recently';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}
