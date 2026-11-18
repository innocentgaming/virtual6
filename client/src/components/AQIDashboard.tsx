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
  Activity 
} from 'lucide-react';
import { AQIData } from '../services/api';

interface AQIDashboardProps {
  data: AQIData | null;
  isLoading: boolean;
}

export const AQIDashboard: React.FC<AQIDashboardProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm">Fetching real-time atmospheric and particulate data...</p>
      </div>
    );
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#8b5cf6';
    return '#7f1d1d';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Inversion & Safe Ventilation Window */}
      {data.isInversionLikely && (
        <section 
          aria-labelledby="inversion-banner-heading"
          className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-600/40 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <CloudFog className="w-6 h-6 animate-pulse" aria-hidden="true" />
              </div>
              <div>
                <h2 id="inversion-banner-heading" className="text-base font-bold text-amber-200">
                  Severe Winter Thermal Inversion Detected
                </h2>
                <p className="text-sm text-amber-300/80 mt-1 max-w-2xl leading-relaxed">
                  Cold, dense air at ground level is trapped beneath a warmer ceiling layer. Combustion exhaust, diesel particulates, and smoke cannot disperse vertically.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Optimal Micro-Vent Window</span>
              </div>
              <p className="text-sm font-bold text-white">
                {data.safeVentilationHours[0] || '12:00 PM - 02:30 PM'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">When direct sun mixes surface air layer</p>
            </div>
          </div>
        </section>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary AQI Gauge Card */}
        <div className="lg:col-span-1 bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                US EPA Air Quality Index
              </span>
              <span className="text-xs text-slate-400">
                {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span 
                className="text-6xl font-black tracking-tight"
                style={{ color: getAQIColor(data.aqi) }}
              >
                {data.aqi}
              </span>
              <div>
                <span className="text-sm font-bold block text-white">{data.level}</span>
                <span className="text-xs text-slate-400">{data.city}, {data.country}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              {data.smogAlertNotice}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/40 p-2 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                <span>Temp</span>
              </div>
              <span className="font-bold text-sm text-slate-200 mt-0.5 block">{data.temperature}°C</span>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Humidity</span>
              </div>
              <span className="font-bold text-sm text-slate-200 mt-0.5 block">{data.humidity}%</span>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Wind</span>
              </div>
              <span className="font-bold text-sm text-slate-200 mt-0.5 block">{data.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* 6 Pollutant Breakdown Cards */}
        <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Pollutant Concentrations</span>
            </h3>
            <span className="text-xs text-slate-400">WHO 24h Safe Limit: PM2.5 ≤ 15 µg/m³</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* PM2.5 */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">PM2.5</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  {(data.pollutants.pm25 / 15).toFixed(1)}x WHO Limit
                </span>
              </div>
              <div className="mt-2 text-xl font-black text-rose-400">
                {data.pollutants.pm25} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Deep lung & blood penetrator</p>
            </div>

            {/* PM10 */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">PM10</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  {(data.pollutants.pm10 / 45).toFixed(1)}x WHO Limit
                </span>
              </div>
              <div className="mt-2 text-xl font-black text-amber-400">
                {data.pollutants.pm10} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Coarse dust & mechanical grit</p>
            </div>

            {/* NO2 */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">NO2</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
                  Traffic Gas
                </span>
              </div>
              <div className="mt-2 text-xl font-black text-orange-400">
                {data.pollutants.no2} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Diesel exhaust & bronchial irritant</p>
            </div>

            {/* Ozone O3 */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Ozone (O3)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Photochemical
                </span>
              </div>
              <div className="mt-2 text-xl font-black text-emerald-400">
                {data.pollutants.o3} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Higher in afternoons with UV</p>
            </div>

            {/* Carbon Monoxide */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">CO</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                  Combustion
                </span>
              </div>
              <div className="mt-2 text-xl font-black text-blue-400">
                {data.pollutants.co} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Solid fuel & engine incomplete burn</p>
            </div>

            {/* SO2 */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">SO2</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  Industrial
                </span>
              </div>
              <div className="mt-2 text-xl font-black text-purple-400">
                {data.pollutants.so2} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Coal plants & heavy fuel oil</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerable Population Safety Checklist */}
      <section 
        aria-labelledby="safety-checklist-heading"
        className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <HeartHandshake className="w-5 h-5 text-emerald-400" />
          <h3 id="safety-checklist-heading" className="text-base font-bold text-white">
            Household Smog Vulnerability Defense Protocol
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-2">
              <Baby className="w-4 h-4" />
              <h4>Infants & Schoolchildren</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Inhale 2x more air per kg than adults; keep indoors during morning recess.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Use pediatric KF94 respirators; standard adult masks leave side gaps.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
              <Activity className="w-4 h-4" />
              <h4>Asthmatics & Cardiac Patients</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>PM2.5 triggers bronchospasm & arterial vasoconstriction; maintain rescue inhaler nearby.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Run bedroom air purifier continuously on lowest quiet setting during sleep.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm mb-2">
              <UserCheck className="w-4 h-4" />
              <h4>Elderly & Outdoor Commuters</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Avoid walking along arterial diesel corridors; use inner residential lanes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Perform gentle nasal saline wash post-commute to remove particulate accumulation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

