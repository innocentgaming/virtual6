/**
 * 72-Hour Predictive Smog & Inversion Trajectory Engine
 * 
 * Implements Planetary Boundary Layer (PBL) diurnal dynamics:
 * - Nocturnal radiative cooling surface inversion depth: h(t)
 * - Daytime solar convective mixing boundary layer growth: z_i(t)
 * - Secondary photochemical smog generation (NOx + VOC + Sunlight -> O3 + Secondary PM2.5)
 */

export interface HourlyForecastPoint {
  hourOffset: number;
  timestamp: string;
  timeLabel: string;
  dayLabel: string;
  predictedAQI: number;
  predictedPM25: number;
  predictedPM10: number;
  predictedO3: number;
  predictedNO2: number;
  boundaryLayerHeightMeters: number;
  isInversionActive: boolean;
  inversionSeverityIndex: number; // 0 to 100
  dispersionRating: 'Excellent' | 'Moderate' | 'Poor' | 'Hazardous Stagnation';
  recommendedAction: string;
  isOptimalVentilationWindow: boolean;
}

export interface PredictiveSmogReport {
  city: string;
  generatedAt: string;
  baselineAQI: number;
  forecastPoints: HourlyForecastPoint[];
  peakSmogRiskHour: string;
  safestVentilationWindowTomorrow: string;
  threeDayAverageAQI: number;
  inversionWarningSeverity: 'None' | 'Moderate' | 'Severe' | 'Critical Stagnation';
}

