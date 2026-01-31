import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../store';

const JWT_SECRET = process.env.JWT_SECRET || 'safelink-africa-dev-secret-change-in-production';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
    return;
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload & { iat?: number; exp?: number };
    const user = findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
      return;
    }
    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export function signToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export { JWT_SECRET };
