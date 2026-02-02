/**
 * SafeLink Africa — Auth API
 * POST /auth/register, POST /auth/login, GET /auth/me
 */

import { Router, Request, Response } from 'express';
import * as store from '../store';
import { authMiddleware, signToken, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

// POST /auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
    res.status(400).json({
      error: 'Bad request',
      message: 'email, password, and name (strings) required',
    });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({
      error: 'Bad request',
      message: 'Password must be at least 6 characters',
    });
    return;
  }
  try {
    const user = store.createUser(email, password, name);
    const token = signToken(user.id, user.email, user.role);
    res.status(201).json({
      user: store.toPublicUser(user),
      token,
      expiresIn: '7d',
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_IN_USE') {
      res.status(409).json({ error: 'Conflict', message: 'Email already in use' });
      return;
    }
    throw e;
  }
});

// POST /auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({
      error: 'Bad request',
      message: 'email and password (strings) required',
    });
    return;
  }
  const user = store.verifyUser(email, password);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
    return;
  }
  const token = signToken(user.id, user.email, user.role);
  res.status(200).json({
    user: store.toPublicUser(user),
    token,
    expiresIn: '7d',
  });
});

// GET /auth/me — requires Bearer token
authRouter.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const user = store.findUserById(req.user.userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
    return;
  }
  res.status(200).json({ user: store.toPublicUser(user) });
});
