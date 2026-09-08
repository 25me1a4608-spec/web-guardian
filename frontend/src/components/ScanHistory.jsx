import React, { useState, useMemo } from 'react';
import {
  History,
  Trash2,
  Search,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Database,
  ArrowRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { truncateDomain } from '../utils/storage';

export default function ScanHistory({
  history = [],
  onScanAgain,
  onClearHistory,
  onSelectHistoryItem,
  setActiveTab,
  onLoadDemoData,
  onResetDemo
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [expandedUrls, setExpandedUrls] = useState({});

  const toggleUrlExpand = (id, e) => {
    e.stopPropagation();
    setExpandedUrls(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter & Sort Logic
  const filteredHistory = useMemo(() => {
    let result = [...history];

    // Search query against URL and domain
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const url = (item.url || '').toLowerCase();
        return url.includes(q);
      });
    }

    // Risk level filter
    if (riskFilter !== 'ALL') {
      result = result.filter(item => {
        const level = (item.riskLevel || '').toUpperCase();
        if (riskFilter === 'LOW') return level.includes('LOW');
        if (riskFilter === 'SUSPICIOUS') return level.includes('SUSP');
        if (riskFilter === 'HIGH') return level.includes('HIGH');
        return true;
      });
    }

    // Sorting
    if (sortOrder === 'NEWEST') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortOrder === 'OLDEST') {
      result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else if (sortOrder === 'HIGHEST_RISK') {
      result.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return result;
  }, [history, searchQuery, riskFilter, sortOrder]);

  const hasHistory = history && history.length > 0;

  return (
    <div className="history-container">

      {/* ── Header Card ─────────────────────────────────────────────── */}
      <div className="history-header-card">
        <div className="history-header-left">
          <div className="history-badge">
            <History size={14} />
            <span>Persistent Audit Log</span>
          </div>
          <h2 className="history-title">URL Scan History</h2>
          <p className="history-subtitle">
            Search, filter, and inspect previously analyzed links and security findings.
          </p>
        </div>

        <div className="history-header-right">
          <span className="history-source-pill">Web App Scans</span>

          {hasHistory && (
            <button
              type="button"
              className="clear-history-trigger-btn"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Clear Confirmation Modal Dialog (Requirement 7) ─────────── */}
      {showClearConfirm && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-icon-wrap red">
              <AlertTriangle size={24} />
            </div>
            <h3 className="modal-title">Clear Scan History?</h3>
            <p className="modal-msg">
              Are you sure you want to clear your scan history? All locally stored URL analysis records and statistics will be reset.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
              >
                Clear History
              </button>
              {/* Reset Demo Scans (Requirement 6) */}
              {history.some(i => i.isDemo || i.id?.startsWith('demo-')) && onResetDemo && (
                <button
                  type="button"
                  className="btn-history-action reset-demo"
                  onClick={onResetDemo}
                  title="Remove demo test scans and preserve real user scans"
                >
                  <RotateCcw size={14} />
                  <span>Reset Demo Scans</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Filters & Search Controls (Requirements 8 & 9) ──────────── */}
      {hasHistory && (
        <div className="history-controls-card">
          {/* Search Bar */}
          <div className="search-bar-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search scanned URLs or domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-sort-row">
            {/* Risk Tier Filter Pills */}
            <div className="risk-filter-group">
              <span className="filter-label">Filter:</span>
              <button
                type="button"
                className={`filter-chip ${riskFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setRiskFilter('ALL')}
              >
                All ({history.length})
              </button>
              <button
                type="button"
                className={`filter-chip green ${riskFilter === 'LOW' ? 'active' : ''}`}
                onClick={() => setRiskFilter('LOW')}
              >
                Low Risk
              </button>
              <button
                type="button"
                className={`filter-chip amber ${riskFilter === 'SUSPICIOUS' ? 'active' : ''}`}
                onClick={() => setRiskFilter('SUSPICIOUS')}
              >
                Suspicious
              </button>
              <button
                type="button"
                className={`filter-chip red ${riskFilter === 'HIGH' ? 'active' : ''}`}
                onClick={() => setRiskFilter('HIGH')}
              >
                High Risk
              </button>
            </div>

            {/* Sorting Select */}
            <div className="sort-group">
              <span className="filter-label">Sort:</span>
              <select
                className="sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="HIGHEST_RISK">Highest Risk</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── History Items List ──────────────────────────────────────── */}
      {!hasHistory ? (
        <div className="empty-history-card">
          <div className="empty-icon-shield">
            <History size={42} />
          </div>
          <h3>No scans yet.</h3>
          <p>Analyze a URL to start building your security history and telemetry.</p>
          <div className="empty-actions-row">
            <button
              type="button"
              className="btn-primary-compact"
              onClick={() => setActiveTab('scanner')}
            >
              Analyze URL
            </button>
            {onLoadDemoData && (
              <button
                type="button"
                className="btn-demo-link"
                onClick={onLoadDemoData}
              >
                <Database size={14} />
                <span>Load Demo Data (Hackathon Demo)</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-filter-card">
          <Search size={32} className="empty-filter-icon" />
          <h4>No matching scans found</h4>
          <p>No recorded scans match your search query or filter selection.</p>
          <button
            type="button"
            className="btn-reset-filters"
            onClick={() => {
              setSearchQuery('');
              setRiskFilter('ALL');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="history-cards-list">
          {filteredHistory.map((item) => {
            const isHigh = item.riskLevel?.includes('HIGH');
            const isSusp = item.riskLevel?.includes('SUSP');
            const domain = truncateDomain(item.url);
            const isExpanded = !!expandedUrls[item.id];
            const indicators = item.indicators || [];

            return (
              <div
                key={item.id}
                className="history-item-card"
                onClick={() => {
                  if (item.fullResult) onSelectHistoryItem(item.fullResult);
                }}
              >
                <div className="item-card-main">
                  <div className="item-meta-row">
                    <span className={`risk-tag-badge ${isHigh ? 'red' : isSusp ? 'amber' : 'green'}`}>
                      {item.riskLevel}
                    </span>
                    {(item.isDemo || item.id?.startsWith('demo-')) && (
                      <span className="demo-pill-badge">Demo</span>
                    )}
                    <span className="score-chip">
                      Score: <strong>{item.score}</strong>/100
                    </span>
                    <span className="time-chip">
                      <Clock size={12} />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="url-display-group">
                    <div className="item-domain-title">{domain}</div>
                    <div className={`item-full-url ${isExpanded ? 'expanded' : ''}`} title={item.url}>
                      {item.url}
                    </div>
                    {item.url && item.url.length > 45 && (
                      <button
                        type="button"
                        className="url-expand-toggle-btn"
                        onClick={(e) => toggleUrlExpand(item.id, e)}
                      >
                        {isExpanded ? (
                          <><span>Collapse URL</span> <ChevronUp size={12} /></>
                        ) : (
                          <><span>Show full URL</span> <ChevronDown size={12} /></>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="item-summary-row">
                    <div className="indicators-count-pill">
                      <Layers size={13} />
                      <span>
                        {indicators.length} indicator{indicators.length === 1 ? '' : 's'}
                        {indicators[0] ? ` • ${indicators[0].name || indicators[0].id}` : ''}
                      </span>
                    </div>
                    {item.explanation && (
                      <div className="explanation-snippet" title={item.explanation}>
                        {item.explanation.length > 80 ? item.explanation.substring(0, 80) + '...' : item.explanation}
                      </div>
                    )}
                  </div>
                </div>

                <div className="item-card-actions">
                  <button
                    type="button"
                    className="btn-view-report"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.fullResult) onSelectHistoryItem(item.fullResult);
                    }}
                  >
                    <span>Inspect</span>
                    <ArrowRight size={14} />
                  </button>
                  {onScanAgain && (
                    <button
                      type="button"
                      className="btn-rescan-item"
                      title="Re-analyze URL now"
                      onClick={(e) => {
                        e.stopPropagation();
                        onScanAgain(item.url);
                      }}
                    >
                      Re-scan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note about extension storage separation (Requirement 14) */}
      <div className="extension-storage-note">
        <p>
          <strong>Web App Scans</strong> are stored in this browser's local storage. Scans conducted inside the <strong>WebGuard AI Chrome Extension</strong> are saved securely inside the extension's local sandbox (accessible via the extension toolbar popup).
        </p>
      </div>

    </div>
  );
}
