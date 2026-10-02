import React, { useState } from 'react';
import {
  BookOpen, FileText, CheckSquare, HelpCircle, ChevronDown, ChevronUp,
  Download, ArrowRight, ShieldCheck, Lock, ExternalLink
} from 'lucide-react';

const FAQS = [
  {
    question: 'How does WebGuard AI inspect suspicious URLs without risking infection?',
    answer: 'WebGuard AI performs passive, non-executing server-side analysis. Our engine analyzes domain WHOIS records, SSL certificates, lexical patterns, typosquatting databases, and DNS configurations in an isolated sandbox environment so your device is never exposed.'
  },
  {
    question: 'Why is an HTTPS padlock icon insufficient to determine if a website is genuine?',
    answer: 'HTTPS encrypts the connection between your browser and the web server to prevent eavesdropping, but it does NOT verify the intent or identity of the domain owner. Attackers obtain free, valid SSL certificates for phishing domains within minutes.'
  },
  {
    question: 'What is typosquatting, and how can I detect it?',
    answer: 'Typosquatting involves registering domain names that closely mirror popular brand names with minor typos (e.g., swapping letters like "clouclflare.com" for "cloudflare.com"). Always inspect the host domain carefully from right to left.'
  },
  {
    question: 'Can WebGuard AI integrate into our organization’s SIEM or browser extensions?',
    answer: 'Yes! WebGuard AI provides RESTful API endpoints and lightweight browser extension manifests for Chrome, Firefox, and Edge to enforce real-time URL inspection at the endpoint level.'
  },
  {
    question: 'What should I do if I accidentally entered credentials on a phishing website?',
    answer: 'Immediately change your password on the official website from a clean device, terminate all active browser sessions, report the incident to your IT security team, and monitor financial accounts for unauthorized activity.'
  }
];

const GUIDES = [
  {
    title: 'Enterprise Phishing Prevention Playbook',
    category: 'Security Guide',
    readTime: '10 min read',
    desc: 'Comprehensive reference for security leaders to deploy URL filtering, endpoint defenses, and user awareness training.'
  },
  {
    title: 'Recognizing Adversary-in-the-Middle (AiTM) Scams',
    category: 'Awareness Article',
    readTime: '7 min read',
    desc: 'How reverse-proxy frameworks attempt to bypass two-factor authentication and how hardware security keys stop them.'
  },
  {
    title: 'Domain Reputation & Lexical Inspection Framework',
    category: 'Technical Paper',
    readTime: '12 min read',
    desc: 'Technical breakdown of Shannon entropy scoring, string distance algorithms, and brand impersonation heuristics.'
  }
];

export default function ResourcesPage({ setActiveTab }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="wg-page-wrap">
      {/* Sub Hero */}
      <section className="wg-sub-hero">
        <div className="wrap">
          <div className="wg-sub-hero-inner">
            <div className="wg-badge">
              <BookOpen size={14} color="#0891B2" />
              <span>Knowledge Base & Security Resources</span>
            </div>
            <h1 className="wg-sub-hero-title">Resources & Security Guides</h1>
            <p className="wg-sub-hero-desc">
              Access educational materials, security research guides, enterprise awareness checklists, and frequently asked questions about phishing prevention.
            </p>
          </div>
        </div>
      </section>

      {/* Security Guides Grid */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">EDUCATIONAL GUIDES</span>
            <h2 className="wg-section-title">Featured Security Guides & Articles</h2>
            <p className="wg-section-sub">
              Curated by cybersecurity researchers to keep your team informed against evolving threat vectors.
            </p>
          </div>

          <div className="wg-guides-grid">
            {GUIDES.map((guide, idx) => (
              <div key={idx} className="wg-guide-card">
                <div className="guide-card-top">
                  <span className="guide-category-pill">{guide.category}</span>
                  <span className="guide-read-time">{guide.readTime}</span>
                </div>
                <h3 className="guide-card-title">{guide.title}</h3>
                <p className="guide-card-desc">{guide.desc}</p>
                <div className="guide-card-footer">
                  <button
                    type="button"
                    className="wg-btn wg-btn-outline wg-btn-sm"
                    onClick={() => setActiveTab('academy')}
                  >
                    <span>Read Guide</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Checklist Section */}
      <section className="wg-section wg-bg-card">
        <div className="wrap">
          <div className="wg-checklist-box">
            <div className="checklist-content">
              <div className="wg-badge inline">
                <CheckSquare size={14} color="#16A34A" />
                <span>Enterprise Security Checklist</span>
              </div>
              <h2>Cybersecurity Best Practices Checklist</h2>
              <p>
                Download or review our 10-point cybersecurity hygiene checklist for employees, students, and organizations.
              </p>

              <div className="checklist-items-grid">
                <div className="check-item">✓ Verify domain spelling before submitting passwords</div>
                <div className="check-item">✓ Mandate FIDO2/WebAuthn hardware keys for critical systems</div>
                <div className="check-item">✓ Inspect full email header addresses on external messages</div>
                <div className="check-item">✓ Conduct quarterly simulated phishing assessments</div>
                <div className="check-item">✓ Maintain automated, off-site encrypted backups</div>
                <div className="check-item">✓ Enforce strict endpoint browser auto-update policies</div>
              </div>
            </div>

            <div className="checklist-action">
              <button
                type="button"
                className="wg-btn wg-btn-primary wg-btn-lg"
                onClick={() => alert('WebGuard AI Security Awareness Checklist PDF generated and ready for distribution.')}
              >
                <Download size={18} />
                <span>Download Printable PDF Checklist</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-section-header">
            <span className="wg-section-tag">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="wg-section-title">Everything You Need To Know</h2>
            <p className="wg-section-sub">
              Clear answers regarding URL scanning, detection mechanics, and best practices.
            </p>
          </div>

          <div className="wg-faq-accordion">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`wg-faq-item ${openFaqIndex === idx ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="wg-faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                >
                  <span className="question-text">{faq.question}</span>
                  <span className="faq-toggle-icon">
                    {openFaqIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="wg-faq-answer-panel">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
