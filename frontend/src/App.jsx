import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UrlScanner from './components/UrlScanner';
import ScanningProgress from './components/ScanningProgress';
import AnalysisResult from './components/AnalysisResult';
import Dashboard from './components/Dashboard';
import ScanHistory from './components/ScanHistory';
import HowItWorks from './components/HowItWorks';
import SecurityAwareness from './components/SecurityAwareness';
import ExtensionGuide from './components/ExtensionGuide';
import PrivacySecurityModal from './components/PrivacySecurityModal';
import Footer from './components/Footer';

import { analyzeUrl, checkBackendHealth } from './services/api';
import { getScanHistory, saveScanToHistory, clearScanHistory, loadDemoScanData, resetDemoScans } from './utils/storage';
import { AlertTriangle, X } from 'lucide-react';
import './App.css';

// 7 stages matching the Step 11 pipeline spec (Requirement 9)
const SCAN_STAGES = [
  'Validating URL',
  'Extracting URL features',
  'Checking security indicators',
  'Threat intelligence',
  'Risk prediction',
  'Calculating final score',
  'Generating explanation'
];

// Staggered timing (ms from start) — snappy for live hackathon presentation
const STAGE_DELAYS = [0, 220, 480, 750, 1050, 1350, 1650];

export default function App() {
  const [activeTab,          setActiveTab]          = useState('scanner');
  const [isScanning,         setIsScanning]         = useState(false);
  const [scanStage,          setScanStage]          = useState(0);
  const [targetUrl,          setTargetUrl]          = useState('');
  const [currentResult,      setCurrentResult]      = useState(null);
  const [history,            setHistory]            = useState([]);
  const [isBackendOnline,    setIsBackendOnline]    = useState(false);
  const [tiConfigured,       setTiConfigured]       = useState(false);
  const [isPrivacyOpen,      setIsPrivacyOpen]      = useState(false);
  const [scanError,          setScanError]          = useState('');
  const [isDemoMode,         setIsDemoMode]         = useState(false);
  const [activeScenarioId,   setActiveScenarioId]   = useState(null);

  // Load history + check backend on mount + check query param
  useEffect(() => {
    setHistory(getScanHistory());

    checkBackendHealth().then(({ online, tiConfigured: ti }) => {
      setIsBackendOnline(online);
      setTiConfigured(!!ti);
    });

    // Check for ?url= query parameter (e.g. from Chrome extension "Full Report" click)
    try {
      const params = new URLSearchParams(window.location.search);
      const queryUrl = params.get('url');
      if (queryUrl) {
        handleStartAnalysis(decodeURIComponent(queryUrl));
      }
    } catch {
      // Ignore query param error
    }

    // Heartbeat every 15 s
    const interval = setInterval(() => {
      checkBackendHealth().then(({ online, tiConfigured: ti }) => {
        setIsBackendOnline(online);
        setTiConfigured(!!ti);
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleStartAnalysis = async (urlToScan, options = {}) => {
    const isThisDemo = !!(options.isDemo || isDemoMode);
    if (options.scenarioId) setActiveScenarioId(options.scenarioId);

    setTargetUrl(urlToScan);
    setIsScanning(true);
    setScanStage(0);
    setCurrentResult(null);
    setScanError('');
    setActiveTab('scanner');

    // Schedule stage transitions
    const timers = STAGE_DELAYS.slice(1).map((delay, idx) =>
      setTimeout(() => setScanStage(idx + 1), delay)
    );

    try {
      const [apiResult] = await Promise.all([
        analyzeUrl(urlToScan),
        // Snappy transition for live presentations (~1.8s)
        new Promise(resolve => setTimeout(resolve, 1800))
      ]);

      timers.forEach(clearTimeout);

      if (apiResult.success) {
        const enriched = {
          ...apiResult,
          isDemo: isThisDemo
        };
        setCurrentResult(enriched);
        const updated = saveScanToHistory(enriched, isThisDemo);
        setHistory(updated);
      } else {
        setScanError(apiResult.error || 'Failed to analyze URL.');
      }
    } catch (err) {
      timers.forEach(clearTimeout);
      console.error('Scan error:', err);
      setScanError('Analysis encountered an unexpected issue. Please check the URL and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRunDemo = (scenario) => {
    setIsDemoMode(true);
    setActiveScenarioId(scenario.id);
    handleStartAnalysis(scenario.url, { isDemo: true, scenarioId: scenario.id });
  };

  const handleResetDemo = () => {
    setIsDemoMode(false);
    setActiveScenarioId(null);
    if (currentResult?.isDemo) {
      setCurrentResult(null);
    }
    const cleaned = resetDemoScans();
    setHistory(cleaned);
    setScanError('');
    setActiveTab('scanner');
  };

  const handleToggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const handleScanAnother = () => {
    setCurrentResult(null);
    setScanError('');
    setActiveTab('scanner');
  };

  const handleSelectHistoryItem = (savedResult) => {
    setCurrentResult(savedResult);
    setScanError('');
    setActiveTab('scanner');
  };

  const handleClearHistory = () => {
    setHistory(clearScanHistory());
  };

  const handleLoadDemoData = () => {
    setHistory(loadDemoScanData());
  };

  return (
    <div className="app-layout">
      <div className="ambient-blob cyan"   aria-hidden="true" />
      <div className="ambient-blob purple" aria-hidden="true" />

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendOnline={isBackendOnline}
        isDemoMode={isDemoMode}
      />

      <main className="main-viewport">
        {/* Global User-Friendly Error Banner */}
        {scanError && (
          <div className="scan-error-toast" role="alert">
            <div className="toast-icon-wrap">
              <AlertTriangle size={18} />
            </div>
            <div className="toast-content">
              <strong>Validation / Analysis Notice</strong>
              <p>{scanError}</p>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setScanError('')}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {activeTab === 'scanner' && (
          <>
            {isScanning ? (
              <ScanningProgress
                currentStageIndex={scanStage}
                targetUrl={targetUrl}
                tiConfigured={tiConfigured}
              />
            ) : currentResult ? (
              <AnalysisResult
                result={currentResult}
                onScanAnother={handleScanAnother}
              />
            ) : (
              <UrlScanner
                onStartAnalysis={handleStartAnalysis}
                recentScans={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                setActiveTab={setActiveTab}
                isDemoMode={isDemoMode}
                onToggleDemoMode={handleToggleDemoMode}
                onRunDemo={handleRunDemo}
                onResetDemo={handleResetDemo}
                activeScenarioId={activeScenarioId}
                isScanning={isScanning}
              />
            )}
          </>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            history={history}
            onScanNewUrl={handleScanAnother}
            setActiveTab={setActiveTab}
            onSelectHistoryItem={handleSelectHistoryItem}
            onLoadDemoData={handleLoadDemoData}
            onResetDemo={handleResetDemo}
          />
        )}

        {activeTab === 'history' && (
          <ScanHistory
            history={history}
            onScanAgain={handleStartAnalysis}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
            setActiveTab={setActiveTab}
            onLoadDemoData={handleLoadDemoData}
            onResetDemo={handleResetDemo}
          />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorks setActiveTab={setActiveTab} />
        )}

        {activeTab === 'awareness' && (
          <SecurityAwareness setActiveTab={setActiveTab} />
        )}

        {activeTab === 'extension' && (
          <ExtensionGuide
            isBackendOnline={isBackendOnline}
            onScanUrl={handleStartAnalysis}
          />
        )}
      </main>

      <Footer
        setActiveTab={setActiveTab}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <PrivacySecurityModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
