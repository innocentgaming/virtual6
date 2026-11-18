import { IAQSimulationInput, IAQSimulationResult, AirQualityLevel } from '../types';
import { calculateAQILevel } from './aqiService';

export function simulateIndoorAirQuality(input: IAQSimulationInput): IAQSimulationResult {
  const volume = Math.max(input.roomVolumeM3, 10); // Minimum 10 m3
  const outdoorPM25 = Math.max(input.outdoorPM25, 5);
  const ach = Math.min(Math.max(input.airChangesPerHour, 0.1), 3.0); // Air changes per hour
  const duration = Math.min(Math.max(input.simulationDurationMinutes, 15), 180);

  // Deposition rate (natural settling on walls/floors) ~ 0.2 h^-1
  const naturalDepositionRate = 0.2;

  // Infiltration factor (penetration rate through building envelope)
  const penetrationFactor = 0.75;

  // Purifier CADR (m3/h)
  const purifierCADR = input.hasAirPurifier ? Math.max(input.purifierCADR_M3H, 50) : 0;
  const filtrationRate = purifierCADR / volume; // h^-1

  // Indoor source emissions (micrograms per hour)
  let indoorSourceRateUgH = 0;
  if (input.indoorSources.cookingWithGas) {
    indoorSourceRateUgH += input.indoorSources.hasExhaustOn ? 800 : 4500;
  }
  if (input.indoorSources.incenseOrCandles) {
    indoorSourceRateUgH += 2200;
  }
  if (input.indoorSources.drySweeping) {
    indoorSourceRateUgH += 1800;
  }
  if (input.indoorSources.smokingOrVaping) {
    indoorSourceRateUgH += 8000;
  }

  // Initial indoor PM2.5 estimate (assuming steady state without purifier before start)
  const initialPM25 = Math.round(
    (penetrationFactor * ach * outdoorPM25 + (indoorSourceRateUgH > 0 ? 500 : 0) / volume) /
    (ach + naturalDepositionRate)
  );

  const safeThreshold = 15; // WHO guideline target for PM2.5 in ug/m3
  const timelinePoints: { minute: number; indoorPM25: number; safeThreshold: number }[] = [];

  let currentConcentration = initialPM25;
  let peakConcentration = currentConcentration;
  let timeToSafe: number | null = null;

  const dtHours = 1 / 60; // 1-minute time step in hours
  const totalSteps = duration;

  for (let minute = 0; minute <= totalSteps; minute++) {
    timelinePoints.push({
      minute,
      indoorPM25: Math.round(currentConcentration * 10) / 10,
      safeThreshold
    });

    if (currentConcentration > peakConcentration) {
      peakConcentration = currentConcentration;
    }

    if (timeToSafe === null && currentConcentration <= safeThreshold && minute > 0) {
      timeToSafe = minute;
    }

    // Mass balance differential equation update:
    // dC/dt = (penetration * ach * C_out) + (S / V) - (ach + deposition + filtration) * C
    const generationTerm = (penetrationFactor * ach * outdoorPM25) + (indoorSourceRateUgH / volume);
    const removalRate = ach + naturalDepositionRate + filtrationRate;

    const dC = (generationTerm - removalRate * currentConcentration) * dtHours;
    currentConcentration = Math.max(0, currentConcentration + dC);
  }

  const finalPM25 = Math.round(currentConcentration * 10) / 10;
  const percentReduction = peakConcentration > 0 
    ? Math.round(((peakConcentration - finalPM25) / peakConcentration) * 100) 
    : 0;

  const { level } = calculateAQILevel(finalPM25);

  const hacks: string[] = [];
  if (!input.hasAirPurifier) {
    hacks.push(
      'DIY Corsi-Rosenthal Box: Tape four 20x20 MERV-13 furnace filters to a standard box fan with a cardboard shroud. Provides ~400 CFM clean air delivery for under $40.'
    );
  } else {
    hacks.push(
      'Purifier Placement: Place your unit at least 2 feet away from walls in the center of breathing zone, elevating it 18 inches off the floor to avoid sucking up heavy carpet dust.'
    );
  }

  if (input.indoorSources.drySweeping) {
    hacks.push(
      'Damp Dusting Hack: Replace broom sweeping with microfiber damp mopping. Dry brooms re-suspend settled PM2.5 into breathing air for 3+ hours.'
    );
  }

  if (input.indoorSources.cookingWithGas && !input.indoorSources.hasExhaustOn) {
    hacks.push(
      'Kitchen Vent Rule: Turn your range hood ON 1 minute before lighting burners, and run for 5 minutes after cooking. Covers pots with lids to reduce aerosolization.'
    );
  }

  hacks.push(
    'Draft Sealing: Fit inexpensive silicon door-sweeps under external doors and apply weather-stripping foam tape around drafty window sashes.'
  );

  return {
    initialPM25,
    finalPM25,
    peakPM25: Math.round(peakConcentration * 10) / 10,
    percentReduction: Math.max(0, percentReduction),
    airQualityStatus: level,
    timeToReachSafeThresholdMinutes: timeToSafe,
    timelinePoints,
    actionableHacks: hacks
  };
}

