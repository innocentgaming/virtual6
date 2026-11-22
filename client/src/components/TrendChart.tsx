import React, { useState } from 'react';
import { Table, BarChart2, TrendingUp, Info } from 'lucide-react';
import { HourlyForecastPoint } from '../services/api';

interface TrendChartProps {
  dataPoints: HourlyForecastPoint[];
  title?: string;
  subtitle?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  dataPoints,
  title = '24-Hour Atmospheric AQI & Particulate Trajectory',
  subtitle = 'Diurnal planetary boundary layer convection & nocturnal thermal inversion dynamics'
}) => {
  const [activeMetric, setActiveMetric] = useState<'aqi' | 'pm_comparison' | 'gases'>('aqi');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTableView, setShowTableView] = useState<boolean>(false);

  // Take the first 24 hours
  const points = dataPoints && dataPoints.length > 0 ? dataPoints.slice(0, 24) : [];

  if (points.length === 0) {
    return (
      <div className="card-premium p-6 text-center text-slate-400">
        <p className="text-xs">No temporal sensor data currently available for trajectory chart.</p>
      </div>
    );
  }

  // Dimensions
  const width = 800;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value calculation based on active metric
  let maxValue = 500;
  if (activeMetric === 'aqi') {
    const maxData = Math.max(...points.map(p => p.predictedAQI), 100);
    maxValue = Math.min(Math.ceil(maxData / 50) * 50 + 50, 500);
  } else if (activeMetric === 'pm_comparison') {
    const maxData = Math.max(...points.map(p => Math.max(p.predictedPM25, p.predictedPM10)), 50);
    maxValue = Math.ceil(maxData / 50) * 50 + 50;
  } else {
    const maxData = Math.max(...points.map(p => Math.max(p.predictedNO2, p.predictedO3)), 50);
    maxValue = Math.ceil(maxData / 20) * 20 + 20;
  }

  // Helper coordinate projection
  const getX = (idx: number) => paddingLeft + (idx / (points.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (Math.min(val, maxValue) / maxValue) * chartHeight;

  // Build SVG Paths
  const aqiCoords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.predictedAQI) }));
  const pm25Coords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.predictedPM25) }));
  const pm10Coords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.predictedPM10) }));
  const no2Coords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.predictedNO2) }));
  const o3Coords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.predictedO3) }));

  const buildPathString = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  };

  const aqiPath = buildPathString(aqiCoords);
  const aqiAreaPath = `${aqiPath} L ${getX(points.length - 1)} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`;

  const pm25Path = buildPathString(pm25Coords);
  const pm10Path = buildPathString(pm10Coords);
  const no2Path = buildPathString(no2Coords);
  const o3Path = buildPathString(o3Coords);

  // Y-axis tick intervals (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map(fraction => Math.round(fraction * maxValue));

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="card-premium p-5 sm:p-6 space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveMetric('aqi')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeMetric === 'aqi'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              AQI Trend
            </button>
            <button
              onClick={() => setActiveMetric('pm_comparison')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeMetric === 'pm_comparison'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              PM2.5 vs PM10
            </button>
            <button
              onClick={() => setActiveMetric('gases')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeMetric === 'gases'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              NO₂ & Ozone
            </button>
          </div>

          <button
            onClick={() => setShowTableView(!showTableView)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title={showTableView ? 'Switch to interactive chart visual' : 'Switch to accessible data table'}
            aria-label="Toggle accessible data table"
          >
            {showTableView ? <BarChart2 className="w-4 h-4" /> : <Table className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showTableView ? (
        /* Accessible Data Table View (WCAG 2.2 AA) */
        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs font-mono" role="table">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 sticky top-0">
              <tr>
                <th className="px-3 py-2 font-semibold">Time</th>
                <th className="px-3 py-2 font-semibold">AQI</th>
                <th className="px-3 py-2 font-semibold">PM2.5 (µg/m³)</th>
                <th className="px-3 py-2 font-semibold">PM10 (µg/m³)</th>
                <th className="px-3 py-2 font-semibold">NO₂ (µg/m³)</th>
                <th className="px-3 py-2 font-semibold">Inversion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {points.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{p.timeLabel}</td>
                  <td className="px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400">{p.predictedAQI}</td>
                  <td className="px-3 py-2">{p.predictedPM25}</td>
                  <td className="px-3 py-2">{p.predictedPM10}</td>
                  <td className="px-3 py-2">{p.predictedNO2}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      p.isInversionActive ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {p.isInversionActive ? 'Trapped' : 'Well Mixed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* High-Definition SVG Line Chart */
        <div className="relative">
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-56 sm:h-64 select-none"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="chartAqiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chartHazardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y-Axis Labels */}
              {yTicks.map((val, i) => {
                const y = getY(val);
                return (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800/80"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Ticks (every 3 hours) */}
              {points.map((p, idx) => {
                if (idx % 3 !== 0 && idx !== points.length - 1) return null;
                const x = getX(idx);
                return (
                  <g key={idx}>
                    <line
                      x1={x}
                      y1={paddingTop + chartHeight}
                      x2={x}
                      y2={paddingTop + chartHeight + 4}
                      stroke="currentColor"
                      className="text-slate-300 dark:text-slate-700"
                    />
                    <text
                      x={x}
                      y={paddingTop + chartHeight + 16}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                    >
                      {p.timeLabel}
                    </text>
                  </g>
                );
              })}

              {/* Inversion Warning Zone Shading */}
              {points.map((p, idx) => {
                if (!p.isInversionActive) return null;
                const x = getX(idx);
                const stepWidth = chartWidth / (points.length - 1);
                return (
                  <rect
                    key={`inv-${idx}`}
                    x={x - stepWidth / 2}
                    y={paddingTop}
                    width={stepWidth}
                    height={chartHeight}
                    fill="#F59E0B"
                    opacity="0.05"
                  />
                );
              })}

              {/* Active Metric Lines */}
              {activeMetric === 'aqi' && (
                <>
                  <path d={aqiAreaPath} fill="url(#chartAqiGradient)" />
                  <path
                    d={aqiPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {activeMetric === 'pm_comparison' && (
                <>
                  <path
                    d={pm25Path}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d={pm10Path}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                  />
                </>
              )}

              {activeMetric === 'gases' && (
                <>
                  <path
                    d={no2Path}
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d={o3Path}
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Interactive Hover Columns */}
              {points.map((p, idx) => {
                const x = getX(idx);
                const stepWidth = chartWidth / (points.length - 1);
                return (
                  <rect
                    key={`hover-${idx}`}
                    x={x - stepWidth / 2}
                    y={paddingTop}
                    width={stepWidth}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                  />
                );
              })}

              {/* Hover Cursor Line & Point Indicator */}
              {hoveredIndex !== null && (
                <g>
                  <line
                    x1={getX(hoveredIndex)}
                    y1={paddingTop}
                    x2={getX(hoveredIndex)}
                    y2={paddingTop + chartHeight}
                    stroke="#0F172A"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className="dark:stroke-slate-200"
                  />
                  <circle
                    cx={getX(hoveredIndex)}
                    cy={
                      activeMetric === 'aqi'
                        ? getY(points[hoveredIndex].predictedAQI)
                        : activeMetric === 'pm_comparison'
                        ? getY(points[hoveredIndex].predictedPM25)
                        : getY(points[hoveredIndex].predictedNO2)
                    }
                    r="4.5"
                    fill="#059669"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Interactive Floating Tooltip */}
          {hoveredPoint && hoveredIndex !== null && (
            <div
              className="absolute pointer-events-none z-20 bg-slate-900/95 dark:bg-slate-950 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-xs font-mono space-y-1 backdrop-blur-md transition-all duration-150"
              style={{
                left: `${Math.min(Math.max(15, (hoveredIndex / (points.length - 1)) * 100), 75)}%`,
                top: '10px'
              }}
            >
              <div className="flex items-center justify-between gap-3 text-slate-300 font-bold border-b border-slate-800 pb-1">
                <span>{hoveredPoint.timeLabel} ({hoveredPoint.dayLabel})</span>
                <span className={`px-1 rounded text-[10px] ${
                  hoveredPoint.isInversionActive ? 'bg-amber-900 text-amber-200' : 'bg-emerald-900 text-emerald-200'
                }`}>
                  {hoveredPoint.isInversionActive ? 'Inversion Active' : 'Optimal'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1 text-[11px]">
                <div>AQI: <strong className="text-emerald-400">{hoveredPoint.predictedAQI}</strong></div>
                <div>PM2.5: <strong className="text-rose-400">{hoveredPoint.predictedPM25} µg</strong></div>
                <div>PM10: <strong className="text-amber-400">{hoveredPoint.predictedPM10} µg</strong></div>
                <div>NO₂: <strong className="text-orange-400">{hoveredPoint.predictedNO2} µg</strong></div>
              </div>
              {hoveredPoint.isOptimalVentilationWindow && (
                <div className="text-[10px] text-teal-300 font-sans pt-1 border-t border-slate-800">
                  ✨ Recommended Safe Indoor Ventilation Window
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          {activeMetric === 'aqi' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 rounded" />
              <span>EPA AQI Index</span>
            </div>
          )}
          {activeMetric === 'pm_comparison' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-600 rounded" />
                <span>PM2.5 (Fine Particulates)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-500 rounded border-dashed" />
                <span>PM10 (Inhalable Dust)</span>
              </div>
            </>
          )}
          {activeMetric === 'gases' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-orange-500 rounded" />
                <span>Nitrogen Dioxide (NO₂)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-teal-500 rounded" />
                <span>Ozone (O₃)</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 bg-amber-500/20 rounded-xs" />
            <span>Thermal Inversion Stagnation Window</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5" />
          <span>Physics-based diurnal solar mixing model</span>
        </div>
      </div>
    </div>
  );
};
