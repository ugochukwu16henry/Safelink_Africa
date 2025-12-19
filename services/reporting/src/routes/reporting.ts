/**
 * Reporting routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReport,
  getReport,
  getReports,
  updateReportStatus,
  getNearbyReports,
} from '../controllers/reportingController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/role';

export const reportingRouter = Router();

// All routes require authentication
reportingRouter.use(authenticateToken);

/**
 * POST /api/reports
 * Create incident report
 */
reportingRouter.post(
  '/',
  [
    body('category').isIn(['crime', 'accident', 'hazard', 'suspicious_activity', 'infrastructure_issue', 'other']),
    body('title').trim().isLength({ min: 5, max: 200 }),
    body('description').trim().isLength({ min: 10, max: 2000 }),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('anonymous').optional().isBoolean(),
  ],
  createReport
);

/**
 * GET /api/reports
 * Get user's reports or all reports (admin)
 */
reportingRouter.get('/', getReports);

/**
 * GET /api/reports/nearby
 * Get nearby reports
 */
reportingRouter.get('/nearby', getNearbyReports);

/**
 * GET /api/reports/:id
 * Get report details
 */
reportingRouter.get('/:id', getReport);

/**
 * PUT /api/reports/:id/status
 * Update report status (admin/community admin only)
 */
reportingRouter.put('/:id/status', requireRole('admin', 'community_admin'), updateReportStatus);

