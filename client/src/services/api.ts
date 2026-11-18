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

export interface OptimizedRoutineResponse {
  profile: any;
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

const API_BASE = '/api';

export function getCustomApiKey(): string {
  return localStorage.getItem('AEROSHIELD_GEMINI_KEY') || '';
}

export function setCustomApiKey(key: string): void {
  if (key) {
    localStorage.setItem('AEROSHIELD_GEMINI_KEY', key.trim());
  } else {
    localStorage.removeItem('AEROSHIELD_GEMINI_KEY');
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

export async function optimizeRoutine(profile: any): Promise<OptimizedRoutineResponse> {
  const res = await fetch(`${API_BASE}/routine/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to optimize routine');
  const json = await res.json();
  return json.data;
}

export async function simulateIAQ(input: any): Promise<IAQSimulationResult> {
  const res = await fetch(`${API_BASE}/iaq/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error('Failed to simulate IAQ');
  const json = await res.json();
  return json.data;
}

export async function sendChatMessage(messages: { role: string; content: string }[], profile?: any, currentAQI?: any): Promise<string> {
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
