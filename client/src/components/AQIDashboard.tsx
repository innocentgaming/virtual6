import React, { useState, useEffect } from 'react';
import { 
  CloudFog, 
  Wind, 
  Thermometer, 
  Droplets, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  Compass,
  Radio,
  Gauge,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { AQIData, HourlyForecastPoint, fetchPredictiveSmogForecast } from '../services/api';
import { AQIGauge } from './AQIGauge';
import { AQIMetricCard } from './AQIMetricCard';
import { PollutantCard } from './PollutantCard';
import { InversionAlert } from './InversionAlert';
import { TrendChart } from './TrendChart';
import { HealthInsightCard } from './HealthInsightCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { AtmosphericCanvas } from './AtmosphericCanvas';
import { LungDepositionVisualizer } from './LungDepositionVisualizer';
import { NeighborhoodMap } from './NeighborhoodMap';
import { BiomassSmokeTracker } from './BiomassSmokeTracker';

interface AQIDashboardProps {
  data: AQIData | null;
  isLoading: boolean;
  onRefresh?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AQIDashboard: React.FC<AQIDashboardProps> = ({ 
  data, 
  isLoading, 
  onRefresh, 
  onNavigateTab 
}) => {
  const [forecastPoints, setForecastPoints] = useState<HourlyForecastPoint[]>([]);
  const [forecastLoading, setForecastLoading] = useState<boolean>(false);

  // Load 24-hour forecast data for the trend chart
  useEffect(() => {
    if (data?.city) {
      setForecastLoading(true);
      fetchPredictiveSmogForecast(data.city)
        .then(res => {
          if (res && res.forecastPoints) {
            setForecastPoints(res.forecastPoints);
          }
        })
        .catch(err => {
          console.warn('Could not load forecast trajectory:', err);
        })
        .finally(() => {
          setForecastLoading(false);
        });
    }
  }, [data?.city]);

  if (isLoading || !data) {
    return <LoadingSkeleton />;
  }

  // Calculate WHO multipliers
  const pm25WhoMultiplier = (data.pollutants.pm25 / 15).toFixed(1);
  const pm10WhoMultiplier = (data.pollutants.pm10 / 45).toFixed(1);

  // Status colors based on PM2.5
  const getPM25Status = (): 'emerald' | 'amber' | 'orange' | 'red' | 'purple' => {
    if (data.pollutants.pm25 <= 15) return 'emerald';
    if (data.pollutants.pm25 <= 35) return 'amber';
    if (data.pollutants.pm25 <= 75) return 'orange';
    if (data.pollutants.pm25 <= 150) return 'red';
    return 'purple';
  };

  const formattedTime = new Date(data.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Meteorological Thermal Inversion Alert Banner */}
      <InversionAlert
        isInversionLikely={data.isInversionLikely}
        safeVentilationHours={data.safeVentilationHours}
        temperature={data.temperature}
        windSpeed={data.windSpeed}
        humidity={data.humidity}
        onExplorePhysics={() => onNavigateTab && onNavigateTab('air-quality')}
      />

      {/* 2. Executive Hero Grid: AQI Centerpiece + Key Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Centerpiece AQI Dial Instrument (5 Cols) */}
        <div className="lg:col-span-5 card-premium p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>LIVE TELEMETRY</span>
            </div>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              Observed {formattedTime}
            </span>
          </div>

          {/* Animated SVG Centerpiece Gauge */}
          <div className="py-2">
            <AQIGauge
              aqi={data.aqi}
              level={data.level}
              primaryPollutant={data.primaryPollutant || 'PM2.5'}
              city={data.city}
              country={data.country}
              lastUpdated={formattedTime}
            />
          </div>

          {/* Notice Alert Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{data.smogAlertNotice}</span>
            </div>
          </div>

          {/* Weather strip at the bottom of the card */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] uppercase font-semibold">
                <Thermometer className="w-3 h-3 text-sky-500" />
                <span>Temp</span>
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
                {data.temperature}°C
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] uppercase font-semibold">
                <Droplets className="w-3 h-3 text-cyan-500" />
                <span>Humidity</span>
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
                {data.humidity}%
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] uppercase font-semibold">
                <Wind className="w-3 h-3 text-teal-500" />
                <span>Surface</span>
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
                {data.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Primary Metric Cards Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PM2.5 Card */}
            <AQIMetricCard
              title="Fine Particulates"
              symbol="PM2.5"
              value={data.pollutants.pm25}
              unit="µg/m³"
              statusLabel={Number(pm25WhoMultiplier) > 1 ? `${pm25WhoMultiplier}× WHO Limit` : 'WHO Safe'}
              statusColor={getPM25Status()}
              benchmarkText="WHO 24h Threshold: ≤ 15 µg/m³"
              progressPercent={Math.min((data.pollutants.pm25 / 150) * 100, 100)}
              description="Microscopic soot capable of deep alveolar penetration."
              subtext="Critical Driver"
            />

            {/* PM10 Card */}
            <AQIMetricCard
              title="Inhalable Dust"
              symbol="PM10"
              value={data.pollutants.pm10}
              unit="µg/m³"
              statusLabel={Number(pm10WhoMultiplier) > 1 ? `${pm10WhoMultiplier}× WHO Limit` : 'WHO Safe'}
              statusColor={data.pollutants.pm10 > 45 ? 'amber' : 'emerald'}
              benchmarkText="WHO 24h Threshold: ≤ 45 µg/m³"
              progressPercent={Math.min((data.pollutants.pm10 / 250) * 100, 100)}
              description="Coarse road dust, construction fly ash, and silica."
              subtext="Upper Airways"
            />

            {/* Nitrogen Dioxide Card */}
            <AQIMetricCard
              title="Nitrogen Dioxide"
              symbol="NO₂"
              value={data.pollutants.no2}
              unit="µg/m³"
              statusLabel={data.pollutants.no2 > 25 ? 'Combustion' : 'Normal'}
              statusColor={data.pollutants.no2 > 25 ? 'orange' : 'emerald'}
              benchmarkText="WHO 24h Threshold: ≤ 25 µg/m³"
              progressPercent={Math.min((data.pollutants.no2 / 100) * 100, 100)}
              description="Heavy diesel exhaust & vehicle combustion by-product."
              subtext="Corridor Gas"
            />

            {/* Ozone Card */}
            <AQIMetricCard
              title="Photochemical Ozone"
              symbol="O₃"
              value={data.pollutants.o3}
              unit="µg/m³"
              statusLabel={data.pollutants.o3 > 100 ? 'Elevated' : 'Sub-Threshold'}
              statusColor={data.pollutants.o3 > 100 ? 'red' : 'emerald'}
              benchmarkText="WHO 8h Threshold: ≤ 100 µg/m³"
              progressPercent={Math.min((data.pollutants.o3 / 160) * 100, 100)}
              description="Formed by photochemical solar reactions with VOCs."
              subtext="Respiratory Oxidant"
            />
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="card-premium p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Looking to build a low-cost $35 DIY Air Purifier or optimize your commute schedule?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onNavigateTab && (
                <>
                  <button
                    onClick={() => onNavigateTab('indoor-air')}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 transition shadow-2xs"
                  >
                    DIY Purifier CADR
                  </button>
                  <button
                    onClick={() => onNavigateTab('routine')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition shadow-2xs flex items-center gap-1"
                  >
                    <span>Routine Optimizer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 24-Hour Diurnal Trend & Trajectory Chart */}
      <TrendChart
        dataPoints={forecastPoints}
        title="24-Hour Atmospheric AQI & Particulate Trajectory"
        subtitle="Diurnal solar convection peak vs nocturnal thermal boundary layer stagnation"
      />

      {/* 4. Chemical Spectrometry Grid: CO & SO2 Gas Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
              Secondary Chemical Spectrometry
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Open-Meteo European CAMS Environmental Model
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PollutantCard
            name="Carbon Monoxide"
            formula="CO"
            value={data.pollutants.co}
            unit="µg/m³"
            safeThreshold={4000}
            category="Incomplete Combustion"
            description="Generated by biomass burning, wood heating, and idling gasoline vehicles."
            sourceType="Solid Fuels"
          />

          <PollutantCard
            name="Sulfur Dioxide"
            formula="SO₂"
            value={data.pollutants.so2}
            unit="µg/m³"
            safeThreshold={40}
            category="Heavy Fuel Combustion"
            description="From industrial coal combustion, diesel generators, and heavy fuel oil."
            sourceType="Industrial"
          />

          <PollutantCard
            name="Ozone (Ground Level)"
            formula="O₃"
            value={data.pollutants.o3}
            unit="µg/m³"
            safeThreshold={100}
            category="Secondary Oxidant"
            description="Formed by VOCs and NOx reacting under ultraviolet radiation."
            sourceType="Photochemical"
          />

          <PollutantCard
            name="Nitrogen Dioxide"
            formula="NO₂"
            value={data.pollutants.no2}
            unit="µg/m³"
            safeThreshold={25}
            category="Traffic Combustion"
            description="Emitted directly from vehicular exhausts and power generation plants."
            sourceType="Diesel & Power"
          />
        </div>
      </div>

      {/* 5. Personalized Clinical Health Recommendations */}
      <HealthInsightCard
        aqi={data.aqi}
        isInversionActive={data.isInversionLikely}
        safeVentilationHour={data.safeVentilationHours[0]}
        onOpenRxSheet={() => onNavigateTab && onNavigateTab('health')}
      />

      {/* 6. Atmospheric Physics Interactive Simulation Canvas */}
      <section aria-label="Atmospheric Physics Particle Simulation">
        <AtmosphericCanvas 
          aqi={data.aqi} 
          isInversionLikely={data.isInversionLikely} 
        />
      </section>
    </div>
  );
};
