/**
 * Authentication routes
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, refreshToken, verifyPhone, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
authRouter.post(
  '/register',
  [
    body('phoneNumber').isMobilePhone('any').withMessage('Invalid phone number'),
    body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('First name required'),
    body('lastName').trim().isLength({ min: 1, max: 100 }).withMessage('Last name required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('country').isLength({ min: 2, max: 3 }).withMessage('Country code required'),
  ],
  register
);

/**
 * POST /api/auth/login
 * Login user
 */
authRouter.post(
  '/login',
  [
    body('phoneNumber').isMobilePhone('any').withMessage('Invalid phone number'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login
);

/**
 * POST /api/auth/verify-phone
 * Verify phone number with OTP
 */
authRouter.post(
  '/verify-phone',
  [
    body('phoneNumber').isMobilePhone('any').withMessage('Invalid phone number'),
    body('otp').isLength({ min: 4, max: 6 }).withMessage('Invalid OTP'),
  ],
  verifyPhone
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
authRouter.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token required'),
  ],
  refreshToken
);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
authRouter.post('/logout', authenticateToken, logout);

