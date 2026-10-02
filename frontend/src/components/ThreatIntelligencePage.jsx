import React, { useState } from 'react';
import {
  Activity, ShieldAlert, BarChart3, TrendingUp, AlertTriangle,
  Globe, Server, FileText, Download, Filter, CheckCircle2, Search, ArrowUpRight
} from 'lucide-react';

const THREAT_REPORTS = [
  {
    id: 'TR-2026-089',
    title: 'Q3 Global Phishing Telemetry Report',
    category: 'Credential Harvesting',
    severity: 'HIGH',
    date: 'Sep 2026',
    summary: 'Analysis of 120,000+ flagged phishing domains reveals a 34% surge in automated Microsoft 365 OAuth consent prompt abuses.',
    indicators: ['login-verify-m365.net', 'auth-azure-update.com', 'secure-office365-token.xyz']
  },
  {
    id: 'TR-2026-084',
    title: 'Typosquatting Trends in Banking & FinTech',
    category: 'Brand Impersonation',
    severity: 'CRITICAL',
    date: 'Aug 2026',
    summary: 'Threat actors are leveraging free wildcard SSL certificates combined with unicode homograph characters to target retail banking users.',
    indicators: ['paypaI-security.com', 'chase-verify-account.info', 'wellsfarg0-online.net']
  },
  {
    id: 'TR-2026-078',
    title: 'Quishing & Mobile QR Code Vector Surge',
    category: 'Mobile Vector',
    severity: 'MEDIUM',
    date: 'Aug 2026',
    summary: 'Physical parking meter QR code overlays and PDF invoice email embeds targeting remote enterprise workers.',
    indicators: ['pay-parking-meter.top', 'scan-invoice-verify.site']
  },
  {
    id: 'TR-2026-071',
    title: 'Executive impersonation via SMS & Chat',
    category: 'Social Engineering',
    severity: 'HIGH',
    date: 'Jul 2026',
    summary: 'Smishing campaigns utilizing short-code numbers to pressure finance personnel into emergency gift card or wire purchases.',
    indicators: ['exec-urgent-approval.org', 'ceo-direct-wire.tech']
  }
];

