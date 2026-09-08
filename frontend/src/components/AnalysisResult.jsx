import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, RotateCcw, Info,
  CheckCircle2, XCircle, HelpCircle, Globe, Server, Layers,
  Database, Wifi, WifiOff, AlertCircle, ChevronDown, ChevronUp,
  Brain, BarChart2, ArrowRight, Activity, Sparkles
} from 'lucide-react';

/* ─── Severity chip ─────────────────────────────────────────────────────── */
// Internal helper — not exported to avoid Vite Fast Refresh conflicts
function getSeverityBadge(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical': return <span className="severity-chip critical">CRITICAL</span>;
    case 'high':     return <span className="severity-chip high">HIGH</span>;
    case 'medium':   return <span className="severity-chip medium">MEDIUM</span>;
    case 'low':
    default:         return <span className="severity-chip low">LOW</span>;
  }
}

/* ─── Animated Circular Threat Score Gauge (Requirement 8) ──────────────── */
function ScoreCircleGauge({ score, riskLevel, strokeColor }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289.03
  const clampedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      className="circular-gauge-container"
      role="img"
      aria-label={`Threat score: ${clampedScore} out of 100, classification: ${riskLevel}`}
    >
      <svg className="circular-gauge-svg" width="126" height="126" viewBox="0 0 120 120">
        <defs>
          <filter id={`gauge-glow-${riskLevel?.toLowerCase().replace(/\s+/g, '-') || 'risk'}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={strokeColor} floodOpacity="0.45" />
          </filter>
        </defs>
        {/* Background Track */}
        <circle
          className="gauge-circle-bg"
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="8.5"
        />
        {/* Progress Fill Circle */}
        <circle
          className="gauge-circle-fill"
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="8.5"
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={`url(#gauge-glow-${riskLevel?.toLowerCase().replace(/\s+/g, '-') || 'risk'})`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="gauge-center-text">
        <div className="gauge-score-number">{clampedScore}</div>
        <div className="gauge-score-total">/ 100</div>
        <div className="gauge-score-label">THREAT SCORE</div>
      </div>
    </div>
  );
}

/* ─── Threat Intelligence section ───────────────────────────────────────── */
function ThreatIntelSection({ ti, analysisMode }) {
  if (!ti) return null;

  let statusClass = 'ti-status-unavailable';
  let StatusIcon  = WifiOff;
  let statusLabel = 'Unavailable';

  if (!ti.available) {
    statusClass = 'ti-status-unavailable';
    StatusIcon  = WifiOff;
    statusLabel = analysisMode === 'local'
      ? 'Demo / Local Analysis Mode'
      : 'Threat Intelligence Unavailable';
  } else if (ti.knownMalicious) {
    statusClass = 'ti-status-malicious';
    StatusIcon  = AlertCircle;
    statusLabel = 'Known Malicious';
  } else if (ti.suspicious) {
    statusClass = 'ti-status-suspicious';
    StatusIcon  = AlertTriangle;
    statusLabel = 'Suspicious Reputation';
  } else {
    statusClass = 'ti-status-clean';
    StatusIcon  = CheckCircle2;
    statusLabel = 'No Known Threat';
  }

  return (
    <div className="section-card ti-card">
      <div className="section-header">
        <div className="section-icon-box"><Database size={20} /></div>
        <div>
          <h3 className="section-title">Threat Intelligence</h3>
          <p className="section-subtitle">
            {ti.available ? `Reputation lookup via ${ti.provider}` : 'External reputation check status'}
          </p>
        </div>
      </div>

      <div className={`ti-status-badge ${statusClass}`}>
        <StatusIcon size={20} className="ti-status-icon" />
        <div className="ti-status-text">
          <span className="ti-status-label">{statusLabel}</span>
          <span className="ti-status-message">{ti.message}</span>
        </div>
      </div>

      {ti.available && ti.totalEngines && (
        <div className="ti-engines-row">
          <span className="ti-engines-label">Detections / Engines:</span>
          <span className="ti-engines-value">{ti.detections} / {ti.totalEngines}</span>
        </div>
      )}

      {!ti.available && (
        <p className="ti-disclaimer">
          Unavailability does not indicate the URL is safe — score is based on local structural
          analysis and feature-based prediction only.
        </p>
      )}
    </div>
  );
}

/* ─── AI Risk Analysis section ───────────────────────────────────────────── */
function MlPredictionSection({ ml }) {
  if (!ml) return null;

  const confColor = ml.confidence === 'HIGH'
    ? '#ef4444'
    : ml.confidence === 'MEDIUM'
    ? '#f59e0b'
    : '#22c55e';

  const predColor = ml.prediction === 'HIGH'
    ? '#ef4444'
    : ml.prediction === 'MEDIUM'
    ? '#f59e0b'
    : ml.prediction === 'LOW'
    ? '#22c55e'
    : '#64748b';

  return (
    <div className="section-card ml-card">
      <div className="section-header">
        <div className="section-icon-box"><Brain size={20} /></div>
        <div>
          <h3 className="section-title">AI Risk Analysis</h3>
          <p className="section-subtitle">
            {ml.modelLabel || 'Feature-based prediction'}
          </p>
        </div>
      </div>

      {ml.available ? (
        <>
          <div className="ml-metrics-row">
            <div className="ml-metric">
              <span className="ml-metric-label">Prediction</span>
              <span className="ml-metric-value" style={{ color: predColor }}>
                {ml.prediction}
              </span>
            </div>
            <div className="ml-metric">
              <span className="ml-metric-label">Prediction Type</span>
              <span className="ml-metric-value neutral">Feature-Based</span>
            </div>
            <div className="ml-metric">
              <span className="ml-metric-label">Confidence</span>
              <span className="ml-metric-value" style={{ color: confColor }}>
                {ml.confidence}
              </span>
            </div>
          </div>

          <div className="ml-how-section">
            <div className="ml-how-title">
              <Activity size={14} />
              <span>How the prediction was made</span>
            </div>
            <p className="ml-how-body">
              The system evaluates 18 normalized URL characteristics — including URL length,
              hostname structure, suspicious keywords, protocol security, subdomain depth,
              brand pattern matching, and special character usage — and combines them using
              a hand-weighted model. This is a <strong>feature-based prediction</strong>,
              not a trained ML classifier. No training data, accuracy, or precision metrics
              are claimed.
            </p>
          </div>

          {ml.note && (
            <p className="ml-disclaimer">{ml.note}</p>
          )}
        </>
      ) : (
        <div className="ml-unavailable">
          <WifiOff size={16} />
          <span>{ml.note || 'ML prediction layer unavailable.'}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Security signals flow visualization ───────────────────────────────── */
function SignalsVisualization({ scoreBreakdown, localIndicators, ti, ml }) {
  if (!scoreBreakdown) return null;

  const signals = [
    {
      key  : 'local',
      label: 'URL Analysis',
      desc : `${localIndicators?.length || 0} indicator${localIndicators?.length !== 1 ? 's' : ''} detected`,
      pts  : scoreBreakdown.localAnalysis,
      color: '#38bdf8',
      pct  : scoreBreakdown.total > 0 ? Math.round((scoreBreakdown.localAnalysis / scoreBreakdown.total) * 100) : 0
    },
    {
      key  : 'ti',
      label: 'Threat Intelligence',
      desc : ti?.available ? (ti.knownMalicious ? 'Known malicious' : ti.suspicious ? 'Suspicious' : 'Clean') : 'Unavailable',
      pts  : scoreBreakdown.threatIntelligence,
      color: '#a78bfa',
      pct  : scoreBreakdown.total > 0 ? Math.round((scoreBreakdown.threatIntelligence / scoreBreakdown.total) * 100) : 0
    },
    {
      key  : 'ml',
      label: 'Feature Prediction',
      desc : ml?.available ? `Prediction: ${ml.prediction}` : 'Unavailable',
      pts  : scoreBreakdown.mlPrediction,
      color: '#34d399',
      pct  : scoreBreakdown.total > 0 ? Math.round((scoreBreakdown.mlPrediction / scoreBreakdown.total) * 100) : 0
    }
  ];

  return (
    <div className="section-card signals-card">
      <div className="section-header">
        <div className="section-icon-box"><BarChart2 size={20} /></div>
        <div>
          <h3 className="section-title">Risk Signal Breakdown</h3>
          <p className="section-subtitle">How three independent layers combine into the final score</p>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="signals-flow">
        {signals.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="signal-node">
              <div className="signal-bar-wrapper">
                <div
                  className="signal-bar-fill"
                  style={{ height: `${Math.max(4, (s.pts / 100) * 80)}px`, backgroundColor: s.color }}
                />
              </div>
              <div className="signal-label">{s.label}</div>
              <div className="signal-desc">{s.desc}</div>
              <div className="signal-pts" style={{ color: s.color }}>
                +{s.pts} pts
              </div>
            </div>
            {i < signals.length - 1 && (
              <div className="signal-arrow"><ArrowRight size={18} /></div>
            )}
          </React.Fragment>
        ))}

        <div className="signal-arrow"><ArrowRight size={18} /></div>

        <div className="signal-total-node">
          <div className="signal-total-value">{scoreBreakdown.total}</div>
          <div className="signal-total-label">Final Score</div>
          <div className="signal-total-sub">/ 100</div>
        </div>
      </div>

      {/* Bar chart per signal */}
      <div className="signals-bars">
        {signals.map(s => (
          <div key={s.key} className="signal-row-bar">
            <span className="signal-row-label">{s.label}</span>
            <div className="signal-track">
              <div
                className="signal-fill"
                style={{ width: `${s.pts}%`, backgroundColor: s.color }}
              />
            </div>
            <span className="signal-row-pts">{s.pts} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main result component ──────────────────────────────────────────────── */
export default function AnalysisResult({ result, onScanAnother }) {
  const [showTechDetails, setShowTechDetails] = useState(false);

  if (!result) return null;

  const {
    url,
    score           = 0,
    riskLevel       = 'LOW',
    indicators      = [],
    explanation,
    whyThisScore,
    keyFindings     = [],
    keyFactors      = [],
    recommendation,
    recommendations = [],
    threatIntelligence: ti,
    mlPrediction    : ml,
    scoreBreakdown,
    details         = {},
    analysisMode,
    analyzedAt
  } = result;

  const isHigh       = riskLevel === 'HIGH'       || riskLevel === 'HIGH RISK';
  const isSuspicious = riskLevel === 'SUSPICIOUS';
  const displayFindings = keyFindings.length > 0 ? keyFindings : keyFactors;

  return (
    <div className="result-page-container">

      {/* ── Demo Mode Indicator Banner (Requirement 4) ──────────────────── */}
      {result.isDemo && (
        <div className="demo-result-banner" role="status">
          <div className="demo-banner-pill">
            <Sparkles size={14} />
            <span>Demo Scenario</span>
          </div>
          <p className="demo-banner-text">
            This result is from a predefined test scenario executed on WebGuard's real backend analysis pipeline. Threat intelligence is reported accurately without fabrication.
          </p>
        </div>
      )}

      {/* ── High-Risk Security Warning Action Bar (Requirement 20) ──────── */}
      {isHigh && (
        <div className="high-risk-alert-bar" role="alert">
          <div className="alert-bar-left">
            <div className="alert-bar-icon-wrap">
              <ShieldAlert size={26} className="alert-bar-icon" />
            </div>
            <div className="alert-bar-content">
              <div className="alert-bar-badge">
                <span className="alert-pulse-dot" />
                <span>CRITICAL SECURITY WARNING</span>
              </div>
              <h3 className="alert-bar-title">Phishing or Deceptive Link Detected</h3>
              <p className="alert-bar-desc">
                This URL exhibits high-confidence characteristics of a deceptive website.
                <strong> Do not enter passwords, credit cards, or personal credentials.</strong>
              </p>
            </div>
          </div>
          <div className="alert-bar-actions">
            <button
              type="button"
              className="btn-alert-back"
              onClick={onScanAnother}
              title="Return safely to URL scanner"
            >
              <RotateCcw size={15} />
              <span>Go Back</span>
            </button>
            <button
              type="button"
              className="btn-alert-details"
              onClick={() => {
                const el = document.getElementById('indicators-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              title="Inspect detected indicators below"
            >
              <ChevronDown size={15} />
              <span>View Details</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 1. RISK LEVEL & 2. RISK SCORE (Centerpiece Circular Gauge) ────── */}
      <div className={`result-hero-card ${isHigh ? 'tier-high' : isSuspicious ? 'tier-suspicious' : 'tier-low'}`}>
        <div className="hero-top-row">
          <div className="risk-level-display">
            <div className="risk-icon-wrapper">
              {isHigh
                ? <ShieldAlert   size={36} className="risk-main-icon high" />
                : isSuspicious
                ? <AlertTriangle size={36} className="risk-main-icon suspicious" />
                : <ShieldCheck   size={36} className="risk-main-icon low" />}
            </div>
            <div className="risk-level-info">
              <div className="risk-pill-badge">
                <span className="dot" /><span>RISK CLASSIFICATION</span>
              </div>
              <h2 className="risk-level-title">
                {isHigh ? 'HIGH RISK' : isSuspicious ? 'SUSPICIOUS' : 'LOW RISK'}
              </h2>
              <p className="risk-level-caption">
                {isHigh
                  ? 'Multiple critical indicators of phishing deception or spoofing detected.'
                  : isSuspicious
                  ? 'Heuristic and structural abnormalities flagged. Exercise caution.'
                  : 'No significant malicious patterns or threat indicators detected.'}
              </p>
            </div>
          </div>

          <div className="score-meter-box">
            <ScoreCircleGauge
              score={score}
              riskLevel={isHigh ? 'HIGH RISK' : isSuspicious ? 'SUSPICIOUS' : 'LOW RISK'}
              strokeColor={isHigh ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981'}
            />
          </div>
        </div>

        <div className="inspected-url-bar">
          <div className="inspected-url-label"><Globe size={14} /><span>ANALYZED TARGET</span></div>
          <div className="inspected-url-text" title={url}>{url}</div>
        </div>

        <div className={`analysis-mode-badge ${analysisMode === 'full' ? 'mode-full' : 'mode-local'}`}>
          {analysisMode === 'full'
            ? <><Wifi size={12} /> Full Analysis (Threat Intelligence Active)</>
            : <><WifiOff size={12} /> Demo / Local Analysis Mode — Threat Intelligence Unavailable</>}
        </div>
      </div>

      {/* ── 3. WHY THIS SCORE? (Requirement 10) ──────────────────────────── */}
      <div className="section-card explanation-card">
        <div className="section-header">
          <div className="section-icon-box"><HelpCircle size={20} /></div>
          <div>
            <h3 className="section-title">Why This Score?</h3>
            <p className="section-subtitle">Plain-English reasoning from the WebGuard analysis pipeline</p>
          </div>
        </div>
        <div className="explanation-body">
          <p className="explanation-text">{explanation}</p>
          {whyThisScore && <p className="explanation-why">{whyThisScore}</p>}
          {displayFindings?.length > 0 && (
            <div className="key-factors-list">
              {displayFindings.map((f, i) => (
                <div key={i} className="factor-item">
                  <div className="factor-bullet" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. KEY SECURITY INDICATORS (Requirement 10 & 20) ─────────────── */}
      <div className="section-card indicators-card" id="indicators-section">
        <div className="section-header">
          <div className="section-icon-box"><Layers size={20} /></div>
          <div className="section-header-meta">
            <div>
              <h3 className="section-title">Key Security Indicators</h3>
              <p className="section-subtitle">
                {indicators.length === 0
                  ? 'No negative indicators identified'
                  : `${indicators.length} structural or behavioral signal${indicators.length > 1 ? 's' : ''} flagged`}
              </p>
            </div>
            <span className="count-pill">{indicators.length} Detected</span>
          </div>
        </div>

        {indicators.length === 0 ? (
          <div className="no-indicators-state">
            <CheckCircle2 size={28} className="clean-icon" />
            <div>
              <h4>Clean Structural Baseline</h4>
              <p>No known risk patterns detected from structural, lexical, protocol, and domain analysis.</p>
            </div>
          </div>
        ) : (
          <div className="indicators-grid" id="indicators-list">
            {indicators.map((ind, idx) => (
              <div key={idx} className={`indicator-card ${ind.severity || 'low'}`}>
                <div className="indicator-top">
                  <div className="indicator-title-wrap">
                    <span className={`indicator-dot-severity ${ind.severity || 'low'}`} />
                    <span className="indicator-name">{ind.name || ind.id?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="indicator-badges">
                    {getSeverityBadge(ind.severity)}
                    {ind.points != null && <span className="points-chip">+{ind.points} pts</span>}
                  </div>
                </div>
                <p className="indicator-desc">{ind.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Security Signals Breakdown */}
        {scoreBreakdown && (
          <div className="indicators-breakdown-subarea">
            <SignalsVisualization
              scoreBreakdown={scoreBreakdown}
              localIndicators={indicators}
              ti={ti}
              ml={ml}
            />
          </div>
        )}
      </div>

      {/* ── 5. THREAT INTELLIGENCE (Requirement 10) ──────────────────────── */}
      <ThreatIntelSection ti={ti} analysisMode={analysisMode} />

      {/* ── 6. AI / FEATURE-BASED PREDICTION (Requirement 10) ────────────── */}
      <MlPredictionSection ml={ml} />

      {/* ── Security Recommendation ──────────────────────────────────────── */}
      <div className="section-card recommendations-card">
        <div className="section-header">
          <div className="section-icon-box"><Info size={20} /></div>
          <div>
            <h3 className="section-title">Security Recommendation</h3>
            <p className="section-subtitle">What you should do based on this threat profile</p>
          </div>
        </div>

        {recommendation && (
          <div className={`primary-recommendation ${isHigh ? 'danger' : isSuspicious ? 'warn' : 'safe'}`}>
            <div className="rec-icon-wrapper">
              {isHigh
                ? <XCircle      size={20} className="icon-danger" />
                : isSuspicious
                ? <AlertTriangle size={20} className="icon-warn" />
                : <CheckCircle2  size={20} className="icon-safe" />}
            </div>
            <span className="rec-primary-text">{recommendation}</span>
          </div>
        )}

        <div className="recommendations-list">
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`recommendation-item ${isHigh ? 'danger' : isSuspicious ? 'warn' : 'safe'}`}>
              <div className="rec-icon-wrapper">
                {isHigh
                  ? <XCircle      size={16} className="icon-danger" />
                  : isSuspicious
                  ? <AlertTriangle size={16} className="icon-warn" />
                  : <CheckCircle2  size={16} className="icon-safe" />}
              </div>
              <span className="rec-text">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Technical Details (collapsible) ─────────────────────────────── */}
      <div className="section-card technical-details-card">
        <button className="tech-details-toggle" onClick={() => setShowTechDetails(v => !v)}>
          <div className="section-header-inline">
            <div className="section-icon-box"><Server size={20} /></div>
            <div>
              <h3 className="section-title">Technical Extraction Details</h3>
              <p className="section-subtitle">Normalized feature attributes used for classification</p>
            </div>
          </div>
          {showTechDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showTechDetails && (
          <div className="tech-details-grid">
            <div className="tech-item">
              <span className="tech-label">Apex Domain</span>
              <span className="tech-value">{details.apexDomain || details.domain || 'N/A'}</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Protocol</span>
              <span className="tech-value">{details.protocol || 'N/A'}</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">HTTPS Encryption</span>
              <span className={`tech-value ${details.hasHttps ? 'green' : 'red'}`}>
                {details.hasHttps ? 'Yes (Encrypted)' : 'No (Unencrypted)'}
              </span>
            </div>
            <div className="tech-item">
              <span className="tech-label">IP-based Host</span>
              <span className="tech-value">
                {details.usesIpAddress ? 'Yes (IP Address)' : 'No (Standard Domain)'}
              </span>
            </div>
            <div className="tech-item">
              <span className="tech-label">URL Length</span>
              <span className="tech-value">{details.urlLength || 0} chars</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Subdomains</span>
              <span className="tech-value">{details.subdomainCount ?? 0}</span>
            </div>
            {details.brandImpersonation && (
              <div className="tech-item">
                <span className="tech-label">Brand Impersonated</span>
                <span className="tech-value red">{details.brandImpersonation}</span>
              </div>
            )}
            {details.suspiciousKeywordsFound?.length > 0 && (
              <div className="tech-item full-width">
                <span className="tech-label">Suspicious Keywords</span>
                <span className="tech-value">{details.suspiciousKeywordsFound.join(', ')}</span>
              </div>
            )}
            {ml?.featureMap && Object.keys(ml.featureMap).length > 0 && (
              <div className="tech-item full-width">
                <span className="tech-label">Feature Vector (18 dimensions)</span>
                <div className="feature-vector-grid">
                  {Object.entries(ml.featureMap).map(([k, v]) => (
                    <div key={k} className="fv-item">
                      <span className="fv-key">{k}</span>
                      <span className="fv-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="tech-item">
              <span className="tech-label">Analyzed At</span>
              <span className="tech-value">
                {analyzedAt ? new Date(analyzedAt).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Footer ────────────────────────────────────────────────── */}
      <div className="result-action-footer">
        <button type="button" className="scan-another-btn" onClick={onScanAnother}>
          <RotateCcw size={18} />
          <span>Scan Another URL</span>
        </button>
      </div>
    </div>
  );
}
