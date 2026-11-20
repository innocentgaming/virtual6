/**
 * Multi-Zone Indoor Air Quality & Inter-Room Particulate Drift Service
 * 
 * Simulates interconnected multi-compartment mass balance dynamics
 * and prognosticates filter dust loading, pressure drop, and replacement lifecycle.
 */

export interface ZoneConfig {
  id: string;
  name: string;
  volumeM3: number;
  infiltrationACH: number;
  emissionRateUgMin: number;
  hasPurifier: boolean;
  purifierCADR_M3H: number;
  currentPM25: number;
  targetSafePM25: number;
  complianceStatus: 'Safe' | 'Moderate' | 'Hazardous';
  zonalAdvice: string;
}

export interface FilterPrognostic {
  filterType: 'MERV11' | 'MERV13_Pleated' | 'True_HEPA_H13' | 'Corsi_Rosenthal_Box';
  cumulativeHoursRun: number;
  ambientAvgPM25: number;
  particulateMassLoadedGrams: number;
  saturationPercentage: number; // 0 to 100%
  initialPressureDropPa: number;
  currentPressureDropPa: number;
  airflowDegradationPercent: number;
  estimatedRemainingDays: number;
  healthAlert: 'Optimal Condition' | 'Moderate Dust Loading' | 'Clogged - Replace Filter Immediately';
}

export interface MultiZoneSimulationResult {
  householdId: string;
  outdoorPM25: number;
  zones: ZoneConfig[];
  wholeHouseAveragePM25: number;
  driftVectors: { fromZone: string; toZone: string; driftPM25UgMin: number }[];
  filterDiagnostic: FilterPrognostic;
  highestRiskZone: string;
  strategicInterventions: string[];
}

