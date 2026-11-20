/**
 * Route Exposure & Commute Shield Service
 * 
 * Quantifies microgram respiratory inhalation dosage across urban transit corridors
 * and evaluates direct emission prevention from sustainable transit alternatives.
 */

export interface CommuteRouteOption {
  id: string;
  name: string;
  mode: 'highway_car' | 'metro_transit' | 'green_buffer' | 'active_walk_cycle';
  durationMinutes: number;
  distanceKm: number;
  routeExposurePM25: number; // ug/m3
  minuteVentilationVE: number; // m3/h
  inhaledDoseUg: number; // microgram PM2.5 inhaled
  tailpipeCO2Grams: number;
  tailpipePM25Grams: number;
  respiratoryRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe Hazard';
  protectionTips: string[];
}

export interface RouteOptimizationResult {
  city: string;
  ambientPM25: number;
  commuteDistanceKm: number;
  routes: CommuteRouteOption[];
  recommendedRouteId: string;
  bestOptionDoseReductionPercent: number;
  bestOptionDoseAvoidedUg: number;
  bestOptionCO2SavedKg: number;
  clinicalImpactNotes: string;
}

export function evaluateCommuteRoutes(
  city: string,
  ambientPM25: number,
  commuteDistanceKm: number = 15,
  isVulnerableIndividual: boolean = false
): RouteOptimizationResult {
  // Speed benchmarks (km/h)
  const highwaySpeed = 32;
  const metroSpeed = 42;
  const greenRouteSpeed = 26;
  const walkingBikingSpeed = 14;

  const highwayDuration = Math.round((commuteDistanceKm / highwaySpeed) * 60);
  const metroDuration = Math.round((commuteDistanceKm / metroSpeed) * 60) + 8; // includes station access
  const greenDuration = Math.round((commuteDistanceKm / greenRouteSpeed) * 60);
  const activeDuration = Math.round((commuteDistanceKm / walkingBikingSpeed) * 60);

  // Corridor Particulate Exposure Ratios relative to ambient background
  // Highway corridor: trapped diesel emissions & resuspension -> +65%
  const highwayPM25 = Math.round(ambientPM25 * 1.65);
  // Metro: underground/elevated with recirculated air filtration -> -68%
  const metroPM25 = Math.round(ambientPM25 * 0.32);
  // Green buffer / residential backstreets: lower vehicle density -> -22%
  const greenPM25 = Math.round(ambientPM25 * 0.78);
  // Active roadside: direct proximity to exhausts -> +40%
  const activeRoadsidePM25 = Math.round(ambientPM25 * 1.40);

  // Minute Ventilation Rates (m3/h) per EPA Exposure Factors Handbook
  const veInCar = 0.65;
  const veInMetro = 0.75;
  const veDrivingGreen = 0.65;
  const veActiveCommute = 2.40; // Elevated breathing rate during physical exertion

  // Inhaled Dose Formula: Dose (ug) = Concentration (ug/m3) * VE (m3/h) * (duration / 60)
  const doseHighway = Math.round(highwayPM25 * veInCar * (highwayDuration / 60));
  const doseMetro = Math.round(metroPM25 * veInMetro * (metroDuration / 60));
  const doseGreen = Math.round(greenPM25 * veDrivingGreen * (greenDuration / 60));
  const doseActive = Math.round(activeRoadsidePM25 * veActiveCommute * (activeDuration / 60));

  // Emissions per trip
  // Average passenger car: 180 g CO2/km, 0.03 g PM2.5/km
  const carCO2Grams = Math.round(commuteDistanceKm * 180);
  const carPM25Grams = Number((commuteDistanceKm * 0.03).toFixed(2));

  // Electric Metro: 28 g CO2/passenger-km, 0 g tailpipe PM2.5
  const metroCO2Grams = Math.round(commuteDistanceKm * 28);

  const routes: CommuteRouteOption[] = [
    {
      id: 'route_highway',
      name: 'Direct Arterial Highway (Solo Vehicle)',
      mode: 'highway_car',
      durationMinutes: highwayDuration,
      distanceKm: commuteDistanceKm,
      routeExposurePM25: highwayPM25,
      minuteVentilationVE: veInCar,
      inhaledDoseUg: doseHighway,
      tailpipeCO2Grams: carCO2Grams,
      tailpipePM25Grams: carPM25Grams,
      respiratoryRiskLevel: doseHighway > 60 ? 'Severe Hazard' : 'High',
      protectionTips: [
        'Keep vehicle AC strictly set to Cabin Recirculation mode to prevent drawing in highway diesel soot.',
        'Upgrade vehicle cabin air filter to a HEPA/Activated Carbon composite filter.',
        'Avoid opening side windows even for toll booths or drive-throughs during rush hours.'
      ]
    },
    {
      id: 'route_metro',
      name: 'Shielded Metro Rail Transit',
      mode: 'metro_transit',
      durationMinutes: metroDuration,
      distanceKm: commuteDistanceKm,
      routeExposurePM25: metroPM25,
      minuteVentilationVE: veInMetro,
      inhaledDoseUg: doseMetro,
      tailpipeCO2Grams: metroCO2Grams,
      tailpipePM25Grams: 0,
      respiratoryRiskLevel: 'Low',
      protectionTips: [
        'Station platforms and train cars utilize commercial particulate air handling; lowest dose intake.',
        'Wear an N95 or KF94 mask during the final outdoor last-mile walk from station to destination.',
        'Reduces community carbon footprint by ~84% per commuter trip.'
      ]
    },
    {
      id: 'route_green',
      name: 'Low-Traffic Residential / Green Buffer Bypass',
      mode: 'green_buffer',
      durationMinutes: greenDuration,
      distanceKm: Math.round(commuteDistanceKm * 1.15), // slightly longer route
      routeExposurePM25: greenPM25,
      minuteVentilationVE: veDrivingGreen,
      inhaledDoseUg: doseGreen,
      tailpipeCO2Grams: Math.round(carCO2Grams * 1.1),
      tailpipePM25Grams: carPM25Grams,
      respiratoryRiskLevel: 'Moderate',
      protectionTips: [
        'Bypasses primary heavy-duty diesel truck transit corridors.',
        'Roadside vegetative tree canopies actively absorb coarse particulate matter.'
      ]
    },
    {
      id: 'route_active',
      name: 'Active Walking / Cycling along Surface Corridors',
      mode: 'active_walk_cycle',
      durationMinutes: activeDuration,
      distanceKm: commuteDistanceKm,
      routeExposurePM25: activeRoadsidePM25,
      minuteVentilationVE: veActiveCommute,
      inhaledDoseUg: doseActive,
      tailpipeCO2Grams: 0,
      tailpipePM25Grams: 0,
      respiratoryRiskLevel: 'Severe Hazard',
      protectionTips: [
        'CRITICAL WARNING: Minute ventilation increases to 2.4 m3/h under physical exertion, dramatically spiking deep lung dose.',
        'If active commuting is essential, you MUST wear a fitted NIOSH-certified N95/FFP2 respirator.',
        'Cloth and surgical masks do not seal against roadside ultra-fine soot particles.'
      ]
    }
  ];

  // Best recommended route is metro
  const recommendedRouteId = 'route_metro';
  const doseAvoided = doseHighway - doseMetro;
  const reductionPercent = Math.round((doseAvoided / doseHighway) * 100);
  const co2SavedKg = Number(((carCO2Grams - metroCO2Grams) / 1000).toFixed(2));

  const clinicalNotes = isVulnerableIndividual
    ? `For individuals with asthma, pediatric airways, or cardiac sensitivity, switching from highway traffic to shielded metro transit eliminates ${reductionPercent}% of inhaled particulate mass (${doseAvoided} µg PM2.5 avoided per trip), preventing acute airway vasoconstriction.`
    : `Selecting shielded metro rail reduces round-trip particulate intake by ${reductionPercent}% and removes ${co2SavedKg} kg of tailpipe CO2 from the urban airshed every single day.`;

  return {
    city,
    ambientPM25,
    commuteDistanceKm,
    routes,
    recommendedRouteId,
    bestOptionDoseReductionPercent: reductionPercent,
    bestOptionDoseAvoidedUg: doseAvoided,
    bestOptionCO2SavedKg: co2SavedKg,
    clinicalImpactNotes: clinicalNotes
  };
}