export function generate72HourSmogForecast(
  city: string,
  baselineAQI: number,
  baselinePM25: number,
  currentTempC = 14,
  currentHumidity = 72
): PredictiveSmogReport {
  const forecastPoints: HourlyForecastPoint[] = [];
  const now = new Date();
  let peakAQI = baselineAQI;
  let peakHour = '';
  let safeWindowStart: number | null = null;
  let safeWindowEnd: number | null = null;
  let sumAQI = 0;

  for (let offset = 0; offset < 72; offset++) {
    const futureDate = new Date(now.getTime() + offset * 60 * 60 * 1000);
    const hourOfDay = futureDate.getHours();
    const dayName = futureDate.toLocaleDateString('en-US', { weekday: 'short' });
    const timeLabel = futureDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Planetary Boundary Layer (PBL) height model based on diurnal solar radiation cycle
    // Night (00:00 - 07:00): Nocturnal inversion traps air down to 60m - 120m
    // Midday (12:00 - 15:00): Solar convection lifts boundary layer to 650m - 900m
    // Evening (18:00 - 23:00): Surface cools, boundary layer collapses
    let pblHeight: number;
    let inversionActive = false;
    let inversionSeverity = 0;

    if (hourOfDay >= 0 && hourOfDay < 9) {
      // Early morning radiation cooling peak
      pblHeight = Math.round(70 + Math.sin((hourOfDay / 9) * Math.PI) * 50);
      inversionActive = true;
      inversionSeverity = Math.min(100, Math.round(75 + (1 - pblHeight / 200) * 25));
    } else if (hourOfDay >= 9 && hourOfDay < 11) {
      // Transition warming
      pblHeight = Math.round(150 + ((hourOfDay - 9) / 2) * 250);
      inversionActive = true;
      inversionSeverity = 45;
    } else if (hourOfDay >= 11 && hourOfDay <= 16) {
      // Solar mixing window (peak convection)
      pblHeight = Math.round(600 + Math.sin(((hourOfDay - 11) / 5) * Math.PI) * 280);
      inversionActive = false;
      inversionSeverity = 15;
    } else {
      // Evening resealing
      pblHeight = Math.round(450 - ((hourOfDay - 16) / 8) * 350);
      inversionActive = hourOfDay >= 19;
      inversionSeverity = hourOfDay >= 20 ? 65 : 35;
    }

    // Inversion concentration multiplier: inverse proportionality to mixing layer height
    const dilutionFactor = Math.max(0.45, Math.min(1.85, 450 / pblHeight));

    // Secondary photochemical ozone generation (peaks around 14:00 with direct UV)
    const solarUVFactor = (hourOfDay >= 10 && hourOfDay <= 16)
      ? Math.sin(((hourOfDay - 10) / 6) * Math.PI)
      : 0;
    const predictedO3 = Math.round(22 + solarUVFactor * 55);

    // Day-over-day weather front accumulation factor (slight compounding if stagnation persists)
    const dayCycle = Math.floor(offset / 24);
    const accumulationDrift = 1 + dayCycle * 0.05;

    // Predicted particulate matter
    const predictedPM25 = Math.round(
      Math.max(25, baselinePM25 * dilutionFactor * accumulationDrift + (inversionActive ? 30 : -20))
    );
    const predictedPM10 = Math.round(predictedPM25 * 1.55);
    const predictedNO2 = Math.round(35 * dilutionFactor + (hourOfDay === 8 || hourOfDay === 19 ? 45 : 10)); // traffic rush hours

    // Convert PM2.5 to approximate US EPA AQI
    let predictedAQI: number;
    if (predictedPM25 <= 12) {
      predictedAQI = Math.round((50 / 12) * predictedPM25);
    } else if (predictedPM25 <= 35.4) {
      predictedAQI = Math.round(50 + ((100 - 50) / (35.4 - 12)) * (predictedPM25 - 12));
    } else if (predictedPM25 <= 55.4) {
      predictedAQI = Math.round(101 + ((150 - 101) / (55.4 - 35.4)) * (predictedPM25 - 35.4));
    } else if (predictedPM25 <= 150.4) {
      predictedAQI = Math.round(151 + ((200 - 151) / (150.4 - 55.4)) * (predictedPM25 - 55.4));
    } else if (predictedPM25 <= 250.4) {
      predictedAQI = Math.round(201 + ((300 - 201) / (250.4 - 150.4)) * (predictedPM25 - 150.4));
    } else {
      predictedAQI = Math.min(500, Math.round(301 + ((500 - 301) / (500 - 250.4)) * (predictedPM25 - 250.4)));
    }

    if (predictedAQI > peakAQI) {
      peakAQI = predictedAQI;
      peakHour = `${dayName} ${timeLabel}`;
    }

    sumAQI += predictedAQI;

    // Check if optimal ventilation window (between 12:00 and 15:00)
    const isOptimalVentilationWindow = hourOfDay >= 12 && hourOfDay <= 15;
    if (offset >= 24 && offset < 48 && isOptimalVentilationWindow) {
      if (safeWindowStart === null) safeWindowStart = hourOfDay;
      safeWindowEnd = hourOfDay + 1;
    }

    // Determine dispersion rating
    let dispersionRating: HourlyForecastPoint['dispersionRating'];
    if (pblHeight >= 650) dispersionRating = 'Excellent';
    else if (pblHeight >= 350) dispersionRating = 'Moderate';
    else if (pblHeight >= 180) dispersionRating = 'Poor';
    else dispersionRating = 'Hazardous Stagnation';

    // Action recommendation
    let recommendedAction: string;
    if (inversionActive && predictedAQI >= 300) {
      recommendedAction = 'Seal windows tight; run HEPA/Corsi air cleaners on high; cancel all outdoor physical activities.';
    } else if (isOptimalVentilationWindow) {
      recommendedAction = 'Midday thermal mixing active; optimal time for brief 15-minute cross-ventilation and outdoor errands.';
    } else if (hourOfDay >= 21 || hourOfDay <= 6) {
      recommendedAction = 'Nocturnal boundary layer resealing; run bedroom purifiers in quiet mode.';
    } else {
      recommendedAction = 'Moderate ambient particulate load; wear N95/FFP2 respirator if outdoors.';
    }

    forecastPoints.push({
      hourOffset: offset,
      timestamp: futureDate.toISOString(),
      timeLabel,
      dayLabel: dayName,
      predictedAQI,
      predictedPM25,
      predictedPM10,
      predictedO3,
      predictedNO2,
      boundaryLayerHeightMeters: pblHeight,
      isInversionActive: inversionActive,
      inversionSeverityIndex: inversionSeverity,
      dispersionRating,
      recommendedAction,
      isOptimalVentilationWindow
    });
  }

  const safestTomorrowStr = safeWindowStart !== null && safeWindowEnd !== null
    ? `Tomorrow 12:00 PM – 03:00 PM (Solar Convection Peak)`
    : 'Midday 12:30 PM – 02:30 PM';

  const avgAQI = Math.round(sumAQI / 72);
  const inversionWarningSeverity = avgAQI >= 300 ? 'Critical Stagnation' : avgAQI >= 200 ? 'Severe' : avgAQI >= 100 ? 'Moderate' : 'None';

  return {
    city,
    generatedAt: now.toISOString(),
    baselineAQI,
    forecastPoints,
    peakSmogRiskHour: peakHour || 'Tomorrow 07:00 AM',
    safestVentilationWindowTomorrow: safestTomorrowStr,
    threeDayAverageAQI: avgAQI,
    inversionWarningSeverity
  };
}
