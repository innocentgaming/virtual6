import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart2, 
  Calendar, 
  Clock, 
  Layers, 
  Activity, 
  Info, 
  Table 
} from 'lucide-react';
import { HourlyForecastPoint, fetchPredictiveSmogForecast } from '../services/api';
import { TrendChart } from './TrendChart';
import { LoadingSkeleton } from './LoadingSkeleton';

interface TrendsAnalyticsViewProps {
  city: string;
  currentAqi: number;
}

export const TrendsAnalyticsView: React.FC<TrendsAnalyticsViewProps> = ({
  city,
  currentAqi
}) => {
  const [forecastPoints, setForecastPoints] = useState<HourlyForecastPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRange, setActiveRange] = useState<'24h' | '72h'>('24h');

  useEffect(() => {
    setIsLoading(true);
    fetchPredictiveSmogForecast(city)
      .then(res => {
        if (res && res.forecastPoints) {
          setForecastPoints(res.forecastPoints);
        }
      })
      .catch(err => {
        console.warn('Could not load analytics forecast:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [city]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const displayedPoints = activeRange === '24h' 
    ? forecastPoints.slice(0, 24) 
    : forecastPoints.slice(0, 72);

  // Group by day for multi-day daily averages
  const dailyAverages: { day: string; avgAqi: number; avgPm25: number; status: string }[] = [];
  const daysMap = new Map<string, { aqiSum: number; pm25Sum: number; count: number }>();

  forecastPoints.forEach(pt => {
    const day = pt.dayLabel || 'Today';
    const entry = daysMap.get(day) || { aqiSum: 0, pm25Sum: 0, count: 0 };
    entry.aqiSum += pt.predictedAQI;
    entry.pm25Sum += pt.predictedPM25;
    entry.count += 1;
    daysMap.set(day, entry);
  });

  daysMap.forEach((val, day) => {
    const avgAqi = Math.round(val.aqiSum / val.count);
    const avgPm25 = Math.round(val.pm25Sum / val.count);
    let status = 'Moderate';
    if (avgAqi <= 50) status = 'Good';
    else if (avgAqi <= 100) status = 'Moderate';
    else if (avgAqi <= 150) status = 'Unhealthy Sensitive';
    else if (avgAqi <= 200) status = 'Unhealthy';
    else if (avgAqi <= 300) status = 'Very Unhealthy';
    else status = 'Hazardous';

    dailyAverages.push({ day, avgAqi, avgPm25, status });
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              Atmospheric Trends & Predictive Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Planetary boundary layer meteorology and diurnal particulate trajectory analysis for {city}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveRange('24h')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeRange === '24h'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              24-Hour Horizon
            </button>
            <button
              onClick={() => setActiveRange('72h')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeRange === '72h'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              72-Hour Horizon
            </button>
          </div>
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <TrendChart
        dataPoints={displayedPoints}
        title={`${activeRange === '24h' ? '24-Hour' : '72-Hour'} Atmospheric Trajectory`}
        subtitle="Forward model incorporating solar flux convective mixing and nocturnal inversion depth"
      />

      {/* Multi-Day Daily Summary Strip */}
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
              Multi-Day Forecast Averages & Inversion Severity
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Open-Meteo European CAMS Inversion Physics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {dailyAverages.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                  {item.day}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {item.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-500 block">Predicted AQI</span>
                  <span className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{item.avgAqi}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Avg PM2.5</span>
                  <span className="text-lg font-bold font-display text-rose-600 dark:text-rose-400">{item.avgPm25} <span className="text-[10px] font-normal text-slate-400">µg/m³</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AQI Category Legend (Requirement #2) */}
      <div className="card-premium p-6 space-y-4">
        <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
          US EPA & WHO Air Quality Index (AQI) Classification Reference
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-sans">
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-1">
            <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
              <span>Good (0–50)</span>
              <span>PM2.5 ≤ 12 µg/m³</span>
            </div>
            <p className="text-emerald-900/80 dark:text-emerald-200/80 text-[11px]">Clean air. Ideal for all outdoor exertion and ventilation.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 space-y-1">
            <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
              <span>Moderate (51–100)</span>
              <span>PM2.5 12.1–35.4 µg/m³</span>
            </div>
            <p className="text-amber-900/80 dark:text-amber-200/80 text-[11px]">Acceptable quality. Sensitive individuals reduce extreme prolonged exertion.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50/70 dark:bg-orange-950/30 space-y-1">
            <div className="flex items-center justify-between font-bold text-orange-800 dark:text-orange-300">
              <span>Unhealthy for Sensitive (101–150)</span>
              <span>PM2.5 35.5–55.4 µg/m³</span>
            </div>
            <p className="text-orange-900/80 dark:text-orange-200/80 text-[11px]">Children, asthmatics, and seniors avoid heavy outdoor exercise.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 space-y-1">
            <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
              <span>Unhealthy (151–200)</span>
              <span>PM2.5 55.5–150.4 µg/m³</span>
            </div>
            <p className="text-rose-900/80 dark:text-rose-200/80 text-[11px]">General public experiences irritation. Fitted N95/KF94 masks recommended.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 space-y-1">
            <div className="flex items-center justify-between font-bold text-purple-800 dark:text-purple-300">
              <span>Very Unhealthy (201–300)</span>
              <span>PM2.5 150.5–250.4 µg/m³</span>
            </div>
            <p className="text-purple-900/80 dark:text-purple-200/80 text-[11px]">Severe smog alert. Cancel school outdoor sports; run indoor purifiers 24/7.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-950/40 space-y-1">
            <div className="flex items-center justify-between font-bold text-red-900 dark:text-red-200">
              <span>Hazardous (301–500+)</span>
              <span>PM2.5 &gt; 250.4 µg/m³</span>
            </div>
            <p className="text-red-900/80 dark:text-red-200/80 text-[11px]">Emergency conditions. Acute respiratory distress risk for all demographics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
