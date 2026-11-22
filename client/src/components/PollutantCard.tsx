import React from 'react';

interface PollutantCardProps {
  name: string;
  formula: string;
  value: number;
  unit?: string;
  safeThreshold: number;
  category: string;
  description: string;
  sourceType: string;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
  name,
  formula,
  value,
  unit = 'µg/m³',
  safeThreshold,
  category,
  description,
  sourceType
}) => {
  const ratio = value / safeThreshold;
  const isElevated = ratio > 1;

  const getSeverity = () => {
    if (ratio <= 0.5) return { color: 'emerald', text: 'Good', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
    if (ratio <= 1.0) return { color: 'teal', text: 'Moderate', badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800' };
    if (ratio <= 1.5) return { color: 'amber', text: 'Elevated', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
    return { color: 'red', text: 'High', badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' };
  };

  const severity = getSeverity();
  const barPercent = Math.min((value / (safeThreshold * 2)) * 100, 100);

  return (
    <div className="card-premium p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 min-w-0 w-full">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">
                {formula}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ({name})
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {sourceType}
            </span>
          </div>

          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${severity.badge}`}>
            {severity.text}
          </span>
        </div>

        <div className="my-2.5 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {unit}
          </span>
        </div>

        {/* Gauge bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-1.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isElevated ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(barPercent, 4)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
          <span>Threshold: {safeThreshold} {unit}</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {ratio.toFixed(1)}× standard
          </span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
        {description}
      </div>
    </div>
  );
};
