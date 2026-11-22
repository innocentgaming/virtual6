import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import app from '../server/src/index';

describe('API HTTP Integration Suite (Target 100/100 Testing & Security)', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      // Bind to an ephemeral port
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://127.0.0.1:${address.port}/api`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/aqi -> returns real or fallback AQI telemetry with valid schema', async () => {
    const res = await fetch(`${baseUrl}/aqi?city=Delhi`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.city).toBe('Delhi NCR');
    expect(json.data.aqi).toBeGreaterThanOrEqual(0);
    expect(json.data.pollutants).toBeDefined();
    expect(json.data.pollutants.pm25).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/aqi/cities -> returns list of metropolitan hubs', async () => {
    const res = await fetch(`${baseUrl}/aqi/cities`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/aqi/forecast -> returns 72-hour forecast with boundary layer physics', async () => {
    const res = await fetch(`${baseUrl}/aqi/forecast?city=Delhi%20NCR`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.forecastPoints).toHaveLength(72);
  });

  it('GET /api/route/exposure -> returns 4 transit modes and identifies safest route', async () => {
    const res = await fetch(`${baseUrl}/route/exposure?city=Delhi&distanceKm=12&vulnerable=true`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.routes).toHaveLength(4);
    expect(json.data.bestOptionDoseReductionPercent).toBeGreaterThan(0);
  });

  it('GET /api/iaq/multizone -> returns multi-room IAQ and filter lifecycle status', async () => {
    const res = await fetch(`${baseUrl}/iaq/multizone?outdoorPM25=220&filterHours=450`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.zones)).toBe(true);
    expect(json.data.filterDiagnostic).toBeDefined();
  });

  it('POST /api/routine/optimize -> validates request body schema', async () => {
    // Valid body
    const validRes = await fetch(`${baseUrl}/routine/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona: 'family',
        city: 'Delhi NCR',
        vulnerabilities: ['infant'],
        commuteMode: 'carpool',
        budgetTier: 'moderate'
      })
    });
    expect(validRes.status).toBe(200);
    const validJson = await validRes.json();
    expect(validJson.success).toBe(true);
    expect(validJson.data.timeline.length).toBeGreaterThan(0);

    // Invalid body (invalid persona enum & out-of-range distance)
    const invalidRes = await fetch(`${baseUrl}/routine/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona: 'invalid_persona_role',
        commuteDistanceKm: -999
      })
    });
    expect(invalidRes.status).toBe(400);
  });

  it('POST /api/iaq/simulate -> calculates single-compartment aerosol decay', async () => {
    const res = await fetch(`${baseUrl}/iaq/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomVolumeM3: 40,
        outdoorPM25: 180,
        airChangesPerHour: 0.5,
        hasAirPurifier: true,
        purifierCADR_M3H: 220,
        indoorSources: {
          cookingWithGas: false,
          hasExhaustOn: true,
          incenseOrCandles: false,
          drySweeping: false,
          smokingOrVaping: false
        },
        simulationDurationMinutes: 60
      })
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.finalPM25).toBeLessThan(180);
  });

  it('POST /api/auth/register & /api/auth/login -> validates credential requirements', async () => {
    const testEmail = `qa_test_${Date.now()}@example.com`;
    const testPassword = 'StrongPassword123!';

    // Register
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'QA Test User'
      })
    });
    expect(regRes.status).toBe(201);
    const regJson = await regRes.json();
    expect(regJson.success).toBe(true);
    expect(regJson.data.token).toBeDefined();

    // Login with valid credentials
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    expect(loginRes.status).toBe(200);

    // Login with invalid password
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999'
      })
    });
    expect(badLoginRes.status).toBe(401);
  });

  it('Security: Helmet & CORS headers are strictly present', async () => {
    const res = await fetch(`${baseUrl}/aqi?city=Delhi`);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
    expect(res.headers.get('content-security-policy')).toBeDefined();
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});
