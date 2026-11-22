import React from 'react';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  Baby, 
  AlertTriangle, 
  Wind, 
  Info, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';

interface HealthRecommendationProps {
  aqi: number;
  safeVentilationHour?: string;
  onOpenPrescription?: () => void;
}

export const HealthRecommendation: React.FC<HealthRecommendationProps> = ({
  aqi,
  safeVentilationHour = '12:00 PM – 02:30 PM',
  onOpenPrescription
}) => {
  // Guidance matrix based on AQI categories
  const getGuidance = (value: number) => {
    if (value <= 50) {
      return {
        level: 'Good (0–50)',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        generalImpact: 'Air pollution poses little or no risk to human health. Ambient air is clean.',
        outdoorActivity: 'All outdoor exercise, sports, and recreational activities are completely safe.',
        maskRequired: false,
        maskAdvice: 'No respirator or mask needed under clean air conditions.',
        sensitiveAdvice: 'Sensitive individuals can engage freely without restriction.',
        precautions: [
          'Ventilate rooms freely to circulate fresh outdoor air.',
          'Enjoy outdoor cardiovascular activities and walks.'
        ]
      };
    }
    if (value <= 100) {
      return {
        level: 'Moderate (51–100)',
        badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        generalImpact: 'Acceptable air quality. Minor irritation possible in hyper-reactive airways.',
        outdoorActivity: 'Safe for most people; unusually sensitive individuals should take breaks.',
        maskRequired: false,
        maskAdvice: 'Mask not required for general public; sensitive persons may carry KF94.',
        sensitiveAdvice: 'Children and adults with asthma should monitor for mild wheeze or coughing.',
        precautions: [
          'Air out indoor spaces during midday solar convection window.',
          'Keep rescue medication accessible if historically sensitive to dust.'
        ]
      };
    }
    if (value <= 150) {
      return {
        level: 'Unhealthy for Sensitive Groups (101–150)',
        badge: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
        generalImpact: 'Elevated fine particulates can cause airway inflammation in sensitive demographics.',
        outdoorActivity: 'Reduce prolonged or heavy outdoor exertion. Reschedule strenuous runs.',
        maskRequired: true,
        maskAdvice: 'KF94 or N95 recommended for vulnerable demographics during transit.',
        sensitiveAdvice: 'Children and elderly should move physical play indoors. Asthmatics pre-treat before commute.',
        precautions: [
          'Close windows facing heavy traffic corridors.',
          'Run indoor air purifier on medium speed in sleeping quarters.'
        ]
      };
    }
    if (value <= 200) {
      return {
        level: 'Unhealthy (151–200)',
        badge: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
        generalImpact: 'Adverse health effects likely for entire population; serious effects for sensitive groups.',
        outdoorActivity: 'Avoid outdoor exercise, jogging, and prolonged walks. Move all training indoors.',
        maskRequired: true,
        maskAdvice: 'Wear a well-fitted NIOSH N95, FFP2, or KF94 respirator outdoors. Cloth masks fail to filter sub-micron particles.',
        sensitiveAdvice: 'Children, pregnant individuals, and asthmatics must remain indoors in filtered rooms.',
        precautions: [
          'Keep all doors and windows sealed airtight.',
          'Set vehicle ventilation to internal recirculation mode.',
          'Perform saline nasal lavage after unavoidable outdoor transit.'
        ]
      };
    }
    if (value <= 300) {
      return {
        level: 'Very Unhealthy (201–300)',
        badge: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
        generalImpact: 'Acute toxic smog warning. Significant impairment of respiratory cilia and endothelial function.',
        outdoorActivity: 'Strictly avoid all outdoor activities. Cancel school physical recess and outdoor sports.',
        maskRequired: true,
        maskAdvice: 'Head-strap N95 or tight-fitting respirator mandatory for all outdoor exposure.',
        sensitiveAdvice: 'High risk of acute bronchospasm, asthma flare-ups, and cardiac strain.',
        precautions: [
          'Run HEPA / Corsi-Rosenthal purifiers 24/7 in clean-air sanctuary bedrooms.',
          'Avoid dry-sweeping, frying, and incense burning indoors to prevent secondary spikes.',
          'Use designated municipal clean-air shelters if home filtration is unavailable.'
        ]
      };
    }
    return {
      level: 'Hazardous (301–500+)',
      badge: 'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800',
      generalImpact: 'Emergency environmental conditions. High risk of severe respiratory distress across entire population.',
      outdoorActivity: 'Total outdoor stay advised. Stay indoors in sealed, filtered environments.',
      maskRequired: true,
      maskAdvice: 'Dual-strap N95 / FFP3 mandatory. Check seal continuously; side gaps eliminate protection.',
      sensitiveAdvice: 'Seek urgent clinical medical evaluation if experiencing shortness of breath or persistent chest tightness.',
      precautions: [
        'Maintain positive-pressure indoor filtered sanctuary.',
        'Postpone non-essential travel and school attendance.',
        'Call 911 / 112 emergency services immediately if lips turn pale or breathing becomes severely labored.'
      ]
    };
  };

  const guidance = getGuidance(aqi);

  return (
    <div className="card-premium p-5 sm:p-6 space-y-6 min-w-0 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
            Comprehensive Clinical Health Recommendations
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${guidance.badge}`}>
            {guidance.level}
          </span>

          {onOpenPrescription && (
            <button
              onClick={onOpenPrescription}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Export Rx Sheet →
            </button>
          )}
        </div>
      </div>

      {/* 4 Health Impact Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0 w-full">
        {/* 1. General Impact */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>General Impact</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {guidance.generalImpact}
          </p>
        </div>

        {/* 2. Outdoor Activity */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Outdoor Activity</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {guidance.outdoorActivity}
          </p>
        </div>

        {/* 3. Mask Recommendation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Respirator / Mask</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {guidance.maskAdvice}
          </p>
        </div>

        {/* 4. Sensitive Groups */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Baby className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Sensitive Groups</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {guidance.sensitiveAdvice}
          </p>
        </div>
      </div>

      {/* Suggested Precautions List */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block mb-2">
          Suggested Actionable Precautions
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
          {guidance.precautions.map((p, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{p}</span>
            </div>
          ))}
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Safe natural ventilation window: <strong>{safeVentilationHour}</strong></span>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer Note (Requirement #3) */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 shrink-0 text-slate-400" />
        <span>
          <strong>Informational Guidance:</strong> Recommendations are derived from US EPA 40 CFR Part 58 and WHO 2021 air quality guidelines. This interface provides environmental risk mitigation strategies and does not constitute a clinical medical diagnosis.
        </span>
      </div>
    </div>
  );
};
