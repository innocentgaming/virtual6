import React from 'react';
import { Baby, Activity, UserCheck, Wind, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface HealthInsightCardProps {
  aqi: number;
  isInversionActive: boolean;
  safeVentilationHour?: string;
  onOpenRxSheet?: () => void;
}

export const HealthInsightCard: React.FC<HealthInsightCardProps> = ({
  aqi,
  isInversionActive,
  safeVentilationHour = '12:00 PM – 02:30 PM',
  onOpenRxSheet
}) => {
  const getSeverity = () => {
    if (aqi <= 50) return { title: 'Air Quality is Optimal', color: 'emerald' };
    if (aqi <= 100) return { title: 'Moderate Air Quality', color: 'amber' };
    if (aqi <= 150) return { title: 'Unhealthy for Sensitive Groups', color: 'orange' };
    if (aqi <= 200) return { title: 'Unhealthy Atmospheric Smog', color: 'red' };
    if (aqi <= 300) return { title: 'Very Unhealthy Winter Inversion', color: 'purple' };
    return { title: 'Hazardous Particulate Stagnation', color: 'maroon' };
  };

  const severity = getSeverity();

  return (
    <div className="card-premium p-5 sm:p-6 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
            Personalized Clinical Health Protocols
          </h3>
        </div>
        {onOpenRxSheet && (
          <button
            onClick={onOpenRxSheet}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Generate Full Clinical Rx Sheet</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Grid of Apple Weather style cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Pediatric & Infants */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Baby className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Infants & Children
              </h4>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              High Vulnerability
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Children inhale <strong>2× more volume</strong> per kg body weight. Under current AQI, cancel outdoor school sports and seal nursery windows.
          </p>

          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Pediatric-fit KF94 respirators required</span>
          </div>
        </div>

        {/* 2. Asthmatics & Cardiac */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Asthma & Cardiac
              </h4>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Bronchospasm Risk
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Sub-micron particulate infiltration triggers airway hyper-reactivity. Keep rescue inhaler on person. Run bedroom HEPA/Corsi filter continuously on low.
          </p>

          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Avoid morning dry-sweeping & frying</span>
          </div>
        </div>

        {/* 3. Commuters & Ventilation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Commuters & Adults
              </h4>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Route Defense
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Stagger transit away from 07:00–09:30 rush-hour diesel canyon spikes. Set car ventilation to <strong>Internal Recirculation</strong> mode.
          </p>

          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Ventilate only during {safeVentilationHour}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
