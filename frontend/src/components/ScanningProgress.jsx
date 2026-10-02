import React from 'react';
import { Shield, Loader2, CheckCircle, Search, Cpu, Globe, Server, AlertCircle } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Validating URL',              desc: 'Checking protocol, format, and RFC standards', icon: Globe },
  { id: 2, label: 'Extracting URL features',     desc: 'Parsing lexical, structural, and hostname signals', icon: Search },
  { id: 3, label: 'Checking security indicators',desc: 'Analyzing brand lookalikes, keywords, and path structures', icon: Shield },
  { id: 4, label: 'Threat intelligence',         desc: 'Querying reputation providers', hasTiNote: true, icon: Server },
  { id: 5, label: 'Feature-based risk prediction',desc: 'Evaluating structural signals with risk predictor', icon: Cpu },
  { id: 6, label: 'Generating explainable verdict',desc: 'Building transparent risk breakdown and recommendations', icon: AlertCircle },
];

export default function ScanningProgress({
  stage,
  currentStageIndex: csi,
  targetUrl = '',
  tiConfigured = false,
}) {
  const currentStageIndex = stage ?? csi ?? 0;
  const progressPercent = Math.min(100, Math.round((currentStageIndex / STAGES.length) * 100));

  return (
    <div className="wg-page-wrap">
      <div className="wrap" style={{ display: 'flex', justifyContent: 'center', padding: '60px 24px' }}>
        <div className="wg-scanner-console">
          
          <div className="wg-scanner-header">
            <div className="scanner-status">
              <Loader2 className="spin-icon" size={24} color="#0891B2" />
              <h2>Active Threat Analysis</h2>
            </div>
            <div className="scanner-target">
              <span className="target-label">TARGET:</span>
              <span className="target-url">{targetUrl}</span>
            </div>
          </div>

          <div className="wg-scanner-progress-bar-wrap">
            <div className="wg-scanner-progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>

          <div className="wg-scanner-body">
            <div className="wg-stage-list">
              {STAGES.map((s, idx) => {
                const done    = idx < currentStageIndex;
                const active  = idx === currentStageIndex;
                const pending = idx > currentStageIndex;
                const stateKey = done ? 'done' : active ? 'active' : 'pending';
                const Icon = s.icon;

                return (
                  <div key={s.id} className={`wg-stage-item ${stateKey}`}>
                    <div className="stage-icon-wrap">
                      {done ? <CheckCircle size={18} color="#10B981" /> : 
                       active ? <Loader2 size={18} className="spin-icon" color="#38BDF8" /> : 
                       <Icon size={18} color="#475569" />}
                    </div>
                    <div className="stage-content">
                      <h4 className="stage-label">
                        {s.hasTiNote && active && !tiConfigured
                          ? 'Threat intelligence (Local analysis)'
                          : s.label}
                      </h4>
                      <p className="stage-desc">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="wg-scanner-footer">
            <p>Heuristic Engine v2.4.1 &middot; Establishing secure telemetry link...</p>
          </div>

        </div>
      </div>
    </div>
  );
}
