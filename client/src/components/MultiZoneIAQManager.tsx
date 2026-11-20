import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Flame, 
  Wind, 
  Fan, 
  ShieldAlert, 
  CheckCircle, 
  Activity, 
  Layers, 
  Gauge, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { fetchMultiZoneIAQ, MultiZoneSimulationResult, ZoneConfig } from '../services/api';
import { playTactileClick } from './AudioEffects';

interface MultiZoneIAQManagerProps {
  outdoorPM25: number;
}

export const MultiZoneIAQManager: React.FC<MultiZoneIAQManagerProps> = ({ outdoorPM25 }) => {
  const [cookingActive, setCookingActive] = useState<boolean>(true);
  const [bedroomPurifier, setBedroomPurifier] = useState<boolean>(true);
  const [livingPurifier, setLivingPurifier] = useState<boolean>(false);
  const [filterHours, setFilterHours] = useState<number>(340);
  const [multiZoneData, setMultiZoneData] = useState<MultiZoneSimulationResult | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<string>('zone_kitchen');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMultiZoneIAQ(
        outdoorPM25,
        cookingActive,
        bedroomPurifier,
        livingPurifier,
        filterHours
      );
      setMultiZoneData(res);
    } catch (err) {
      console.error('Failed to simulate multi-zone IAQ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [outdoorPM25, cookingActive, bedroomPurifier, livingPurifier, filterHours]);

  if (!multiZoneData && isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-[#090c10] border border-white/10 text-center text-xs font-mono text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2" />
        Solving inter-compartment particulate mass balance differential matrix...
      </div>
    );
  }

  const selectedZone = multiZoneData?.zones.find(z => z.id === activeZoneId) || multiZoneData?.zones[0];
  const diag = multiZoneData?.filterDiagnostic;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Multi-Zone Household IAQ & Filter Lifecycle Prognosticator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Solves 4-compartment inter-room particulate migration and prognosticates filter dust loading & pressure drops.
          </p>
        </div>

        {/* Whole House Avg Pill */}
        {multiZoneData && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-slate-300 font-mono text-xs self-start sm:self-auto flex items-center gap-2">
            <span className="text-slate-400">Whole-Home Volume Avg:</span>
            <strong className="text-emerald-400 text-sm">{multiZoneData.wholeHouseAveragePM25} µg/m³</strong>
          </div>
        )}
      </div>

      {/* Household Simulation Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => {
            playTactileClick(700, 0.02);
            setCookingActive(!cookingActive);
          }}
          className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
            cookingActive
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-slate-900/60 border-white/5 text-slate-400'
          }`}
        >
          <div>
            <span className="text-xs font-mono font-bold block">Kitchen Gas Stove</span>
            <span className="text-[10px] font-sans text-slate-400">Combustion & frying aerosols</span>
          </div>
          <Flame className="w-4 h-4 text-amber-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClick(700, 0.02);
            setBedroomPurifier(!bedroomPurifier);
          }}
          className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
            bedroomPurifier
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-900/60 border-white/5 text-slate-400'
          }`}
        >
          <div>
            <span className="text-xs font-mono font-bold block">Bedroom Air Cleaner</span>
            <span className="text-[10px] font-sans text-slate-400">Night sanctuary CADR 280</span>
          </div>
          <Fan className="w-4 h-4 text-emerald-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClick(700, 0.02);
            setLivingPurifier(!livingPurifier);
          }}
          className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
            livingPurifier
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-900/60 border-white/5 text-slate-400'
          }`}
        >
          <div>
            <span className="text-xs font-mono font-bold block">Living Room Central Fan</span>
            <span className="text-[10px] font-sans text-slate-400">Corsi-Rosenthal CADR 350</span>
          </div>
          <Fan className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* 4 Connected Household Zones Cards */}
      {multiZoneData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {multiZoneData.zones.map((zone) => {
            const isSelected = activeZoneId === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => {
                  playTactileClick(800, 0.02);
                  setActiveZoneId(zone.id);
                }}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/70 shadow-lg text-white'
                    : 'bg-slate-950/70 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-mono font-bold truncate block">{zone.name}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      zone.complianceStatus === 'Safe' 
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                        : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                    }`}>
                      {zone.complianceStatus}
                    </span>
                  </div>

                  <div className="text-2xl font-black font-mono mt-1" style={{
                    color: zone.currentPM25 <= 15 ? '#10b981' : zone.currentPM25 <= 35 ? '#f59e0b' : '#ef4444'
                  }}>
                    {zone.currentPM25} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Target: ≤{zone.targetSafePM25} µg/m³ • {zone.volumeM3} m³
                  </span>
                </div>

                <div className="text-[11px] font-sans text-slate-400 pt-2 border-t border-white/[0.06] line-clamp-2">
                  {zone.zonalAdvice}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Dust Saturation & Pressure Drop Prognosticator */}
      {diag && (
        <div className="bg-slate-950/80 p-5 rounded-xl border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Particulate Dust Loading & Filter Saturation Diagnostic (Darcy-Weisbach Model)
              </h4>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              diag.saturationPercentage >= 85 
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' 
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
            }`}>
              {diag.healthAlert}
            </span>
          </div>

          {/* Operational Hours Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Cumulative Operating Hours:</span>
              <span className="text-white font-bold">{filterHours} hours run</span>
            </div>
            <input
              type="range"
              min="20"
              max="900"
              step="20"
              value={filterHours}
              onChange={(e) => {
                playTactileClick(650, 0.01);
                setFilterHours(Number(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
              <span className="text-[10px] uppercase text-slate-400 block">Dust Mass Trapped</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{diag.particulateMassLoadedGrams} g</span>
              <span className="text-[10px] text-slate-500">Fine soot captured</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
              <span className="text-[10px] uppercase text-slate-400 block">Filter Saturation</span>
              <span className="text-lg font-bold text-amber-400 mt-0.5 block">{diag.saturationPercentage}%</span>
              <span className="text-[10px] text-slate-500">Fiber pore occlusion</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
              <span className="text-[10px] uppercase text-slate-400 block">Pressure Drop (ΔP)</span>
              <span className="text-lg font-bold text-cyan-400 mt-0.5 block">{diag.currentPressureDropPa} Pa</span>
              <span className="text-[10px] text-slate-500">Base: {diag.initialPressureDropPa} Pa</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
              <span className="text-[10px] uppercase text-slate-400 block">Estimated Remaining</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{diag.estimatedRemainingDays} days</span>
              <span className="text-[10px] text-slate-500">At current ambient AQI</span>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Household Interventions */}
      {multiZoneData && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-300 block">
            Multi-Zone Migration Defense Directives:
          </span>
          {multiZoneData.strategicInterventions.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-sans">{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
