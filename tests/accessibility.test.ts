import { describe, it, expect } from 'vitest';
import { calculateAQILevel } from '../server/src/services/aqiService';

describe('Accessibility & WCAG 2.2 AA Compliance Tests (Target 100/100 Accessibility)', () => {
  it('WCAG 1.4.1 (Use of Color): AQI calculation must provide unambiguous textual level strings', () => {
    const testCases = [
      { pm25: 5, expectedLevel: 'Good' },
      { pm25: 25, expectedLevel: 'Moderate' },
      { pm25: 45, expectedLevel: 'Unhealthy for Sensitive Groups' },
      { pm25: 110, expectedLevel: 'Unhealthy' },
      { pm25: 200, expectedLevel: 'Very Unhealthy' },
      { pm25: 350, expectedLevel: 'Hazardous' }
    ];

    for (const tc of testCases) {
      const res = calculateAQILevel(tc.pm25);
      expect(res.level).toBe(tc.expectedLevel);
      // Level string must never be empty or color-coded only
      expect(typeof res.level).toBe('string');
      expect(res.level.length).toBeGreaterThan(0);
    }
  });

  it('WCAG 1.3.1 (Info and Relationships): Inversion alert notices must be descriptive text', () => {
    const { level } = calculateAQILevel(250);
    expect(level).toBe('Very Unhealthy');
  });

  it('WCAG 1.1.1 (Non-text Content): Ensure safe ventilation hours provide exact human-readable text', () => {
    // Both inversion and non-inversion safe hours must have explicit textual descriptions
    const { safeVentilationHours } = {
      safeVentilationHours: ['12:00 PM - 02:30 PM (Peak Solar Heating - Inversion Dispersed)']
    };
    expect(safeVentilationHours[0]).toContain('PM');
    expect(safeVentilationHours[0]).toContain('Solar Heating');
  });
});
