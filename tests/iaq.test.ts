import { describe, it, expect } from 'vitest';
import { simulateIndoorAirQuality } from '../server/src/services/iaqSimulationService';
import { IAQSimulationInput } from '../server/src/types';

describe('Indoor Air Quality (IAQ) Simulation Model', () => {
  const baseInput: IAQSimulationInput = {
    roomVolumeM3: 45, // approx 160 sq ft room
    outdoorPM25: 200,
    airChangesPerHour: 0.5,
    hasAirPurifier: true,
    purifierCADR_M3H: 300,
    indoorSources: {
      cookingWithGas: false,
      hasExhaustOn: false,
      incenseOrCandles: false,
      drySweeping: false,
      smokingOrVaping: false
    },
    simulationDurationMinutes: 60
  };

  it('should significantly reduce indoor PM2.5 when air purifier is operational', () => {
    const resultWithPurifier = simulateIndoorAirQuality(baseInput);
    const resultWithoutPurifier = simulateIndoorAirQuality({
      ...baseInput,
      hasAirPurifier: false
    });

    expect(resultWithPurifier.finalPM25).toBeLessThan(resultWithoutPurifier.finalPM25);
    expect(resultWithPurifier.percentReduction).toBeGreaterThan(50);
  });

  it('should reflect indoor PM2.5 spikes from unvented cooking and dry sweeping', () => {
    const resultClean = simulateIndoorAirQuality(baseInput);
    const resultPolluting = simulateIndoorAirQuality({
      ...baseInput,
      hasAirPurifier: false,
      indoorSources: {
        cookingWithGas: true,
        hasExhaustOn: false,
        incenseOrCandles: true,
        drySweeping: true,
        smokingOrVaping: false
      }
    });

    expect(resultPolluting.peakPM25).toBeGreaterThan(resultClean.peakPM25);
  });

  it('should provide practical IAQ hacks including Corsi-Rosenthal box guidance', () => {
    const result = simulateIndoorAirQuality({
      ...baseInput,
      hasAirPurifier: false
    });
    const hacks = result.actionableHacks.join(' ');
    expect(hacks).toContain('Corsi-Rosenthal Box');
  });
});
