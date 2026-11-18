export type AirQualityLevel = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export interface PollutantBreakdown {
  pm25: number;      // ug/m3
  pm10: number;      // ug/m3
  no2: number;       // ug/m3
  o3: number;        // ug/m3
  co: number;        // ug/m3
  so2: number;       // ug/m3
}

export interface AQIData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  aqi: number;
  level: AirQualityLevel;
  primaryPollutant: string;
  pollutants: PollutantBreakdown;
  temperature: number; // Celsius
  humidity: number;    // %
  windSpeed: number;   // km/h
  isInversionLikely: boolean;
  smogAlertNotice: string;
  safeVentilationHours: string[];
}

export type HouseholdVulnerability = 'infant' | 'child' | 'asthma_respiratory' | 'elderly' | 'pregnant' | 'pet' | 'none';

export type CommuteMode = 'walking' | 'cycling' | 'motorbike' | 'car_solo' | 'carpool' | 'public_transit' | 'work_from_home';

export type HeatingSource = 'wood_biomass' | 'coal_chulha' | 'unvented_gas' | 'electric_space_heater' | 'heat_pump' | 'central_steam';

export interface UserLifestyleProfile {
  city: string;
  householdMembers: number;
  vulnerabilities: HouseholdVulnerability[];
  homeAreaSqFt: number;
  commuteMode: CommuteMode;
  commuteDistanceKm: number;
  heatingSource: HeatingSource;
  hasAirPurifier: boolean;
  hasCookingExhaust: boolean;
  morningOutdoorRoutine: boolean;
}

export interface RoutineTimeSlot {
  time: string;
  activity: string;
  ambientAQI: number;
  ambientPM25: number;
  traditionalExposureDoseUg: number; // micrograms inhaled
  recommendedActivity: string;
  mitigatedPM25: number;
  mitigatedExposureDoseUg: number;
  emissionMitigationGramsCO2: number;
  actionReasoning: string;
}

export interface OptimizedRoutineResponse {
  profile: UserLifestyleProfile;
  currentAQI: AQIData;
  timeline: RoutineTimeSlot[];
  impactSummary: {
    totalInhaledPM25AvoidedUg: number;
    percentageDoseReduction: number;
    equivalentCigarettesAvoided: number;
    totalCO2PreventedKg: number;
    primaryHealthRecommendations: string[];
  };
}

export interface IAQSimulationInput {
  roomVolumeM3: number;              // Room length * width * height
  outdoorPM25: number;               // ug/m3
  airChangesPerHour: number;         // 0.2 to 2.0 (leakiness of room)
  hasAirPurifier: boolean;
  purifierCADR_M3H: number;          // Clean Air Delivery Rate in m3/hour
  indoorSources: {
    cookingWithGas: boolean;
    hasExhaustOn: boolean;
    incenseOrCandles: boolean;
    drySweeping: boolean;
    smokingOrVaping: boolean;
  };
  simulationDurationMinutes: number;
}

export interface IAQSimulationResult {
  initialPM25: number;
  finalPM25: number;
  peakPM25: number;
  percentReduction: number;
  airQualityStatus: AirQualityLevel;
  timeToReachSafeThresholdMinutes: number | null;
  timelinePoints: { minute: number; indoorPM25: number; safeThreshold: number }[];
  actionableHacks: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface CommunityReport {
  id: string;
  reporterName: string;
  category: 'open_burning' | 'traffic_congestion' | 'dust_construction' | 'industrial_smoke' | 'carpool_offer';
  location: string;
  description: string;
  timestamp: string;
  upvotes: number;
  status: 'verified' | 'reported' | 'mitigated';
}
