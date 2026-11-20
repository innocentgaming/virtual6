import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Train, 
  Car, 
  TreePine, 
  Footprints, 
  ShieldCheck, 
  TrendingDown, 
  Leaf, 
  AlertTriangle,
  ArrowRight,
  Clock
} from 'lucide-react';
import { fetchRouteExposure, RouteOptimizationResult, CommuteRouteOption } from '../services/api';
import { playTactileClick } from './AudioEffects';

interface RouteExposureOptimizerProps {
  city: string;
}

export const RouteExposureOptimizer: React.FC<RouteExposureOptimizerProps> = ({ city }) => {
  const [distanceKm, setDistanceKm] = useState<number>(14);
  const [isVulnerable, setIsVulnerable] = useState<boolean>(true);
  const [routeResult, setRouteResult] = useState<RouteOptimizationResult | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_metro');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRouteExposure(city, distanceKm, isVulnerable);
      setRouteResult(data);
    } catch (err) {
      console.error('Failed to evaluate commute routes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, [city, distanceKm, isVulnerable]);

  if (!routeResult && isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-[#090c10] border border-white/10 text-center text-xs font-mono text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2" />
        Simulating urban corridor particulate exposure differentials...
      </div>
    );
  }

  const selectedRoute = routeResult?.routes.find(r => r.id === selectedRouteId) || routeResult?.routes[1];

  const getModeIcon = (mode: CommuteRouteOption['mode']) => {
    switch (mode) {
      case 'highway_car': return Car;
      case 'metro_transit': return Train;
      case 'green_buffer': return TreePine;
      case 'active_walk_cycle': return Footprints;
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Urban Commute Shield & Route Exposure Optimizer
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Compares highway diesel corridors against filtered rail and green vegetative bypasses to minimize lung dose intake.
          </p>
        </div>

        {/* Impact Reduction Pill */}
        {routeResult && (
          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-xs self-start sm:self-auto flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>Shielded Metro: <strong>-{routeResult.bestOptionDoseReductionPercent}% Lung Dose Avoided</strong></span>
          </div>
        )}
      </div>

      {/* Distance Slider & Vulnerability Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-white/10">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">One-Way Commute Distance:</span>
            <span className="text-white font-bold">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min="2"
            max="40"
            value={distanceKm}
            onChange={(e) => {
              playTactileClick(650, 0.01);
              setDistanceKm(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-300 font-bold block">
              Respiratory Vulnerability Multiplier
            </span>
            <span className="text-[11px] font-sans text-slate-400">
              Asthma, cardiac sensitivity, or pediatric airways
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playTactileClick(750, 0.02);
              setIsVulnerable(!isVulnerable);
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              isVulnerable ? 'bg-emerald-600' : 'bg-slate-800'
            }`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
              isVulnerable ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* 4 Route Options Grid */}
      {routeResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {routeResult.routes.map((route) => {
            const Icon = getModeIcon(route.mode);
            const isSelected = selectedRouteId === route.id;
            const isRecommended = route.id === routeResult.recommendedRouteId;

            return (
              <button
                key={route.id}
                onClick={() => {
                  playTactileClick(800, 0.02);
                  setSelectedRouteId(route.id);
                }}
                className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/70 shadow-lg text-white'
                    : 'bg-slate-950/70 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-2 right-3 text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white border border-emerald-400 shadow">
                    Recommended
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg border ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold truncate block">
                      {route.name.split(' (')[0]}
                    </span>
                  </div>

                  <div className="text-xl font-black font-mono mt-1" style={{
                    color: route.inhaledDoseUg > 50 ? '#ef4444' : route.inhaledDoseUg > 25 ? '#f59e0b' : '#10b981'
                  }}>
                    {route.inhaledDoseUg} <span className="text-xs font-normal text-slate-400">µg inhaled</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {route.durationMinutes} min • {route.routeExposurePM25} µg/m³ ambient
                  </span>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <span>CO₂: {route.tailpipeCO2Grams}g</span>
                  <span className={route.respiratoryRiskLevel === 'Low' ? 'text-emerald-400' : 'text-rose-400'}>
                    {route.respiratoryRiskLevel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Corridor Technical Breakdown */}
      {selectedRoute && (
        <div className="bg-slate-950/80 p-5 rounded-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <span>Engineering Telemetry: {selectedRoute.name}</span>
            </h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              V_E Ventilation: {selectedRoute.minuteVentilationVE} m³/h
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Inhaled Mass</span>
              <span className="text-lg font-bold font-mono text-white mt-0.5 block">{selectedRoute.inhaledDoseUg} µg</span>
              <p className="text-[11px] font-sans text-slate-400">Direct particulate dose lodged in respiratory tract</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Tailpipe CO₂ Emitted</span>
              <span className="text-lg font-bold font-mono text-white mt-0.5 block">{selectedRoute.tailpipeCO2Grams} grams</span>
              <p className="text-[11px] font-sans text-slate-400">Fossil carbon added to the urban airshed</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Corridor Stagnation</span>
              <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{selectedRoute.routeExposurePM25} µg/m³</span>
              <p className="text-[11px] font-sans text-slate-400">Concentration at commuter breathing height</p>
            </div>
          </div>

          {/* Actionable Protective Protocols */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-300 block">
              Corridor Commuter Protection Directives:
            </span>
            {selectedRoute.protectionTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Notes */}
      {routeResult && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed">
          <strong>Clinical Airway Summary:</strong> {routeResult.clinicalImpactNotes}
        </div>
      )}
    </div>
  );
};
