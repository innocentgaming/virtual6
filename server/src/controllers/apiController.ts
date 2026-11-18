import { Request, Response } from 'express';
import { getCityAQI, KNOWN_CITIES } from '../services/aqiService';
import { optimizeDailyRoutine } from '../services/routineOptimizerService';
import { simulateIndoorAirQuality } from '../services/iaqSimulationService';
import { generateAssistantResponse } from '../services/geminiService';
import { 
  getCommunityReports, 
  createCommunityReport, 
  upvoteCommunityReport 
} from '../services/communityService';
import { sanitizeString, sanitizeNumber } from '../utils/sanitizer';
import { UserLifestyleProfile, IAQSimulationInput } from '../types';

export async function getAQIHandler(req: Request, res: Response): Promise<void> {
  try {
    const rawCity = (req.query.city as string) || 'Delhi';
    const city = sanitizeString(rawCity, 60);
    const aqiData = await getCityAQI(city);
    res.json({ success: true, data: aqiData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve air quality data' });
  }
}

export function getCitiesListHandler(_req: Request, res: Response): void {
  const list = Object.values(KNOWN_CITIES).map(c => ({
    name: c.name,
    country: c.country
  }));
  res.json({ success: true, data: list });
}

export async function optimizeRoutineHandler(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body || {};
    const city = sanitizeString(body.city || 'Delhi', 60);
    const aqiData = await getCityAQI(city);

    const profile: UserLifestyleProfile = {
      city,
      householdMembers: sanitizeNumber(body.householdMembers, 1, 15, 3),
      vulnerabilities: Array.isArray(body.vulnerabilities) ? body.vulnerabilities : ['child'],
      homeAreaSqFt: sanitizeNumber(body.homeAreaSqFt, 100, 10000, 950),
      commuteMode: body.commuteMode || 'car_solo',
      commuteDistanceKm: sanitizeNumber(body.commuteDistanceKm, 1, 100, 12),
      heatingSource: body.heatingSource || 'electric_space_heater',
      hasAirPurifier: Boolean(body.hasAirPurifier),
      hasCookingExhaust: Boolean(body.hasCookingExhaust),
      morningOutdoorRoutine: Boolean(body.morningOutdoorRoutine)
    };

    const result = optimizeDailyRoutine(profile, aqiData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to calculate optimized routine' });
  }
}

export function simulateIAQHandler(req: Request, res: Response): void {
  try {
    const body = req.body || {};
    const input: IAQSimulationInput = {
      roomVolumeM3: sanitizeNumber(body.roomVolumeM3, 10, 500, 45), // ~160 sq ft room
      outdoorPM25: sanitizeNumber(body.outdoorPM25, 5, 800, 185),
      airChangesPerHour: sanitizeNumber(body.airChangesPerHour, 0.1, 3.0, 0.6),
      hasAirPurifier: Boolean(body.hasAirPurifier),
      purifierCADR_M3H: sanitizeNumber(body.purifierCADR_M3H, 0, 1000, 300),
      indoorSources: {
        cookingWithGas: Boolean(body.indoorSources?.cookingWithGas),
        hasExhaustOn: Boolean(body.indoorSources?.hasExhaustOn),
        incenseOrCandles: Boolean(body.indoorSources?.incenseOrCandles),
        drySweeping: Boolean(body.indoorSources?.drySweeping),
        smokingOrVaping: Boolean(body.indoorSources?.smokingOrVaping)
      },
      simulationDurationMinutes: sanitizeNumber(body.simulationDurationMinutes, 15, 180, 60)
    };

    const simulation = simulateIndoorAirQuality(input);
    res.json({ success: true, data: simulation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to simulate indoor air quality' });
  }
}

export async function chatHandler(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (messages.length === 0) {
      res.status(400).json({ success: false, error: 'Message payload required' });
      return;
    }

    const customKey = req.headers['x-gemini-key'] as string | undefined;
    const response = await generateAssistantResponse(
      messages,
      body.profile,
      body.currentAQI,
      customKey
    );

    res.json({ 
      success: true, 
      data: {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Chat assistant error' });
  }
}

export function getCommunityHandler(_req: Request, res: Response): void {
  const reports = getCommunityReports();
  res.json({ success: true, data: reports });
}

export function createCommunityReportHandler(req: Request, res: Response): void {
  try {
    const { reporterName, category, location, description } = req.body || {};
    if (!location || !description || !category) {
      res.status(400).json({ success: false, error: 'Missing required report fields' });
      return;
    }

    const report = createCommunityReport({
      reporterName,
      category,
      location,
      description
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit report' });
  }
}

export function upvoteCommunityHandler(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const updated = upvoteCommunityReport(id);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upvote report' });
  }
}
