import React from 'react';
import {
  BookOpen,
  AlertOctagon,
  Key,
  ShieldCheck,
  Lock,
  Globe,
  CheckCircle,
  HelpCircle,
  Smartphone,
  CreditCard
} from 'lucide-react';

export default function SecurityAwareness({ setActiveTab }) {
  return (
    <div className="awareness-container">
      {/* Awareness Header */}
      <div className="awareness-header">
        <div className="awareness-badge">
          <BookOpen size={14} />
          <span>Cyber Education</span>
        </div>
        <h2 className="awareness-title">Security Awareness & Phishing Defense</h2>
        <p className="awareness-quote">
          "Humans are often the weakest link because phishing attacks target human decisions, not just technology."
        </p>
      </div>

      {/* Core Warning Box: The HTTPS Myth */}
      <div className="awareness-alert-box">
        <div className="alert-icon-box">
          <Lock size={26} />
        </div>
        <div className="alert-content">
          <h3>The HTTPS Myth: A Lock Icon Does NOT Equal Safe!</h3>
          <p>
            Many internet users mistakenly believe that if a website has a green lock or starts with <code>https://</code>,
            it is automatically legitimate. In reality, modern phishing sites also use HTTPS certificates!
            HTTPS only encrypts the connection between your device and the server — it does NOT verify that the server owner is honest.
          </p>
        </div>
      </div>

      {/* Anatomy of a Phishing Attack Grid */}
      <div className="threat-tactics-grid">
        <div className="tactic-card">
          <div className="tactic-icon-header red">
            <Globe size={22} />
            <span>Look-Alike Domains</span>
          </div>
          <p className="tactic-desc">
            Attackers register domains that look nearly identical to real brands by adding extra words or replacing characters.
          </p>
          <div className="tactic-example">
            <div className="example-row legit">
              <span className="label">REAL:</span>
              <code>amazon.in</code>
            </div>
            <div className="example-row fake">
              <span className="label">PHISH:</span>
              <code>amazon-login-security-example.com</code>
            </div>
          </div>
        </div>

        <div className="tactic-card">
          <div className="tactic-icon-header amber">
            <AlertOctagon size={22} />
            <span>Artificial Urgency & Fear</span>
          </div>
          <p className="tactic-desc">
            Phishers design messages intended to induce panic: <em>"Account Suspended!"</em>, <em>"Verify in 24 Hours!"</em>, or <em>"Unauthorized Wire Detected!"</em>.
            When users feel rushed, critical judgment drops.
          </p>
          <div className="tactic-tip">
            Always pause. Legitimate companies never demand emergency verification via an unverified link.
          </div>
        </div>

        <div className="tactic-card">
          <div className="tactic-icon-header purple">
            <CreditCard size={22} />
            <span>Credential Harvesters</span>
          </div>
          <p className="tactic-desc">
            Attackers duplicate the HTML and CSS of trusted login pages (Google, Microsoft 365, PayPal).
            When you type your password, it is silently transmitted to the attacker's database.
          </p>
          <div className="tactic-tip">
            Look closely at the browser address bar before typing passwords.
          </div>
        </div>

        <div className="tactic-card">
          <div className="tactic-icon-header cyan">
            <Smartphone size={22} />
            <span>Smishing & Direct Messages</span>
          </div>
          <p className="tactic-desc">
            Phishing links sent via SMS, WhatsApp, Discord, or LinkedIn frequently use URL shorteners
            (like <code>bit.ly</code> or <code>tinyurl</code>) to conceal the malicious destination.
          </p>
          <div className="tactic-tip">
            Run shortened links through WebGuard AI before opening them.
          </div>
        </div>
      </div>

      {/* Golden Rules Checklist */}
      <div className="golden-rules-card">
        <div className="rules-header">
          <ShieldCheck size={24} className="rules-icon" />
          <div>
            <h3>WebGuard AI: 5 Golden Rules of Link Safety</h3>
            <p>Simple habits to keep you and your organization protected</p>
          </div>
        </div>

        <div className="rules-grid">
          <div className="rule-item">
            <span className="rule-num">01</span>
            <div className="rule-text">
              <h4>Inspect the Root Domain</h4>
              <p>Check the letters immediately preceding the final dot (e.g. in <code>paypal.evil.com</code>, the domain is <strong>evil.com</strong>, not PayPal!).</p>
            </div>
          </div>

          <div className="rule-item">
            <span className="rule-num">02</span>
            <div className="rule-text">
              <h4>Never Enter Passwords from Links</h4>
              <p>If an email warns of an account problem, open a new browser tab and navigate to the website manually through your bookmarks.</p>
            </div>
          </div>

          <div className="rule-item">
            <span className="rule-num">03</span>
            <div className="rule-text">
              <h4>Beware of Raw IP Addresses</h4>
              <p>Legitimate organizations never ask you to sign into an IP address such as <code>http://192.168.1.50/login</code>.</p>
            </div>
          </div>

          <div className="rule-item">
            <span className="rule-num">04</span>
            <div className="rule-text">
              <h4>Enable Multi-Factor Authentication (MFA)</h4>
              <p>MFA ensures that even if an attacker tricks you into revealing your password, they still cannot access your account.</p>
            </div>
          </div>

          <div className="rule-item">
            <span className="rule-num">05</span>
            <div className="rule-text">
              <h4>Use WebGuard AI on Suspicious Links</h4>
              <p>Whenever in doubt, paste the URL into WebGuard AI to inspect structural indicators before clicking.</p>
            </div>
          </div>
        </div>

        <div className="rules-cta">
          <button
            type="button"
            className="rules-cta-btn"
            onClick={() => setActiveTab('scanner')}
          >
            Go to WebGuard URL Scanner &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
