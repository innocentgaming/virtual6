import React from 'react';
import { CloudFog, Clock, AlertTriangle, Sun, ArrowUpRight } from 'lucide-react';

interface InversionAlertProps {
  isInversionLikely: boolean;
  safeVentilationHours?: string[];
  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  onExplorePhysics?: () => void;
}

export const InversionAlert: React.FC<InversionAlertProps> = ({
  isInversionLikely,
  safeVentilationHours = ['12:00 PM – 02:30 PM'],
  temperature,
  windSpeed,
  humidity,
  onExplorePhysics
}) => {
  if (!isInversionLikely) return null;

  return (
    <div
      role="alert"
      aria-labelledby="inversion-banner-title"
      className="w-full rounded-2xl p-4 sm:p-5 lg:p-6 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 shadow-xs relative overflow-hidden min-w-0"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full min-w-0">
        {/* Left column: Warning & Details */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <CloudFog className="w-6 h-6 animate-pulse" aria-hidden="true" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-bold uppercase tracking-wider border border-amber-300 dark:border-amber-700">
                Atmospheric Inversion
              </span>
              <h2 id="inversion-banner-title" className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100 font-display">
                Thermal Radiation Inversion Active
              </h2>
            </div>

            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 max-w-2xl leading-relaxed font-sans">
              Nocturnal ground cooling has established a warm atmospheric boundary cap at ~80–140m. Vehicular soot, crop residue smoke, and industrial particulates cannot disperse vertically.
            </p>

            {(temperature !== undefined || windSpeed !== undefined || humidity !== undefined) && (
              <div className="flex items-center gap-3 text-[11px] font-mono text-amber-800/70 dark:text-amber-300/70 pt-1 flex-wrap">
                {temperature !== undefined && <span>Temp: {temperature}°C</span>}
                {windSpeed !== undefined && <span>Wind: {windSpeed} km/h (Stagnant)</span>}
                {humidity !== undefined && <span>Humidity: {humidity}%</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Solar mixing window */}
        <div className="w-full lg:w-auto lg:min-w-[220px] p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-amber-800/60 shadow-xs shrink-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Sun className="w-3.5 h-3.5" />
              <span>Solar Convection Window</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
              {safeVentilationHours[0] || '12:00 PM – 02:30 PM'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Trapped column expands under peak midday sun
            </div>
          </div>

          {onExplorePhysics && (
            <button
              onClick={onExplorePhysics}
              className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center justify-between"
            >
              <span>View Atmospheric Column</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
