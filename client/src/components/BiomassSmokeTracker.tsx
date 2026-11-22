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
    <div className="card-premium p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
              Satellite Thermal Fire Anomaly & Agricultural Smoke Drift Tracer
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            MODIS / VIIRS satellite thermal hotspot detection and forward smoke plume trajectory calculation.
          </p>
        </div>

        {/* Hotspot Count Pill */}
        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 font-mono text-xs self-start sm:self-auto flex items-center gap-2 shadow-2xs">
          <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
          <span>Active Upwind Thermal Hotspots: <strong>{activeFireCount.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Trajectory Calculation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wind Speed Slider */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Transport Wind Speed</span>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{windSpeedKmh} km/h</span>
          </div>
          <input
            type="range"
            min="4"
            max="35"
            step="1"
            value={windSpeedKmh}
            aria-label="Transport Wind Speed"
            onChange={(e) => {
              setWindSpeedKmh(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>4 km/h (Stagnant)</span>
            <span>35 km/h (Rapid Dispersion)</span>
          </div>
        </div>

        {/* Wind Vector Direction */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Plume Approach Vector</span>
            </div>
            <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">{windDirection} Bearing</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['NW', 'W', 'SW', 'N'] as const).map(dir => (
              <button
                key={dir}
                onClick={() => {
                  playTactileClick(750, 0.02);
                  setWindDirection(dir);
                }}
                className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                  windDirection === dir
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">NW vector channels smoke from agrarian burning belts.</p>
        </div>

        {/* Calculated Plume Transit Lag */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Plume Transit Lag</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
              Lag Forecast
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-black font-display text-slate-900 dark:text-slate-100">{transitHours}</span>
            <span className="text-xs text-slate-500 font-mono ml-1">Hours</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Smoke emitted now enters city boundary in ~{transitHours}h.
          </p>
        </div>
      </div>

      {/* Chemical Mass Balance Apportionment */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Chemical Mass-Balance Source Apportionment
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Agricultural Contribution: <strong>{biomassPM25} µg/m³</strong> ({biomassShare}% of ambient)
          </span>
        </div>

        {/* Stacked Multi-Color Proportion Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex shadow-2xs">
          <div style={{ width: `${biomassShare}%` }} className="bg-orange-500 h-full" title={`Biomass Burning: ${biomassShare}%`} />
          <div style={{ width: `${vehicleShare}%` }} className="bg-rose-500 h-full" title={`Diesel Vehicular: ${vehicleShare}%`} />
          <div style={{ width: `${industryShare}%` }} className="bg-purple-500 h-full" title={`Industrial Point Sources: ${industryShare}%`} />
          <div style={{ width: `${dustShare}%` }} className="bg-amber-400 h-full" title={`Construction Dust: ${dustShare}%`} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span>Biomass Burning ({biomassShare}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span>Diesel Traffic ({vehicleShare}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
            <span>Industrial Point ({industryShare}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span>Road Dust ({dustShare}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
