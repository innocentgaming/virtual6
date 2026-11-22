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
    <div className="bg-slate-950/80 p-5 rounded-xl border border-white/10 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Custom Parametric Purifier Sizing Calculator & Pressure Modeler
          </h4>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
          Estimated Build: ${totalCost}
        </span>
      </div>

      {/* Sizing Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fan Size */}
        <div>
          <label className="text-[11px] font-mono text-slate-300 block mb-1">Fan Chassis Size</label>
          <div className="flex gap-1.5">
            {[16, 20, 24].map(sz => (
              <button
                key={sz}
                onClick={() => {
                  playTactileClick(700, 0.02);
                  setFanSizeInches(sz);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition border ${
                  fanSizeInches === sz
                    ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {sz}" Box Fan
              </button>
            ))}
          </div>
        </div>

        {/* Filter Thickness */}
        <div>
          <label className="text-[11px] font-mono text-slate-300 block mb-1">MERV 13 Pleat Thickness</label>
          <div className="flex gap-1.5">
            {[1, 2, 4].map(th => (
              <button
                key={th}
                onClick={() => {
                  playTactileClick(700, 0.02);
                  setFilterThicknessInches(th);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition border ${
                  filterThicknessInches === th
                    ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {th}" Deep Pleat
              </button>
            ))}
          </div>
        </div>

        {/* Geometry Configuration */}
        <div>
          <label className="text-[11px] font-mono text-slate-300 block mb-1">Cubic Geometry</label>
          <select
            value={filterGeometry}
            onChange={(e) => {
              playTactileClick(700, 0.02);
              setFilterGeometry(e.target.value as any);
            }}
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
          >
            <option value="4_cube">4-Filter Standard Cube</option>
            <option value="5_cube">5-Filter Compactor (Extra quiet)</option>
            <option value="2_wedge">2-Filter Mini Wedge (Compact)</option>
          </select>
        </div>
      </div>

      {/* Physics Results Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
          <span className="text-[10px] uppercase text-slate-400 block">Clean Air Rate (CADR)</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5 block">{calculatedCADR} CFM</span>
          <span className="text-[10px] text-slate-500">{calculatedCADR_M3H} m³/hour</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
          <span className="text-[10px] uppercase text-slate-400 block">Total Filter Surface Area</span>
          <span className="text-xl font-black text-cyan-400 mt-0.5 block">{totalEffectiveMediaAreaSqFt} sq ft</span>
          <span className="text-[10px] text-slate-500">Low face velocity</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
          <span className="text-[10px] uppercase text-slate-400 block">Motor Thermal Safety</span>
          <span className="text-xs font-bold text-slate-200 mt-1 block truncate">{pressureRisk.split(' (')[0]}</span>
          <span className="text-[10px] text-slate-500">Static pressure balance</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
          <span className="text-[10px] uppercase text-slate-400 block">Commercial Equivalent</span>
          <span className="text-xl font-black text-white mt-0.5 block">$450 HEPA</span>
          <span className="text-[10px] text-emerald-400">Save ~${450 - totalCost}</span>
        </div>
      </div>
    </div>
  );
};
