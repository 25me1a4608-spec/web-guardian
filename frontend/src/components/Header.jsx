import React from 'react';
import { ShieldAlert, Activity, ShieldCheck, Cpu, History, LayoutDashboard, HelpCircle, BookOpen, Puzzle } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isBackendOnline, isDemoMode }) {
  return (
    <header className="cyber-header">
      <div className="header-inner">
        {/* Brand Logo & Motto */}
        <div className="brand-wrapper" onClick={() => setActiveTab('scanner')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box">
            <ShieldAlert size={22} className="brand-icon" />
            <div className="brand-icon-pulse" />
          </div>
          <div className="brand-text">
            <span className="brand-title">
              WEBGUARD <span className="accent">AI</span>
            </span>
            <span className="brand-tagline">
              "Don't just detect the threat. Understand it."
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            <ShieldCheck size={16} />
            <span>Analyze</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            <span>History</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'how-it-works' ? 'active' : ''}`}
            onClick={() => setActiveTab('how-it-works')}
          >
            <Cpu size={16} />
            <span>About</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'awareness' ? 'active' : ''}`}
            onClick={() => setActiveTab('awareness')}
          >
            <BookOpen size={16} />
            <span>Awareness</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'extension' ? 'active' : ''}`}
            onClick={() => setActiveTab('extension')}
          >
            <Puzzle size={16} />
            <span>Browser Protection</span>
          </button>
        </nav>

        {/* Hackathon Badge & Live Engine Status (Requirement 15) */}
        <div className="header-status-group">
          <div className="hackathon-badge-pill" title="WebGuard AI MVP — Built for responsible security awareness">
            <span className="badge-highlight">Cybersecurity Analysis MVP</span>
            <span className="badge-subtext">Built for responsible security awareness</span>
          </div>

          {isDemoMode && (
            <div className="header-demo-tag">
              <span className="demo-dot" />
              <span>Demo Mode</span>
            </div>
          )}

          <div className={`status-badge ${isBackendOnline ? 'online' : 'offline'}`}>
            <span className="status-dot" />
            <span>{isBackendOnline ? 'Backend API Active' : 'Backend Unavailable'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
