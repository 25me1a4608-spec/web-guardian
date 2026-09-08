import React from 'react';
import {
  Shield,
  Lock,
  EyeOff,
  Database,
  Server,
  FileCheck,
  X,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function PrivacySecurityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
      <div className="modal-content cyber-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Lock size={20} className="cyan" />
            </div>
            <div>
              <h3 id="privacy-modal-title" className="modal-title">Privacy &amp; Security Policy</h3>
              <span className="modal-subtitle">WebGuard AI Architectural Principles &amp; Data Safeguards</span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-scroll-body">
          {/* Core Tenet Banner */}
          <div className="privacy-highlight-card">
            <Shield size={24} className="cyan" />
            <div>
              <strong>Passive Text-Only Inspection</strong>
              <p>
                WebGuard AI evaluates submitted URLs strictly as text strings.
                We <em>never</em> visit, fetch, execute scripts, render pages, or submit forms to analyzed destinations.
              </p>
            </div>
          </div>

          <div className="privacy-sections-grid">
            {/* Section 1: What Data is Processed */}
            <div className="privacy-section-card">
              <div className="sec-header">
                <FileCheck size={18} className="green" />
                <h4>What Data is Analyzed</h4>
              </div>
              <p>
                We only analyze the lexical characters of the submitted URL: protocol, hostname, apex domain, subdomains,
                path, and query keys.
              </p>
            </div>

            {/* Section 2: What We Never Touch */}
            <div className="privacy-section-card">
              <div className="sec-header">
                <EyeOff size={18} className="crimson" />
                <h4>Zero Credential Access</h4>
              </div>
              <p>
                WebGuard AI never requests, inspects, or logs passwords, session cookies, payment cards, or user identity files.
                Never enter private passwords into any analysis tool.
              </p>
            </div>

            {/* Section 3: Local Storage Isolation */}
            <div className="privacy-section-card">
              <div className="sec-header">
                <Database size={18} className="purple" />
                <h4>Local-Only Device Storage</h4>
              </div>
              <p>
                Your scan history lives entirely in your browser's local sandbox (<code>localStorage</code> for web app;
                <code>chrome.storage.local</code> for extension). No remote database stores your scan logs.
              </p>
            </div>

            {/* Section 4: Threat Intelligence Privacy */}
            <div className="privacy-section-card">
              <div className="sec-header">
                <Server size={18} className="amber" />
                <h4>Threat Intelligence Services</h4>
              </div>
              <p>
                When VirusTotal or Google Safe Browsing is configured, only the URL or cryptographic hash is transmitted to
                official reputation APIs. In default local mode, zero external network queries occur.
              </p>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="responsible-ai-box">
            <div className="resp-header">
              <Cpu size={18} className="cyan" />
              <strong>Responsible Security &amp; AI Disclaimer</strong>
            </div>
            <p>
              Security analysis results represent a structural risk assessment based on available indicators and patterns,
              not an absolute guarantee. Cyber adversaries continuously evolve their techniques. Always exercise vigilance
              and verify sensitive communications through verified independent channels.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-dismiss-btn" onClick={onClose}>
            <CheckCircle2 size={16} />
            <span>Understood &amp; Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
