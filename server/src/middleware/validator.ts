import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(60)
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const routineSchema = z.object({
  city: z.string().min(1).max(60).default('Delhi NCR'),
  persona: z.enum(['family', 'student', 'professional', 'community']).default('family'),
  householdMembers: z.number().int().min(1).max(20).default(3),
  vulnerabilities: z.array(z.string()).default([]),
  homeAreaSqFt: z.number().min(50).max(15000).default(900),
  commuteMode: z.enum(['walking', 'cycling', 'motorbike', 'car_solo', 'carpool', 'public_transit', 'work_from_home']).default('car_solo'),
  commuteDistanceKm: z.number().min(0).max(200).default(12),
  heatingSource: z.enum(['wood_biomass', 'coal_chulha', 'unvented_gas', 'electric_space_heater', 'heat_pump', 'central_steam']).default('electric_space_heater'),
  hasAirPurifier: z.boolean().default(false),
  hasCookingExhaust: z.boolean().default(true),
  morningOutdoorRoutine: z.boolean().default(true),
  budgetTier: z.enum(['low', 'moderate', 'high']).default('moderate')
});

export const iaqSchema = z.object({
  roomVolumeM3: z.number().min(5).max(1000).default(45),
  outdoorPM25: z.number().min(0).max(1500).default(180),
  airChangesPerHour: z.number().min(0.05).max(5.0).default(0.6),
  hasAirPurifier: z.boolean().default(true),
  purifierCADR_M3H: z.number().min(0).max(2000).default(300),
  indoorSources: z.object({
    cookingWithGas: z.boolean().default(false),
    hasExhaustOn: z.boolean().default(true),
    incenseOrCandles: z.boolean().default(false),
    drySweeping: z.boolean().default(false),
    smokingOrVaping: z.boolean().default(false)
  }).default({}),
  simulationDurationMinutes: z.number().min(15).max(240).default(60)
});

export const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(3000)
  })).min(1, 'Messages list must not be empty'),
  profile: z.record(z.any()).optional(),
  currentAQI: z.record(z.any()).optional()
});

export const communitySchema = z.object({
  reporterName: z.string().max(50).optional().default('Neighbor'),
  category: z.enum(['open_burning', 'traffic_congestion', 'dust_construction', 'industrial_smoke', 'carpool_offer']),
  location: z.string().min(2, 'Location is required').max(120),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500)
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
        return;
      }
      res.status(400).json({ success: false, error: 'Malformed request body' });
    }
  };
}
