import React from 'react';
import { Shield, CheckCircle2, Loader2, Search, Cpu, Globe, Key, AlertTriangle, Database, WifiOff } from 'lucide-react';

const STAGES = [
  {
    id   : 1,
    label: 'Validating URL',
    icon : Globe,
    desc : 'Checking protocol, format, and RFC standards'
  },
  {
    id   : 2,
    label: 'Extracting URL features',
    icon : Search,
    desc : 'Parsing lexical, structural, and hostname signals'
  },
  {
    id   : 3,
    label: 'Checking security indicators',
    icon : AlertTriangle,
    desc : 'Analyzing brand lookalikes, keywords, and path structures'
  },
  {
    id   : 4,
    label: 'Threat intelligence',
    icon : Database,
    desc : 'Querying reputation providers (if configured)',
    hasTiNote: true
  },
  {
    id   : 5,
    label: 'Feature-based risk prediction',
    icon : Cpu,
    desc : 'Evaluating structural signals with ML-ready predictor'
  },
  {
    id   : 6,
    label: 'Generating explainable verdict',
    icon : Key,
    desc : 'Building transparent risk breakdown and recommendations'
  }
];

export default function ScanningProgress({
  stage: currentStageIndex = 0,
  targetUrl = '',
  tiConfigured = false
}) {
  return (
    <div className="scanning-overlay-card">
      <div className="scanning-modal-body">
        {/* Header with spinning shield */}
        <div className="scanning-header-center">
          <div className="shield-pulsing-wrapper">
            <div className="shield-ping-circle" />
            <div className="shield-inner-icon">
              <Shield size={32} className="shield-cyan" />
            </div>
          </div>
          <h3 className="scanning-title">Security Analysis in Progress</h3>
          <p className="scanning-target-url" title={targetUrl}>{targetUrl}</p>
        </div>

        {/* Stage list */}
        <div className="stages-progress-list">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent   = idx === currentStageIndex;
            const isPending   = idx > currentStageIndex;

            // For stage 4 (Threat Intelligence), show a contextual note
            const isTiStage = stage.hasTiNote;

            return (
              <div
                key={stage.id}
                className={`stage-row ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="stage-icon-status">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="icon-completed" />
                  ) : isCurrent ? (
                    <Loader2 size={18} className="icon-current spin" />
                  ) : (
                    <div className="status-dot-pending" />
                  )}
                </div>

                <div className="stage-meta">
                  <span className="stage-name">{stage.label}</span>
                  <span className="stage-desc">
                    {isTiStage && isCurrent
                      ? tiConfigured
                        ? 'Querying external reputation provider...'
                        : 'Threat intelligence service unavailable — continuing with local analysis.'
                      : stage.desc}
                  </span>
                  {isTiStage && !tiConfigured && isCurrent && (
                    <span className="ti-stage-note">
                      <WifiOff size={11} />
                      &nbsp;No API key configured — local analysis only
                    </span>
                  )}
                </div>

                {isCurrent  && <span className="stage-tag-active">ANALYZING</span>}
                {isCompleted && <span className="stage-tag-done">VERIFIED</span>}
              </div>
            );
          })}
        </div>

        <div className="scanning-footer-note">
          <span className="scan-live-pulse" />
          <span>Non-invasive heuristic inspection • URL is never executed or visited</span>
        </div>
      </div>
    </div>
  );
}
