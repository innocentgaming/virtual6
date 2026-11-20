import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sun, 
  Moon, 
  Wind, 
  ShieldAlert, 
  TrendingUp, 
  Calendar, 
  Layers, 
  CheckCircle, 
  Sparkles 
} from 'lucide-react';
import { fetchPredictiveSmogForecast, PredictiveSmogReport, HourlyForecastPoint } from '../services/api';
import { playTactileClick } from './AudioEffects';

interface PredictiveSmogTimelineProps {
  city: string;
}

export const PredictiveSmogTimeline: React.FC<PredictiveSmogTimelineProps> = ({ city }) => {
  const [forecastReport, setForecastReport] = useState<PredictiveSmogReport | null>(null);
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(12); // default to 12h ahead
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchPredictiveSmogForecast(city)
      .then((data) => {
        if (isMounted) {
          setForecastReport(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load smog forecast:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [city]);

  if (isLoading || !forecastReport) {
    return (
      <div className="p-8 rounded-2xl bg-[#090c10] border border-white/10 text-center text-xs font-mono text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2" />
        Simulating 72-hour planetary boundary layer meteorological trajectory...
      </div>
    );
  }

  const currentPoint = forecastReport.forecastPoints[selectedHourOffset] || forecastReport.forecastPoints[0];

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#8b5cf6';
    return '#dc2626';
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              72-Hour Planetary Boundary Layer & Smog Trajectory Model
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Diagnostic forecasting combining solar irradiance, surface cooling flux, and secondary photochemical generation.
          </p>
        </div>

        {/* Safest Window Callout */}
        <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-xs self-start sm:self-auto flex items-center gap-2">
          <Sun className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Optimal Vent Window: <strong>{forecastReport.safestVentilationWindowTomorrow}</strong></span>
        </div>
      </div>

      {/* Scrubbing Timeline Slider */}
      <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-white/10">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Forecast Horizon: <strong>+{selectedHourOffset}h ({currentPoint.dayLabel} {currentPoint.timeLabel})</strong></span>
          </span>
          <span className="text-slate-400 font-bold">
            PBL Height: <span className="text-emerald-400">{currentPoint.boundaryLayerHeightMeters}m AGL</span>
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="71"
          value={selectedHourOffset}
          onChange={(e) => {
            playTactileClick(600 + Number(e.target.value) * 4, 0.01);
            setSelectedHourOffset(Number(e.target.value));
          }}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span>Now (Hour 0)</span>
          <span>+24h (Day 1)</span>
          <span>+48h (Day 2)</span>
          <span>+72h (Day 3)</span>
        </div>
      </div>

      {/* Selected Time Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Predicted AQI */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Predicted EPA AQI
          </span>
          <div 
            className="text-3xl font-black font-mono tracking-tight"
            style={{ color: getAQIColor(currentPoint.predictedAQI) }}
          >
            {currentPoint.predictedAQI}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {currentPoint.predictedAQI > 300 ? 'Hazardous Air Mass' : currentPoint.predictedAQI > 200 ? 'Very Unhealthy' : 'Moderate'}
          </span>
        </div>

        {/* Boundary Layer Mixing */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Atmospheric Mixing Lid
          </span>
          <div className="text-3xl font-black font-mono text-cyan-400">
            {currentPoint.boundaryLayerHeightMeters} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {currentPoint.isInversionActive ? '⚠️ Radiation Cap Trapped' : '✓ Solar Convective Flush'}
          </span>
        </div>

        {/* PM2.5 & Photochemical Ozone */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            PM2.5 / Ozone Ratio
          </span>
          <div className="text-xl font-bold font-mono text-white">
            <span className="text-rose-400">{currentPoint.predictedPM25}</span> / <span className="text-emerald-400">{currentPoint.predictedO3}</span>
            <span className="text-xs font-normal text-slate-400"> µg/m³</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Dispersion: <strong className="text-slate-300">{currentPoint.dispersionRating}</strong>
          </span>
        </div>

        {/* Inversion Severity Index */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Inversion Severity Index
          </span>
          <div className="text-3xl font-black font-mono text-amber-400">
            {currentPoint.inversionSeverityIndex}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Thermal trapping magnitude
          </span>
        </div>
      </div>

      {/* Proactive Guidance Box */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-white/10 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-mono font-bold text-white block">
            Predictive Household Protocol for {currentPoint.dayLabel} at {currentPoint.timeLabel}:
          </span>
          <p className="text-xs text-slate-300 mt-0.5 font-sans leading-relaxed">
            {currentPoint.recommendedAction}
          </p>
        </div>
      </div>
    </div>
  );
};
