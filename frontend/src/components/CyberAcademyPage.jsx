import React, { useState } from 'react';
import {
  Lock, Globe, Key, Users, QrCode, MessageSquare, ShoppingBag,
  Shield, CheckCircle2, AlertTriangle, X, ArrowRight, BookOpen, Sparkles
} from 'lucide-react';

const ACADEMY_CARDS = [
  {
    id: 'https-myth',
    icon: <Lock size={24} color="#0891B2" />,
    title: 'HTTPS Myth',
    shortDesc: 'Why a padlock icon does NOT mean a website is safe or legitimate.',
    fullContent: {
      overview: 'Many users mistakenly assume that an HTTPS padlock icon guarantees a website is safe. In reality, HTTPS only encrypts the connection between your browser and the website.',
      redFlags: [
        'Free SSL certificates (Let’s Encrypt, ZeroSSL) are automatically issued to phishing domains.',
        'Attackers host credential harvesters on encrypted HTTPS links to bypass basic browser warnings.',
        'HTTPS protects against wiretapping, NOT against deceptive domain ownership.'
      ],
      takeaway: 'Never rely on the padlock icon alone. Always verify the domain name in the address bar before logging in.'
    }
  },
  {
    id: 'look-alike-domains',
    icon: <Globe size={24} color="#0891B2" />,
    title: 'Look-Alike Domains',
    shortDesc: 'How attackers register subtle typosquatting domain variations to deceive users.',
    fullContent: {
      overview: 'Typosquatting and IDN homograph attacks trick the eye by substituting visually identical characters (e.g. "arnazon.com" instead of "amazon.com", or Cyrillic letters).',
      redFlags: [
        'Extra hyphens or words appended to official brands (e.g., paypal-security-update.com).',
        'Subdomain trickery: microsoft.com.login-verify.net (the true domain is login-verify.net!).',
        'Top-level domain swaps (.xyz, .top, .online instead of .com or .org).'
      ],
      takeaway: 'Read domain names from right to left starting from the top-level extension to locate the primary host.'
    }
  },
  {
    id: 'credential-harvesting',
    icon: <Key size={24} color="#0891B2" />,
    title: 'Credential Harvesting',
    shortDesc: 'Detecting pixel-perfect sign-in clones engineered to capture credentials & MFA.',
    fullContent: {
      overview: 'Credential harvesting pages replicate login screens of Google, Microsoft 365, banks, or corporate VPNs to steal usernames, passwords, and 2FA tokens in real time.',
      redFlags: [
        'Form action posts credentials directly to foreign IP addresses or unrecognized PHP scripts.',
        'Site fails to allow standard password manager auto-fill.',
        'Prompting for 2FA one-time passcodes twice in rapid succession.'
      ],
      takeaway: 'Use hardware security keys (FIDO2 / WebAuthn) or password managers that refuse to auto-fill on spoofed domains.'
    }
  },
  {
    id: 'social-engineering',
    icon: <Users size={24} color="#0891B2" />,
    title: 'Social Engineering',
    shortDesc: 'Recognizing psychological manipulation techniques used by threat actors.',
    fullContent: {
      overview: 'Social engineering bypasses firewalls by exploiting human emotions like urgency, fear, authority, or curiosity.',
      redFlags: [
        'Pretending to be IT support requesting remote access or password resets.',
        'Urgent CEO or executive wire transfer demands via informal chat.',
        'Threats of legal action, account suspension, or financial penalties if action is delayed.'
      ],
      takeaway: 'Always perform out-of-band verification via a known official phone number before fulfilling unexpected requests.'
    }
  },
  {
    id: 'qr-code-scams',
    icon: <QrCode size={24} color="#0891B2" />,
    title: 'QR Code Scams (Quishing)',
    shortDesc: 'How malicious QR codes redirect mobile devices to deceptive payment pages.',
    fullContent: {
      overview: 'Attackers overlay physical QR code stickers on parking meters, public posters, or send them in emails to bypass desktop security filters.',
      redFlags: [
        'Physical QR code stickers placed over original printed signage.',
        'QR codes received in unexpected email attachments without prior context.',
        'Redirecting to unverified payment gateways or credential entry screens.'
      ],
      takeaway: 'Always use a camera app that previews the destination URL before opening the link.'
    }
  },
  {
    id: 'sms-phishing',
    icon: <MessageSquare size={24} color="#0891B2" />,
    title: 'SMS Phishing (Smishing)',
    shortDesc: 'Identifying fraudulent text messages posing as parcel delivery or bank alerts.',
    fullContent: {
      overview: 'Smishing utilizes short messages claiming package delivery delays, bank account lockouts, or tax refunds to lure mobile users.',
      redFlags: [
        'Messages sent from standard 10-digit mobile numbers or unknown international country codes.',
        'Contains shortened bit.ly or tinyurl links requiring urgent click.',
        'Spelling mistakes or awkward phrasing in official alerts.'
      ],
      takeaway: 'Never click link targets in unexpected text messages. Navigate directly to the provider’s official mobile app or site.'
    }
  },
  {
    id: 'fake-shopping-sites',
    icon: <ShoppingBag size={24} color="#0891B2" />,
    title: 'Fake Shopping Sites',
    shortDesc: 'Uncovering fraudulent e-commerce storefronts offering unrealistic discounts.',
    fullContent: {
      overview: 'Fake shopping sites lure buyers with 80-90% discounts on luxury products, taking payment details without ever shipping products.',
      redFlags: [
        'Unrealistic prices across luxury items.',
        'Absence of verifiable physical company address or customer support phone number.',
        'Only accepting non-refundable payment methods like wire transfers or crypto.'
      ],
      takeaway: 'Research merchant reviews on independent consumer trust portals before purchasing from unfamiliar stores.'
    }
  },
  {
    id: 'browser-security',
    icon: <Shield size={24} color="#0891B2" />,
    title: 'Browser Security',
    shortDesc: 'Best practices for configuring browser protections, extensions, and updates.',
    fullContent: {
      overview: 'Modern web browsers contain built-in Safe Browsing engines, sandboxing, and strict cookie controls that protect against zero-day web threats.',
      redFlags: [
        'Outdated browser versions missing critical security patches.',
        'Installing unverified browser extensions that request permissions to read all site data.',
        'Disabling pop-up blockers or security warnings on unverified sites.'
      ],
      takeaway: 'Keep your browser updated to the latest version and audit installed extensions quarterly.'
    }
  }
];

