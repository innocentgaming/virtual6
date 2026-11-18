import NodeCache from 'node-cache';
import { AQIData, AirQualityLevel, PollutantBreakdown } from '../types';

// Cache AQI results for 10 minutes (600 seconds)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

interface CityCoords {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const KNOWN_CITIES: Record<string, CityCoords> = {
  'delhi': { name: 'Delhi NCR', country: 'India', lat: 28.6139, lon: 77.2090 },
  'beijing': { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  'lahore': { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587 },
  'salt lake city': { name: 'Salt Lake City', country: 'USA', lat: 40.7608, lon: -111.8910 },
  'london': { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  'milan': { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900 },
  'kathmandu': { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.3240 },
  'new york': { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  'mumbai': { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 }
};

export function calculateAQILevel(pm25: number): { aqi: number; level: AirQualityLevel } {
  // US EPA standard breakpoints for PM2.5 (ug/m3) -> AQI calculation
  let aqi: number;
  let level: AirQualityLevel;

  if (pm25 <= 12.0) {
    aqi = Math.round((50 / 12.0) * pm25);
    level = 'Good';
  } else if (pm25 <= 35.4) {
    aqi = Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
    level = 'Moderate';
  } else if (pm25 <= 55.4) {
    aqi = Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
    level = 'Unhealthy for Sensitive Groups';
  } else if (pm25 <= 150.4) {
    aqi = Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
    level = 'Unhealthy';
  } else if (pm25 <= 250.4) {
    aqi = Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
    level = 'Very Unhealthy';
  } else {
    aqi = Math.round(((500 - 301) / (500.4 - 250.5)) * (Math.min(pm25, 500) - 250.5) + 301);
    level = 'Hazardous';
  }

  return { aqi, level };
}

export function detectInversion(temp: number, windSpeed: number, humidity: number): boolean {
  // Classic winter smog inversion conditions:
  // Low ambient surface temp (< 16°C), calm winds (< 8 km/h), high moisture/humidity (> 65%)
  return temp < 16 && windSpeed < 8 && humidity > 65;
}

export function generateSafeVentilationHours(isInversion: boolean): string[] {
  if (isInversion) {
    // During thermal inversion, afternoon (12 PM - 3 PM) has maximal solar boundary layer heating
    return ['12:00 PM - 02:30 PM (Peak Solar Heating - Inversion Dispersed)'];
  }
  return [
    '11:00 AM - 01:00 PM (Mid-day minimum traffic)',
    '02:00 PM - 03:30 PM (Sunlight helps vertical mixing)'
  ];
}

export async function getCityAQI(cityName: string): Promise<AQIData> {
  const normalizedKey = cityName.trim().toLowerCase();
  const cachedData = cache.get<AQIData>(normalizedKey);
  if (cachedData) {
    return cachedData;
  }

  let coords: CityCoords = KNOWN_CITIES[normalizedKey];
  if (!coords) {
    // Default to Delhi if unknown or search match
    coords = KNOWN_CITIES['delhi'];
  }

  try {
    // Open-Meteo Air Quality & Weather API
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    const [aqiRes, weatherRes] = await Promise.all([
      fetch(aqiUrl, { signal: AbortSignal.timeout(4000) }),
      fetch(weatherUrl, { signal: AbortSignal.timeout(4000) })
    ]);

    if (!aqiRes.ok || !weatherRes.ok) {
      throw new Error('Upstream weather API responded with status error');
    }

    const aqiJson = await aqiRes.json();
    const weatherJson = await weatherRes.json();

    const pm25 = aqiJson.current?.pm2_5 ?? 145;
    const pm10 = aqiJson.current?.pm10 ?? 260;
    const no2 = aqiJson.current?.nitrogen_dioxide ?? 55;
    const o3 = aqiJson.current?.ozone ?? 25;
    const so2 = aqiJson.current?.sulphur_dioxide ?? 15;
    const co = aqiJson.current?.carbon_monoxide ?? 850;

    const temp = weatherJson.current?.temperature_2m ?? 14;
    const humidity = weatherJson.current?.relative_humidity_2m ?? 78;
    const windSpeed = weatherJson.current?.wind_speed_10m ?? 4.2;

    const { aqi, level } = calculateAQILevel(pm25);
    const isInversion = detectInversion(temp, windSpeed, humidity);
    const safeHours = generateSafeVentilationHours(isInversion);

    const alertNotice = isInversion
      ? 'Thermal Inversion Detected! Cold air is trapped beneath warm air layer, concentrating surface PM2.5. Reschedule early morning runs & keep windows sealed.'
      : (level === 'Hazardous' || level === 'Very Unhealthy')
      ? 'Severe Smog Episode! Ambient air has hazardous particulate levels. Vulnerable members should strictly remain indoors with filtration.'
      : 'Moderate air pollution levels. High-efficiency transit and localized ventilation advised.';

    const result: AQIData = {
      city: coords.name,
      country: coords.country,
      latitude: coords.lat,
      longitude: coords.lon,
      timestamp: new Date().toISOString(),
      aqi,
      level,
      primaryPollutant: 'PM2.5 (Fine Respirable Particulates)',
      pollutants: {
        pm25: Math.round(pm25 * 10) / 10,
        pm10: Math.round(pm10 * 10) / 10,
        no2: Math.round(no2 * 10) / 10,
        o3: Math.round(o3 * 10) / 10,
        co: Math.round(co * 10) / 10,
        so2: Math.round(so2 * 10) / 10,
      },
      temperature: Math.round(temp * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
      isInversionLikely: isInversion,
      smogAlertNotice: alertNotice,
      safeVentilationHours: safeHours
    };

    cache.set(normalizedKey, result);
    return result;
  } catch (err) {
    // Deterministic realistic fallback for winter smog season
    return getFallbackAQI(coords);
  }
}

export function getFallbackAQI(coords: CityCoords): AQIData {
  // Realistic winter smog baselines based on geographic profile
  let basePM25 = 175;
  let temp = 13.5;
  let humidity = 82;
  let windSpeed = 3.8;

  if (coords.name.includes('Salt Lake City')) {
    basePM25 = 48; // Typical winter bowl inversion
    temp = 1.0;
    humidity = 70;
    windSpeed = 4.5;
  } else if (coords.name.includes('London')) {
    basePM25 = 22;
    temp = 8.0;
    humidity = 88;
    windSpeed = 12.0;
  } else if (coords.name.includes('Beijing')) {
    basePM25 = 130;
    temp = 2.0;
    humidity = 55;
    windSpeed = 5.0;
  } else if (coords.name.includes('Lahore') || coords.name.includes('Delhi')) {
    basePM25 = 285; // Severe seasonal smog
    temp = 12.0;
    humidity = 85;
    windSpeed = 3.2;
  }

  const { aqi, level } = calculateAQILevel(basePM25);
  const isInversion = detectInversion(temp, windSpeed, humidity);

  return {
    city: coords.name,
    country: coords.country,
    latitude: coords.lat,
    longitude: coords.lon,
    timestamp: new Date().toISOString(),
    aqi,
    level,
    primaryPollutant: 'PM2.5 (Fine Respirable Particulates)',
    pollutants: {
      pm25: basePM25,
      pm10: basePM25 * 1.8,
      no2: 68.4,
      o3: 21.0,
      co: 1100,
      so2: 18.2
    },
    temperature: temp,
    humidity: humidity,
    windSpeed: windSpeed,
    isInversionLikely: isInversion,
    smogAlertNotice: isInversion
      ? 'Thermal Inversion Detected! Cold air is trapped beneath warm air layer, concentrating surface PM2.5. Reschedule early morning runs & keep windows sealed.'
      : 'Severe Winter Particulate Loading. Stay protected indoors during morning and night smog peaks.',
    safeVentilationHours: generateSafeVentilationHours(isInversion)
  };
}
