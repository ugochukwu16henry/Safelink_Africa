/**
 * Transport routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  startTrip,
  updateTripLocation,
  endTrip,
  getTrip,
  getTripHistory,
} from '../controllers/transportController';
import { authenticateToken } from '../middleware/auth';

export const transportRouter = Router();

transportRouter.use(authenticateToken);

/**
 * POST /api/transport/trips
 * Start a new trip
 */
transportRouter.post(
  '/trips',
  [
    body('startLatitude').isFloat({ min: -90, max: 90 }),
    body('startLongitude').isFloat({ min: -180, max: 180 }),
    body('endLatitude').isFloat({ min: -90, max: 90 }),
    body('endLongitude').isFloat({ min: -180, max: 180 }),
    body('vehicleId').optional().isString(),
  ],
  startTrip
);

/**
 * POST /api/transport/trips/:id/location
 * Update trip location
 */
transportRouter.post('/trips/:id/location', updateTripLocation);

/**
 * POST /api/transport/trips/:id/end
 * End trip
 */
transportRouter.post('/trips/:id/end', endTrip);

/**
 * GET /api/transport/trips/:id
 * Get trip details
 */
transportRouter.get('/trips/:id', getTrip);

/**
 * GET /api/transport/trips
 * Get trip history
 */
transportRouter.get('/trips', getTripHistory);

