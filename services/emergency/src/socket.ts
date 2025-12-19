/**
 * Socket.IO setup for real-time emergency alerts
 */

import { Server, Socket } from 'socket.io';
import { logger } from './utils/logger';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';

export function setupSocketIO(io: Server): void {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userRole = (socket as any).userRole;

    logger.info(`Socket connected: ${userId} (${userRole})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join role-based rooms for security partners/admins
    if (userRole === 'security_partner' || userRole === 'admin') {
      socket.join('security:alerts');
    }

    // Handle emergency response
    socket.on('emergency:respond', async (data) => {
      const { emergencyId } = data;
      logger.info(`User ${userId} responding to emergency ${emergencyId}`);

      // Emit response to emergency room
      io.to(`emergency:${emergencyId}`).emit('emergency:response', {
        emergencyId,
        responderId: userId,
        timestamp: new Date(),
      });
    });

    // Handle location updates during emergency
    socket.on('emergency:location', (data) => {
      const { emergencyId, location } = data;
      io.to(`emergency:${emergencyId}`).emit('emergency:location_update', {
        emergencyId,
        location,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);
    });
  });
}

