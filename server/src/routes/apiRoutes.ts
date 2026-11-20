import { Router } from 'express';
import {
  getAQIHandler,
  getCitiesListHandler,
  optimizeRoutineHandler,
  simulateIAQHandler,
  chatHandler,
  getCommunityHandler,
  createCommunityReportHandler,
  upvoteCommunityHandler,
  registerHandler,
  loginHandler,
  getProfileHandler,
  updateProfileHandler,
  exportDataHandler,
  deleteAccountHandler,
  getPredictiveForecastHandler,
  getRouteExposureHandler,
  getMultiZoneIAQHandler
} from '../controllers/apiController';
import { 
  validateBody, 
  registerSchema, 
  loginSchema, 
  routineSchema, 
  iaqSchema, 
  chatSchema, 
  communitySchema 
} from '../middleware/validator';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Authentication & Profile Endpoints
router.post('/auth/register', validateBody(registerSchema), registerHandler);
router.post('/auth/login', validateBody(loginSchema), loginHandler);
router.get('/user/profile', requireAuth, getProfileHandler);
router.post('/user/profile', requireAuth, updateProfileHandler);
router.get('/user/export', requireAuth, exportDataHandler);
router.delete('/user/account', requireAuth, deleteAccountHandler);

// Air quality endpoints
router.get('/aqi', getAQIHandler);
router.get('/aqi/cities', getCitiesListHandler);
router.get('/aqi/forecast', getPredictiveForecastHandler);

// Route exposure optimization
router.get('/route/exposure', getRouteExposureHandler);

// Multi-zone IAQ & filter lifecycle prognostics
router.get('/iaq/multizone', getMultiZoneIAQHandler);

// Routine optimization
router.post('/routine/optimize', validateBody(routineSchema), optimizeRoutineHandler);

// Indoor air quality simulation
router.post('/iaq/simulate', validateBody(iaqSchema), simulateIAQHandler);

// GenAI assistant chat
router.post('/chat', validateBody(chatSchema), chatHandler);

// Community alerts & carpools
router.get('/community', getCommunityHandler);
router.post('/community', validateBody(communitySchema), createCommunityReportHandler);
router.post('/community/:id/upvote', upvoteCommunityHandler);

// System health check
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'BreatheSmart AI Engine', 
    version: '1.0.0', 
    timestamp: new Date().toISOString() 
  });
});

export default router;