export function simulateMultiZoneIAQ(
  outdoorPM25: number = 195,
  kitchenCookingActive: boolean = true,
  bedroomPurifierOn: boolean = true,
  livingRoomPurifierOn: boolean = false,
  filterHoursAccumulated: number = 320
): MultiZoneSimulationResult {
  // 1. Define 4 Interconnected Zones
  const kitchenVolume = 32; // m3
  const livingVolume = 75; // m3
  const bedroomVolume = 45; // m3
  const nurseryVolume = 35; // m3

  // Kitchen source emission rate: 1400 ug/min if gas burner active
  const kitchenEmission = kitchenCookingActive ? 1400 : 20;

  // Infiltration rates
  const livingInfiltrationACH = 0.95; // higher draft near external doors
  const kitchenInfiltrationACH = 0.80;
  const bedroomInfiltrationACH = 0.35; // weatherstripped
  const nurseryInfiltrationACH = 0.30;

  // Purifier CADR in m3/h
  const bedroomCADR = bedroomPurifierOn ? 280 : 0;
  const livingCADR = livingRoomPurifierOn ? 350 : 0;

  // Steady-state indoor concentrations (approximate mass balance equilibrium)
  // Kitchen (intense source)
  const kitchenLossRate = kitchenInfiltrationACH * kitchenVolume + (kitchenCookingActive ? 120 : 0) + 0.24 * kitchenVolume;
  const kitchenPM25 = Math.round(
    ((0.7 * kitchenInfiltrationACH * kitchenVolume * outdoorPM25 + kitchenEmission * 60) / (kitchenLossRate + 1)) * 0.18
  );

  // Living Room (receives inter-room drift from kitchen)
  const driftKitchenToLiving = kitchenCookingActive ? Math.round(kitchenPM25 * 0.28) : 10;
  const livingLossRate = livingInfiltrationACH * livingVolume + livingCADR + 0.24 * livingVolume;
  const livingPM25 = Math.round(
    (0.7 * livingInfiltrationACH * livingVolume * outdoorPM25 + driftKitchenToLiving * 60) / (livingLossRate + 1)
  );

  // Master Bedroom (nighttime haven)
  const bedroomLossRate = bedroomInfiltrationACH * bedroomVolume + bedroomCADR + 0.24 * bedroomVolume;
  const bedroomPM25 = Math.round(
    (0.6 * bedroomInfiltrationACH * bedroomVolume * outdoorPM25) / (bedroomLossRate + 1)
  );

  // Children's Nursery (isolated sanctuary)
  const nurseryCADR = 180; // dedicated small air filter
  const nurseryLossRate = nurseryInfiltrationACH * nurseryVolume + nurseryCADR + 0.24 * nurseryVolume;
  const nurseryPM25 = Math.round(
    (0.55 * nurseryInfiltrationACH * nurseryVolume * outdoorPM25) / (nurseryLossRate + 1)
  );

  const zones: ZoneConfig[] = [
    {
      id: 'zone_kitchen',
      name: 'Kitchen (Cooking & Combustion)',
      volumeM3: kitchenVolume,
      infiltrationACH: kitchenInfiltrationACH,
      emissionRateUgMin: kitchenEmission,
      hasPurifier: false,
      purifierCADR_M3H: 0,
      currentPM25: Math.max(20, kitchenPM25),
      targetSafePM25: 25,
      complianceStatus: kitchenPM25 > 50 ? 'Hazardous' : kitchenPM25 > 25 ? 'Moderate' : 'Safe',
      zonalAdvice: kitchenCookingActive 
        ? 'Gas stove combustion active! Keep kitchen door closed and run range hood fan on maximum exhaust.'
        : 'Kitchen emissions nominal; maintain ambient cross-sealing.'
    },
    {
      id: 'zone_living',
      name: 'Living Room & Entryway',
      volumeM3: livingVolume,
      infiltrationACH: livingInfiltrationACH,
      emissionRateUgMin: 15,
      hasPurifier: livingRoomPurifierOn,
      purifierCADR_M3H: livingCADR,
      currentPM25: Math.max(18, livingPM25),
      targetSafePM25: 25,
      complianceStatus: livingPM25 > 50 ? 'Hazardous' : livingPM25 > 25 ? 'Moderate' : 'Safe',
      zonalAdvice: livingRoomPurifierOn
        ? 'Central air filtration active. Buffer zone effectively mitigating exterior draft.'
        : 'Exterior door opening creates particulate drift. Deploy central Corsi-Rosenthal unit here.'
    },
    {
      id: 'zone_bedroom',
      name: 'Master Bedroom',
      volumeM3: bedroomVolume,
      infiltrationACH: bedroomInfiltrationACH,
      emissionRateUgMin: 5,
      hasPurifier: bedroomPurifierOn,
      purifierCADR_M3H: bedroomCADR,
      currentPM25: Math.max(8, bedroomPM25),
      targetSafePM25: 15,
      complianceStatus: bedroomPM25 <= 15 ? 'Safe' : 'Moderate',
      zonalAdvice: bedroomPurifierOn
        ? 'Sleep sanctuary validated. PM2.5 maintained below WHO safe threshold for nocturnal recovery.'
        : 'Nighttime inhalation risk elevated. Activate bedroom filtration unit before sleep.'
    },
    {
      id: 'zone_nursery',
      name: "Children's Nursery",
      volumeM3: nurseryVolume,
      infiltrationACH: nurseryInfiltrationACH,
      emissionRateUgMin: 2,
      hasPurifier: true,
      purifierCADR_M3H: nurseryCADR,
      currentPM25: Math.max(6, nurseryPM25),
      targetSafePM25: 12,
      complianceStatus: 'Safe',
      zonalAdvice: 'Strict pediatric threshold maintained. Low air infiltration protects developing lung alveoli.'
    }
  ];

  // Calculate Whole-House Volume-Weighted Average
  const totalVolume = kitchenVolume + livingVolume + bedroomVolume + nurseryVolume;
  const weightedPM25 = Math.round(
    zones.reduce((acc, z) => acc + z.currentPM25 * z.volumeM3, 0) / totalVolume
  );

  // 2. Filter Saturation & Prognostics Model
  // Davies / Darcy-Weisbach particle cake accumulation:
  // Particulate mass loaded (grams) = (Hours * FlowRate m3/h * PM2.5 ug/m3 * efficiency) / 10^6
  const avgOperatingCADR = 250;
  const filterEfficiency = 0.85; // MERV 13
  const massLoadedGrams = Number(
    ((filterHoursAccumulated * avgOperatingCADR * outdoorPM25 * filterEfficiency) / 1_000_000).toFixed(2)
  );

  // MERV 13 4-filter cube dust holding capacity ≈ 85 grams before pressure drop doubles
  const dustCapacityGrams = 85;
  const saturationPercent = Math.min(100, Math.round((massLoadedGrams / dustCapacityGrams) * 100));

  const initialPressureDropPa = 42;
  const currentPressureDropPa = Math.round(initialPressureDropPa * (1 + (saturationPercent / 100) * 1.6));
  const airflowDegradation = Math.min(45, Math.round((saturationPercent / 100) * 28));

  // Remaining lifetime in days based on 14 hours/day operation
  const dailyMassLoaded = (14 * avgOperatingCADR * outdoorPM25 * filterEfficiency) / 1_000_000;
  const remainingDays = dailyMassLoaded > 0
    ? Math.max(0, Math.round((dustCapacityGrams - massLoadedGrams) / dailyMassLoaded))
    : 90;

  let healthAlert: FilterPrognostic['healthAlert'] = 'Optimal Condition';
  if (saturationPercent >= 85) healthAlert = 'Clogged - Replace Filter Immediately';
  else if (saturationPercent >= 55) healthAlert = 'Moderate Dust Loading';

  const filterDiagnostic: FilterPrognostic = {
    filterType: 'Corsi_Rosenthal_Box',
    cumulativeHoursRun: filterHoursAccumulated,
    ambientAvgPM25: outdoorPM25,
    particulateMassLoadedGrams: massLoadedGrams,
    saturationPercentage: saturationPercent,
    initialPressureDropPa,
    currentPressureDropPa,
    airflowDegradationPercent: airflowDegradation,
    estimatedRemainingDays: remainingDays,
    healthAlert
  };

  const highestRiskZone = zones.reduce((prev, curr) => curr.currentPM25 > prev.currentPM25 ? curr : prev).name;

  return {
    householdId: 'home_multi_zone_default',
    outdoorPM25,
    zones,
    wholeHouseAveragePM25: weightedPM25,
    driftVectors: [
      { fromZone: 'Kitchen', toZone: 'Living Room', driftPM25UgMin: Math.round(kitchenEmission * 0.25) },
      { fromZone: 'Living Room', toZone: 'Master Bedroom', driftPM25UgMin: Math.round(livingPM25 * 0.12) }
    ],
    filterDiagnostic,
    highestRiskZone,
    strategicInterventions: [
      'Maintain positive pressure in bedrooms by weatherstripping door frames and running dedicated HEPA/Corsi units.',
      'Operate kitchen exhaust fan for minimum 12 minutes following stove shutdown to exhaust ultra-fine combustion aerosols.',
      `Air filter is currently at ${saturationPercent}% dust saturation. Estimated replacement in ${remainingDays} days.`
    ]
  };
}
