import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import UrlScanner from './components/UrlScanner';
import ScanningProgress from './components/ScanningProgress';
import AnalysisResult from './components/AnalysisResult';
import CyberAcademyPage from './components/CyberAcademyPage';
import ThreatIntelligencePage from './components/ThreatIntelligencePage';
import ResourcesPage from './components/ResourcesPage';
import ExtensionGuide from './components/ExtensionGuide';
import SupportPage from './components/SupportPage';
import PrivacySecurityModal from './components/PrivacySecurityModal';
import Footer from './components/Footer';

import { analyzeUrl, checkBackendHealth } from './services/api';
import { getScanHistory, saveScanToHistory, clearScanHistory, resetDemoScans } from './utils/storage';
import { AlertTriangle, X } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab,          setActiveTab]          = useState('home');
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

  // Staggered timing for scanning animation
  const STAGE_DELAYS = [0, 220, 480, 750, 1050, 1350, 1650];

  useEffect(() => {
    setHistory(getScanHistory());

    checkBackendHealth().then(({ online, tiConfigured: ti }) => {
      setIsBackendOnline(online);
      setTiConfigured(!!ti);
    });

    try {
      const params = new URLSearchParams(window.location.search);
      const queryUrl = params.get('url');
      if (queryUrl) {
        handleStartAnalysis(decodeURIComponent(queryUrl));
      }
    } catch {
      // Ignore query param error
    }

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
    setActiveTab('analysis');

    const timers = STAGE_DELAYS.slice(1).map((delay, idx) =>
      setTimeout(() => setScanStage(idx + 1), delay)
    );

    try {
      const [apiResult] = await Promise.all([
        analyzeUrl(urlToScan),
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
    setActiveTab('analysis');
  };

  const handleToggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const handleScanAnother = () => {
    setCurrentResult(null);
    setScanError('');
    setActiveTab('analysis');
  };

  const handleSelectHistoryItem = (savedResult) => {
    setCurrentResult(savedResult);
    setScanError('');
    setActiveTab('analysis');
  };

  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendOnline={isBackendOnline}
        isDemoMode={isDemoMode}
      />

      <main className="main-viewport" id="main-content">
        {/* Global Error Banner */}
        {scanError && (
          <div className="wg-error-toast" role="alert">
            <div className="wg-error-toast-icon">
              <AlertTriangle size={18} />
            </div>
            <div className="wg-error-toast-content">
              <strong>Validation / Analysis Notice</strong>
              <p>{scanError}</p>
            </div>
            <button
              type="button"
              className="wg-error-toast-close"
              onClick={() => setScanError('')}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* HOME PAGE */}
        {activeTab === 'home' && (
          <HomePage
            onStartAnalysis={handleStartAnalysis}
            setActiveTab={setActiveTab}
            onRunDemo={handleRunDemo}
          />
        )}

        {/* THREAT ANALYSIS PAGE */}
        {activeTab === 'analysis' && (
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

        {/* CYBER ACADEMY PAGE */}
        {activeTab === 'academy' && (
          <CyberAcademyPage setActiveTab={setActiveTab} />
        )}

        {/* THREAT INTELLIGENCE PAGE */}
        {activeTab === 'intelligence' && (
          <ThreatIntelligencePage setActiveTab={setActiveTab} />
        )}

        {/* RESOURCES PAGE */}
        {activeTab === 'resources' && (
          <ResourcesPage setActiveTab={setActiveTab} />
        )}

        {/* CHROME SHIELD EXTENSION PAGE */}
        {activeTab === 'extension' && (
          <ExtensionGuide
            isBackendOnline={isBackendOnline}
            onScanUrl={handleStartAnalysis}
          />
        )}

        {/* SUPPORT PAGE */}
        {activeTab === 'support' && (
          <SupportPage setActiveTab={setActiveTab} />
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
