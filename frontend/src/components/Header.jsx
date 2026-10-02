import React, { useState } from 'react';
import { Shield, Activity, Menu, X, ChevronRight, Puzzle } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isBackendOnline, isDemoMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'analysis', label: 'Threat Analysis' },
    { id: 'academy', label: 'Cyber Academy' },
    { id: 'intelligence', label: 'Threat Intelligence' },
    { id: 'resources', label: 'Resources' },
    { id: 'extension', label: 'Chrome Shield' },
    { id: 'support', label: 'Support' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="wg-header">
      <div className="wrap">
        <div className="wg-header-inner">
          {/* Logo */}
          <div className="wg-brand" onClick={() => handleNavClick('home')}>
            <div className="wg-logo-icon">
              <Shield size={20} color="#FFFFFF" strokeWidth={2.2} />
            </div>
            <div className="wg-brand-text">
              <div className="wg-brand-title">
                CyberAware <span className="wg-brand-subtitle-badge">SECURITY</span>
              </div>
              <div className="wg-brand-tagline">Protecting Users Through Cybersecurity Awareness</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="wg-nav-desktop" aria-label="Main Navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`wg-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions Right */}
          <div className="wg-header-actions">
            <div
              className={`wg-status-badge ${isBackendOnline ? 'online' : 'offline'}`}
              title={isBackendOnline ? 'AI ML Detection Engine Online' : 'Local Detection Engine Active'}
            >
              <span className="dot" />
              <span>{isBackendOnline ? 'Engine Online' : 'Engine Ready'}</span>
            </div>

            {isDemoMode && (
              <span className="wg-demo-pill">DEMO MODE</span>
            )}

            <button
              type="button"
              className="wg-btn wg-btn-primary wg-btn-sm"
              onClick={() => handleNavClick('analysis')}
            >
              <span>Analyze URL</span>
              <ChevronRight size={14} />
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="wg-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="wg-mobile-menu">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`wg-mobile-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}
            <div className="wg-mobile-action-wrap">
              <button
                type="button"
                className="wg-btn wg-btn-primary full-w"
                onClick={() => handleNavClick('analysis')}
              >
                Analyze URL Now
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
