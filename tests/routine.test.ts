import { describe, it, expect } from 'vitest';
import { optimizeDailyRoutine } from '../server/src/services/routineOptimizerService';
import { UserLifestyleProfile, AQIData } from '../server/src/types';

describe('Daily Routine Optimizer & Exposure Dose Calculations', () => {
  const mockAQI: AQIData = {
    city: 'Delhi NCR',
    country: 'India',
    latitude: 28.61,
    longitude: 77.2,
    timestamp: new Date().toISOString(),
    aqi: 320,
    level: 'Hazardous',
    primaryPollutant: 'PM2.5',
    pollutants: {
      pm25: 220,
      pm10: 380,
      no2: 65,
      o3: 20,
      co: 900,
      so2: 15
    },
    temperature: 12,
    humidity: 82,
    windSpeed: 4,
    isInversionLikely: true,
    smogAlertNotice: 'High Smog Alert',
    safeVentilationHours: ['12:00 PM - 02:30 PM']
  };

  const sampleProfile: UserLifestyleProfile = {
    city: 'Delhi',
    householdMembers: 4,
    vulnerabilities: ['asthma_respiratory', 'child'],
    homeAreaSqFt: 1200,
    commuteMode: 'car_solo',
    commuteDistanceKm: 15,
    heatingSource: 'wood_biomass',
    hasAirPurifier: true,
    hasCookingExhaust: true,
    morningOutdoorRoutine: true
  };

  it('should generate an optimized timeline with substantial inhaled dose reduction', () => {
    const result = optimizeDailyRoutine(sampleProfile, mockAQI);

    expect(result.timeline.length).toBe(6);
    expect(result.impactSummary.percentageDoseReduction).toBeGreaterThan(40);
    expect(result.impactSummary.totalInhaledPM25AvoidedUg).toBeGreaterThan(0);
    expect(result.impactSummary.equivalentCigarettesAvoided).toBeGreaterThan(0);
  });

  it('should flag high-priority recommendations for vulnerable households and solid fuels', () => {
    const result = optimizeDailyRoutine(sampleProfile, mockAQI);
    const recs = result.impactSummary.primaryHealthRecommendations.join(' ');

    expect(recs).toContain('Vulnerable Family Members');
    expect(recs).toContain('solid fuel');
  });

  it('should calculate CO2 and emission savings from solo car commute shift', () => {
    const result = optimizeDailyRoutine(sampleProfile, mockAQI);
    expect(result.impactSummary.totalCO2PreventedKg).toBeGreaterThan(0);
  });
});

