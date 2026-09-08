import React from 'react';
import { Shield, Lock, ShieldCheck } from 'lucide-react';

export default function Footer({ setActiveTab, onOpenPrivacy }) {
  return (
    <footer className="cyber-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <Shield size={18} className="footer-logo-icon" />
            <span className="footer-brand-title">WEBGUARD <span className="accent">AI</span></span>
          </div>
          <p className="footer-motto">
            "Don't just detect the threat. Understand it."
          </p>
          <span className="footer-hackathon-tag">Hackathon Prototype &bull; Real-Time Phishing Threat Defense</span>
        </div>

        <div className="footer-links-col">
          <button type="button" className="footer-nav-link" onClick={() => setActiveTab('scanner')}>
            URL Scanner
          </button>
          <button type="button" className="footer-nav-link" onClick={() => setActiveTab('dashboard')}>
            Threat Dashboard
          </button>
          <button type="button" className="footer-nav-link" onClick={() => setActiveTab('history')}>
            Scan History
          </button>
          <button type="button" className="footer-nav-link" onClick={() => setActiveTab('how-it-works')}>
            Architecture
          </button>
          <button type="button" className="footer-nav-link" onClick={() => setActiveTab('awareness')}>
            Cyber Awareness
          </button>
          <button type="button" className="footer-nav-link policy-link" onClick={onOpenPrivacy}>
            <ShieldCheck size={14} />
            <span>Privacy &amp; Data Safeguards</span>
          </button>
        </div>

        <div className="footer-disclaimer-col">
          <button type="button" className="disclaimer-badge-btn" onClick={onOpenPrivacy} title="View Privacy Safeguards">
            <div className="disclaimer-badge">
              <Lock size={12} />
              <span>PASSIVE INSPECTION &bull; VIEW PRIVACY</span>
            </div>
          </button>
          <p className="disclaimer-text">
            WebGuard AI performs passive, non-invasive lexical and structural analysis.
            Submitted links are never opened, rendered, or executed in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
