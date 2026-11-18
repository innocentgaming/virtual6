import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ShieldCheck, 
  TrendingDown, 
  Cigarette, 
  Leaf, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  User, 
  Car, 
  Flame, 
  Clock 
} from 'lucide-react';
import { AQIData, optimizeRoutine, OptimizedRoutineResponse } from '../services/api';

interface RoutinePlannerProps {
  aqiData: AQIData | null;
  selectedCity: string;
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({ aqiData, selectedCity }) => {
  const [vulnerabilities, setVulnerabilities] = useState<string[]>(['child', 'asthma_respiratory']);
  const [commuteMode, setCommuteMode] = useState<string>('car_solo');
  const [commuteDistanceKm, setCommuteDistanceKm] = useState<number>(15);
  const [heatingSource, setHeatingSource] = useState<string>('electric_space_heater');
  const [hasAirPurifier, setHasAirPurifier] = useState<boolean>(true);
  const [hasCookingExhaust, setHasCookingExhaust] = useState<boolean>(true);
  const [morningOutdoorRoutine, setMorningOutdoorRoutine] = useState<boolean>(true);

  const [routineData, setRoutineData] = useState<OptimizedRoutineResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const triggerOptimize = async () => {
    setIsLoading(true);
    try {
      const res = await optimizeRoutine({
        city: selectedCity,
        vulnerabilities,
        commuteMode,
        commuteDistanceKm,
        heatingSource,
        hasAirPurifier,
        hasCookingExhaust,
        morningOutdoorRoutine
      });
      setRoutineData(res);
    } catch (err) {
      console.error('Failed to optimize routine:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    triggerOptimize();
  }, [selectedCity, vulnerabilities, commuteMode, commuteDistanceKm, heatingSource, hasAirPurifier, hasCookingExhaust, morningOutdoorRoutine]);

  const toggleVulnerability = (v: string) => {
    setVulnerabilities(prev => 
      prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]
    );
  };

  return (
    <div className="space-y-8">
      {/* Configuration Header Card */}
      <section 
        aria-labelledby="profile-config-heading"
        className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div>
            <h2 id="profile-config-heading" className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Personalized Low-Emission Smog Routine Planner</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize your household profile to balance daily obligations with minimal pollutant inhalation and zero unnecessary emissions.
            </p>
          </div>

          <button
            onClick={triggerOptimize}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Recalculating...' : 'Recalculate Schedule'}</span>
          </button>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {/* Household Vulnerabilities */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vulnerable Members</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'child', label: 'Children' },
                { id: 'asthma_respiratory', label: 'Asthma/Lung' },
                { id: 'elderly', label: 'Elderly' },
                { id: 'pregnant', label: 'Pregnant' },
                { id: 'pet', label: 'Pets' }
              ].map(item => {
                const isSelected = vulnerabilities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleVulnerability(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commute Mode & Distance */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Daily Commute</span>
            </label>
            <select
              value={commuteMode}
              onChange={(e) => setCommuteMode(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="car_solo">Solo Fossil Fuel Car</option>
              <option value="carpool">Shared Carpool / EV</option>
              <option value="public_transit">Public Metro / Bus</option>
              <option value="walking">Outdoor Walking</option>
              <option value="work_from_home">Work from Home</option>
            </select>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Distance: {commuteDistanceKm} km</span>
              <input
                type="range"
                min="2"
                max="50"
                value={commuteDistanceKm}
                onChange={(e) => setCommuteDistanceKm(Number(e.target.value))}
                className="w-24 accent-emerald-500"
              />
            </div>
          </div>

          {/* Heating Source */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Winter Heating Source</span>
            </label>
            <select
              value={heatingSource}
              onChange={(e) => setHeatingSource(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="electric_space_heater">Electric Heater / Oil Radiator</option>
              <option value="heat_pump">Heat Pump (Reverse AC)</option>
              <option value="unvented_gas">Unvented Gas Heater</option>
              <option value="wood_biomass">Fireplace / Wood Biomass</option>
              <option value="coal_chulha">Coal / Chulha Stove</option>
            </select>
          </div>

          {/* Household Equipment Toggles */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Home Setup</span>
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAirPurifier}
                  onChange={(e) => setHasAirPurifier(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Air Purifier (HEPA/Corsi)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCookingExhaust}
                  onChange={(e) => setHasCookingExhaust(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Kitchen Range Hood</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={morningOutdoorRoutine}
                  onChange={(e) => setMorningOutdoorRoutine(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Morning Outdoor Run/Walk</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Summary Banner */}
      {routineData && (
        <section 
          aria-labelledby="impact-summary-heading"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* PM2.5 Inhalation Avoided */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/40 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                Inhaled PM2.5 Dose Reduction
              </span>
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                -{routineData.impactSummary.percentageDoseReduction}%
              </span>
              <span className="text-xs text-emerald-300">
                ({routineData.impactSummary.totalInhaledPM25AvoidedUg.toLocaleString()} µg avoided)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Avoids deep alveolar particulate loading by shifting strenuous workouts away from inversion peaks.
            </p>
          </div>

          {/* Cigarettes Avoided */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/70 to-slate-900 border border-blue-500/40 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
                Equivalent Cigarettes Avoided
              </span>
              <Cigarette className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {routineData.impactSummary.equivalentCigarettesAvoided}
              </span>
              <span className="text-xs text-blue-300">cigs / family member / day</span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Based on the Berkeley Earth particulate-to-cigarette inhalation toxicity formula.
            </p>
          </div>

          {/* Carbon & Tailpipe Mitigation */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/70 to-slate-900 border border-teal-500/40 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">
                Direct CO2 & Smog Emissions Prevented
              </span>
              <Leaf className="w-5 h-5 text-teal-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {routineData.impactSummary.totalCO2PreventedKg} kg
              </span>
              <span className="text-xs text-teal-300">daily CO2e prevented</span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Direct tailpipe emissions and indoor fuel combustion eliminated from the community air shed.
            </p>
          </div>
        </section>
      )}

      {/* Routine Timeline Comparison */}
      {routineData && (
        <section 
          aria-labelledby="timeline-heading"
          className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 id="timeline-heading" className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>24-Hour Smog-Resilient Schedule Comparison</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Side-by-side comparison of typical high-exposure routines vs. AeroShield optimized timings.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {routineData.timeline.map((slot, index) => (
              <div 
                key={index}
                className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 transition hover:border-slate-600"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                      {slot.time}
                    </span>
                    <span className="text-xs text-slate-400">
                      Ambient PM2.5: <strong className="text-slate-200">{slot.ambientPM25} µg/m³</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-rose-400 font-medium">
                      Traditional Intake: {slot.traditionalExposureDoseUg} µg
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-emerald-400 font-bold">
                      Shielded Intake: {slot.mitigatedExposureDoseUg} µg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="text-xs">
                    <span className="text-slate-500 uppercase font-semibold text-[10px] block mb-1">
                      Traditional Activity
                    </span>
                    <p className="text-slate-300 line-through opacity-70">
                      {slot.activity}
                    </p>
                  </div>

                  <div className="text-xs">
                    <span className="text-emerald-400 uppercase font-semibold text-[10px] block mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>AeroShield Recommended Alternative</span>
                    </span>
                    <p className="text-white font-medium">
                      {slot.recommendedActivity}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 shrink-0">Impact Logic:</span>
                  <span>{slot.actionReasoning}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Primary Health Recommendations */}
      {routineData && routineData.impactSummary.primaryHealthRecommendations.length > 0 && (
        <section 
          aria-labelledby="priority-recs-heading"
          className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5"
        >
          <h4 id="priority-recs-heading" className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3">
            Core Household Action Directives
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {routineData.impactSummary.primaryHealthRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
