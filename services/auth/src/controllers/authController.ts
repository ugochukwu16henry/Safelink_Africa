/**
 * Authentication controller
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db, redis } from '../index';
import { UserRole, UserStatus } from '../../../shared/types';
import { logger } from '../utils/logger';
import { generateOTP, verifyOTP } from '../utils/otp';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

/**
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array(),
        },
        timestamp: new Date(),
      });
      return;
    }

    const { phoneNumber, firstName, lastName, password, country, email, language } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this phone number already exists',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (phone_number, email, first_name, last_name, password_hash, country, language, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, phone_number, email, first_name, last_name, role, status, country, language, created_at`,
      [
        phoneNumber,
        email || null,
        firstName,
        lastName,
        passwordHash,
        country,
        language || 'en',
        UserRole.INDIVIDUAL,
        UserStatus.PENDING_VERIFICATION,
      ]
    );

    const user = result.rows[0];

    // Generate OTP for phone verification
    const otp = generateOTP();
    await redis.setEx(`otp:${phoneNumber}`, 600, otp); // 10 minutes expiry

    // TODO: Send OTP via SMS service

    logger.info(`User registered: ${phoneNumber}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          country: user.country,
          language: user.language,
        },
        message: 'Registration successful. Please verify your phone number.',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Registration failed',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array(),
        },
        timestamp: new Date(),
      });
      return;
    }

    const { phoneNumber, password } = req.body;

    // Find user
    const result = await db.query(
      'SELECT id, phone_number, email, first_name, last_name, password_hash, role, status FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid phone number or password',
        },
        timestamp: new Date(),
      });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid phone number or password',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.VERIFIED) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is not active. Please verify your phone number.',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        phoneNumber: user.phone_number,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Store refresh token in Redis
    await redis.setEx(`refresh_token:${user.id}`, 30 * 24 * 60 * 60, refreshToken);

    // Update last active
    await db.query('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    logger.info(`User logged in: ${phoneNumber}`);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: JWT_EXPIRES_IN,
        tokenType: 'Bearer',
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Verify phone number with OTP
 */
export async function verifyPhone(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array(),
        },
        timestamp: new Date(),
      });
      return;
    }

    const { phoneNumber, otp } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(phoneNumber, otp);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid or expired OTP',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Update user status
    await db.query(
      'UPDATE users SET status = $1 WHERE phone_number = $2',
      [UserStatus.VERIFIED, phoneNumber]
    );

    logger.info(`Phone verified: ${phoneNumber}`);

    res.json({
      success: true,
      data: {
        message: 'Phone number verified successfully',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Verification failed',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Refresh token required',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Check if token exists in Redis
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (storedToken !== token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Refresh token not found or expired',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Get user details
    const result = await db.query(
      'SELECT id, phone_number, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    const user = result.rows[0];

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        phoneNumber: user.phone_number,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: JWT_EXPIRES_IN,
        tokenType: 'Bearer',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired refresh token',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Logout user
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;

    if (userId) {
      // Remove refresh token from Redis
      await redis.del(`refresh_token:${userId}`);
    }

    res.json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Logout failed',
      },
      timestamp: new Date(),
    });
  }
}

