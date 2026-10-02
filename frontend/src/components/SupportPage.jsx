import React, { useState } from 'react';
import {
  HelpCircle, AlertTriangle, Send, MessageSquare, CheckCircle2,
  ShieldAlert, Mail, Phone, LifeBuoy, FileText, Lock
} from 'lucide-react';

export default function SupportPage({ setActiveTab }) {
  const [activeFormTab, setActiveFormTab] = useState('report'); // 'report' | 'feedback'

  // Report form state
  const [reportUrl, setReportUrl]       = useState('');
  const [reportCategory, setCategory]   = useState('Phishing / Credential Harvester');
  const [reportDetails, setDetails]     = useState('');
  const [reportSuccess, setReportSubmitted] = useState(false);

  // Feedback form state
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setEmail]       = useState('');
  const [feedbackMsg, setMsg]           = useState('');
  const [feedbackSuccess, setFeedbackSubmitted] = useState(false);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportUrl.trim()) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setReportUrl('');
      setDetails('');
    }, 500);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackName('');
      setEmail('');
      setMsg('');
    }, 500);
  };

  return (
    <div className="wg-page-wrap">
      {/* Sub Hero */}
      <section className="wg-sub-hero">
        <div className="wrap">
          <div className="wg-sub-hero-inner">
            <div className="wg-badge">
              <LifeBuoy size={14} color="#0891B2" />
              <span>WebGuard AI Help & Support Center</span>
            </div>
            <h1 className="wg-sub-hero-title">Support & Threat Reporting</h1>
            <p className="wg-sub-hero-desc">
              Report suspicious links, submit community threat feedback, or reach out to our cybersecurity operations team.
            </p>
          </div>
        </div>
      </section>

      {/* Support Cards */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-support-cards-grid">
            <div className="wg-support-card">
              <div className="support-icon cyan">
                <ShieldAlert size={22} color="#0891B2" />
              </div>
              <h3>Report Phishing Site</h3>
              <p>Submit suspicious URLs to our automated verification system for threat feed inclusion.</p>
              <button
                type="button"
                className="wg-btn wg-btn-outline wg-btn-sm"
                onClick={() => setActiveFormTab('report')}
              >
                <span>Submit URL Report</span>
              </button>
            </div>

            <div className="wg-support-card">
              <div className="support-icon success">
                <MessageSquare size={22} color="#16A34A" />
              </div>
              <h3>Community Feedback</h3>
              <p>Share suggestions, feature requests, or report false positive detection scores.</p>
              <button
                type="button"
                className="wg-btn wg-btn-outline wg-btn-sm"
                onClick={() => setActiveFormTab('feedback')}
              >
                <span>Provide Feedback</span>
              </button>
            </div>

            <div className="wg-support-card">
              <div className="support-icon warning">
                <HelpCircle size={22} color="#F59E0B" />
              </div>
              <h3>Help Center & Guides</h3>
              <p>Explore technical documentation, integration guides, and security FAQs.</p>
              <button
                type="button"
                className="wg-btn wg-btn-outline wg-btn-sm"
                onClick={() => setActiveTab('resources')}
              >
                <span>View Knowledge Base</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Form Section */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-form-container">
            <div className="wg-form-tabs">
              <button
                type="button"
                className={`form-tab-btn ${activeFormTab === 'report' ? 'active' : ''}`}
                onClick={() => setActiveFormTab('report')}
              >
                <ShieldAlert size={16} />
                <span>Report Suspicious Website</span>
              </button>
              <button
                type="button"
                className={`form-tab-btn ${activeFormTab === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveFormTab('feedback')}
              >
                <MessageSquare size={16} />
                <span>Submit Feedback</span>
              </button>
            </div>

            <div className="wg-form-body">
              {activeFormTab === 'report' ? (
                reportSuccess ? (
                  <div className="wg-success-state">
                    <CheckCircle2 size={48} color="#16A34A" />
                    <h3>Suspicious URL Report Submitted Successfully</h3>
                    <p>
                      Thank you for contributing to threat intelligence! Our automated detection engine is inspecting the host and updating security feed blocks.
                    </p>
                    <button
                      type="button"
                      className="wg-btn wg-btn-primary"
                      onClick={() => setReportSubmitted(false)}
                    >
                      Report Another URL
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReportSubmit} className="wg-support-form">
                    <div className="form-field">
                      <label htmlFor="report-url">Suspicious URL Address *</label>
                      <input
                        id="report-url"
                        type="url"
                        placeholder="https://deceptive-login-domain.com/verify"
                        value={reportUrl}
                        onChange={(e) => setReportUrl(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="report-category">Threat Classification Category</label>
                      <select
                        id="report-category"
                        value={reportCategory}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Phishing / Credential Harvester">Phishing / Credential Harvester</option>
                        <option value="Look-Alike Typosquatting">Look-Alike Typosquatting</option>
                        <option value="Fake Shopping / E-commerce Scam">Fake Shopping / E-commerce Scam</option>
                        <option value="Malware / Ransomware Distribution">Malware / Ransomware Distribution</option>
                        <option value="SMS / QR Code Target Link">SMS / QR Code Target Link</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="report-details">Additional Details & Context (Optional)</label>
                      <textarea
                        id="report-details"
                        rows="4"
                        placeholder="Provide information on how you encountered this URL (e.g., email subject, sender address, SMS content)..."
                        value={reportDetails}
                        onChange={(e) => setDetails(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="wg-btn wg-btn-primary">
                      <Send size={16} />
                      <span>Submit Suspicious Site Report</span>
                    </button>
                  </form>
                )
              ) : feedbackSuccess ? (
                <div className="wg-success-state">
                  <CheckCircle2 size={48} color="#16A34A" />
                  <h3>Feedback Received</h3>
                  <p>We appreciate your insights! Our security user experience team will review your comments.</p>
                  <button
                    type="button"
                    className="wg-btn wg-btn-primary"
                    onClick={() => setFeedbackSubmitted(false)}
                  >
                    Submit Additional Feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="wg-support-form">
                  <div className="form-row-2col">
                    <div className="form-field">
                      <label htmlFor="fb-name">Your Name</label>
                      <input
                        id="fb-name"
                        type="text"
                        placeholder="John Doe"
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="fb-email">Work Email</label>
                      <input
                        id="fb-email"
                        type="email"
                        placeholder="john@organization.com"
                        value={feedbackEmail}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="fb-msg">Feedback Comments or Feature Request *</label>
                    <textarea
                      id="fb-msg"
                      rows="4"
                      placeholder="Share your thoughts on WebGuard AI tools, interface, or detection accuracy..."
                      value={feedbackMsg}
                      onChange={(e) => setMsg(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="wg-btn wg-btn-primary">
                    <Send size={16} />
                    <span>Send Feedback Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
