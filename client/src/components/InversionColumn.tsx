import React, { useState } from 'react';
import { CloudFog, Sun, Moon, ArrowUpRight, ShieldAlert, Wind, Thermometer } from 'lucide-react';
import { playTactileClick } from './AudioEffects';

interface InversionColumnProps {
  currentAqi: number;
  isInversionLikely: boolean;
}

export const InversionColumn: React.FC<InversionColumnProps> = ({ currentAqi, isInversionLikely }) => {
  const [activePhase, setActivePhase] = useState<'morning' | 'midday' | 'night'>('morning');

  const phases = {
    morning: {
      time: '06:00 AM – 10:00 AM',
      title: 'Dense Ground-Layer Radiation Trapping',
      lidHeight: '90m - 140m AGL',
      surfaceTemp: '8°C',
      ceilingTemp: '16°C (Inverted)',
      ventilation: 'Zero Vertical Mixing (Stagnation)',
      pm25: '380 - 450 µg/m³',
      hazard: 'Extreme Risk for Morning Walkers & Commuters',
      icon: Moon,
      color: 'text-rose-400',
      lidColor: 'bg-rose-500/30 border-rose-500/50'
    },
    midday: {
      time: '12:00 PM – 02:30 PM',
      title: 'Solar Thermal Expansion Window',
      lidHeight: 'Ceiling Breaks (Mixing to 800m+)',
      surfaceTemp: '22°C (Warmed by Sun)',
      ceilingTemp: '18°C (Normal Gradient)',
      ventilation: 'High Convective Dispersion',
      pm25: '120 - 180 µg/m³ (Lowest of 24h)',
      hazard: 'Safe Window for Quick Errands & HEPA Flushing',
      icon: Sun,
      color: 'text-emerald-400',
      lidColor: 'bg-emerald-500/20 border-emerald-500/40'
    },
    night: {
      time: '08:00 PM – 04:00 AM',
      title: 'Radiative Surface Cooling & Resealing',
      lidHeight: 'Lid Reseals at 120m',
      surfaceTemp: '11°C',
      ceilingTemp: '15°C',
      ventilation: 'Particulates Pool in Urban Valleys',
      pm25: '290 - 360 µg/m³',
      hazard: 'Seal Windows; Run Purifiers in Bedrooms',
      icon: CloudFog,
      color: 'text-amber-400',
      lidColor: 'bg-amber-500/20 border-amber-500/40'
    }
  };

  const selected = phases[activePhase];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Atmospheric Inversion Column Cross-Section
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing the meteorological boundary layer that traps ground-level winter smog.
          </p>
        </div>

        {/* Phase Selectors */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 self-start sm:self-auto">
          {(['morning', 'midday', 'night'] as const).map((phase) => {
            const Icon = phases[phase].icon;
            const isActive = activePhase === phase;
            return (
              <button
                key={phase}
                onClick={() => {
                  playTactileClick(900, 0.03);
                  setActivePhase(phase);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{phase}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Atmospheric Column Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Atmospheric Altitude Slice (CSS Cross Section) */}
        <div className="lg:col-span-5 h-[280px] rounded-xl border border-white/10 bg-slate-950/80 p-3.5 flex flex-col justify-between relative overflow-hidden">
          {/* Upper Troposphere (Clean Zone) */}
          <div className="flex-1 rounded-lg bg-blue-950/20 border border-blue-500/20 p-2.5 flex flex-col justify-between relative">
            <div className="flex justify-between items-center text-[10px] font-mono text-blue-300">
              <span>500m AGL (Upper Troposphere)</span>
              <span className="text-emerald-400 font-bold">Clean Air Stream</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Ambient PM2.5: ≤ 25 µg/m³
            </div>
          </div>

          {/* Inversion Boundary Lid */}
          <div className={`my-2 py-2 px-3 rounded-lg border flex items-center justify-between text-xs font-mono font-bold transition-all duration-300 ${selected.lidColor}`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-amber-200">INVERSION CEILING LID: {selected.lidHeight}</span>
            </div>
            <span className="text-[10px] text-amber-300/80 font-normal">Warm Cap Layer</span>
          </div>

          {/* Surface Boundary Layer (Trapped Smog) */}
          <div className={`h-[110px] rounded-lg border p-3 flex flex-col justify-between relative transition-all duration-300 ${
            activePhase === 'midday'
              ? 'bg-emerald-950/30 border-emerald-500/30'
              : 'bg-gradient-to-t from-red-950/50 via-amber-950/40 to-slate-900 border-red-500/30'
          }`}>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
              <span className="font-bold">0m - 50m Ground Level (Human Breathing Zone)</span>
              <span className={selected.color}>PM2.5: {selected.pm25}</span>
            </div>
            <p className="text-[11px] text-slate-300/90 font-mono leading-relaxed">
              Vehicular diesel, biomass heating smoke, and industrial particulate matter trapped at breathing altitude.
            </p>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span>Ground Temp: {selected.surfaceTemp}</span>
              <span>•</span>
              <span>Ceiling Temp: {selected.ceilingTemp}</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Explanation & Action Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {selected.time}
            </span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${selected.lidColor} ${selected.color}`}>
              {selected.ventilation}
            </span>
          </div>

          <h4 className="text-lg font-bold text-white">
            {selected.title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            During winter nights, the ground rapidly loses heat through radiative cooling, chilling the thin air layer touching the surface. 
            Because cold air is denser than warm air, it cannot rise vertically. This creates a virtual "lid" at 100 meters altitude that acts like a pressure cooker, 
            concentrating daily vehicular exhaust and biomass heating smoke directly into household airways.
          </p>

          {/* Action Callout */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-start gap-3">
            <ArrowUpRight className={`w-5 h-5 shrink-0 mt-0.5 ${selected.color}`} />
            <div>
              <span className="text-xs font-bold text-slate-200 block font-mono">
                Prescribed Behavioral Protocol:
              </span>
              <span className="text-xs text-slate-300 mt-0.5 block leading-relaxed">
                {selected.hazard}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
