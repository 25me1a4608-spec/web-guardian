import React from 'react';
import { Shield, ExternalLink, HeartHandshake } from 'lucide-react';

export default function Footer({ setActiveTab, onOpenPrivacy }) {
  return (
    <footer className="wg-footer">
      <div className="wrap">
        <div className="wg-footer-grid">
          {/* Brand col */}
          <div className="wg-footer-brand-col">
            <div className="wg-brand footer-brand" onClick={() => setActiveTab('home')}>
              <div className="wg-logo-icon">
                <Shield size={20} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <div className="wg-brand-text">
                <div className="wg-brand-title white">CyberAware <span className="wg-brand-subtitle-badge">SECURITY</span></div>
                <div className="wg-brand-tagline muted">Protecting Users Through Cybersecurity Awareness</div>
              </div>
            </div>
            <p className="wg-footer-mission">
              Our mission is to help users identify phishing attacks, suspicious websites, social engineering scams, and online threats before they become victims.
            </p>
            <div className="wg-footer-accreditation">
              <span className="accreditation-pill">ISO/IEC 27001 Standard Aligned</span>
              <span className="accreditation-pill">Open Source Threat Feeds</span>
            </div>
          </div>

          {/* Col 1: Navigation */}
          <div className="wg-footer-col">
            <h4>Platform</h4>
            <ul>
              <li><button type="button" onClick={() => setActiveTab('home')}>Home</button></li>
              <li><button type="button" onClick={() => setActiveTab('analysis')}>Threat Analysis</button></li>
              <li><button type="button" onClick={() => setActiveTab('academy')}>Cyber Academy</button></li>
              <li><button type="button" onClick={() => setActiveTab('intelligence')}>Threat Intelligence</button></li>
              <li><button type="button" onClick={() => setActiveTab('resources')}>Resources & Guides</button></li>
              <li><button type="button" onClick={() => setActiveTab('support')}>Support Center</button></li>
            </ul>
          </div>

          {/* Col 2: Education */}
          <div className="wg-footer-col">
            <h4>Cyber Academy</h4>
            <ul>
              <li><button type="button" onClick={() => setActiveTab('academy')}>HTTPS Myth Explained</button></li>
              <li><button type="button" onClick={() => setActiveTab('academy')}>Look-Alike Typosquat Domains</button></li>
              <li><button type="button" onClick={() => setActiveTab('academy')}>Credential Harvesting Scams</button></li>
              <li><button type="button" onClick={() => setActiveTab('academy')}>Social Engineering Defense</button></li>
              <li><button type="button" onClick={() => setActiveTab('academy')}>QR Code & SMS Phishing</button></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="wg-footer-col">
            <h4>Support & Reporting</h4>
            <ul>
              <li><button type="button" onClick={() => setActiveTab('support')}>Report Suspicious Website</button></li>
              <li><button type="button" onClick={() => setActiveTab('support')}>Submit Community Feedback</button></li>
              <li><button type="button" onClick={() => setActiveTab('support')}>Help Center & FAQ</button></li>
              <li><button type="button" onClick={() => onOpenPrivacy()}>Privacy & Data Handling</button></li>
            </ul>
          </div>
        </div>

        <div className="wg-footer-bottom">
          <p>© {new Date().getFullYear()} CyberAware Security Platform. Built for Enterprise, Academic & Public Cyber Defense.</p>
          <div className="wg-footer-legal">
            <button type="button" onClick={() => onOpenPrivacy()}>Privacy Policy</button>
            <span className="sep">•</span>
            <button type="button" onClick={() => onOpenPrivacy()}>Terms of Service</button>
            <span className="sep">•</span>
            <button type="button" onClick={() => setActiveTab('support')}>Contact Security Team</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
