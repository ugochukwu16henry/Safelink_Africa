/**
 * Emergency routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { triggerEmergency, getEmergency, cancelEmergency, getEmergencyHistory } from '../controllers/emergencyController';
import { authenticateToken } from '../middleware/auth';

export const emergencyRouter = Router();

// All emergency routes require authentication
emergencyRouter.use(authenticateToken);

/**
 * POST /api/emergency/trigger
 * Trigger SOS emergency alert
 */
emergencyRouter.post(
  '/trigger',
  [
    body('type').isIn(['medical', 'security', 'fire', 'accident', 'natural_disaster', 'other']),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('message').optional().isString().isLength({ max: 500 }),
  ],
  triggerEmergency
);

/**
 * GET /api/emergency/:id
 * Get emergency alert details
 */
emergencyRouter.get('/:id', getEmergency);

/**
 * POST /api/emergency/:id/cancel
 * Cancel emergency alert
 */
emergencyRouter.post('/:id/cancel', cancelEmergency);

/**
 * GET /api/emergency/history
 * Get user's emergency history
 */
emergencyRouter.get('/history', getEmergencyHistory);

