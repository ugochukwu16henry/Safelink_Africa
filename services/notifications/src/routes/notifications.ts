/**
 * Notifications routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { sendNotification, getNotifications, markAsRead } from '../controllers/notificationsController';

export const notificationsRouter = Router();

/**
 * POST /api/notifications/send
 * Send notification
 */
notificationsRouter.post(
  '/send',
  [
    body('userId').notEmpty(),
    body('type').isIn(['emergency_alert', 'report_update', 'transport_update', 'community_alert', 'system_notification']),
    body('channel').isIn(['push', 'sms', 'ussd', 'email', 'in_app']),
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('message').trim().isLength({ min: 1, max: 1000 }),
  ],
  sendNotification
);

/**
 * GET /api/notifications
 * Get notifications (requires userId query param)
 */
notificationsRouter.get('/', getNotifications);

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
notificationsRouter.put('/:id/read', markAsRead);

