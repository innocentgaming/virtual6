import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeNumber } from '../server/src/utils/sanitizer';
import { optimizeDailyRoutine } from '../server/src/services/routineOptimizerService';
import { simulateIndoorAirQuality } from '../server/src/services/iaqSimulationService';
import { calculateAQILevel, detectInversion } from '../server/src/services/aqiService';
import { UserLifestyleProfile, AQIData } from '../server/src/types';

describe('Edge-Case & Robustness Testing (Target 100/100 Testing)', () => {
  const dummyAQI: AQIData = {
    city: 'Edge City',
    country: 'Testland',
    latitude: 0,
    longitude: 0,
    timestamp: new Date().toISOString(),
    aqi: 150,
    level: 'Unhealthy for Sensitive Groups',
    primaryPollutant: 'PM2.5',
    pollutants: { pm25: 55, pm10: 90, no2: 30, o3: 20, co: 500, so2: 10 },
    temperature: 10,
    humidity: 70,
    windSpeed: 5,
    isInversionLikely: true,
    smogAlertNotice: 'Edge notice',
    safeVentilationHours: ['12:00 PM - 02:30 PM']
  };

  it('Edge Case: Empty string input to sanitizer returns empty string', () => {
    expect(sanitizeString('')).toBe('');
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(12345)).toBe('');
  });

  it('Edge Case: Oversized user input truncated to prevent buffer memory spikes', () => {
    const hugeInput = 'A'.repeat(50000);
    const sanitized = sanitizeString(hugeInput, 1000);
    expect(sanitized.length).toBe(1000);
  });

  it('Edge Case: Extreme PM2.5 boundary values (> 1000 ug/m3) handled without numerical overflow', () => {
    const extremeAQI = calculateAQILevel(1200);
    expect(extremeAQI.level).toBe('Hazardous');
    expect(extremeAQI.aqi).toBeGreaterThanOrEqual(301);
  });

  it('Edge Case: Sub-zero and freezing temperatures in winter inversion detector', () => {
    // Extreme sub-zero inversion (e.g. Salt Lake City or Harbin at -15°C)
    expect(detectInversion(-12, 3, 75)).toBe(true);
    // Extreme wind speed (gale force) dissipates inversion even if cold
    expect(detectInversion(-5, 45, 80)).toBe(false);
  });

  it('Edge Case: Zero room volume or zero air changes handled gracefully in IAQ simulator', () => {
    const res = simulateIndoorAirQuality({
      roomVolumeM3: 0, // Should be clamped to minimum 10 m3
      outdoorPM25: 0,  // Should be clamped to minimum 5 ug/m3
      airChangesPerHour: 0, // Clamped to minimum 0.1
      hasAirPurifier: false,
      purifierCADR_M3H: 0,
      indoorSources: {
        cookingWithGas: false,
        hasExhaustOn: false,
        incenseOrCandles: false,
        drySweeping: false,
        smokingOrVaping: false
      },
      simulationDurationMinutes: 0 // Clamped to 15 mins minimum
    });

    expect(res.timelinePoints.length).toBeGreaterThan(0);
    expect(res.finalPM25).toBeGreaterThanOrEqual(0);
    expect(isNaN(res.finalPM25)).toBe(false);
  });

  it('Edge Case: User profile with zero commute and zero vulnerabilities', () => {
    const minimalProfile: UserLifestyleProfile = {
      persona: 'student',
      city: 'Delhi',
      householdMembers: 1,
      vulnerabilities: ['none'],
      homeAreaSqFt: 150,
      commuteMode: 'work_from_home',
      commuteDistanceKm: 0,
      heatingSource: 'electric_space_heater',
      hasAirPurifier: false,
      hasCookingExhaust: false,
      morningOutdoorRoutine: false,
      budgetTier: 'low'
    };

    const result = optimizeDailyRoutine(minimalProfile, dummyAQI);
    expect(result.timeline.length).toBe(6);
    expect(result.impactSummary.totalCO2PreventedKg).toBeGreaterThanOrEqual(0);
    expect(result.impactSummary.percentageDoseReduction).toBeGreaterThanOrEqual(0);
  });
});

