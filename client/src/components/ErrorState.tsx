import React from 'react';
import { AlertCircle, RefreshCw, Radio } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  city?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to establish atmospheric sensor telemetry stream.',
  onRetry,
  city
}) => {
  return (
    <div className="card-premium p-8 max-w-lg mx-auto text-center space-y-4 my-12" role="alert">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-800">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
          Atmospheric Telemetry Offline
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
          {message} {city ? `Could not connect to sensor nodes for ${city}.` : ''}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Sensor Connection</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 font-mono">
        Open-Meteo & Ground Station Microclimate Interface
      </p>
    </div>
  );
};
