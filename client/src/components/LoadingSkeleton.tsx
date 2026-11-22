import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading atmospheric telemetry">
      {/* Top Banner Skeleton */}
      <div className="h-24 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 shimmer-active" />

      {/* Main Grid: Gauge + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gauge card */}
        <div className="lg:col-span-5 card-premium p-6 flex flex-col items-center justify-center space-y-4 min-h-[380px]">
          <div className="w-48 h-48 rounded-full border-8 border-slate-200 dark:border-slate-800 shimmer-active" />
          <div className="w-32 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="w-48 h-4 rounded-lg bg-slate-100 dark:bg-slate-800/80" />
        </div>

        {/* Metric cards grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-premium p-5 space-y-3 min-h-[175px]">
              <div className="flex justify-between items-center">
                <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-16 h-4 rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="w-24 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="w-full h-2 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="w-3/4 h-3 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="card-premium p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-48 h-5 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="w-32 h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="w-full h-56 rounded-xl bg-slate-100 dark:bg-slate-800/50 shimmer-active" />
      </div>
    </div>
  );
};