export default function CyberAcademyPage({ setActiveTab }) {
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <div className="wg-page-wrap">
      {/* Academy Hero */}
      <section className="wg-sub-hero">
        <div className="wrap">
          <div className="wg-sub-hero-inner">
            <div className="wg-badge">
              <BookOpen size={14} color="#0891B2" />
              <span>Cyber Awareness Learning Hub</span>
            </div>
            <h1 className="wg-sub-hero-title">Cyber Academy</h1>
            <p className="wg-sub-hero-desc">
              Learn how attackers use phishing, spoofing, social engineering, and fake websites to compromise users — and master the defensive skills to protect yourself.
            </p>
          </div>
        </div>
      </section>

      {/* Grid of 8 Academy Cards */}
      <section className="wg-section">
        <div className="wrap">
          <div className="wg-academy-grid">
            {ACADEMY_CARDS.map((card) => (
              <div key={card.id} className="wg-academy-card">
                <div className="academy-card-icon">{card.icon}</div>
                <h3 className="academy-card-title">{card.title}</h3>
                <p className="academy-card-desc">{card.shortDesc}</p>
                <div className="academy-card-footer">
                  <button
                    type="button"
                    className="wg-btn wg-btn-outline wg-btn-sm full-w"
                    onClick={() => setSelectedTopic(card)}
                  >
                    <span>Learn More</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Modal / Slide-over Drawer */}
      {selectedTopic && (
        <div className="wg-modal-backdrop" onClick={() => setSelectedTopic(null)}>
          <div className="wg-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="wg-modal-header">
              <div className="wg-modal-title-wrap">
                <div className="wg-modal-icon">{selectedTopic.icon}</div>
                <div>
                  <h3 className="wg-modal-title">{selectedTopic.title}</h3>
                  <span className="wg-modal-sub">Security Awareness Masterclass</span>
                </div>
              </div>
              <button
                type="button"
                className="wg-modal-close"
                onClick={() => setSelectedTopic(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="wg-modal-body">
              <div className="modal-section">
                <h4>Topic Overview</h4>
                <p>{selectedTopic.fullContent.overview}</p>
              </div>

              <div className="modal-section warning-box">
                <h4 className="warning-hdr">
                  <AlertTriangle size={16} color="#F59E0B" />
                  <span>Key Red Flags & Indicator Signs</span>
                </h4>
                <ul className="red-flags-list">
                  {selectedTopic.fullContent.redFlags.map((flag, idx) => (
                    <li key={idx}>⚠️ {flag}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-section success-box">
                <h4 className="success-hdr">
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>Key Defense Takeaway</span>
                </h4>
                <p className="takeaway-text">{selectedTopic.fullContent.takeaway}</p>
              </div>
            </div>

            <div className="wg-modal-footer">
              <button
                type="button"
                className="wg-btn wg-btn-secondary"
                onClick={() => setSelectedTopic(null)}
              >
                Close Topic
              </button>
              <button
                type="button"
                className="wg-btn wg-btn-primary"
                onClick={() => {
                  setSelectedTopic(null);
                  setActiveTab('analysis');
                }}
              >
                <span>Test a Suspicious URL</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
