import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AQIMetricCardProps {
  title: string;
  symbol?: string;
  value: number | string;
  unit: string;
  statusLabel?: string;
  statusColor?: 'emerald' | 'amber' | 'orange' | 'red' | 'purple' | 'slate';
  benchmarkText?: string;
  progressPercent?: number;
  description?: string;
  icon?: LucideIcon;
  subtext?: string;
}

export const AQIMetricCard: React.FC<AQIMetricCardProps> = ({
  title,
  symbol,
  value,
  unit,
  statusLabel,
  statusColor = 'emerald',
  benchmarkText,
  progressPercent,
  description,
  icon: Icon,
  subtext
}) => {
  const getBadgeStyle = () => {
    switch (statusColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'orange':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
      case 'red':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getBarColor = () => {
    switch (statusColor) {
      case 'emerald': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-rose-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="card-premium p-5 flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition duration-200">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {title}
              </span>
              {symbol && (
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {symbol}
                </span>
              )}
            </div>
          </div>

          {statusLabel && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
              {statusLabel}
            </span>
          )}
        </div>

        {/* Value readout */}
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        </div>

        {/* Progress bar if applicable */}
        {typeof progressPercent === 'number' && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-2.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()}`}
              style={{ width: `${Math.min(Math.max(progressPercent, 2), 100)}%` }}
            />
          </div>
        )}

        {/* Benchmark notice */}
        {benchmarkText && (
          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1">
            {benchmarkText}
          </div>
        )}
      </div>

      {/* Description / Subtext */}
      {(description || subtext) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          {description && <span className="line-clamp-1">{description}</span>}
          {subtext && <span className="font-mono text-[10px] shrink-0 text-slate-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
