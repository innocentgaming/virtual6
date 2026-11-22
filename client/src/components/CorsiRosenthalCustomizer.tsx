import React, { useState } from 'react';
import { 
  Sliders, 
  Wind, 
  Wrench, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';
import { playTactileClick } from './AudioEffects';

export const CorsiRosenthalCustomizer: React.FC = () => {
  const [fanSizeInches, setFanSizeInches] = useState<number>(20);
  const [filterThicknessInches, setFilterThicknessInches] = useState<number>(1);
  const [filterGeometry, setFilterGeometry] = useState<'4_cube' | '5_cube' | '2_wedge'>('4_cube');

  // Mathematical modeling of CADR and pressure drop based on geometry
  const numFilters = filterGeometry === '4_cube' ? 4 : filterGeometry === '5_cube' ? 5 : 2;
  const singleFilterAreaSqFt = (fanSizeInches * fanSizeInches) / 144;
  const pleatMultiplier = filterThicknessInches === 1 ? 2.5 : filterThicknessInches === 2 ? 4.2 : 7.0;
  const totalEffectiveMediaAreaSqFt = Number((numFilters * singleFilterAreaSqFt * pleatMultiplier).toFixed(1));

  // CADR (CFM) calculation
  const baseFanCFM = fanSizeInches === 16 ? 190 : fanSizeInches === 20 ? 250 : 340;
  const flowEfficiency = filterGeometry === '4_cube' ? 0.92 : filterGeometry === '5_cube' ? 0.96 : 0.74;
  const calculatedCADR = Math.round(baseFanCFM * flowEfficiency * (filterThicknessInches >= 2 ? 1.08 : 1.0));
  const calculatedCADR_M3H = Math.round(calculatedCADR * 1.699);

  // Pressure drop rating
  const pressureRisk = filterGeometry === '2_wedge' 
    ? 'Moderate Motor Load (Higher resistance)' 
    : 'Optimal Low Resistance (Motor runs cool)';

  // Build cost
  const fanCost = fanSizeInches === 16 ? 16 : fanSizeInches === 20 ? 20 : 28;
  const filterCost = filterThicknessInches === 1 ? numFilters * 4.5 : filterThicknessInches === 2 ? numFilters * 7.0 : numFilters * 12.0;
  const totalCost = Math.round(fanCost + filterCost + 4); // +4 for duct tape & shroud

  return (
    <div className="card-premium p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
            Parametric Purifier Sizing Calculator & Aerodynamic Modeler
          </h4>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
          Estimated Build: ${totalCost}
        </span>
      </div>

      {/* Sizing Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fan Size */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Fan Chassis Size</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[16, 20, 24].map(size => (
              <button
                key={size}
                onClick={() => {
                  playTactileClick(750, 0.02);
                  setFanSizeInches(size);
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                  fanSizeInches === size
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {size}" Fan
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 block">20" standard offers best cost/CFM</span>
        </div>

        {/* Filter Pleat Thickness */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">MERV-13 Pleat Depth</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 4].map(thick => (
              <button
                key={thick}
                onClick={() => {
                  playTactileClick(750, 0.02);
                  setFilterThicknessInches(thick);
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterThicknessInches === thick
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {thick}" Pleat
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 block">2" pleats double effective surface area</span>
        </div>

        {/* Geometry Configuration */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Assembly Geometry</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: '4_cube' as const, label: '4-Cube' },
              { id: '5_cube' as const, label: '5-Cube' },
              { id: '2_wedge' as const, label: '2-Wedge' }
            ].map(geom => (
              <button
                key={geom.id}
                onClick={() => {
                  playTactileClick(750, 0.02);
                  setFilterGeometry(geom.id);
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterGeometry === geom.id
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {geom.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 block">4-cube is the golden standard</span>
        </div>
      </div>

      {/* Aerodynamic Simulation Results Output */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">Clean Air Delivery (CADR)</span>
          <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 my-0.5 block">{calculatedCADR} CFM</span>
          <span className="text-[10px] text-slate-500 font-mono">({calculatedCADR_M3H} m³/h)</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">Effective Media Area</span>
          <span className="text-2xl font-bold font-display text-sky-600 dark:text-sky-400 my-0.5 block">{totalEffectiveMediaAreaSqFt} ft²</span>
          <span className="text-[10px] text-slate-500 font-mono">Total pleated surface</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">Backpressure Risk</span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 my-1 block">{pressureRisk}</span>
          <span className="text-[10px] text-slate-500 font-mono">Motor lifespan: 3+ yrs</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">Component Cost</span>
          <span className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 my-0.5 block">${totalCost}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">vs $350 Commercial HEPA</span>
        </div>
      </div>
    </div>
  );
};
