import React, { useState } from 'react';
import { Layers, ShieldCheck, DollarSign, Wind, Volume2, Cpu, Wrench, CheckCircle } from 'lucide-react';
import { playTactileClick } from './AudioEffects';

export const CorsiRosenthalBlueprint: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<number>(0);
  const [fanSpeed, setFanSpeed] = useState<'low' | 'med' | 'high'>('med');

  const components = [
    {
      id: 0,
      title: '1. 20" High-Velocity Box Fan',
      cost: '$18 – $22',
      specs: '120V / 52 Watts, 3-speed selector',
      cadrContribution: '220 - 310 CFM Clean Air Delivery Rate',
      details: 'Positioned on top facing upward. Pulls air through all four side filter faces simultaneously, lowering static pressure resistance across the pleats.',
      tip: 'Do not use oscillating or pedestal fans; a flat square box fan provides the necessary structural chassis.'
    },
    {
      id: 1,
      title: '2. Four MERV 13 Pleated Filters (20" x 20" x 1" or 2")',
      cost: '$14 – $18 total ($4/filter in bulk)',
      specs: 'Efficiency: 85% at 1.0-3.0 µm, 50% at 0.3-1.0 µm',
      cadrContribution: '4× Filter Surface Area (Reduces Air Resistance)',
      details: 'Arranged into a 4-sided cube pointing airflow direction inward toward the center cavity. The 4-filter geometry reduces face velocity, allowing fine particles to be trapped without straining the fan motor.',
      tip: 'Ensure arrows printed on filter frames point INWARD toward the center of the box.'
    },
    {
      id: 2,
      title: '3. Cardboard Corner Shroud Ring',
      cost: '$0 (Repurposed Fan Shipping Box)',
      specs: '14" circular aperture cutout centered on fan face',
      cadrContribution: '+22% Airflow Velocity Boost',
      details: 'The corner areas of square box fans suffer from air vortex reverse recirculation. A cardboard shroud covers the dead corners and forces 100% of the air forward, dramatically boosting CADR while lowering acoustic motor hum.',
      tip: 'Trace a 14" circular plate or mixing bowl on the fan box cardboard and tape tightly to the front grille.'
    },
    {
      id: 3,
      title: '4. Airtight Duct-Tape Seal Framing',
      cost: '$3 (Standard Heavy-Duty Duct Tape)',
      specs: 'Bottom cardboard floor plate + sealed corner seams',
      cadrContribution: 'Zero Particulate Bypass Guarantee',
      details: 'Tapes the 4 filters to the bottom square cardboard plate and to each other along vertical seams. Any air gap larger than 1mm allows fine PM2.5 to bypass the media.',
      tip: 'Press tape firmly along all seams with a credit card edge to ensure an airtight seal.'
    }
  ];

  const current = components[activeComponent];

  const speedData = {
    low: { noise: '41 dB (Whisper Quiet / Bedroom Safe)', cadr: '185 CFM', power: '38 W' },
    med: { noise: '49 dB (White Noise / Living Room)', cadr: '245 CFM', power: '48 W' },
    high: { noise: '58 dB (Deep Clean / Heavy Cooking)', cadr: '315 CFM', power: '58 W' }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Corsi-Rosenthal Box — Exploded CAD Blueprint & Build Specs
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Open-source DIY air cleaner proven by UC Davis & EPA to match $500 commercial HEPA units for $38 total.
          </p>
        </div>

        {/* CADR vs Cost Comparison Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold self-start sm:self-auto">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Total Build Cost: $35 – $40</span>
        </div>
      </div>

      {/* Component Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {components.map((comp, idx) => {
          const isActive = activeComponent === idx;
          return (
            <button
              key={comp.id}
              onClick={() => {
                playTactileClick(850 + idx * 50, 0.02);
                setActiveComponent(idx);
              }}
              className={`p-3 rounded-xl border text-left transition ${
                isActive
                  ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg text-white'
                  : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400">
                Layer 0{idx + 1}
              </span>
              <span className="text-xs font-bold font-mono mt-1 block truncate">
                {comp.title.split('. ')[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Blueprint Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Schematic Specifications */}
        <div className="lg:col-span-7 space-y-4 bg-slate-950/70 p-5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-mono font-bold text-emerald-300">
              {current.title}
            </h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-500/30">
              Cost: {current.cost}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Engineering Specs:</span>
              <span className="text-white font-semibold">{current.specs}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">CADR Contribution:</span>
              <span className="text-teal-300 font-semibold">{current.cadrContribution}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {current.details}
          </p>

          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Pro Builder Tip:</strong> {current.tip}</span>
          </div>
        </div>

        {/* Right: Real-time Performance & Acoustic Profiler */}
        <div className="lg:col-span-5 space-y-4 bg-slate-950/70 p-5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Fan Velocity Setting
            </span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
              {(['low', 'med', 'high'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    playTactileClick(700, 0.02);
                    setFanSpeed(spd);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-mono uppercase transition ${
                    fanSpeed === spd
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Acoustic Output</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {speedData[fanSpeed].noise}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Wind className="w-4 h-4 text-emerald-400" />
                <span>Effective Clean Air (CADR)</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {speedData[fanSpeed].cadr}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Power Draw</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {speedData[fanSpeed].power}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 font-mono text-center">
            Calculated for a standard 200 sq ft bedroom: <strong>5.2 Air Changes per Hour (ACH)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
