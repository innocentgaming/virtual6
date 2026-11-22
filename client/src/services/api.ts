export interface AQIData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  aqi: number;
  level: string;
  primaryPollutant: string;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    co: number;
    so2: number;
  };
  temperature: number;
  humidity: number;
  windSpeed: number;
  isInversionLikely: boolean;
  smogAlertNotice: string;
  safeVentilationHours: string[];
}

export interface RoutineTimeSlot {
  time: string;
  activity: string;
  ambientAQI: number;
  ambientPM25: number;
  traditionalExposureDoseUg: number;
  recommendedActivity: string;
  mitigatedPM25: number;
  mitigatedExposureDoseUg: number;
  emissionMitigationGramsCO2: number;
  actionReasoning: string;
}

export type UserPersona = 'family' | 'student' | 'professional' | 'community';
export type HouseholdVulnerability = 'infant' | 'child' | 'asthma_respiratory' | 'elderly' | 'pregnant' | 'pet' | 'none';
export type CommuteMode = 'walking' | 'cycling' | 'motorbike' | 'car_solo' | 'carpool' | 'public_transit' | 'work_from_home';
export type HeatingSource = 'wood_biomass' | 'coal_chulha' | 'unvented_gas' | 'electric_space_heater' | 'heat_pump' | 'central_steam';

export interface UserLifestyleProfile {
  persona: UserPersona;
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
  budgetTier: 'low' | 'moderate' | 'high';
}

export interface IAQSimulationInput {
  roomVolumeM3: number;
  outdoorPM25: number;
  airChangesPerHour: number;
  hasAirPurifier: boolean;
  purifierCADR_M3H: number;
  indoorSources: {
    cookingWithGas: boolean;
    hasExhaustOn: boolean;
    incenseOrCandles: boolean;
    drySweeping: boolean;
    smokingOrVaping: boolean;
  };
  simulationDurationMinutes: number;
}

