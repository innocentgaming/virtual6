import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Wrench, 
  CheckCircle, 
  Sparkles, 
  DollarSign, 
  HelpCircle, 
  Flame, 
  Wind, 
  Layers 
} from 'lucide-react';
import { simulateIAQ, IAQSimulationResult, AQIData } from '../services/api';

interface IAQSimulatorProps {
  aqiData: AQIData | null;
}

export const IAQSimulator: React.FC<IAQSimulatorProps> = ({ aqiData }) => {
  const [roomAreaSqFt, setRoomAreaSqFt] = useState<number>(200);
  const [ceilingHeightFt, setCeilingHeightFt] = useState<number>(9);
  const [airChangesPerHour, setAirChangesPerHour] = useState<number>(0.6);
  const [hasAirPurifier, setHasAirPurifier] = useState<boolean>(true);
  const [purifierCADR, setPurifierCADR] = useState<number>(350); // m3/h
  const [cookingWithGas, setCookingWithGas] = useState<boolean>(true);
  const [hasExhaustOn, setHasExhaustOn] = useState<boolean>(true);
  const [incenseOrCandles, setIncenseOrCandles] = useState<boolean>(false);
  const [drySweeping, setDrySweeping] = useState<boolean>(false);

  const [simulationResult, setSimulationResult] = useState<IAQSimulationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'simulator' | 'diy'>('simulator');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Convert sq ft & ft height to m3
  const roomVolumeM3 = Math.round((roomAreaSqFt * 0.0929) * (ceilingHeightFt * 0.3048));
  const outdoorPM25 = aqiData?.pollutants.pm25 || 185;

  const runSimulation = async () => {
    try {
      const res = await simulateIAQ({
        roomVolumeM3,
        outdoorPM25,
        airChangesPerHour,
        hasAirPurifier,
        purifierCADR_M3H: purifierCADR,
        indoorSources: {
          cookingWithGas,
          hasExhaustOn,
          incenseOrCandles,
          drySweeping,
          smokingOrVaping: false
        },
        simulationDurationMinutes: 60
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Failed to run simulation:', err);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [roomVolumeM3, outdoorPM25, airChangesPerHour, hasAirPurifier, purifierCADR, cookingWithGas, hasExhaustOn, incenseOrCandles, drySweeping]);

  // Render chart on canvas
  useEffect(() => {
    if (!simulationResult || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const points = simulationResult.timelinePoints;
    const maxPM25 = Math.max(...points.map(p => p.indoorPM25), 60);

    // Draw grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const labelVal = Math.round(maxPM25 - (maxPM25 / 4) * i);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${labelVal}`, 8, y + 3);
    }

    // Draw WHO Safe Target Line (15 ug/m3)
    const whoY = padding + graphHeight - (15 / maxPM25) * graphHeight;
    ctx.strokeStyle = '#10b981';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, whoY);
    ctx.lineTo(width - padding, whoY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#10b981';
    ctx.fillText('WHO Safe (15 µg/m³)', width - padding - 110, whoY - 5);

    // Draw Indoor PM2.5 Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((pt, index) => {
      const x = padding + (index / (points.length - 1)) * graphWidth;
      const y = padding + graphHeight - (pt.indoorPM25 / maxPM25) * graphHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Fill gradient under curve
    ctx.lineTo(width - padding, padding + graphHeight);
    ctx.lineTo(padding, padding + graphHeight);
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('0 min', padding, height - 10);
    ctx.fillText('30 min', padding + graphWidth / 2 - 15, height - 10);
    ctx.fillText('60 min', width - padding - 35, height - 10);
  }, [simulationResult]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Indoor Air Quality (IAQ) Physics Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('diy')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'diy'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>DIY Corsi-Rosenthal Box Blueprint ($35)</span>
        </button>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Room & Source Parameters</span>
            </h3>

            {/* Room Area */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Room Size: {roomAreaSqFt} sq ft ({roomVolumeM3} m³)</span>
              </div>
              <input
                type="range"
                min="80"
                max="600"
                step="20"
                value={roomAreaSqFt}
                onChange={(e) => setRoomAreaSqFt(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Infiltration ACH */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Draftiness / Leakiness: {airChangesPerHour} ACH</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={airChangesPerHour}
                onChange={(e) => setAirChangesPerHour(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                (0.3 = tight sealed room, 1.2 = drafty older windows)
              </span>
            </div>

            {/* Purifier Toggle & CADR */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer">
                <span>Air Purifier Operational</span>
                <input
                  type="checkbox"
                  checked={hasAirPurifier}
                  onChange={(e) => setHasAirPurifier(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
              </label>

              {hasAirPurifier && (
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Clean Air Delivery Rate: {purifierCADR} m³/h</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="650"
                    step="50"
                    value={purifierCADR}
                    onChange={(e) => setPurifierCADR(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-[10px] text-emerald-400/80 block">
                    (Standard commercial: ~250 m³/h; DIY Corsi Box: ~500+ m³/h)
                  </span>
                </div>
              )}
            </div>

            {/* Indoor Pollution Activities */}
            <div className="space-y-2 pt-2 border-t border-slate-700/60">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Indoor Combustion & Dust Activities
              </span>

              <label className="flex items-center justify-between text-xs text-slate-300">
                <span>Gas Stove Active</span>
                <input
                  type="checkbox"
                  checked={cookingWithGas}
                  onChange={(e) => setCookingWithGas(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
              </label>

              {cookingWithGas && (
                <label className="flex items-center justify-between text-xs text-slate-400 pl-3 border-l-2 border-slate-700">
                  <span>Range Exhaust Hood Running</span>
                  <input
                    type="checkbox"
                    checked={hasExhaustOn}
                    onChange={(e) => setHasExhaustOn(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500"
                  />
                </label>
              )}

              <label className="flex items-center justify-between text-xs text-slate-300">
                <span>Incense Sticks / Scented Candles</span>
                <input
                  type="checkbox"
                  checked={incenseOrCandles}
                  onChange={(e) => setIncenseOrCandles(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300">
                <span>Dry Broom Sweeping (Re-suspension)</span>
                <input
                  type="checkbox"
                  checked={drySweeping}
                  onChange={(e) => setDrySweeping(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Results & Canvas Graph */}
          <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Indoor PM2.5 Concentration Decay Curve (60 Minutes)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time single-compartment mass balance response
                  </p>
                </div>

                {simulationResult && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      Final: <strong className="text-emerald-400 text-sm">{simulationResult.finalPM25} µg/m³</strong>
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      -{simulationResult.percentReduction}%
                    </span>
                  </div>
                )}
              </div>

              {/* Canvas Graph */}
              <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-700/80">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={220}
                  className="w-full h-auto block"
                />
              </div>

              {/* Status summary */}
              {simulationResult && (
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Peak Indoor PM2.5</span>
                    <span className="text-base font-black text-rose-400">{simulationResult.peakPM25} µg/m³</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Time to WHO Safe</span>
                    <span className="text-base font-black text-emerald-400">
                      {simulationResult.timeToReachSafeThresholdMinutes ? `${simulationResult.timeToReachSafeThresholdMinutes} mins` : '> 60 mins'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Room Status</span>
                    <span className="text-base font-black text-slate-200">{simulationResult.airQualityStatus}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Targeted IAQ Hacks */}
            {simulationResult && simulationResult.actionableHacks.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-700/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  High-Impact Indoor Hacks for Your Current Setup
                </h4>
                <div className="space-y-2">
                  {simulationResult.actionableHacks.map((hack, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{hack}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* DIY Corsi-Rosenthal Box Blueprint */
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">The Corsi-Rosenthal Box Blueprint</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  CADR ~450+ CFM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Invented by environmental engineer Dr. Richard Corsi and Jim Rosenthal. Outperforms $300 commercial HEPA purifiers for just $35-$45.
              </p>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Estimated Cost Comparison</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white">$35 - $45</span>
                <span className="text-xs text-slate-400 line-through">$300+ HEPA</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Materials */}
            <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Bill of Materials</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1x Standard 20" Box Fan:</strong> 3-speed household box fan ($18–$22).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>4x MERV 13 Filters:</strong> 20" x 20" x 1" or 2" pleated furnace filters ($5–$7 each).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Cardboard Base & Shroud:</strong> Scrap delivery box cardboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Duct Tape:</strong> Standard heavy-duty utility tape.</span>
                </li>
              </ul>
            </div>

            {/* Assembly Steps */}
            <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>5-Step Assembly Instructions</span>
              </h4>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                <li><strong>Cube Formation:</strong> Form a 4-sided cube with the 4 filters. Make sure the arrows on all filters point <em>inward</em>.</li>
                <li><strong>Bottom Seal:</strong> Tape a 20" x 20" cardboard square to seal the bottom surface completely.</li>
                <li><strong>Top Fan Mount:</strong> Place the box fan on top, blowing <em>upward/outward</em> away from the cube.</li>
                <li><strong>The Cardboard Shroud (Crucial):</strong> Cut a 15" circular hole in a piece of cardboard and tape it over the front grill of the fan. This stops tip vortex leakage and boosts airflow by 40%.</li>
                <li><strong>Air-Tight Taping:</strong> Generously tape all seams and edges so no air bypasses the filters.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
