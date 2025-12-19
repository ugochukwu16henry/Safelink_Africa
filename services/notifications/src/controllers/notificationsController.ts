/**
 * Notifications controller
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendPushNotification, sendSMS, sendUSSD } from '../services/notificationChannels';
import { logger } from '../utils/logger';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * Send notification
 */
export async function sendNotification(req: Request, res: Response): Promise<void> {
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

    const { userId, phoneNumber, type, channel, title, message, data } = req.body;

    let sent = false;
    let notificationId: string | null = null;

    // Send via appropriate channel
    switch (channel) {
      case 'push':
        sent = await sendPushNotification(userId, title, message, data);
        break;
      case 'sms':
        const phone = phoneNumber || await getUserPhoneNumber(userId);
        if (phone) {
          sent = await sendSMS(phone, message);
        }
        break;
      case 'ussd':
        const ussdPhone = phoneNumber || await getUserPhoneNumber(userId);
        if (ussdPhone) {
          sent = await sendUSSD(ussdPhone, message);
        }
        break;
      default:
        logger.warn(`Unsupported notification channel: ${channel}`);
    }

    // Store notification in database (via API call to main DB or direct connection)
    // For now, we'll just log it
    logger.info(`Notification sent: ${type} via ${channel} to ${userId}`);

    res.json({
      success: sent,
      data: {
        notificationId,
        message: sent ? 'Notification sent successfully' : 'Failed to send notification',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send notification',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get notifications
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userId is required',
        },
        timestamp: new Date(),
      });
      return;
    }

    // In a real implementation, fetch from database
    // For now, return empty array
    res.json({
      success: true,
      data: {
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit,
          totalPages: 0,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch notifications',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // In a real implementation, update database
    logger.info(`Notification marked as read: ${id}`);

    res.json({
      success: true,
      data: {
        message: 'Notification marked as read',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark notification as read',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get user phone number
 */
async function getUserPhoneNumber(userId: string): Promise<string | null> {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || ''}`,
      },
    });
    return response.data?.data?.user?.phoneNumber || null;
  } catch (error) {
    logger.error('Failed to get user phone number:', error);
    return null;
  }
}

