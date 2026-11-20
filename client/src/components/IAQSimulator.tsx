import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Wrench, 
  CheckCircle, 
  Sparkles, 
  Layers, 
  Table as TableIcon, 
  LineChart,
  ShieldCheck,
  Flame,
  Fan,
  Wind
} from 'lucide-react';
import { simulateIAQ, IAQSimulationResult, AQIData } from '../services/api';
import { CorsiRosenthalBlueprint } from './CorsiRosenthalBlueprint';
import { playTactileClick } from './AudioEffects';

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
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
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
    if (viewMode !== 'chart' || !simulationResult || !canvasRef.current) return;
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const labelVal = Math.round(maxPM25 - (maxPM25 / 4) * i);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${labelVal}`, 8, y + 3);
    }

    // Draw WHO Safe Target Line (15 ug/m3)
    const whoY = padding + graphHeight - (15 / maxPM25) * graphHeight;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, whoY);
    ctx.lineTo(width - padding, whoY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.fillText('WHO Safe (15 µg/m³)', width - padding - 110, whoY - 5);

    // Draw Indoor PM2.5 Decay Curve
    ctx.beginPath();
    points.forEach((p, idx) => {
      const x = padding + (p.minute / 60) * graphWidth;
      const y = padding + graphHeight - (p.indoorPM25 / maxPM25) * graphHeight;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill gradient under curve
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.lineTo(padding + graphWidth, padding + graphHeight);
    ctx.lineTo(padding, padding + graphHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Time Axis Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono';
    for (let m = 0; m <= 60; m += 15) {
      const x = padding + (m / 60) * graphWidth;
      ctx.fillText(`${m}m`, x - 8, height - 12);
    }
  }, [simulationResult, viewMode]);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090c10] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white">
              Indoor Air Quality (IAQ) Differential Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Single-compartment mass balance differential solver: dC/dt = (P·a·C_out)/V + S/V - (a + k_dep + CADR/V)·C
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              playTactileClick(800, 0.02);
              setActiveTab('simulator');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'simulator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Differential Solver</span>
          </button>

          <button
            onClick={() => {
              playTactileClick(900, 0.02);
              setActiveTab('diy');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'diy'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>DIY $35 Filter Blueprint</span>
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-[#090c10] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="pb-3 border-b border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300">
                Compartment Parameters
              </span>
              <span className="text-xs font-mono text-emerald-400">
                Volume: {roomVolumeM3} m³
              </span>
            </div>

            {/* Room Area Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Room Floor Area:</span>
                <span className="text-white font-bold">{roomAreaSqFt} sq ft</span>
              </div>
              <input
                type="range"
                min="80"
                max="800"
                step="20"
                value={roomAreaSqFt}
                onChange={(e) => {
                  playTactileClick(600, 0.01);
                  setRoomAreaSqFt(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Infiltration Rate ACH Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Air Exchange Rate (a):</span>
                <span className="text-white font-bold">{airChangesPerHour} ACH</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.1"
                value={airChangesPerHour}
                onChange={(e) => {
                  playTactileClick(650, 0.01);
                  setAirChangesPerHour(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                0.2 = Sealed weatherstripped room • 1.5 = Drafty / open cracks
              </p>
            </div>

            {/* Filtration Toggle & CADR */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fan className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-white">Air Filtration Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick(750, 0.02);
                    setHasAirPurifier(!hasAirPurifier);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                    hasAirPurifier ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    hasAirPurifier ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {hasAirPurifier && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Clean Air Delivery (CADR):</span>
                    <span className="text-emerald-400 font-bold">{purifierCADR} m³/h</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="650"
                    step="25"
                    value={purifierCADR}
                    onChange={(e) => {
                      playTactileClick(700, 0.01);
                      setPurifierCADR(Number(e.target.value));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Corsi-Rosenthal Box ≈ 350-420 m³/h • Small HEPA ≈ 180 m³/h
                  </span>
                </div>
              )}
            </div>

            {/* Indoor Pollution Emission Sources */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Indoor Combustion & Dust Sources
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick(600, 0.02);
                    setCookingWithGas(!cookingWithGas);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    cookingWithGas 
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' 
                      : 'bg-slate-950/60 border-white/5 text-slate-400'
                  }`}
                >
                  <span>Gas Cooking</span>
                  <Flame className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick(600, 0.02);
                    setHasExhaustOn(!hasExhaustOn);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    hasExhaustOn 
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                      : 'bg-slate-950/60 border-white/5 text-slate-400'
                  }`}
                >
                  <span>Kitchen Hood ON</span>
                  <Wind className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick(600, 0.02);
                    setIncenseOrCandles(!incenseOrCandles);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    incenseOrCandles 
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                      : 'bg-slate-950/60 border-white/5 text-slate-400'
                  }`}
                >
                  <span>Incense / Candles</span>
                  <Flame className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick(600, 0.02);
                    setDrySweeping(!drySweeping);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    drySweeping 
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                      : 'bg-slate-950/60 border-white/5 text-slate-400'
                  }`}
                >
                  <span>Dry Broom Sweeping</span>
                  <Wind className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Visualization Column (7 cols) */}
          <div className="lg:col-span-7 bg-[#090c10] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              {/* Header with Chart vs Table view switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                    Indoor PM2.5 Decay Profile (60-Minute Forward Run)
                  </h3>
                </div>

                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => {
                      playTactileClick(700, 0.02);
                      setViewMode('chart');
                    }}
                    className={`p-1.5 rounded text-xs transition ${
                      viewMode === 'chart' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Interactive Curve Chart"
                  >
                    <LineChart className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick(700, 0.02);
                      setViewMode('table');
                    }}
                    className={`p-1.5 rounded text-xs transition ${
                      viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Accessible Table View (WCAG 2.2 AA)"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* View Output */}
              <div className="mt-4">
                {viewMode === 'chart' ? (
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-white/10">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={240}
                      className="w-full h-auto block"
                      aria-label="Indoor particulate decay curve over 60 minutes"
                      role="img"
                    />
                  </div>
                ) : (
                  <div 
                    className="bg-slate-950/80 rounded-xl p-3 border border-white/10 max-h-[250px] overflow-y-auto"
                    tabIndex={0}
                    role="region"
                    aria-label="Indoor PM2.5 Time Series Table"
                  >
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-1 px-2">Time (Min)</th>
                          <th className="py-1 px-2">Indoor PM2.5</th>
                          <th className="py-1 px-2">WHO Safe</th>
                          <th className="py-1 px-2">Compliance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {simulationResult?.timelinePoints.filter((_, i) => i % 5 === 0).map(pt => (
                          <tr key={pt.minute}>
                            <td className="py-1 px-2">{pt.minute} min</td>
                            <td className="py-1 px-2 text-sky-400 font-bold">{pt.indoorPM25} µg/m³</td>
                            <td className="py-1 px-2 text-emerald-400">15 µg/m³</td>
                            <td className="py-1 px-2">
                              {pt.indoorPM25 <= 15 ? (
                                <span className="text-emerald-400 font-bold">✓ Compliant</span>
                              ) : (
                                <span className="text-amber-400">Elevated</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Simulation Result Stat Boxes */}
              {simulationResult && (
                <div className="grid grid-cols-3 gap-3 mt-4 text-center font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                    <span className="text-[10px] uppercase text-slate-400 block">Peak Indoor PM2.5</span>
                    <span className="text-lg font-black text-rose-400">{simulationResult.peakPM25} µg/m³</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                    <span className="text-[10px] uppercase text-slate-400 block">Time to WHO Safe</span>
                    <span className="text-lg font-black text-emerald-400">
                      {simulationResult.timeToReachSafeThresholdMinutes ? `${simulationResult.timeToReachSafeThresholdMinutes} mins` : '> 60 mins'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                    <span className="text-[10px] uppercase text-slate-400 block">Air Quality Status</span>
                    <span className="text-sm font-bold text-slate-200 mt-0.5 block">{simulationResult.airQualityStatus}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Targeted IAQ Hacks */}
            {simulationResult && simulationResult.actionableHacks.length > 0 && (
              <div className="pt-3 border-t border-white/[0.08]">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Tailored Mitigation Protocols for Current Compartment:
                </h4>
                <div className="space-y-1.5">
                  {simulationResult.actionableHacks.map((hack, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
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
        /* Exploded Technical Blueprint for $35 Corsi-Rosenthal Box */
        <CorsiRosenthalBlueprint />
      )}
    </div>
  );
};
