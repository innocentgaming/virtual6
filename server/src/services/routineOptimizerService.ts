import { 
  UserLifestyleProfile, 
  AQIData, 
  OptimizedRoutineResponse, 
  RoutineTimeSlot 
} from '../types';

/**
 * Human Inhalation Rates (m3/hour) based on EPA Exposure Factors Handbook:
 * - Sleep / Rest: 0.45 m3/h
 * - Light Indoor / Sedentary: 0.75 m3/h
 * - Light Walking / Commute: 1.10 m3/h
 * - High Intensity Aerobic (Jogging / Cycling): 2.90 m3/h
 */
const INHALATION_RATES = {
  sleep: 0.45,
  sedentary: 0.75,
  commute: 1.10,
  strenuousOutdoor: 2.90,
  indoorExercise: 1.80
};

export function optimizeDailyRoutine(profile: UserLifestyleProfile, aqiData: AQIData): OptimizedRoutineResponse {
  const basePM25 = aqiData.pollutants.pm25;
  const isVulnerable = (profile.vulnerabilities || []).some(v => v !== 'none');
  const persona = profile.persona || 'family';
  const isLowBudget = profile.budgetTier === 'low';

  // Baseline indoor penetration factor (fraction of outdoor PM2.5 that gets indoors)
  const indoorFactorTraditional = 0.70;
  const indoorFactorMitigated = profile.hasAirPurifier ? 0.20 : (isLowBudget ? 0.35 : 0.40);

  // Persona-specific morning workout recommendation
  let morningRec = 'Indoor stretch / yoga in sealed room with DIY or HEPA purifier running on medium.';
  if (persona === 'student') {
    morningRec = 'Dorm/room bodyweight workout; use fan-filter unit or study hall with central air. Strictly avoid outdoor jogs before 10 AM.';
  } else if (persona === 'professional') {
    morningRec = 'Shift morning outdoor cardio to filtered indoor gym; perform breathing exercises in sealed bedroom with purifier.';
  } else if (persona === 'community') {
    morningRec = 'Conduct indoor group stretch; check neighborhood community air sensors before advising local schools on morning recess.';
  }

  // Persona-specific commute recommendation
  let commuteRec = profile.commuteMode === 'car_solo'
    ? 'Shift to Electric Metro / Shared Carpool; set vehicle HVAC to strict internal recirculation with cabin N95 filter.'
    : 'Wear tight-seal N95/FFP2 respirator; select green corridors away from heavy diesel truck arteries.';
  
  if (persona === 'student') {
    commuteRec = 'Walk through campus interior garden paths instead of arterial main roads; wear reusable fitted KF94 mask.';
  } else if (persona === 'professional') {
    commuteRec = 'Stagger morning commute departure by 30 mins to avoid gridlock peak NO2; enforce internal AC recirculation mode.';
  }

  // Timeline slots reflecting a winter 24-hour cycle
  const timeline: RoutineTimeSlot[] = [
    {
      time: '06:30 AM',
      activity: profile.morningOutdoorRoutine ? 'Morning outdoor run / brisk park walk' : 'Waking up & airing bedroom',
      ambientAQI: Math.round(aqiData.aqi * 1.35),
      ambientPM25: Math.round(basePM25 * 1.35),
      traditionalExposureDoseUg: profile.morningOutdoorRoutine 
        ? Math.round(basePM25 * 1.35 * INHALATION_RATES.strenuousOutdoor * 1.0)
        : Math.round(basePM25 * 1.35 * indoorFactorTraditional * INHALATION_RATES.sedentary * 1.0),
      recommendedActivity: morningRec,
      mitigatedPM25: Math.round(basePM25 * 1.35 * indoorFactorMitigated),
      mitigatedExposureDoseUg: Math.round(basePM25 * 1.35 * indoorFactorMitigated * INHALATION_RATES.indoorExercise * 1.0),
      emissionMitigationGramsCO2: 0,
      actionReasoning: 'Peak thermal inversion traps heavy particulates near ground level between 6 AM and 9 AM. Moving workouts indoors prevents deep alveolar lung deposition.'
    },
    {
      time: '08:30 AM',
      activity: `Morning Commute (${profile.commuteMode.replace('_', ' ')}) - ${profile.commuteDistanceKm} km`,
      ambientAQI: Math.round(aqiData.aqi * 1.2),
      ambientPM25: Math.round(basePM25 * 1.2),
      traditionalExposureDoseUg: Math.round(basePM25 * 1.2 * INHALATION_RATES.commute * 0.75),
      recommendedActivity: commuteRec,
      mitigatedPM25: Math.round(basePM25 * 0.35),
      mitigatedExposureDoseUg: Math.round(basePM25 * 0.35 * INHALATION_RATES.commute * 0.75),
      emissionMitigationGramsCO2: profile.commuteMode === 'car_solo' 
        ? Math.round(profile.commuteDistanceKm * 185)
        : Math.round(profile.commuteDistanceKm * 40),
      actionReasoning: 'Urban street canyons concentrate toxic NO2 and black carbon. Internal recirculation + N95 reduces commute intake by over 70% while reducing single-occupancy tailpipe emissions.'
    },
    {
      time: '12:30 PM',
      activity: 'Lunch cooking & office / home ventilation',
      ambientAQI: Math.round(aqiData.aqi * 0.75),
      ambientPM25: Math.round(basePM25 * 0.75),
      traditionalExposureDoseUg: Math.round(basePM25 * 0.75 * indoorFactorTraditional * INHALATION_RATES.sedentary * 1.5) + (profile.hasCookingExhaust ? 20 : 65),
      recommendedActivity: 'Perform 20-minute cross-ventilation during peak solar mixing; turn kitchen range hood to maximum before igniting burner; cover pots with lids.',
      mitigatedPM25: Math.round(basePM25 * 0.75 * indoorFactorMitigated),
      mitigatedExposureDoseUg: Math.round(basePM25 * 0.75 * indoorFactorMitigated * INHALATION_RATES.sedentary * 1.5),
      emissionMitigationGramsCO2: 120,
      actionReasoning: 'Solar boundary layer expands during midday, lowering outdoor PM2.5 to the daily minimum. This is the only safe window for clearing indoor CO2 and moisture.'
    },
    {
      time: '05:30 PM',
      activity: 'School / Office release & evening commute return',
      ambientAQI: Math.round(aqiData.aqi * 1.15),
      ambientPM25: Math.round(basePM25 * 1.15),
      traditionalExposureDoseUg: Math.round(basePM25 * 1.15 * INHALATION_RATES.commute * 0.75),
      recommendedActivity: persona === 'family'
        ? 'Coordinate neighborhood walking school bus or carpooling pod; avoid school gate vehicle idling zones; equip children with fitted pediatric KF94 masks.'
        : 'Stagger commute 20 minutes past peak rush; wait in filtered indoor lobby rather than curbside bus stop.',
      mitigatedPM25: Math.round(basePM25 * 0.35),
      mitigatedExposureDoseUg: Math.round(basePM25 * 0.35 * INHALATION_RATES.commute * 0.75),
      emissionMitigationGramsCO2: Math.round(profile.commuteDistanceKm * 95),
      actionReasoning: 'School pickup zones and transit hubs suffer from intense localized PM2.5 and benzene spikes from idling engines. Eliminating idling protects vulnerable child lung capacity.'
    },
    {
      time: '08:30 PM',
      activity: profile.heatingSource === 'wood_biomass' || profile.heatingSource === 'coal_chulha' 
        ? 'Home space heating with biomass/wood fire' 
        : 'Dinner & evening relaxation',
      ambientAQI: Math.round(aqiData.aqi * 1.3),
      ambientPM25: Math.round(basePM25 * 1.3),
      traditionalExposureDoseUg: (profile.heatingSource === 'wood_biomass' || profile.heatingSource === 'coal_chulha')
        ? Math.round(basePM25 * 1.3 * indoorFactorTraditional * INHALATION_RATES.sedentary * 2.0) + 210
        : Math.round(basePM25 * 1.3 * indoorFactorTraditional * INHALATION_RATES.sedentary * 2.0),
      recommendedActivity: profile.heatingSource === 'wood_biomass' || profile.heatingSource === 'coal_chulha'
        ? 'Switch to ceramic infrared electric heating or heat pump; insulate doors with draft-stoppers to retain heat without smoke.'
        : 'Damp-wipe surfaces (avoid dry sweeping which re-suspends dust); run bedroom purifier on low noise mode.',
      mitigatedPM25: Math.round(basePM25 * 1.3 * indoorFactorMitigated),
      mitigatedExposureDoseUg: Math.round(basePM25 * 1.3 * indoorFactorMitigated * INHALATION_RATES.sedentary * 2.0),
      emissionMitigationGramsCO2: (profile.heatingSource === 'wood_biomass' || profile.heatingSource === 'coal_chulha') ? 3200 : 250,
      actionReasoning: 'Solid fuel combustion indoors releases polycyclic aromatic hydrocarbons (PAHs) directly into living spaces. Clean heating protects cardiac health and eliminates household emissions.'
    },
    {
      time: '10:30 PM',
      activity: 'Overnight sleep (7-8 hours)',
      ambientAQI: Math.round(aqiData.aqi * 1.25),
      ambientPM25: Math.round(basePM25 * 1.25),
      traditionalExposureDoseUg: Math.round(basePM25 * 1.25 * indoorFactorTraditional * INHALATION_RATES.sleep * 7.5),
      recommendedActivity: isLowBudget
        ? 'Sealed bedroom with DIY Corsi-Rosenthal unit running on quiet fan speed; place draft-stopper towel under bedroom door.'
        : 'Sealed bedroom with Corsi-Rosenthal DIY box or HEPA unit running on low speed; use humidifier to maintain 40-50% RH for bronchial mucosal hydration.',
      mitigatedPM25: Math.round(basePM25 * 1.25 * indoorFactorMitigated),
      mitigatedExposureDoseUg: Math.round(basePM25 * 1.25 * indoorFactorMitigated * INHALATION_RATES.sleep * 7.5),
      emissionMitigationGramsCO2: 0,
      actionReasoning: 'During 8 hours of sleep, you breathe over 3,500 liters of air. Clean bedroom air allows respiratory cilia recovery from daytime particulate exposure.'
    }
  ];

  // Calculate totals
  const totalTraditionalDose = timeline.reduce((acc, slot) => acc + slot.traditionalExposureDoseUg, 0);
  const totalMitigatedDose = timeline.reduce((acc, slot) => acc + slot.mitigatedExposureDoseUg, 0);
  const totalAvoidedUg = Math.max(0, totalTraditionalDose - totalMitigatedDose);
  const percentReduction = totalTraditionalDose > 0 
    ? Math.round((totalAvoidedUg / totalTraditionalDose) * 100) 
    : 0;

  // Berkeley Earth model: 1 cigarette approx 264 ug of PM2.5 inhaled
  const cigarettesAvoided = Math.round((totalAvoidedUg / 264) * 10) / 10;
  const totalCO2SavedKg = Math.round(
    timeline.reduce((acc, slot) => acc + slot.emissionMitigationGramsCO2, 0) / 1000 * 10
  ) / 10;

  const recommendations: string[] = [];
  if (isVulnerable) {
    recommendations.push(
      'Vulnerable Family Members Identified: Strictly avoid outdoor aerobic workouts before 10 AM. Provide pediatric/elderly fitted N95 respirators.'
    );
  }
  if (profile.heatingSource === 'wood_biomass' || profile.heatingSource === 'coal_chulha') {
    recommendations.push(
      'High Priority: Replace solid fuel burning with electric ceramic or reverse-cycle heat pumps. Apply door sweeps to eliminate draft air exchange.'
    );
  }
  if (!profile.hasAirPurifier || isLowBudget) {
    recommendations.push(
      'Budget Clean Air Hack: Build a low-cost DIY Corsi-Rosenthal box using a box fan and MERV 13 filters for high Clean Air Delivery Rate (CADR > 250 CFM for ~$35).'
    );
  }
  recommendations.push(
    'Micro-Ventilation Rule: Vent rooms only between 12:00 PM and 2:30 PM when solar ground radiation lifts the thermal inversion layer.'
  );

  return {
    profile,
    currentAQI: aqiData,
    timeline,
    impactSummary: {
      totalInhaledPM25AvoidedUg: totalAvoidedUg,
      percentageDoseReduction: percentReduction,
      equivalentCigarettesAvoided: cigarettesAvoided,
      totalCO2PreventedKg: totalCO2SavedKg,
      primaryHealthRecommendations: recommendations
    }
  };
}
