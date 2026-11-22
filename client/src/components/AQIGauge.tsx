import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AQIGaugeProps {
  aqi: number;
  level: string;
  primaryPollutant?: string;
  city?: string;
  country?: string;
  lastUpdated?: string;
}

export const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#059669'; // Emerald
  if (aqi <= 100) return '#D97706'; // Amber
  if (aqi <= 150) return '#EA580C'; // Orange
  if (aqi <= 200) return '#DC2626'; // Red
  if (aqi <= 300) return '#7C3AED'; // Purple
  return '#991B1B'; // Maroon / Hazardous
};

export const getAQIBgLight = (aqi: number) => {
  if (aqi <= 50) return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';
  if (aqi <= 100) return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
  if (aqi <= 150) return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50';
  if (aqi <= 200) return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50';
  if (aqi <= 300) return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50';
  return 'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800/60';
};

export const AQIGauge: React.FC<AQIGaugeProps> = ({
  aqi,
  level,
  primaryPollutant = 'PM2.5',
  city,
  country,
  lastUpdated
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Smooth number counter transition
  useEffect(() => {
    let start = 0;
    const end = Math.min(Math.max(aqi, 0), 500);
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 800; // ms
    const startTime = performance.now();

    const animateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * end));

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [aqi]);

  // SVG Gauge calculations
  // Gauge spans 240 degrees (from 150 deg to 390 deg)
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360); // 240-degree open gauge
  const percentage = Math.min(Math.max(aqi, 0) / 500, 1);
  const strokeDashoffset = arcLength - (arcLength * percentage);
  const strokeColor = getAQIColor(aqi);

  // Status icon
  const getIcon = () => {
    if (aqi <= 100) return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (aqi <= 200) return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    return <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />;
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Gauge SVG Container */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 220 220"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="aqiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="25%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="75%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            strokeDashoffset="0"
            transform="rotate(-30 110 110)"
          />

          {/* Active Colored Arc */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-30 110 110)"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: aqi > 200 ? 'url(#softGlow)' : undefined
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-0.5">
            US EPA AQI
          </span>

          <div className="flex items-baseline justify-center">
            <span
              className="text-6xl font-extrabold tracking-tight font-display transition-colors duration-300"
              style={{ color: strokeColor }}
            >
              {displayValue}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs transition-colors duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            {getIcon()}
            <span className="font-medium text-slate-900 dark:text-slate-100">{level}</span>
          </div>
        </div>
      </div>

      {/* Primary Pollutant & Location Sub-label */}
      <div className="mt-2 flex flex-col items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        {city && (
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            {city}{country ? `, ${country}` : ''}
          </span>
        )}
        <div className="flex items-center gap-2 text-[11px]">
          <span>Primary: <strong className="text-slate-700 dark:text-slate-300">{primaryPollutant}</strong></span>
          <span>•</span>
          <span>Scale: 0–500</span>
          {lastUpdated && (
            <>
              <span>•</span>
              <span>Updated {lastUpdated}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
