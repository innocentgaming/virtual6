import React from 'react';
import { 
  Radio, 
  MapPin, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  Clock, 
  Info 
} from 'lucide-react';
import { AQIData } from '../services/api';
import { AQIGauge } from './AQIGauge';
import { playTactileClick } from './AudioEffects';

interface AQICardProps {
  data: AQIData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const AQICard: React.FC<AQICardProps> = ({
  data,
  isLoading = false,
  onRefresh
}) => {
  const formattedTime = new Date(data.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getCategoryDetails = (aqi: number) => {
    if (aqi <= 50) {
      return {
        label: 'Good Air Quality',
        bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        summary: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
        action: 'Ideal conditions for outdoor activity and unconstrained ventilation.'
      };
    }
    if (aqi <= 100) {
      return {
        label: 'Moderate Air Quality',
        bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        summary: 'Air quality is acceptable; however, some pollutants may cause moderate concern for sensitive individuals.',
        action: 'Unusually sensitive individuals should consider limiting prolonged outdoor exertion.'
      };
    }
    if (aqi <= 150) {
      return {
        label: 'Unhealthy for Sensitive Groups',
        bg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        summary: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
        action: 'Children, older adults, and individuals with respiratory conditions should reduce heavy outdoor exertion.'
      };
    }
    if (aqi <= 200) {
      return {
        label: 'Unhealthy Air Quality',
        bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        summary: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.',
        action: 'Active children and adults, and people with respiratory disease, should avoid prolonged outdoor exertion.'
      };
    }
    if (aqi <= 300) {
      return {
        label: 'Very Unhealthy Air Quality',
        bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        summary: 'Health alert: The risk of health effects is increased for everyone across the entire metropolitan area.',
        action: 'Avoid all outdoor physical activities; keep windows sealed and run indoor air filtration.'
      };
    }
    return {
      label: 'Hazardous Atmospheric Smog',
      bg: 'bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800',
      summary: 'Emergency health warning: Entire population is likely to experience serious adverse respiratory symptoms.',
      action: 'Remain strictly indoors with air purifiers operating; wear fitted N95/FFP2 respirators if transit is required.'
    };
  };

  const category = getCategoryDetails(data.aqi);

  return (
    <div className="card-premium p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 h-full w-full min-w-0">
      <div>
        {/* Top telemetry status bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Live Sensor Telemetry
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formattedTime}</span>
            </span>

            {onRefresh && (
              <button
                onClick={() => {
                  playTactileClick(850, 0.02);
                  onRefresh();
                }}
                disabled={isLoading}
                aria-label="Refresh live AQI"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Centerpiece Gauge */}
        <div className="my-1">
          <AQIGauge
            aqi={data.aqi}
            level={data.level}
            primaryPollutant={data.primaryPollutant || 'PM2.5'}
            city={data.city}
            country={data.country}
            lastUpdated={formattedTime}
          />
        </div>

        {/* Health category narrative box */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 transition-colors ${category.bg}`}>
          <div className="flex items-center justify-between font-bold">
            <span className="uppercase tracking-wider text-[11px]">{category.label}</span>
            <span className="text-[10px] font-mono opacity-80">EPA Standard</span>
          </div>
          <p className="font-sans opacity-90">{category.summary}</p>
          <div className="pt-1 border-t border-current/15 text-[11px] font-medium opacity-95">
            <strong>Recommendation:</strong> {category.action}
          </div>
        </div>
      </div>

      {/* Scale brackets overview */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-1.5">
          <span>0 (Clean)</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200</span>
          <span>300</span>
          <span>500+ (Severe)</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex shadow-2xs">
          <div style={{ width: '10%' }} className="bg-emerald-500 h-full" title="0-50 Good" />
          <div style={{ width: '10%' }} className="bg-amber-400 h-full" title="51-100 Moderate" />
          <div style={{ width: '10%' }} className="bg-orange-500 h-full" title="101-150 Sensitive" />
          <div style={{ width: '10%' }} className="bg-rose-500 h-full" title="151-200 Unhealthy" />
          <div style={{ width: '20%' }} className="bg-purple-500 h-full" title="201-300 Very Unhealthy" />
          <div style={{ width: '40%' }} className="bg-red-800 h-full" title="301-500 Hazardous" />
        </div>
      </div>
    </div>
  );
};
