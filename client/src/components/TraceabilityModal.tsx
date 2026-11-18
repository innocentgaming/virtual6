import React from 'react';
import { X, CheckCircle2, Shield, FileText } from 'lucide-react';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const matrix = [
    {
      reqId: 'REQ-01',
      requirement: 'Severe Winter Smog & Urban Air Pollution Focus',
      feature: 'Radiation Inversion Detector & Diurnal Smog Modeler',
      implementation: 'server/src/services/aqiService.ts & AQIDashboard.tsx',
      verification: 'detectInversion() detects cold surface air (<16°C) + calm wind (<8km/h) + high humidity (>65%).'
    },
    {
      reqId: 'REQ-02',
      requirement: 'Personalized Low-Emission Daily Routines',
      feature: 'Dynamic Schedule Optimizer with Inhaled Dose Math',
      implementation: 'server/src/services/routineOptimizerService.ts & RoutinePlanner.tsx',
      verification: 'Dose formula Dose = sum(C_i * V_i * T_i) with EPA minute inhalation rates; Berkeley Earth cigarette equivalence.'
    },
    {
      reqId: 'REQ-03',
      requirement: 'Indoor Air Quality (IAQ) Hacks & Affordability',
      feature: 'Single-Compartment Mass-Balance IAQ Simulator & DIY Corsi-Rosenthal Blueprint',
      implementation: 'server/src/services/iaqSimulationService.ts & IAQSimulator.tsx',
      verification: 'dC/dt differential physics model calculating PM2.5 decay vs WHO 15 ug/m3 target; $35 DIY assembly instructions.'
    },
    {
      reqId: 'REQ-04',
      requirement: 'Direct Quantifiable Impact Explanations',
      feature: 'Real-time Inhaled Micrograms Avoided & CO2e Prevention Counters',
      implementation: 'RoutinePlanner.tsx & apiController.ts',
      verification: 'Computes exact percentage reduction (-83%), micrograms of PM2.5 avoided, and kg CO2e saved.'
    },
    {
      reqId: 'REQ-05',
      requirement: 'Persona Support (Families, Students, Professionals, Communities)',
      feature: 'Multi-Persona Profile Configuration & Budget Tiers',
      implementation: 'types/index.ts, routineOptimizerService.ts & RoutinePlanner.tsx',
      verification: 'Dedicated logic for families (pediatric KF94), students (dorms/zero-cost), professionals (staggered commute), community (idling monitoring).'
    },
    {
      reqId: 'REQ-06',
      requirement: 'Sustainable Clean Alternatives',
      feature: 'Heating, Cooking, Transit & Filtration Matrix',
      implementation: 'CommunityHub.tsx',
      verification: 'Actionable side-by-side comparison (Heat pump vs biomass, Induction vs gas, N95 vs cloth).'
    },
    {
      reqId: 'REQ-07',
      requirement: 'Community Defense & Crowdsourced Reporting',
      feature: 'Open Burning & Idling Alert Feed with Upvoting',
      implementation: 'server/src/services/communityService.ts & CommunityHub.tsx',
      verification: 'Sanitized report submissions, status verification badges, and localized alert feeds.'
    },
    {
      reqId: 'REQ-08',
      requirement: 'Security, Safe AI & Medical Triage Guardrails',
      feature: 'Prompt Injection Defense & Clinical Referral Gatekeeper',
      implementation: 'server/src/security/promptGuard.ts & validator.ts',
      verification: 'Rejects jailbreak attempts; immediately redirects acute shortness of breath to 911/112 emergency services.'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="traceability-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close Traceability Matrix"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 id="traceability-title" className="text-lg font-bold text-white">
              Problem-to-Feature Traceability Matrix
            </h3>
            <p className="text-xs text-slate-400">100% Problem Statement Alignment & Verification Mapping</p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 space-y-3">
          {matrix.map((row) => (
            <div key={row.reqId} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {row.reqId}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{row.implementation}</span>
              </div>
              <h4 className="font-bold text-white text-sm mb-1">{row.requirement}</h4>
              <p className="text-slate-300 mb-1">
                <strong className="text-emerald-300">Feature:</strong> {row.feature}
              </p>
              <p className="text-slate-400">
                <strong className="text-slate-300">Verification Logic:</strong> {row.verification}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
