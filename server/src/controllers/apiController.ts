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
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  exportUserData, 
  deleteUserData 
} from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { sanitizeString } from '../utils/sanitizer';
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
    const body = req.body;
    const city = sanitizeString(body.city || 'Delhi NCR', 60);
    const aqiData = await getCityAQI(city);

    const profile: UserLifestyleProfile = {
      persona: body.persona || 'family',
      city,
      householdMembers: body.householdMembers ?? 3,
      vulnerabilities: Array.isArray(body.vulnerabilities) ? body.vulnerabilities : ['child'],
      homeAreaSqFt: body.homeAreaSqFt ?? 900,
      commuteMode: body.commuteMode || 'car_solo',
      commuteDistanceKm: body.commuteDistanceKm ?? 12,
      heatingSource: body.heatingSource || 'electric_space_heater',
      hasAirPurifier: Boolean(body.hasAirPurifier),
      hasCookingExhaust: Boolean(body.hasCookingExhaust),
      morningOutdoorRoutine: Boolean(body.morningOutdoorRoutine),
      budgetTier: body.budgetTier || 'moderate'
    };

    const result = optimizeDailyRoutine(profile, aqiData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to calculate optimized routine' });
  }
}

export function simulateIAQHandler(req: Request, res: Response): void {
  try {
    const body = req.body;
    const input: IAQSimulationInput = {
      roomVolumeM3: body.roomVolumeM3,
      outdoorPM25: body.outdoorPM25,
      airChangesPerHour: body.airChangesPerHour,
      hasAirPurifier: body.hasAirPurifier,
      purifierCADR_M3H: body.purifierCADR_M3H,
      indoorSources: {
        cookingWithGas: Boolean(body.indoorSources?.cookingWithGas),
        hasExhaustOn: Boolean(body.indoorSources?.hasExhaustOn),
        incenseOrCandles: Boolean(body.indoorSources?.incenseOrCandles),
        drySweeping: Boolean(body.indoorSources?.drySweeping),
        smokingOrVaping: Boolean(body.indoorSources?.smokingOrVaping)
      },
      simulationDurationMinutes: body.simulationDurationMinutes
    };

    const simulation = simulateIndoorAirQuality(input);
    res.json({ success: true, data: simulation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to simulate indoor air quality' });
  }
}

export async function chatHandler(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body;
    const messages = body.messages;

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
    const { reporterName, category, location, description } = req.body;
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

// Authentication & Privacy Handlers
export function registerHandler(req: Request, res: Response): void {
  try {
    const { email, password, name } = req.body;
    const auth = registerUser(email, password, name);
    res.status(201).json({ success: true, data: auth });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Registration failed' });
  }
}

export function loginHandler(req: Request, res: Response): void {
  try {
    const { email, password } = req.body;
    const auth = loginUser(email, password);
    res.json({ success: true, data: auth });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message || 'Authentication failed' });
  }
}

export function getProfileHandler(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = getUserProfile(req.userId!);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: user.profile || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
  }
}

export function updateProfileHandler(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = updateUserProfile(req.userId!, req.body);
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: user.profile
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Profile update failed' });
  }
}

export function exportDataHandler(req: AuthenticatedRequest, res: Response): void {
  try {
    const exported = exportUserData(req.userId!);
    res.json({ success: true, data: exported });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message || 'Export failed' });
  }
}

export function deleteAccountHandler(req: AuthenticatedRequest, res: Response): void {
  try {
    const success = deleteUserData(req.userId!);
    if (success) {
      res.json({ success: true, message: 'User account and all personal data permanently deleted.' });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
}
