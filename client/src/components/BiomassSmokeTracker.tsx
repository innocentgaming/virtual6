import React, { useState } from 'react';
import { 
  Flame, 
  Wind, 
  Satellite, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Layers, 
  Compass,
  Sparkles
} from 'lucide-react';
import { playTactileClick } from './AudioEffects';

interface BiomassSmokeTrackerProps {
  city: string;
  ambientPM25: number;
}

export const BiomassSmokeTracker: React.FC<BiomassSmokeTrackerProps> = ({ city, ambientPM25 }) => {
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(14);
  const [windDirection, setWindDirection] = useState<'NW' | 'W' | 'SW' | 'N'>('NW');

  // Trajectory physics: Upwind farm fires are ~160km away
  const distanceKm = 160;
  const transitHours = Number((distanceKm / Math.max(1, windSpeedKmh)).toFixed(1));
  const activeFireCount = 1420;

  // Source apportionment breakdown
  const biomassShare = 38; // 38% from stubble & biomass burning
  const vehicleShare = 28; // 28% from diesel & traffic
  const industryShare = 20; // 20% from power & industrial stacks
  const dustShare = 14; // 14% from road dust & construction

  const biomassPM25 = Math.round(ambientPM25 * (biomassShare / 100));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Satellite Thermal Fire Anomaly & Agricultural Smoke Drift Tracer
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            MODIS / VIIRS satellite thermal hotspot detection and forward smoke plume trajectory calculation.
          </p>
        </div>

        {/* Hotspot Count Pill */}
        <div className="p-2.5 rounded-xl bg-orange-950/70 border border-orange-500/40 text-orange-300 font-mono text-xs self-start sm:self-auto flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Active Upwind Thermal Hotspots: <strong>{activeFireCount.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Trajectory Calculation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-white/10">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Upwind Steering Wind Speed:</span>
            <span className="text-white font-bold">{windSpeedKmh} km/h</span>
          </div>
          <input
            type="range"
            min="4"
            max="35"
            value={windSpeedKmh}
            onChange={(e) => {
              playTactileClick(650, 0.01);
              setWindSpeedKmh(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-300 font-bold block">
              Plume Trajectory Drift Vector
            </span>
            <span className="text-[11px] font-sans text-slate-400">
              Northwest prevailing winter corridor
            </span>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            {(['NW', 'W', 'SW', 'N'] as const).map(dir => (
              <button
                key={dir}
                onClick={() => {
                  playTactileClick(700, 0.02);
                  setWindDirection(dir);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                  windDirection === dir ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trajectory Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase text-slate-400 block">Plume Transit Lag</span>
          <div className="text-2xl font-black text-orange-400 mt-0.5 block">{transitHours} hours</div>
          <span className="text-[11px] text-slate-400 font-sans">
            Fires lit upwind at 02:00 AM impact city center at ~{Math.round(2 + transitHours)}:00 AM
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase text-slate-400 block">Biomass PM2.5 Share</span>
          <div className="text-2xl font-black text-white mt-0.5 block">{biomassShare}% ({biomassPM25} µg/m³)</div>
          <span className="text-[11px] text-slate-400 font-sans">
            Direct organic carbon and levoglucosan signature
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase text-slate-400 block">Basin Trapping Factor</span>
          <div className="text-2xl font-black text-amber-400 mt-0.5 block">High Risk</div>
          <span className="text-[11px] text-slate-400 font-sans">
            Smoke settles into urban river basin beneath cold air cap
          </span>
        </div>
      </div>

      {/* Source Apportionment Breakdown Bar */}
      <div className="bg-slate-950/80 p-5 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Chemical Mass Balance Source Apportionment
          </span>
          <span className="text-xs font-mono text-slate-400">Total: {ambientPM25} µg/m³</span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
          <div style={{ width: `${biomassShare}%` }} className="bg-orange-500" title="Biomass / Agricultural 38%" />
          <div style={{ width: `${vehicleShare}%` }} className="bg-rose-500" title="Vehicular Diesel 28%" />
          <div style={{ width: `${industryShare}%` }} className="bg-purple-500" title="Industrial Point Sources 20%" />
          <div style={{ width: `${dustShare}%` }} className="bg-amber-500" title="Road Dust 14%" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span>Biomass: {biomassShare}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span>Vehicular: {vehicleShare}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
            <span>Industrial: {industryShare}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>Road Dust: {dustShare}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
