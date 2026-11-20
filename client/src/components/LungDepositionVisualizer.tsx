import React, { useState } from 'react';
import { Activity, ShieldAlert, Heart, Wind, AlertCircle } from 'lucide-react';
import { playTactileClick } from './AudioEffects';

interface LungDepositionVisualizerProps {
  pm25: number;
}

export const LungDepositionVisualizer: React.FC<LungDepositionVisualizerProps> = ({ pm25 }) => {
  const [activity, setActivity] = useState<'sleep' | 'desk' | 'walk' | 'run'>('walk');

  const activities = {
    sleep: { label: 'Sleeping', ve: 0.45, breathRate: '12 bpm', desc: 'Basal metabolic rate; minimum minute ventilation.' },
    desk: { label: 'Desk Work', ve: 0.75, breathRate: '16 bpm', desc: 'Standard office or study environment.' },
    walk: { label: 'Walking', ve: 1.25, breathRate: '22 bpm', desc: 'Commuting on foot or light household movement.' },
    run: { label: 'Outdoor Running', ve: 3.10, breathRate: '40 bpm', desc: 'Deep mouth breathing bypasses natural nasal filtration.' }
  };

  const selectedAct = activities[activity];
  // Dose in micrograms inhaled per hour: PM2.5 (ug/m3) * VE (m3/h)
  const hourlyDose = Math.round(pm25 * selectedAct.ve);
  // Alveolar deposition fraction (roughly 38% for PM2.5 according to ICRP deposition model)
  const alveolarDose = Math.round(hourlyDose * 0.38);
  // Cigarette equivalent (Berkeley Earth: 264 ug PM2.5 = 1 cigarette)
  const cigsEquiv = (hourlyDose / 264).toFixed(2);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              ICRP Human Respiratory Particle Deposition Model
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calculates internal particulate intake across human respiratory tracts based on physical exertion.
          </p>
        </div>

        {/* Activity Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {(['sleep', 'desk', 'walk', 'run'] as const).map((act) => {
            const isActive = activity === act;
            return (
              <button
                key={act}
                onClick={() => {
                  playTactileClick(800, 0.02);
                  setActivity(act);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activities[act].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deposition Calculations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Minute Ventilation (V_E)
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {selectedAct.ve} <span className="text-sm font-normal text-slate-400">m³/hour</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {selectedAct.breathRate} • {selectedAct.desc}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Hourly PM2.5 Inhaled Mass
          </div>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            {hourlyDose} <span className="text-sm font-normal text-slate-400">µg/hour</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            ≈ {cigsEquiv} cigarettes/hr at current ambient level
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Deep Alveolar Penetration
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">
            {alveolarDose} <span className="text-sm font-normal text-slate-400">µg deposited</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Trapped in deep lung tissue; enters capillary bloodstream
          </p>
        </div>
      </div>

      {/* Three Respiratory Zones Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
            Zone 1: Upper Nasal Cavity (&gt;10 µm)
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Coarse road dust and pollen. Filtered by nasal hairs and mucosal lining; expelled via coughing or blowing nose.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
            Zone 2: Tracheobronchial (2.5 – 10 µm)
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Smog dust and vehicular soot. Settles in airway branches, inflaming bronchial walls and triggering acute asthma flare-ups.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
            Zone 3: Pulmonary Alveoli (&lt;2.5 µm)
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Combustion nanoparticles. Bypasses all biological barriers, lodging permanently in gas-exchange sacs and crossing into bloodstream.
          </p>
        </div>
      </div>
    </div>
  );
};