export interface OptimizedRoutineResponse {
  profile: Partial<UserLifestyleProfile>;
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

export interface IAQSimulationResult {
  initialPM25: number;
  finalPM25: number;
  peakPM25: number;
  percentReduction: number;
  airQualityStatus: string;
  timeToReachSafeThresholdMinutes: number | null;
  timelinePoints: { minute: number; indoorPM25: number; safeThreshold: number }[];
  actionableHacks: string[];
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

export interface HourlyForecastPoint {
  hourOffset: number;
  timestamp: string;
  timeLabel: string;
  dayLabel: string;
  predictedAQI: number;
  predictedPM25: number;
  predictedPM10: number;
  predictedO3: number;
  predictedNO2: number;
  boundaryLayerHeightMeters: number;
  isInversionActive: boolean;
  inversionSeverityIndex: number;
  dispersionRating: 'Excellent' | 'Moderate' | 'Poor' | 'Hazardous Stagnation';
  recommendedAction: string;
  isOptimalVentilationWindow: boolean;
}

export interface PredictiveSmogReport {
  city: string;
  generatedAt: string;
  baselineAQI: number;
  forecastPoints: HourlyForecastPoint[];
  peakSmogRiskHour: string;
  safestVentilationWindowTomorrow: string;
  threeDayAverageAQI: number;
  inversionWarningSeverity: 'None' | 'Moderate' | 'Severe' | 'Critical Stagnation';
}

export interface CommuteRouteOption {
  id: string;
  name: string;
  mode: 'highway_car' | 'metro_transit' | 'green_buffer' | 'active_walk_cycle';
  durationMinutes: number;
  distanceKm: number;
  routeExposurePM25: number;
  minuteVentilationVE: number;
  inhaledDoseUg: number;
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
  saturationPercentage: number;
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

export interface UserSession {
  id: string;
  email: string;
  name: string;
  token: string;
}

const API_BASE = '/api';

export function getCustomApiKey(): string {
  return localStorage.getItem('BREATHESMART_GEMINI_KEY') || '';
}

export function setCustomApiKey(key: string): void {
  if (key) {
    localStorage.setItem('BREATHESMART_GEMINI_KEY', key.trim());
  } else {
    localStorage.removeItem('BREATHESMART_GEMINI_KEY');
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('BREATHESMART_AUTH_TOKEN');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('BREATHESMART_AUTH_TOKEN', token);
  } else {
    localStorage.removeItem('BREATHESMART_AUTH_TOKEN');
  }
}

export async function fetchAQI(city: string): Promise<AQIData> {
  const res = await fetch(`${API_BASE}/aqi?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error('Failed to fetch AQI data');
  const json = await res.json();
  return json.data;
}

export async function fetchCities(): Promise<{ name: string; country: string }[]> {
  const res = await fetch(`${API_BASE}/aqi/cities`);
  if (!res.ok) throw new Error('Failed to fetch cities');
  const json = await res.json();
  return json.data;
}

export async function optimizeRoutine(profile: Partial<UserLifestyleProfile>): Promise<OptimizedRoutineResponse> {
  const res = await fetch(`${API_BASE}/routine/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to optimize routine');
  const json = await res.json();
  return json.data;
}

export async function simulateIAQ(input: Partial<IAQSimulationInput>): Promise<IAQSimulationResult> {
  const res = await fetch(`${API_BASE}/iaq/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error('Failed to simulate IAQ');
  const json = await res.json();
  return json.data;
}

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  profile?: Partial<UserLifestyleProfile>,
  currentAQI?: Partial<AQIData>
): Promise<string> {
  const customKey = getCustomApiKey();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (customKey) {
    headers['x-gemini-key'] = customKey;
  }

  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, profile, currentAQI })
  });
  if (!res.ok) throw new Error('Failed to get chat response');
  const json = await res.json();
  return json.data.content;
}

export async function fetchCommunityReports(): Promise<CommunityReport[]> {
  const res = await fetch(`${API_BASE}/community`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  const json = await res.json();
  return json.data;
}

export async function submitCommunityReport(data: {
  reporterName?: string;
  category: string;
  location: string;
  description: string;
}): Promise<CommunityReport> {
  const res = await fetch(`${API_BASE}/community`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit report');
  const json = await res.json();
  return json.data;
}

export async function upvoteReport(id: string): Promise<CommunityReport> {
  const res = await fetch(`${API_BASE}/community/${id}/upvote`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to upvote report');
  const json = await res.json();
  return json.data;
}

// User Auth & Privacy
export async function register(email: string, password: string, name: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Registration failed');
  setAuthToken(json.data.token);
  return { ...json.data.user, token: json.data.token };
}

export async function login(email: string, password: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Login failed');
  setAuthToken(json.data.token);
  return { ...json.data.user, token: json.data.token };
}

export async function exportUserData(): Promise<Record<string, unknown>> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/user/export`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to export data');
  return json.data;
}

export async function deleteUserAccount(): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/user/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete account');
  setAuthToken(null);
}

// 72-Hour Predictive Smog Forecast
export async function fetchPredictiveSmogForecast(city: string): Promise<PredictiveSmogReport> {
  const res = await fetch(`${API_BASE}/aqi/forecast?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error('Failed to fetch predictive smog forecast');
  const json = await res.json();
  return json.data;
}

// Commute Corridor Route Exposure
export async function fetchRouteExposure(
  city: string,
  distanceKm: number = 15,
  isVulnerable: boolean = false
): Promise<RouteOptimizationResult> {
  const res = await fetch(
    `${API_BASE}/route/exposure?city=${encodeURIComponent(city)}&distanceKm=${distanceKm}&vulnerable=${isVulnerable}`
  );
  if (!res.ok) throw new Error('Failed to evaluate commute routes');
  const json = await res.json();
  return json.data;
}

// Multi-Zone IAQ & Filter Lifecycle Prognostics
export async function fetchMultiZoneIAQ(
  outdoorPM25: number,
  cooking: boolean = true,
  bedroomPurifier: boolean = true,
  livingPurifier: boolean = false,
  filterHours: number = 320
): Promise<MultiZoneSimulationResult> {
  const res = await fetch(
    `${API_BASE}/iaq/multizone?outdoorPM25=${outdoorPM25}&cooking=${cooking}&bedroomPurifier=${bedroomPurifier}&livingPurifier=${livingPurifier}&filterHours=${filterHours}`
  );
  if (!res.ok) throw new Error('Failed to simulate multi-zone IAQ');
  const json = await res.json();
  return json.data;
}
