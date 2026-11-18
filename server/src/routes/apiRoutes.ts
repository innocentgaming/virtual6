import { Router } from 'express';
import {
  getAQIHandler,
  getCitiesListHandler,
  optimizeRoutineHandler,
  simulateIAQHandler,
  chatHandler,
  getCommunityHandler,
  createCommunityReportHandler,
  upvoteCommunityHandler
} from '../controllers/apiController';

const router = Router();

// Air quality endpoints
router.get('/aqi', getAQIHandler);
router.get('/aqi/cities', getCitiesListHandler);

// Routine optimization
router.post('/routine/optimize', optimizeRoutineHandler);

// Indoor air quality simulation
router.post('/iaq/simulate', simulateIAQHandler);

// GenAI assistant chat
router.post('/chat', chatHandler);

// Community alerts & carpools
router.get('/community', getCommunityHandler);
router.post('/community', createCommunityReportHandler);
router.post('/community/:id/upvote', upvoteCommunityHandler);

// System health check
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default router;
