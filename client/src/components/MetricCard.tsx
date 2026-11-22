import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  symbol?: string;
  value: number | string;
  unit: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'orange' | 'rose' | 'purple' | 'slate';
  progressPercent?: number;
  benchmark?: string;
  description?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  symbol,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  badge,
  badgeColor = 'emerald',
  progressPercent,
  benchmark,
  description,
  className = ''
}) => {
  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'orange':
        return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getBarColor = () => {
    switch (badgeColor) {
      case 'emerald': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'orange': return 'bg-orange-500';
      case 'rose': return 'bg-rose-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className={`card-premium p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 min-w-0 w-full ${className}`}>
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                {title}
              </span>
              {symbol && (
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block truncate">
                  {symbol}
                </span>
              )}
            </div>
          </div>

          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getBadgeClass()}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Big value display */}
        <div className="my-2.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100">
            {value !== undefined && value !== null ? value : '—'}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>

          {trend && (
            <span className="ml-auto flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />}
              {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
              {trendLabel && <span className="ml-0.5">{trendLabel}</span>}
            </span>
          )}
        </div>

        {/* Progress gauge bar */}
        {typeof progressPercent === 'number' && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()}`}
              style={{ width: `${Math.min(Math.max(progressPercent, 3), 100)}%` }}
            />
          </div>
        )}

        {/* Benchmark text */}
        {benchmark && (
          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1">
            {benchmark}
          </div>
        )}
      </div>

      {description && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
          {description}
        </div>
      )}
    </div>
  );
};
