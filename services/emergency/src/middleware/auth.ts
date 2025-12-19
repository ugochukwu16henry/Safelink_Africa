/**
 * Authentication middleware (reuses from auth service pattern)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../../shared/types';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authenticate JWT token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required',
      },
      timestamp: new Date(),
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    // Try to validate with auth service
    axios
      .get(`${AUTH_SERVICE_URL}/api/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        const decoded = jwt.decode(token) as JwtPayload;
        req.user = decoded;
        next();
      })
      .catch(() => {
        res.status(403).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
          timestamp: new Date(),
        });
      });
  }
}

