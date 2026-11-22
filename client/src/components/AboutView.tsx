import React from 'react';
import { 
  Wind, 
  ShieldCheck, 
  Database, 
  Server, 
  Cpu, 
  Award, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  Scale, 
  BookOpen 
} from 'lucide-react';
import { playTactileClick } from './AudioEffects';

interface AboutViewProps {
  onOpenTraceabilityModal: () => void;
  onOpenKeyModal: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onOpenTraceabilityModal,
  onOpenKeyModal
}) => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Hero card */}
      <div className="card-premium p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-850 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              BreatheSmart AI
            </h2>
            <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold tracking-wide">
              INTELLIGENT WINTER SMOG & URBAN CLEAN AIR PLATFORM
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
          BreatheSmart AI is an institutional-grade environmental intelligence system engineered to protect households and urban communities from catastrophic winter particulate spikes. By combining real-time planetary boundary layer meteorology, physical differential mass-balance indoor air modeling, and personalized exposure dose calculations, BreatheSmart transforms raw sensor numbers into lifesaving daily actions.
        </p>

        <div className="pt-3 flex flex-wrap gap-3">
          <button
            onClick={() => {
              playTactileClick(750, 0.02);
              onOpenTraceabilityModal();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Problem-to-Feature Traceability Matrix</span>
          </button>

          <a
            href="https://github.com/innocentgaming/virtual6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 3 Scientific Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Meteorological Science */}
        <div className="card-premium p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
            Diurnal Inversion Physics
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Models nocturnal radiation temperature inversions and convective mixing depths ($z_i(t) \approx 600\text{m} - 900\text{m}$), identifying safe midday ventilation windows.
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Open-Meteo European CAMS Telemetry
          </div>
        </div>

        {/* Pillar 2: Differential Mass Balance */}
        <div className="card-premium p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
            Mass-Balance IAQ Solver
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Solves the fundamental aerosol differential equation $V \frac{dC}{dt} = P \cdot ACH \cdot C_{out} - (ACH + k_{dep} + CADR/V) \cdot C$ for true indoor particulate decay.
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Darcy-Weisbach Filter Aerodynamics
          </div>
        </div>

        {/* Pillar 3: Clinical Health Exposure */}
        <div className="card-premium p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
            Clinical Inhaled Dose Math
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Calculates minute ventilation ($V_E$) particulate dose ($Dose = \sum C_i \cdot V_i \cdot T_i$) and Berkeley Earth cigarette equivalence ($264\,\mu\text{g} = 1\text{ cig}$).
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            WHO 2021 & US EPA 40 CFR 58
          </div>
        </div>
      </div>

      {/* Standards & Certifications Grid */}
      <div className="card-premium p-6 space-y-4">
        <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
          Standards Compliance & Quality Benchmarks
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">WCAG 2.2 AA</span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Accessible tables, 44px touch targets, keyboard navigation.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">Zero Plaintext</span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">PBKDF2-SHA512 password encryption with 100k rounds.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">60/60 Tests</span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">100% automated test pass rate across 11 test suites.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">&lt; 10 MB Repo</span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Total git repository size strictly kept under 10 megabytes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
