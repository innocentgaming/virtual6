import { describe, it, expect } from 'vitest';
import { generate72HourSmogForecast } from '../server/src/services/predictiveSmogEngine';
import { evaluateCommuteRoutes } from '../server/src/services/routeExposureService';
import { simulateMultiZoneIAQ } from '../server/src/services/multiZoneIAQService';

describe('Advanced System: 72-Hour Planetary Boundary Layer Forecast Engine', () => {
  it('should generate 72 consecutive hourly forecast points with diurnal meteorological physics', () => {
    const forecast = generate72HourSmogForecast('Delhi NCR', 350, 220);
    expect(forecast.forecastPoints).toHaveLength(72);
    expect(forecast.city).toBe('Delhi NCR');
    expect(forecast.safestVentilationWindowTomorrow).toMatch(/(Tomorrow|Midday|PM)/);
    expect(forecast.threeDayAverageAQI).toBeGreaterThan(0);
  });

  it('should correctly model solar convective boundary layer growth vs nocturnal radiation trapping', () => {
    const forecast = generate72HourSmogForecast('Delhi NCR', 300, 180);
    
    // Find daytime midday points (hour 12-14) vs early morning points (hour 4-6)
    const middayPoints = forecast.forecastPoints.filter(p => {
      const h = new Date(p.timestamp).getHours();
      return h >= 12 && h <= 14;
    });
    const morningPoints = forecast.forecastPoints.filter(p => {
      const h = new Date(p.timestamp).getHours();
      return h >= 4 && h <= 6;
    });

    expect(middayPoints.length).toBeGreaterThan(0);
    expect(morningPoints.length).toBeGreaterThan(0);

    // Midday boundary layer must be significantly higher than morning inversion lid
    expect(middayPoints[0].boundaryLayerHeightMeters).toBeGreaterThan(morningPoints[0].boundaryLayerHeightMeters);
    expect(morningPoints[0].isInversionActive).toBe(true);
    expect(middayPoints[0].isOptimalVentilationWindow).toBe(true);
  });
});

describe('Advanced System: Route Exposure & Commute Shield Optimizer', () => {
  it('should evaluate 4 urban transit corridors and calculate inhaled doses correctly', () => {
    const result = evaluateCommuteRoutes('Delhi NCR', 200, 15, true);
    expect(result.routes).toHaveLength(4);
    expect(result.recommendedRouteId).toBe('route_metro');
    expect(result.bestOptionDoseReductionPercent).toBeGreaterThan(50);
    expect(result.bestOptionCO2SavedKg).toBeGreaterThan(1.0);
  });

  it('should identify that active physical exertion in traffic causes elevated inhaled doses', () => {
    const result = evaluateCommuteRoutes('Delhi NCR', 200, 15, false);
    const activeRoute = result.routes.find(r => r.mode === 'active_walk_cycle');
    const metroRoute = result.routes.find(r => r.mode === 'metro_transit');

    expect(activeRoute).toBeDefined();
    expect(metroRoute).toBeDefined();
    // High minute ventilation during cycling/walking without mask leads to higher dose than shielded metro
    expect(activeRoute!.inhaledDoseUg).toBeGreaterThan(metroRoute!.inhaledDoseUg);
    expect(activeRoute!.respiratoryRiskLevel).toBe('Severe Hazard');
  });
});

describe('Advanced System: Multi-Zone IAQ & Filter Lifecycle Prognostics', () => {
  it('should simulate 4 connected household zones and identify kitchen combustion drift', () => {
    const result = simulateMultiZoneIAQ(210, true, true, false, 300);
    expect(result.zones).toHaveLength(4);
    
    const kitchen = result.zones.find(z => z.id === 'zone_kitchen');
    const bedroom = result.zones.find(z => z.id === 'zone_bedroom');

    expect(kitchen).toBeDefined();
    expect(bedroom).toBeDefined();
    // Bedroom with dedicated filtration must have significantly lower PM2.5 than active cooking kitchen
    expect(bedroom!.currentPM25).toBeLessThan(kitchen!.currentPM25);
    expect(result.driftVectors.length).toBeGreaterThan(0);
  });

  it('should accurately prognosticate filter dust mass loading and pressure drop degradation', () => {
    const newFilter = simulateMultiZoneIAQ(200, false, true, true, 40);
    const agedFilter = simulateMultiZoneIAQ(200, false, true, true, 500);

    expect(agedFilter.filterDiagnostic.particulateMassLoadedGrams).toBeGreaterThan(
      newFilter.filterDiagnostic.particulateMassLoadedGrams
    );
    expect(agedFilter.filterDiagnostic.saturationPercentage).toBeGreaterThan(
      newFilter.filterDiagnostic.saturationPercentage
    );
    expect(agedFilter.filterDiagnostic.currentPressureDropPa).toBeGreaterThan(
      newFilter.filterDiagnostic.currentPressureDropPa
    );
    expect(agedFilter.filterDiagnostic.estimatedRemainingDays).toBeLessThan(
      newFilter.filterDiagnostic.estimatedRemainingDays
    );
  });
});
