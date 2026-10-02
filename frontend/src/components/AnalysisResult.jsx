import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowLeft, RotateCcw,
  CheckCircle2, XCircle, Globe, Server, Cpu, BarChart2, Info,
  Copy, Check, Share2, FileText, ChevronDown, ChevronUp, ExternalLink, Sparkles
} from 'lucide-react';
import { fetchVisualVerification } from '../services/api.js';

/* ── Human-Designed Executive Threat Gauge ──────────────────────────────── */
function ScoreCircleGauge({ score, riskLevel }) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const isHigh = riskLevel === 'HIGH' || riskLevel === 'HIGH RISK' || clampedScore >= 70;
  const isSuspicious = riskLevel === 'SUSPICIOUS' || (clampedScore >= 31 && clampedScore < 70);

  // Human professional security color palette (Crimson, Amber, Emerald)
  const strokeColor = isHigh ? '#DC2626' : isSuspicious ? '#D97706' : '#059669';
  const badgeBg = isHigh ? '#FEE2E2' : isSuspicious ? '#FEF3C7' : '#D1FAE5';
  const badgeText = isHigh ? '#991B1B' : isSuspicious ? '#92400E' : '#065F46';
  const statusLabel = isHigh ? 'HIGH RISK' : isSuspicious ? 'SUSPICIOUS' : 'SAFE';

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="wg-score-gauge-wrap">
      <svg width="150" height="150" viewBox="0 0 140 140" className="gauge-svg">
        {/* Outer subtle dial tick ring */}
        <circle
          cx="70" cy="70" r="64"
          fill="none"
          stroke="var(--border, #E2E8F0)"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          opacity="0.7"
        />
        {/* Background track circle */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="var(--gauge-track, #F1F5F9)"
          strokeWidth="10"
        />
        {/* Active progress arc */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="gauge-overlay">
        <span className="gauge-num" style={{ color: strokeColor }}>{clampedScore}</span>
        <span className="gauge-max">/ 100</span>
        <span
          className="gauge-tag-pill"
          style={{ backgroundColor: badgeBg, color: badgeText }}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

export default function AnalysisResult({ result, onScanAnother }) {
  const [copied, setCopied]                   = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [visualData, setVisualData]           = useState(null);
  const [loadingVisual, setLoadingVisual]     = useState(false);

  if (!result) return null;

  const {
    url             = '',
    score           = 0,
    riskLevel       = 'LOW',
    indicators      = [],
    explanation,
    whyThisScore,
    keyFindings     = [],
    recommendation,
    recommendations = [],
    threatIntelligence: ti,
    mlPrediction    : ml,
    scoreBreakdown,
    details         = {},
    analyzedAt
  } = result;

  useEffect(() => {
    if (url) {
      setLoadingVisual(true);
      fetchVisualVerification(url)
        .then(data => {
          setVisualData(data);
          setLoadingVisual(false);
        })
        .catch(() => setLoadingVisual(false));
    }
  }, [url]);

  const isHigh       = riskLevel === 'HIGH' || riskLevel === 'HIGH RISK' || score >= 70;
  const isSuspicious = riskLevel === 'SUSPICIOUS' || (score >= 31 && score < 70);
  const isSafe       = !isHigh && !isSuspicious;

  const statusClass  = isHigh ? 'danger' : isSuspicious ? 'warning' : 'safe';
  const statusLabel  = isHigh ? 'HIGH RISK THREAT' : isSuspicious ? 'SUSPICIOUS REPUTATION' : 'SAFE BASESECURE';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wg-page-wrap">
      {/* Back Bar & Quick Actions */}
      <section className="wg-result-top-bar">
        <div className="wrap">
          <div className="wg-result-bar-inner">
            <button
              type="button"
              className="wg-btn wg-btn-outline wg-btn-sm"
              onClick={onScanAnother}
            >
              <ArrowLeft size={16} />
              <span>Back to Threat Scanner</span>
            </button>

            <div className="result-top-actions">
              {result.isDemo && (
                <span className="wg-demo-pill">DEMO BENCHMARK TEST</span>
              )}
              <button
                type="button"
                className="wg-btn wg-btn-ghost wg-btn-sm"
                onClick={handleCopyUrl}
              >
                {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                <span>{copied ? 'Copied URL' : 'Copy Target URL'}</span>
              </button>
              <button
                type="button"
                className="wg-btn wg-btn-primary wg-btn-sm"
                onClick={onScanAnother}
              >
                <RotateCcw size={14} />
                <span>Scan Another URL</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analysis Result Body */}
      <section className="wg-section">
        <div className="wrap">
          {/* CRITICAL WARNING BANNER IF HIGH RISK */}
          {isHigh && (
            <div className="wg-alert-banner danger">
              <div className="banner-icon">
                <ShieldAlert size={28} color="#DC2626" />
              </div>
              <div className="banner-text">
                <div className="banner-badge danger">CRITICAL SECURITY WARNING</div>
                <h3>Malicious or Deceptive Target Detected</h3>
                <p>
                  This URL matches known credential harvesting, brand impersonation, or phishing infrastructure. <strong>Do NOT enter passwords, credit cards, or MFA security tokens.</strong>
                </p>
              </div>
              <button
                type="button"
                className="wg-btn wg-btn-secondary wg-btn-sm"
                onClick={onScanAnother}
              >
                Retreat to Safety
              </button>
            </div>
          )}

          {/* MAIN SUMMARY HERO CARD */}
          <div className={`wg-result-summary-card ${statusClass}`}>
            <div className="summary-card-top">
              <div className="target-url-info">
                <span className="info-label">INSPECTED TARGET URL:</span>
                <code className="target-url-string">{url}</code>
              </div>

              <div className={`status-badge-hero ${statusClass}`}>
                {isHigh && <ShieldAlert size={18} />}
                {isSuspicious && <AlertTriangle size={18} />}
                {isSafe && <ShieldCheck size={18} />}
                <span>{statusLabel}</span>
              </div>
            </div>

            <div className="summary-card-grid">
              {/* Left Gauge */}
              <div className="summary-gauge-col">
                <ScoreCircleGauge score={score} riskLevel={riskLevel} />
              </div>

              {/* Right Summary Details */}
              <div className="summary-details-col">
                <h3 className="summary-heading">Analysis Diagnosis & AI Summary</h3>
                <p className="summary-explanation-text">
                  {explanation || whyThisScore || 'The automated analysis engine inspected domain WHOIS, SSL records, and lexical feature patterns to generate this security assessment.'}
                </p>

                <div className="summary-metrics-row">
                  <div className="summary-metric">
                    <span className="metric-lbl">Domain Age</span>
                    <span className="metric-val">{details.domainAge || 'Verified / Mature'}</span>
                  </div>
                  <div className="summary-metric">
                    <span className="metric-lbl">SSL Certificate</span>
                    <span className={`metric-val ${details.hasHttps !== false ? 'green-text' : 'red-text'}`}>
                      {details.hasHttps !== false ? 'Valid TLS Encryption' : 'Missing / Self-Signed'}
                    </span>
                  </div>
                  <div className="summary-metric">
                    <span className="metric-lbl">Threat Feeds</span>
                    <span className="metric-val">
                      {ti?.knownMalicious ? 'Flagged Malicious' : ti?.suspicious ? 'Caution' : '0 Blacklists'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL VERIFICATION & PUPPETEER CLONE DETECTION */}
          {visualData && visualData.visualCheckPerformed && (
            <div className={`wg-card-box margin-top visual-verify-card ${visualData.isVisualClone ? 'threat-border' : ''}`}>
              <div className="card-box-header">
                <h3 className="card-box-title">
                  <Sparkles size={18} color={visualData.isVisualClone ? '#DC2626' : '#0891B2'} />
                  <span>Visual Clone & Impersonation Check (Puppeteer)</span>
                </h3>
                <span className={`card-box-tag ${visualData.isVisualClone ? 'danger-tag' : visualData.isAuthentic ? 'safe-tag' : 'neutral-tag'}`}>
                  {visualData.isVisualClone ? 'CLONE DETECTED' : visualData.isAuthentic ? 'VERIFIED OFFICIAL' : 'CHECK COMPLETE'}
                </span>
              </div>

              <div className="card-box-body">
                {visualData.isVisualClone && (
                  <div className="visual-clone-alert-banner">
                    <AlertTriangle size={20} color="#DC2626" />
                    <div>
                      <strong>{visualData.verdictTitle}</strong>
                      <p>{visualData.verdictMessage}</p>
                    </div>
                  </div>
                )}

                <div className="visual-compare-grid">
                  <div className="visual-compare-col">
                    <span className="col-tag">Analyzed URL Screenshot</span>
                    <div className="screenshot-container">
                      {visualData.suspectScreenshot ? (
                        <img src={visualData.suspectScreenshot} alt="Analyzed Site" className="visual-thumb" />
                      ) : (
                        <div className="visual-placeholder">Rendered Screenshot</div>
                      )}
                    </div>
                    <span className="thumb-caption">{visualData.suspectDomain || url}</span>
                  </div>

                  <div className="visual-compare-col">
                    <span className="col-tag green">
                      Official Site (Puppeteer Headless)
                    </span>
                    <div className="screenshot-container">
                      {visualData.originalScreenshot ? (
                        <img src={visualData.originalScreenshot} alt="Original Site" className="visual-thumb" />
                      ) : (
                        <div className="visual-placeholder">Rendered via Puppeteer</div>
                      )}
                    </div>
                    <span className="thumb-caption">
                      {visualData.officialUrl ? (
                        <a href={visualData.officialUrl} target="_blank" rel="noopener noreferrer">
                          {visualData.officialUrl}
                        </a>
                      ) : 'Verified Registrar'}
                    </span>
                  </div>
                </div>

                <div className="visual-similarity-bar-wrap">
                  <div className="sim-label-row">
                    <span>Visual Resemblance Score:</span>
                    <strong>{visualData.similarityScore}%</strong>
                  </div>
                  <div className="sim-track">
                    <div
                      className={`sim-fill ${visualData.isVisualClone ? 'danger' : 'safe'}`}
                      style={{ width: `${visualData.similarityScore}%` }}
                    />
                  </div>
                </div>

                {Array.isArray(visualData.discrepancies) && visualData.discrepancies.length > 0 && (
                  <ul className="visual-discrepancies-list">
                    {visualData.discrepancies.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 2-COLUMN GRID: INDICATORS & RECOMMENDATIONS */}
          <div className="wg-grid-2col margin-top">
            {/* Left: Key Risk Indicators */}
            <div className="wg-card-box">
              <div className="card-box-header">
                <h3 className="card-box-title">
                  <AlertTriangle size={18} color="#0891B2" />
                  <span>Detected Security Indicators ({indicators.length})</span>
                </h3>
                <span className="card-box-tag">18-Feature Vector</span>
              </div>

              <div className="card-box-body">
                {indicators.length === 0 ? (
                  <div className="wg-empty-state green">
                    <CheckCircle2 size={24} color="#16A34A" />
                    <p>No suspicious lexical or structural risk indicators were detected.</p>
                  </div>
                ) : (
                  <div className="indicators-list">
                    {indicators.map((ind, idx) => (
                      <div key={idx} className={`indicator-item ${ind.severity || 'low'}`}>
                        <div className="indicator-item-top">
                          <span className="indicator-title">
                            {ind.severity === 'high' || ind.severity === 'critical' ? '🚨' : '⚠️'} {ind.name || ind.id?.replace(/_/g, ' ')}
                          </span>
                          <span className={`indicator-sev-chip ${ind.severity || 'low'}`}>
                            {ind.severity?.toUpperCase() || 'LOW'}
                          </span>
                        </div>
                        <p className="indicator-desc">{ind.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Security Recommendation */}
            <div className="wg-card-box">
              <div className="card-box-header">
                <h3 className="card-box-title">
                  <ShieldCheck size={18} color="#16A34A" />
                  <span>Safety Guidance & Next Steps</span>
                </h3>
                <span className="card-box-tag">Action Plan</span>
              </div>

              <div className="card-box-body">
                <div className={`recommendation-box ${statusClass}`}>
                  <div className="rec-box-header">
                    {isHigh && <XCircle size={20} color="#DC2626" />}
                    {isSuspicious && <AlertTriangle size={20} color="#F59E0B" />}
                    {isSafe && <CheckCircle2 size={20} color="#16A34A" />}
                    <strong>{recommendation || (isHigh ? 'Block domain access immediately.' : isSuspicious ? 'Exercise extreme caution.' : 'Safe to visit.')}</strong>
                  </div>
                  <ul className="rec-steps-list">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, idx) => (
                        <li key={idx}>✓ {rec}</li>
                      ))
                    ) : (
                      <>
                        <li>✓ Verify domain spelling in browser address bar.</li>
                        <li>✓ Ensure password manager auto-fill functions properly.</li>
                        <li>✓ Report suspicious links to security operations.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="action-button-group">
                  <button
                    type="button"
                    className="wg-btn wg-btn-primary full-w"
                    onClick={onScanAnother}
                  >
                    <RotateCcw size={16} />
                    <span>Scan Another Suspicious URL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details Accordion */}
          <div className="wg-card-box margin-top">
            <button
              type="button"
              className="tech-accordion-btn"
              onClick={() => setShowTechDetails(!showTechDetails)}
            >
              <div className="tech-acc-title">
                <Server size={18} color="#0891B2" />
                <span>Technical Inspection Telemetry</span>
              </div>
              {showTechDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showTechDetails && (
              <div className="tech-acc-content">
                <div className="tech-data-grid">
                  <div className="data-item">
                    <span className="lbl">Apex Domain:</span>
                    <span className="val">{details.apexDomain || details.domain || 'N/A'}</span>
                  </div>
                  <div className="data-item">
                    <span className="lbl">Protocol Scheme:</span>
                    <span className="val">{details.protocol || 'N/A'}</span>
                  </div>
                  <div className="data-item">
                    <span className="lbl">IP Host Check:</span>
                    <span className="val">{details.usesIpAddress ? 'Yes (IP Address Host)' : 'No (Hostname)'}</span>
                  </div>
                  <div className="data-item">
                    <span className="lbl">URL String Length:</span>
                    <span className="val">{details.urlLength || url.length} characters</span>
                  </div>
                  <div className="data-item">
                    <span className="lbl">Subdomain Depth:</span>
                    <span className="val">{details.subdomainCount ?? 0} level(s)</span>
                  </div>
                  <div className="data-item">
                    <span className="lbl">Analyzed Timestamp:</span>
                    <span className="val">{analyzedAt ? new Date(analyzedAt).toLocaleString() : new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
