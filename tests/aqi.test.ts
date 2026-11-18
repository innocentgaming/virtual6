import { describe, it, expect } from 'vitest';
import { 
  calculateAQILevel, 
  detectInversion, 
  generateSafeVentilationHours,
  getFallbackAQI,
  KNOWN_CITIES
} from '../server/src/services/aqiService';

describe('AQI & Microclimate Services', () => {
  it('should accurately calculate US EPA AQI levels across breakpoints', () => {
    // 0 - 12 -> Good
    expect(calculateAQILevel(10).level).toBe('Good');
    // 12.1 - 35.4 -> Moderate
    expect(calculateAQILevel(25).level).toBe('Moderate');
    // 35.5 - 55.4 -> Unhealthy for Sensitive Groups
    expect(calculateAQILevel(45).level).toBe('Unhealthy for Sensitive Groups');
    // 55.5 - 150.4 -> Unhealthy
    expect(calculateAQILevel(100).level).toBe('Unhealthy');
    // 150.5 - 250.4 -> Very Unhealthy
    expect(calculateAQILevel(200).level).toBe('Very Unhealthy');
    // > 250.5 -> Hazardous
    expect(calculateAQILevel(350).level).toBe('Hazardous');
  });

  it('should detect winter thermal inversion conditions accurately', () => {
    // Winter inversion: cold temp (< 16°C), calm wind (< 8 km/h), high humidity (> 65%)
    expect(detectInversion(12, 4, 80)).toBe(true);
    // Warm windy weather should not trigger inversion
    expect(detectInversion(26, 18, 45)).toBe(false);
  });

  it('should generate mid-day safe ventilation hours during inversions', () => {
    const hoursInversion = generateSafeVentilationHours(true);
    expect(hoursInversion[0]).toContain('12:00 PM');
    expect(hoursInversion[0]).toContain('Inversion Dispersed');

    const hoursNormal = generateSafeVentilationHours(false);
    expect(hoursNormal.length).toBeGreaterThan(1);
  });

  it('should produce valid fallback AQI data for known cities', () => {
    const fallback = getFallbackAQI(KNOWN_CITIES['delhi']);
    expect(fallback.city).toBe('Delhi NCR');
    expect(fallback.pollutants.pm25).toBeGreaterThan(0);
    expect(fallback.safeVentilationHours.length).toBeGreaterThan(0);
  });
});

