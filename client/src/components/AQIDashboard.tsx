import React from 'react';
import { 
  CloudFog, 
  Wind, 
  Thermometer, 
  Droplets, 
  Clock, 
  AlertCircle, 
  HeartHandshake, 
  CheckCircle2, 
  Baby, 
  UserCheck, 
  Activity,
  Compass,
  Radio,
  Gauge
} from 'lucide-react';
import { AQIData } from '../services/api';
import { AtmosphericCanvas } from './AtmosphericCanvas';
import { InversionColumn } from './InversionColumn';
import { LungDepositionVisualizer } from './LungDepositionVisualizer';
import { PredictiveSmogTimeline } from './PredictiveSmogTimeline';

interface AQIDashboardProps {
  data: AQIData | null;
  isLoading: boolean;
}

export const AQIDashboard: React.FC<AQIDashboardProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-14 h-14 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <span className="font-mono text-xs tracking-wider text-slate-400 uppercase">
          Initializing telemetry & atmospheric microclimate sensors...
        </span>
      </div>
    );
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#8b5cf6';
    return '#dc2626';
  };

  // Percentage for circular meter (capped at 500)
  const aqiPercentage = Math.min(100, Math.round((data.aqi / 500) * 100));
  const strokeDashoffset = 283 - (283 * (aqiPercentage * 0.75)) / 100;

  return (
    <div className="space-y-8">
      {/* 1. Atmospheric Particle Physics Canvas (Interactive Simulation) */}
      <section aria-label="Atmospheric Physics Simulation">
        <AtmosphericCanvas 
          aqi={data.aqi} 
          isInversionLikely={data.isInversionLikely} 
        />
      </section>

      {/* 2. Top Banner: Inversion & Safe Ventilation Window */}
      {data.isInversionLikely && (
        <section 
          aria-labelledby="inversion-banner-heading"
          className="p-5 rounded-2xl bg-[#120d08] border border-amber-500/40 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                <CloudFog className="w-6 h-6 animate-pulse" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase font-bold tracking-wider border border-amber-500/40">
                    METEOROLOGICAL EVENT
                  </span>
                  <h2 id="inversion-banner-heading" className="text-base font-bold text-amber-100">
                    Radiation Temperature Inversion Active
                  </h2>
                </div>
                <p className="text-xs text-amber-200/80 mt-1 max-w-2xl leading-relaxed font-sans">
                  Cold, dense nocturnal air is trapped under a warm boundary lid at ~120m altitude. Ground exhaust and biomass smoke cannot disperse vertically.
                </p>
              </div>
            </div>

            <div className="bg-[#1a140c] border border-amber-500/30 rounded-xl p-3 shrink-0 self-start md:self-auto min-w-[200px]">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Midday Solar Mixing</span>
              </div>
              <p className="text-sm font-bold font-mono text-white">
                {data.safeVentilationHours[0] || '12:00 PM - 02:30 PM'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Solar flux expands trapped air column</p>
            </div>
          </div>
        </section>
      )}

      {/* 3. Main Stats Grid: Precision Instrument HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Primary AQI Dial / Gauge Instrument (4 cols) */}
        <div className="lg:col-span-4 bg-[#090c10] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>SENSOR TELEMETRY</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Circular Gauge Graphic */}
            <div className="my-6 flex flex-col items-center justify-center relative">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeWidth="8"
                  strokeDasharray="212"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Active meter arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getAQIColor(data.aqi)}
                  strokeWidth="8"
                  strokeDasharray="212"
                  strokeDashoffset={212 - (212 * aqiPercentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Centered Dial Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                  EPA AQI
                </span>
                <span 
                  className="text-5xl font-black font-mono tracking-tight my-0.5"
                  style={{ color: getAQIColor(data.aqi) }}
                >
                  {data.aqi}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full font-mono bg-white/5 border border-white/10 text-white">
                  {data.level}
                </span>
              </div>
            </div>

            <div className="text-center pb-2">
              <span className="text-xs font-mono text-slate-300 font-semibold">{data.city}, {data.country}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-white/10 font-sans">
              {data.smogAlertNotice}
            </p>
          </div>

          {/* Meteorological Readings Strip */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono uppercase">
                <Thermometer className="w-3 h-3 text-blue-400" />
                <span>Ambient</span>
              </div>
              <span className="font-bold font-mono text-sm text-slate-200 mt-0.5 block">{data.temperature}°C</span>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono uppercase">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>Humidity</span>
              </div>
              <span className="font-bold font-mono text-sm text-slate-200 mt-0.5 block">{data.humidity}%</span>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono uppercase">
                <Wind className="w-3 h-3 text-teal-400" />
                <span>Surface</span>
              </div>
              <span className="font-bold font-mono text-sm text-slate-200 mt-0.5 block">{data.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Granular 6-Pollutant Matrix (8 cols) */}
        <div className="lg:col-span-8 bg-[#090c10] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                  Chemical & Particulate Spectrometry
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                WHO 24h Threshold: PM2.5 ≤ 15 µg/m³
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4">
              {/* PM2.5 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-red-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">PM2.5</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-600/40 font-bold">
                    {(data.pollutants.pm25 / 15).toFixed(1)}× WHO
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-red-400">
                  {data.pollutants.pm25} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">Deep lung alveolar penetrator</p>
              </div>

              {/* PM10 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">PM10</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40 font-bold">
                    {(data.pollutants.pm10 / 45).toFixed(1)}× WHO
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {data.pollutants.pm10} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">Coarse road dust & grit</p>
              </div>

              {/* NO2 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-orange-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">NO₂</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-600/40 font-bold">
                    Combustion
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-orange-400">
                  {data.pollutants.no2} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">Diesel vehicle emissions</p>
              </div>

              {/* Ozone O3 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">O₃ (Ozone)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-bold">
                    Oxidant
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {data.pollutants.o3} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">Sunlight photochemical gas</p>
              </div>

              {/* Carbon Monoxide CO */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">CO</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-600/40 font-bold">
                    Incomplete
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-400">
                  {data.pollutants.co} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">Solid fuel & charcoal burning</p>
              </div>

              {/* SO2 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">SO₂</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-600/40 font-bold">
                    Heavy Fuel
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-purple-400">
                  {data.pollutants.so2} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">Coal power & sulfur heating</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Primary Dominant Factor: <strong>Fine Combustion Carbon (PM2.5)</strong></span>
            <span>Dispersion Index: <strong>Severely Constrained</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Thermal Inversion Atmospheric Column Cross-Section */}
      <InversionColumn 
        currentAqi={data.aqi} 
        isInversionLikely={data.isInversionLikely} 
      />

      {/* 5. 72-Hour Planetary Boundary Layer & Smog Trajectory Model */}
      <PredictiveSmogTimeline 
        city={data.city} 
      />

      {/* 6. Human Respiratory Particulate Deposition Simulator */}
      <LungDepositionVisualizer 
        pm25={data.pollutants.pm25} 
      />

      {/* 6. Household Smog Defense Protocol */}
      <section 
        aria-labelledby="safety-checklist-heading"
        className="bg-[#090c10] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.08]">
          <HeartHandshake className="w-5 h-5 text-emerald-400" />
          <h3 id="safety-checklist-heading" className="text-sm font-mono uppercase tracking-wider font-bold text-white">
            Household Clinical Defense Protocol
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase">
              <Baby className="w-4 h-4" />
              <h4>Infants & Children</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-sans">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Inhale 2× more air volume per kilogram of body weight than adults; postpone outdoor sports.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Use pediatric KF94 respirators; standard adult masks leave side cheek gaps.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
              <Activity className="w-4 h-4" />
              <h4>Asthmatics & Cardiac Patients</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-sans">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>PM2.5 triggers bronchospasm & endothelial stress; keep rescue bronchodilator on person.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Run bedroom air filtration continuously on low setting to prevent nocturnal asthma spikes.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-mono font-bold text-xs uppercase">
              <UserCheck className="w-4 h-4" />
              <h4>Elderly & Commuters</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-sans">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Avoid walking alongside heavy diesel corridors; choose residential side streets.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Perform gentle isotonic nasal rinse post-commute to remove particulate accumulation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
