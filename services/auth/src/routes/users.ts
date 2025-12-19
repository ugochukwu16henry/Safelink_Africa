/**
 * User routes
 */

import { Router } from 'express';
import { getUserProfile, updateUserProfile, addEmergencyContact } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

export const userRouter = Router();

// All user routes require authentication
userRouter.use(authenticateToken);

/**
 * GET /api/users/me
 * Get current user profile
 */
userRouter.get('/me', getUserProfile);

/**
 * PUT /api/users/me
 * Update user profile
 */
userRouter.put('/me', updateUserProfile);

/**
 * POST /api/users/emergency-contacts
 * Add emergency contact
 */
userRouter.post('/emergency-contacts', addEmergencyContact);

