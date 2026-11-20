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
  Clock, 
  DollarSign, 
  GraduationCap, 
  Briefcase, 
  Users 
} from 'lucide-react';
import { AQIData, optimizeRoutine, OptimizedRoutineResponse } from '../services/api';
import { playTactileClick } from './AudioEffects';

interface RoutinePlannerProps {
  aqiData: AQIData | null;
  selectedCity: string;
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({ aqiData, selectedCity }) => {
  const [persona, setPersona] = useState<'family' | 'student' | 'professional' | 'community'>('family');
  const [budgetTier, setBudgetTier] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [vulnerabilities, setVulnerabilities] = useState<string[]>(['child', 'asthma_respiratory']);
  const [commuteMode, setCommuteMode] = useState<string>('car_solo');
  const [commuteDistanceKm, setCommuteDistanceKm] = useState<number>(15);
  const [heatingSource, setHeatingSource] = useState<string>('electric_space_heater');
  const [hasAirPurifier, setHasAirPurifier] = useState<boolean>(true);
  const [hasCookingExhaust, setHasCookingExhaust] = useState<boolean>(true);
  const [morningOutdoorRoutine, setMorningOutdoorRoutine] = useState<boolean>(true);

  const [routineData, setRoutineData] = useState<OptimizedRoutineResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Auto-tune settings when persona changes
  const handlePersonaChange = (p: 'family' | 'student' | 'professional' | 'community') => {
    playTactileClick(800, 0.03);
    setPersona(p);
    if (p === 'student') {
      setBudgetTier('low');
      setCommuteMode('walking');
      setCommuteDistanceKm(3);
      setHasAirPurifier(false);
      setVulnerabilities(['none']);
    } else if (p === 'professional') {
      setBudgetTier('moderate');
      setCommuteMode('car_solo');
      setCommuteDistanceKm(18);
      setVulnerabilities(['none']);
    } else if (p === 'family') {
      setBudgetTier('moderate');
      setCommuteMode('car_solo');
      setCommuteDistanceKm(12);
      setVulnerabilities(['child', 'asthma_respiratory']);
    } else if (p === 'community') {
      setBudgetTier('low');
      setCommuteMode('public_transit');
      setCommuteDistanceKm(8);
      setVulnerabilities(['elderly']);
    }
  };

  const triggerOptimize = async () => {
    playTactileClick(900, 0.04);
    setIsLoading(true);
    try {
      const res = await optimizeRoutine({
        city: selectedCity,
        persona,
        budgetTier,
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
  }, [selectedCity, persona, budgetTier, vulnerabilities, commuteMode, commuteDistanceKm, heatingSource, hasAirPurifier, hasCookingExhaust, morningOutdoorRoutine]);

  const toggleVulnerability = (v: string) => {
    playTactileClick(700, 0.02);
    setVulnerabilities(prev => 
      prev.includes(v) ? prev.filter(item => item !== v) : [...prev.filter(item => item !== 'none'), v]
    );
  };

  return (
    <div className="space-y-8">
      {/* Persona Selection Banner */}
      <section 
        aria-labelledby="persona-selector-heading"
        className="p-5 rounded-2xl bg-[#090c10] border border-white/10 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 id="persona-selector-heading" className="text-sm font-mono uppercase tracking-wider font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Lifestyle & Exposure Target Archetype</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Personalizes minute ventilation volumes ($V_E$), commute displacement, and budget tier.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'family' as const, label: 'Family & Children', icon: Users },
              { id: 'student' as const, label: 'Student / Budget', icon: GraduationCap },
              { id: 'professional' as const, label: 'Professional', icon: Briefcase },
              { id: 'community' as const, label: 'Community Leader', icon: ShieldCheck }
            ].map(p => {
              const Icon = p.icon;
              const isSelected = persona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePersonaChange(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/60'
                      : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Configuration Header Card */}
      <section 
        aria-labelledby="profile-config-heading"
        className="bg-[#090c10] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h3 id="profile-config-heading" className="text-sm font-mono uppercase tracking-wider font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Household Dosage Parameters ({persona.toUpperCase()})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Calculates minute-inhalation dosages and emission savings using EPA Exposure Factors Handbook values.
            </p>
          </div>

          <button
            onClick={triggerOptimize}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 disabled:opacity-50 min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Recalculating...' : 'Recalculate Schedule'}</span>
          </button>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {/* Household Vulnerabilities */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                      isSelected
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20'
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
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Daily Commute Mode</span>
            </label>
            <select
              value={commuteMode}
              onChange={(e) => {
                playTactileClick(650, 0.01);
                setCommuteMode(e.target.value);
              }}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="car_solo">Solo Fossil Fuel Car</option>
              <option value="carpool">Shared Carpool / EV</option>
              <option value="public_transit">Public Metro / Bus</option>
              <option value="walking">Outdoor Walking</option>
              <option value="work_from_home">Work from Home</option>
            </select>
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Distance: {commuteDistanceKm} km</span>
              <input
                type="range"
                min="1"
                max="50"
                value={commuteDistanceKm}
                onChange={(e) => {
                  playTactileClick(600, 0.01);
                  setCommuteDistanceKm(Number(e.target.value));
                }}
                className="w-24 accent-emerald-500"
              />
            </div>
          </div>

          {/* Heating & Budget Tier */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Heating & Budget</span>
            </label>
            <select
              value={heatingSource}
              onChange={(e) => {
                playTactileClick(650, 0.01);
                setHeatingSource(e.target.value);
              }}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500 mb-2"
            >
              <option value="electric_space_heater">Electric Heater / Radiator</option>
              <option value="heat_pump">Heat Pump (Reverse AC)</option>
              <option value="unvented_gas">Unvented Gas Heater</option>
              <option value="wood_biomass">Fireplace / Wood Biomass</option>
              <option value="coal_chulha">Coal / Chulha Stove</option>
            </select>

            <div className="flex gap-1.5">
              {(['low', 'moderate', 'high'] as const).map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    playTactileClick(700, 0.01);
                    setBudgetTier(tier);
                  }}
                  className={`flex-1 py-1 text-[10px] uppercase font-mono font-bold rounded-lg border transition ${
                    budgetTier === tier
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950/60 text-slate-500 border-white/5'
                  }`}
                >
                  {tier === 'low' ? '$ (DIY)' : tier === 'moderate' ? '$$' : '$$$'}
                </button>
              ))}
            </div>
          </div>

          {/* Household Equipment Toggles */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Mitigation Setup</span>
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAirPurifier}
                  onChange={(e) => {
                    playTactileClick(700, 0.02);
                    setHasAirPurifier(e.target.checked);
                  }}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Air Purifier (HEPA/Corsi)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCookingExhaust}
                  onChange={(e) => {
                    playTactileClick(700, 0.02);
                    setHasCookingExhaust(e.target.checked);
                  }}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Kitchen Range Hood</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={morningOutdoorRoutine}
                  onChange={(e) => {
                    playTactileClick(700, 0.02);
                    setMorningOutdoorRoutine(e.target.checked);
                  }}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Morning Outdoor Workout</span>
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
          <div className="p-5 rounded-2xl bg-[#090c10] border border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[11px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                Inhaled PM2.5 Dose Reduction
              </span>
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-white">
                -{routineData.impactSummary.percentageDoseReduction}%
              </span>
              <span className="text-xs font-mono text-emerald-300">
                ({routineData.impactSummary.totalInhaledPM25AvoidedUg.toLocaleString()} µg avoided)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 font-sans">
              Avoids deep alveolar particulate loading by shifting strenuous workouts away from inversion peaks.
            </p>
          </div>

          {/* Cigarettes Avoided */}
          <div className="p-5 rounded-2xl bg-[#090c10] border border-blue-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[11px] uppercase font-mono font-bold text-blue-400 tracking-wider">
                Equivalent Cigarettes Avoided
              </span>
              <Cigarette className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-white">
                {routineData.impactSummary.equivalentCigarettesAvoided}
              </span>
              <span className="text-xs font-mono text-blue-300">cigs / member / day</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 font-sans">
              Based on the Berkeley Earth particulate-to-cigarette inhalation toxicity formula (264 µg PM2.5 ≈ 1 cigarette).
            </p>
          </div>

          {/* Carbon & Tailpipe Mitigation */}
          <div className="p-5 rounded-2xl bg-[#090c10] border border-teal-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[11px] uppercase font-mono font-bold text-teal-400 tracking-wider">
                Direct CO2 & Smog Prevented
              </span>
              <Leaf className="w-5 h-5 text-teal-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-white">
                {routineData.impactSummary.totalCO2PreventedKg} kg
              </span>
              <span className="text-xs font-mono text-teal-300">daily CO2e prevented</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 font-sans">
              Direct tailpipe emissions and indoor fuel combustion eliminated from the community air shed.
            </p>
          </div>
        </section>
      )}

      {/* Routine Timeline Comparison */}
      {routineData && (
        <section 
          aria-labelledby="timeline-heading"
          className="bg-[#090c10] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 id="timeline-heading" className="text-sm font-mono uppercase tracking-wider font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>24-Hour Smog-Resilient Schedule Comparison</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Side-by-side comparison of typical high-exposure routines vs. BreatheSmart optimized timings.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {routineData.timeline.map((slot, index) => (
              <div 
                key={index}
                className="bg-slate-950/80 border border-white/10 rounded-xl p-4 transition hover:border-emerald-500/40"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                      {slot.time}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Ambient PM2.5: <strong className="text-slate-200">{slot.ambientPM25} µg/m³</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
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
                    <span className="text-slate-500 uppercase font-mono font-semibold text-[10px] block mb-1">
                      Traditional Activity
                    </span>
                    <p className="text-slate-300 line-through opacity-70">
                      {slot.activity}
                    </p>
                  </div>

                  <div className="text-xs">
                    <span className="text-emerald-400 uppercase font-mono font-semibold text-[10px] block mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>BreatheSmart Recommended Alternative</span>
                    </span>
                    <p className="text-white font-medium">
                      {slot.recommendedActivity}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-start gap-2 text-[11px] font-mono text-slate-400">
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
          className="bg-[#090c10] border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <h4 id="priority-recs-heading" className="text-xs font-mono uppercase font-bold tracking-wider text-slate-300 mb-3">
            Core Household Action Directives ({persona.toUpperCase()})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {routineData.impactSummary.primaryHealthRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-sans">{rec}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
