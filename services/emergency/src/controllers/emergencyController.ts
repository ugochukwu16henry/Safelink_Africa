/**
 * Emergency controller
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { db, redis, io } from '../index';
import { EmergencyStatus, EmergencyType } from '../../../shared/types';
import { logger } from '../utils/logger';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005';

/**
 * Trigger emergency SOS alert
 */
export async function triggerEmergency(req: Request, res: Response): Promise<void> {
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

    const userId = req.user?.userId;
    const { type, latitude, longitude, accuracy, altitude, address, message } = req.body;

    // Create emergency alert
    const result = await db.query(
      `INSERT INTO emergency_alerts (
        user_id, type, status, latitude, longitude, accuracy, altitude, address, message, triggered_at, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, ST_SetSRID(ST_MakePoint($5, $4), 4326))
      RETURNING id, user_id, type, status, latitude, longitude, accuracy, altitude, address, message, triggered_at`,
      [
        userId,
        type,
        EmergencyStatus.ACTIVE,
        latitude,
        longitude,
        accuracy || null,
        altitude || null,
        address || null,
        message || null,
      ]
    );

    const alert = result.rows[0];

    // Get user details
    const userResult = await db.query(
      'SELECT phone_number, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Get emergency contacts
    const contactsResult = await db.query(
      'SELECT name, phone_number, is_primary FROM emergency_contacts WHERE user_id = $1',
      [userId]
    );

    // Emit real-time alert via Socket.IO
    io.emit('emergency:alert', {
      id: alert.id,
      userId,
      type: alert.type,
      location: {
        latitude: alert.latitude,
        longitude: alert.longitude,
        accuracy: alert.accuracy,
        address: alert.address,
      },
      user: {
        name: `${user.first_name} ${user.last_name}`,
        phoneNumber: user.phone_number,
      },
      triggeredAt: alert.triggered_at,
    });

    // Store alert in Redis for quick access
    await redis.setEx(
      `emergency:${alert.id}`,
      3600, // 1 hour expiry
      JSON.stringify(alert)
    );

    // Notify emergency contacts
    for (const contact of contactsResult.rows) {
      try {
        await axios.post(`${NOTIFICATIONS_SERVICE_URL}/api/notifications/send`, {
          userId,
          phoneNumber: contact.phone_number,
          type: 'emergency_alert',
          channel: 'sms',
          title: 'Emergency Alert',
          message: `${user.first_name} ${user.last_name} has triggered an emergency alert. Location: ${alert.address || `${alert.latitude}, ${alert.longitude}`}`,
          data: {
            emergencyId: alert.id,
            contactName: contact.name,
          },
        });
      } catch (error) {
        logger.error(`Failed to notify contact ${contact.phone_number}:`, error);
      }
    }

    // Send push notification to user's device
    try {
      await axios.post(`${NOTIFICATIONS_SERVICE_URL}/api/notifications/send`, {
        userId,
        type: 'emergency_alert',
        channel: 'push',
        title: 'Emergency Alert Activated',
        message: 'Your emergency alert has been activated. Help is on the way.',
        data: {
          emergencyId: alert.id,
          type: alert.type,
        },
      });
    } catch (error) {
      logger.error('Failed to send push notification:', error);
    }

    logger.info(`Emergency alert triggered: ${alert.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        emergency: {
          id: alert.id,
          type: alert.type,
          status: alert.status,
          location: {
            latitude: alert.latitude,
            longitude: alert.longitude,
            accuracy: alert.accuracy,
            altitude: alert.altitude,
            address: alert.address,
          },
          message: alert.message,
          triggeredAt: alert.triggered_at,
        },
        message: 'Emergency alert activated successfully',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Trigger emergency error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to trigger emergency alert',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get emergency alert details
 */
export async function getEmergency(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await db.query(
      `SELECT id, user_id, type, status, latitude, longitude, accuracy, altitude, address, message, triggered_at, resolved_at
       FROM emergency_alerts WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Emergency alert not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    const alert = result.rows[0];

    // Check if user has permission to view this alert
    if (alert.user_id !== userId && req.user?.role !== 'admin' && req.user?.role !== 'security_partner') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this alert',
        },
        timestamp: new Date(),
      });
      return;
    }

    res.json({
      success: true,
      data: {
        emergency: {
          id: alert.id,
          type: alert.type,
          status: alert.status,
          location: {
            latitude: alert.latitude,
            longitude: alert.longitude,
            accuracy: alert.accuracy,
            altitude: alert.altitude,
            address: alert.address,
          },
          message: alert.message,
          triggeredAt: alert.triggered_at,
          resolvedAt: alert.resolved_at,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Get emergency error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch emergency alert',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Cancel emergency alert
 */
export async function cancelEmergency(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Check if alert exists and belongs to user
    const checkResult = await db.query(
      'SELECT id, status FROM emergency_alerts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Emergency alert not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    const alert = checkResult.rows[0];

    if (alert.status !== EmergencyStatus.ACTIVE) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Emergency alert is not active',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Update alert status
    await db.query(
      'UPDATE emergency_alerts SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2',
      [EmergencyStatus.CANCELLED, id]
    );

    // Remove from Redis
    await redis.del(`emergency:${id}`);

    // Emit cancellation event
    io.emit('emergency:cancelled', { id, userId });

    logger.info(`Emergency alert cancelled: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: {
        message: 'Emergency alert cancelled successfully',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Cancel emergency error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel emergency alert',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get emergency history
 */
export async function getEmergencyHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT id, type, status, latitude, longitude, address, message, triggered_at, resolved_at
       FROM emergency_alerts
       WHERE user_id = $1
       ORDER BY triggered_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM emergency_alerts WHERE user_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        items: result.rows.map((alert) => ({
          id: alert.id,
          type: alert.type,
          status: alert.status,
          location: {
            latitude: alert.latitude,
            longitude: alert.longitude,
            address: alert.address,
          },
          message: alert.message,
          triggeredAt: alert.triggered_at,
          resolvedAt: alert.resolved_at,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Get emergency history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch emergency history',
      },
      timestamp: new Date(),
    });
  }
}