export default function ThreatIntelligencePage({ setActiveTab }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery]       = useState('');

  const filteredReports = THREAT_REPORTS.filter(report => {
    const matchesCat = filterCategory === 'ALL' || report.category === filterCategory;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="wg-page-wrap">
      {/* Hero Header */}
      <section className="wg-sub-hero">
        <div className="wrap">
          <div className="wg-sub-hero-inner">
            <div className="wg-badge">
              <Activity size={14} color="#0891B2" />
              <span>Real-Time Threat Telemetry & Insights</span>
            </div>
            <h1 className="wg-sub-hero-title">Threat Intelligence</h1>
            <p className="wg-sub-hero-desc">
              Explore global phishing trends, vector statistics, attacker TTPs (Tactics, Techniques, & Procedures), and intelligence feed reports curated by CyberAware analysts.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-stats-overview-grid">
            <div className="wg-overview-stat-card">
              <div className="stat-card-icon cyan">
                <Globe size={20} color="#0891B2" />
              </div>
              <div className="stat-card-data">
                <span className="stat-card-val">4,850,210</span>
                <span className="stat-card-lbl">Phishing URLs Blocked YTD</span>
              </div>
              <span className="stat-card-trend green">+14% vs last quarter</span>
            </div>

            <div className="wg-overview-stat-card">
              <div className="stat-card-icon danger">
                <ShieldAlert size={20} color="#DC2626" />
              </div>
              <div className="stat-card-data">
                <span className="stat-card-val">84.2%</span>
                <span className="stat-card-lbl">Credential Harvesting Share</span>
              </div>
              <span className="stat-card-trend red">Dominant Attack Vector</span>
            </div>

            <div className="wg-overview-stat-card">
              <div className="stat-card-icon warning">
                <TrendingUp size={20} color="#F59E0B" />
              </div>
              <div className="stat-card-data">
                <span className="stat-card-val">12 Days</span>
                <span className="stat-card-lbl">Avg Domain Lifespan</span>
              </div>
              <span className="stat-card-trend orange">Short-lived disposable hosts</span>
            </div>

            <div className="wg-overview-stat-card">
              <div className="stat-card-icon success">
                <CheckCircle2 size={20} color="#16A34A" />
              </div>
              <div className="stat-card-data">
                <span className="stat-card-val">99.4%</span>
                <span className="stat-card-lbl">Detection Accuracy</span>
              </div>
              <span className="stat-card-trend green">Multi-layer Heuristics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Charts & Analysis Grid */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-grid-2col">
            {/* Left: Phishing Vectors Breakdown */}
            <div className="wg-card-box">
              <div className="card-box-header">
                <h3 className="card-box-title">
                  <BarChart3 size={18} color="#0891B2" />
                  <span>Most Common Phishing Techniques</span>
                </h3>
                <span className="card-box-tag">2026 Global Dataset</span>
              </div>
              <div className="card-box-body">
                <div className="tech-bar-row">
                  <div className="tech-info">
                    <span className="tech-name">Brand Impersonation (Microsoft, Google, Apple)</span>
                    <span className="tech-pct">42%</span>
                  </div>
                  <div className="tech-progress-bg">
                    <div className="tech-progress-fill cyan" style={{ width: '42%' }} />
                  </div>
                </div>

                <div className="tech-bar-row">
                  <div className="tech-info">
                    <span className="tech-name">Urgency & Account Suspension Social Engineering</span>
                    <span className="tech-pct">28%</span>
                  </div>
                  <div className="tech-progress-bg">
                    <div className="tech-progress-fill warning" style={{ width: '28%' }} />
                  </div>
                </div>

                <div className="tech-bar-row">
                  <div className="tech-info">
                    <span className="tech-name">Look-Alike Domain Typosquatting</span>
                    <span className="tech-pct">18%</span>
                  </div>
                  <div className="tech-progress-bg">
                    <div className="tech-progress-fill danger" style={{ width: '18%' }} />
                  </div>
                </div>

                <div className="tech-bar-row">
                  <div className="tech-info">
                    <span className="tech-name">Quishing (QR Code Scams) & SMS Phishing</span>
                    <span className="tech-pct">12%</span>
                  </div>
                  <div className="tech-progress-bg">
                    <div className="tech-progress-fill secondary" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Attack Categories & Risk Insights */}
            <div className="wg-card-box">
              <div className="card-box-header">
                <h3 className="card-box-title">
                  <AlertTriangle size={18} color="#F59E0B" />
                  <span>Risk Insights & Threat Observations</span>
                </h3>
                <span className="card-box-tag">Updated Daily</span>
              </div>
              <div className="card-box-body">
                <div className="insight-item">
                  <div className="insight-bullet cyan" />
                  <div>
                    <strong>HTTPS Misconception Exploitation</strong>
                    <p>Over 79% of registered phishing URLs now utilize valid SSL certificates to trick users who look for padlock indicators.</p>
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-bullet danger" />
                  <div>
                    <strong>Top-Level Domain (TLD) Concentration</strong>
                    <p>New gTLDs like <code>.xyz</code>, <code>.top</code>, and <code>.site</code> represent 64% of newly registered malicious hosts due to low-cost bulk registration.</p>
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-bullet warning" />
                  <div>
                    <strong>MFA Interception Proxies (Adversary-in-the-Middle)</strong>
                    <p>Reverse proxy frameworks like Evilginx allow attackers to capture session cookies even when 2FA SMS codes are entered.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Reports Feed */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">INTELLIGENCE REPORTS</span>
            <h2 className="wg-section-title">Published Threat Reports & Advisories</h2>
            <p className="wg-section-sub">
              Detailed technical analyses of emerging phishing campaigns, domain clusters, and IOCs (Indicators of Compromise).
            </p>
          </div>

          {/* Filter Bar */}
          <div className="wg-filter-bar">
            <div className="wg-search-input-wrap">
              <Search size={16} color="#64748B" />
              <input
                type="text"
                placeholder="Search threat reports by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="wg-filter-pills">
              <button
                type="button"
                className={`filter-pill ${filterCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterCategory('ALL')}
              >
                All Categories
              </button>
              <button
                type="button"
                className={`filter-pill ${filterCategory === 'Credential Harvesting' ? 'active' : ''}`}
                onClick={() => setFilterCategory('Credential Harvesting')}
              >
                Credential Harvesting
              </button>
              <button
                type="button"
                className={`filter-pill ${filterCategory === 'Brand Impersonation' ? 'active' : ''}`}
                onClick={() => setFilterCategory('Brand Impersonation')}
              >
                Brand Impersonation
              </button>
              <button
                type="button"
                className={`filter-pill ${filterCategory === 'Mobile Vector' ? 'active' : ''}`}
                onClick={() => setFilterCategory('Mobile Vector')}
              >
                Mobile Vector
              </button>
            </div>
          </div>

          {/* Report List */}
          <div className="wg-reports-list">
            {filteredReports.map((report) => (
              <div key={report.id} className="wg-report-card">
                <div className="report-card-top">
                  <div className="report-badge-wrap">
                    <span className="report-id-code">{report.id}</span>
                    <span className={`report-sev-badge ${report.severity.toLowerCase()}`}>
                      {report.severity} SEVERITY
                    </span>
                    <span className="report-date">{report.date}</span>
                  </div>
                  <span className="report-category-tag">{report.category}</span>
                </div>

                <h3 className="report-card-title">{report.title}</h3>
                <p className="report-card-summary">{report.summary}</p>

                <div className="report-ioc-box">
                  <span className="ioc-lbl">Sample Flagged Indicators (IOCs):</span>
                  <div className="ioc-chips">
                    {report.indicators.map((ioc, idx) => (
                      <code key={idx}>{ioc}</code>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
