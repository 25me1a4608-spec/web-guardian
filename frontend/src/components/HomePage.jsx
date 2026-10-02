import React, { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2,
  Lock, Search, ExternalLink, Activity, Info, FileText, ChevronRight,
  Shield, Server, Globe, Cpu, UserX, AlertCircle, Sparkles
} from 'lucide-react';

export default function HomePage({ onStartAnalysis, setActiveTab, onRunDemo }) {
  const [heroUrl, setHeroUrl] = useState('');

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!heroUrl.trim()) return;
    onStartAnalysis(heroUrl.trim());
  };

  const attackSteps = [
    {
      step: '01',
      title: '1. Fake Message Delivered',
      desc: 'Attacker sends a deceptive email, SMS, or direct message featuring artificial urgency, fake security alerts, or account suspension warnings.',
      icon: <AlertCircle size={20} color="#0891B2" />,
    },
    {
      step: '02',
      title: '2. User Clicks Deceptive Link',
      desc: 'The recipient clicks an embedded hyperlink that uses look-alike domain typosquatting or URL shorteners to mask the malicious destination.',
      icon: <ExternalLink size={20} color="#0891B2" />,
    },
    {
      step: '03',
      title: '3. Fake Website Opens',
      desc: 'The victim is routed to a pixel-accurate clone of an official login portal equipped with a valid SSL certificate to project fake legitimacy.',
      icon: <Globe size={20} color="#F59E0B" />,
    },
    {
      step: '04',
      title: '4. Credentials Entered',
      desc: 'Unaware of the impersonation, the user inputs credentials, one-time passcodes (OTP), or personal identification details.',
      icon: <UserX size={20} color="#DC2626" />,
    },
    {
      step: '05',
      title: '5. Data Stolen & Access Lost',
      desc: 'Harvested credentials are immediately transmitted to attacker servers, compromising accounts and triggering unauthorized access.',
      icon: <ShieldAlert size={20} color="#DC2626" />,
    },
  ];

  const securityTips = [
    {
      title: 'Verify Website URLs',
      desc: 'Always inspect the domain name in your address bar carefully. Look out for subtle character substitutions like substituting "m" with "rn" or extra hyphens.',
    },
    {
      title: 'Use Multi-Factor Authentication',
      desc: 'Enable hardware keys or authenticator apps for all critical accounts so compromised passwords alone cannot grant access.',
    },
    {
      title: 'Never Trust Manufactured Urgency',
      desc: 'Phishing attacks rely on artificial panic such as "Account Suspended in 24 Hours". Take a step back and independently verify via official phone or site.',
    },
    {
      title: 'Check Sender Identity',
      desc: 'Expand the sender email header to verify the actual email domain address instead of relying solely on the friendly display name.',
    },
    {
      title: 'Avoid Suspicious Downloads',
      desc: 'Do not download attachments or executable installers from unexpected emails, even if they claim to contain invoices or tax documents.',
    },
    {
      title: 'Update Passwords Regularly',
      desc: 'Maintain distinct, non-reused high-entropy passwords across all enterprise platforms, and utilize password managers.',
    },
  ];

  return (
    <div className="wg-page-wrap">
      {/* HERO SECTION */}
      <section className="wg-hero">
        <div className="wrap">
          <div className="wg-hero-grid">
            {/* Hero Left Content */}
            <div className="wg-hero-content">
              <div className="wg-badge">
                <ShieldCheck size={14} color="#0891B2" />
                <span>Trusted Cyber Awareness Platform</span>
              </div>
              <h1 className="wg-hero-headline">
                Stay Safe From Online Threats
              </h1>
              <p className="wg-hero-sub">
                Analyze suspicious URLs, detect phishing websites, understand cyber threats, and build safer browsing habits before entering credentials.
              </p>

              {/* Quick Scanner Box */}
              <form className="wg-hero-scanner-form" onSubmit={handleHeroSubmit}>
                <div className="wg-input-group">
                  <span className="input-icon">
                    <Search size={18} color="#64748B" />
                  </span>
                  <input
                    type="url"
                    className="wg-hero-input"
                    placeholder="Enter suspicious URL to inspect (e.g. https://verify-appleid-update.net)..."
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    required
                  />
                  <button type="submit" className="wg-btn wg-btn-primary">
                    <span>Analyze URL</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              {/* Hero CTA buttons & hints */}
              <div className="wg-hero-actions">
                <button
                  type="button"
                  className="wg-btn wg-btn-outline"
                  onClick={() => setActiveTab('academy')}
                >
                  <Sparkles size={16} color="#0891B2" />
                  <span>Explore Learning Hub</span>
                </button>
                <button
                  type="button"
                  className="wg-btn wg-btn-ghost"
                  onClick={() => setActiveTab('intelligence')}
                >
                  <Activity size={16} color="#475569" />
                  <span>View Threat Intelligence</span>
                </button>
              </div>

              <div className="wg-hero-trust-row">
                <span className="trust-label">Key Capabilities:</span>
                <span className="trust-item">✓ Lexical Heuristics</span>
                <span className="trust-item">✓ SSL Validation</span>
                <span className="trust-item">✓ Brand Impersonation Detection</span>
              </div>
            </div>

            {/* Hero Right: REALISTIC CYBERSECURITY DASHBOARD PREVIEW CARD */}
            <div className="wg-hero-preview-col">
              <div className="wg-dashboard-card-preview">
                <div className="preview-card-header">
                  <div className="preview-title-wrap">
                    <div className="pulse-dot green" />
                    <span className="preview-card-title">Live Security Analysis Dashboard</span>
                  </div>
                  <span className="preview-card-domain">google.com</span>
                </div>

                <div className="preview-card-body">
                  {/* Gauge Row */}
                  <div className="preview-stats-row">
                    <div className="preview-stat-box green">
                      <div className="stat-num">18/100</div>
                      <div className="stat-lbl">Risk Score (Low Risk)</div>
                    </div>
                    <div className="preview-stat-box">
                      <div className="stat-val green-text">Clean</div>
                      <div className="stat-lbl">Domain Reputation</div>
                    </div>
                    <div className="preview-stat-box">
                      <div className="stat-val green-text">Valid TLS 1.3</div>
                      <div className="stat-lbl">SSL Certificate</div>
                    </div>
                  </div>

                  {/* Threat Indicators Checklist */}
                  <div className="preview-indicators-section">
                    <div className="indicator-hdr">Threat Indicators Assessment</div>
                    <div className="indicator-grid">
                      <div className="indicator-row safe">
                        <CheckCircle2 size={16} color="#16A34A" />
                        <span>Lexical Structure: <strong>Standard</strong></span>
                      </div>
                      <div className="indicator-row safe">
                        <CheckCircle2 size={16} color="#16A34A" />
                        <span>Brand Impersonation: <strong>None Detected</strong></span>
                      </div>
                      <div className="indicator-row safe">
                        <CheckCircle2 size={16} color="#16A34A" />
                        <span>Domain Age: <strong>26+ Years Old</strong></span>
                      </div>
                      <div className="indicator-row safe">
                        <CheckCircle2 size={16} color="#16A34A" />
                        <span>Security Feeds: <strong>0 Blacklists</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Explanation Box */}
                  <div className="preview-explanation-box">
                    <div className="explanation-hdr">
                      <Cpu size={14} color="#0891B2" />
                      <span>AI Analysis Explanation</span>
                    </div>
                    <p className="explanation-text">
                      Target host uses authenticated SSL infrastructure issued by DigiCert with zero deceptive subdomains or brand spoofing anomalies. Evaluated as a safe legitimate service.
                    </p>
                  </div>
                </div>

                <div className="preview-card-footer">
                  <button
                    type="button"
                    className="preview-demo-trigger"
                    onClick={() => setActiveTab('analysis')}
                  >
                    <span>Run Full Inspection on Any URL</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REAL WORLD EXAMPLES COMPARISON CARDS */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">REAL-WORLD EXAMPLES</span>
            <h2 className="wg-section-title">Spotting The Difference Before Clicking</h2>
            <p className="wg-section-sub">
              Attackers register look-alike domain names that mirror trusted brand names closely. Compare real vs malicious domain structures.
            </p>
          </div>

          <div className="wg-comparison-grid">
            {/* SAFE WEBSITE */}
            <div className="wg-comparison-card safe">
              <div className="comparison-badge safe">
                <CheckCircle2 size={16} color="#16A34A" />
                <span>SAFE WEBSITE</span>
              </div>
              <div className="comparison-url-box safe">
                <span className="url-protocol">https://</span>
                <span className="url-domain">amazon.in</span>
              </div>
              <div className="comparison-body">
                <div className="comp-item">
                  <span className="lbl">Domain Reputation:</span>
                  <span className="val green-text">Legitimate Verified</span>
                </div>
                <div className="comp-item">
                  <span className="lbl">SSL Certificate:</span>
                  <span className="val">Extended Validation (EV)</span>
                </div>
                <div className="comp-item">
                  <span className="lbl">Typo-squatting Risk:</span>
                  <span className="val green-text">None</span>
                </div>
              </div>
            </div>

            {/* SUSPICIOUS WEBSITE */}
            <div className="wg-comparison-card warning">
              <div className="comparison-badge warning">
                <AlertTriangle size={16} color="#F59E0B" />
                <span>SUSPICIOUS WEBSITE</span>
              </div>
              <div className="comparison-url-box warning">
                <span className="url-protocol">http://</span>
                <span className="url-domain">amazon-security-login.com</span>
              </div>
              <div className="comparison-body">
                <div className="comp-item">
                  <span className="lbl">Domain Reputation:</span>
                  <span className="val orange-text">Unverified Domain</span>
                </div>
                <div className="comp-item">
                  <span className="lbl">SSL Certificate:</span>
                  <span className="val orange-text">Basic Free Cert</span>
                </div>
                <div className="comp-item">
                  <span className="lbl">Typo-squatting Risk:</span>
                  <span className="val orange-text">High Brand Impersonation</span>
                </div>
              </div>
            </div>

            {/* MALICIOUS WEBSITE */}
            <div className="wg-comparison-card danger">
              <div className="comparison-badge danger">
                <ShieldAlert size={16} color="#DC2626" />
                <span>MALICIOUS WEBSITE</span>
              </div>
              <div className="comparison-url-box danger">
                <span className="url-protocol">http://</span>
                <span className="url-domain">verify-account-amazon.xyz</span>
              </div>
              <div className="comparison-body">
                <div className="comp-item">
                  <span className="lbl">Domain Reputation:</span>
                  <span className="val red-text">Flagged Phishing Host</span>
                </div>
                <div className="comp-item">
                  <span className="lbl">SSL Certificate:</span>
                  <span className="val red-text">Missing / Self-Signed</span>
                </div>
                <div className="comp-item">
                  <span className="lbl">Typo-squatting Risk:</span>
                  <span className="val red-text">Credential Harvester</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW ATTACKS WORK INFOGRAPHIC TIMELINE */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">ATTACK LIFECYCLE</span>
            <h2 className="wg-section-title">How Phishing Attacks Work</h2>
            <p className="wg-section-sub">
              Understanding the step-by-step vector of social engineering enables users to break the attack chain before credentials are lost.
            </p>
          </div>

          <div className="wg-timeline-grid">
            {attackSteps.map((item, idx) => (
              <div key={idx} className="wg-timeline-card">
                <div className="timeline-num-badge">{item.step}</div>
                <div className="timeline-icon-wrap">{item.icon}</div>
                <h3 className="timeline-card-title">{item.title}</h3>
                <p className="timeline-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY TIPS SECTION */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">DEFENSE STRATEGY</span>
            <h2 className="wg-section-title">Essential Security Best Practices</h2>
            <p className="wg-section-sub">
              Simple, high-impact defense habits to protect enterprise and personal digital accounts from phishing threats.
            </p>
          </div>

          <div className="wg-tips-grid">
            {securityTips.map((tip, idx) => (
              <div key={idx} className="wg-tip-card">
                <div className="tip-check-icon">
                  <CheckCircle2 size={20} color="#16A34A" />
                </div>
                <div className="tip-content">
                  <h3 className="tip-title">✓ {tip.title}</h3>
                  <p className="tip-desc">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="wg-center-cta-wrap">
            <button
              type="button"
              className="wg-btn wg-btn-primary wg-btn-lg"
              onClick={() => setActiveTab('analysis')}
            >
              <span>Test Your Suspicious URL Now</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
