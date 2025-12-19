/**
 * Reporting controller
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { db } from '../index';
import { ReportStatus, ReportCategory } from '../../../shared/types';
import { logger } from '../utils/logger';

/**
 * Create incident report
 */
export async function createReport(req: Request, res: Response): Promise<void> {
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
    const { category, title, description, latitude, longitude, accuracy, address, images, anonymous } = req.body;

    const result = await db.query(
      `INSERT INTO incident_reports (
        user_id, category, status, title, description, latitude, longitude, accuracy, address, images, anonymous, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ST_SetSRID(ST_MakePoint($7, $6), 4326))
      RETURNING id, user_id, category, status, title, description, latitude, longitude, address, anonymous, created_at`,
      [
        userId,
        category,
        ReportStatus.PENDING,
        title,
        description,
        latitude,
        longitude,
        accuracy || null,
        address || null,
        images || [],
        anonymous || false,
      ]
    );

    const report = result.rows[0];

    logger.info(`Incident report created: ${report.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        report: {
          id: report.id,
          category: report.category,
          status: report.status,
          title: report.title,
          description: report.description,
          location: {
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address,
          },
          anonymous: report.anonymous,
          createdAt: report.created_at,
        },
        message: 'Incident report submitted successfully',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create incident report',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get reports
 */
export async function getReports(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let query = '';
    let countQuery = '';
    let params: unknown[] = [];

    // Admin/community admin can see all reports, others only their own
    if (userRole === 'admin' || userRole === 'community_admin') {
      if (status) {
        query = `SELECT id, user_id, category, status, title, description, latitude, longitude, address, anonymous, created_at, updated_at
                 FROM incident_reports
                 WHERE status = $1
                 ORDER BY created_at DESC
                 LIMIT $2 OFFSET $3`;
        countQuery = 'SELECT COUNT(*) FROM incident_reports WHERE status = $1';
        params = [status, limit, offset];
      } else {
        query = `SELECT id, user_id, category, status, title, description, latitude, longitude, address, anonymous, created_at, updated_at
                 FROM incident_reports
                 ORDER BY created_at DESC
                 LIMIT $1 OFFSET $2`;
        countQuery = 'SELECT COUNT(*) FROM incident_reports';
        params = [limit, offset];
      }
    } else {
      query = `SELECT id, user_id, category, status, title, description, latitude, longitude, address, anonymous, created_at, updated_at
               FROM incident_reports
               WHERE user_id = $1
               ORDER BY created_at DESC
               LIMIT $2 OFFSET $3`;
      countQuery = 'SELECT COUNT(*) FROM incident_reports WHERE user_id = $1';
      params = [userId, limit, offset];
    }

    const result = await db.query(query, params);
    const countResult = await db.query(
      countQuery,
      status && (userRole === 'admin' || userRole === 'community_admin') ? [status] : userRole === 'admin' || userRole === 'community_admin' ? [] : [userId]
    );

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        items: result.rows.map((report) => ({
          id: report.id,
          category: report.category,
          status: report.status,
          title: report.title,
          description: report.description,
          location: {
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address,
          },
          anonymous: report.anonymous,
          createdAt: report.created_at,
          updatedAt: report.updated_at,
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
    logger.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch reports',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get report details
 */
export async function getReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const result = await db.query(
      `SELECT id, user_id, category, status, title, description, latitude, longitude, address, images, anonymous, created_at, updated_at, reviewed_by, reviewed_at
       FROM incident_reports WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Report not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    const report = result.rows[0];

    // Check permissions
    if (report.user_id !== userId && userRole !== 'admin' && userRole !== 'community_admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this report',
        },
        timestamp: new Date(),
      });
      return;
    }

    res.json({
      success: true,
      data: {
        report: {
          id: report.id,
          category: report.category,
          status: report.status,
          title: report.title,
          description: report.description,
          location: {
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address,
          },
          images: report.images || [],
          anonymous: report.anonymous,
          createdAt: report.created_at,
          updatedAt: report.updated_at,
          reviewedBy: report.reviewed_by,
          reviewedAt: report.reviewed_at,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Get report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch report',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get nearby reports
 */
export async function getNearbyReports(req: Request, res: Response): Promise<void> {
  try {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const radius = parseFloat(req.query.radius as string) || 5000; // meters
    const limit = parseInt(req.query.limit as string) || 50;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Latitude and longitude are required',
        },
        timestamp: new Date(),
      });
      return;
    }

    const result = await db.query(
      `SELECT id, category, status, title, description, latitude, longitude, address, anonymous, created_at,
              ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance
       FROM incident_reports
       WHERE status != 'dismissed'
         AND ST_DWithin(
           location,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           $3
         )
       ORDER BY distance, created_at DESC
       LIMIT $4`,
      [longitude, latitude, radius, limit]
    );

    res.json({
      success: true,
      data: {
        items: result.rows.map((report) => ({
          id: report.id,
          category: report.category,
          status: report.status,
          title: report.title,
          description: report.description,
          location: {
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address,
          },
          anonymous: report.anonymous,
          distance: Math.round(report.distance),
          createdAt: report.created_at,
        })),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Get nearby reports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch nearby reports',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Update report status
 */
export async function updateReportStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    if (!Object.values(ReportStatus).includes(status)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status',
        },
        timestamp: new Date(),
      });
      return;
    }

    const result = await db.query(
      `UPDATE incident_reports
       SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, status, reviewed_at`,
      [status, userId, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Report not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info(`Report status updated: ${id} to ${status} by ${userId}`);

    res.json({
      success: true,
      data: {
        report: {
          id: result.rows[0].id,
          status: result.rows[0].status,
          reviewedAt: result.rows[0].reviewed_at,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update report status',
      },
      timestamp: new Date(),
    });
  }
}

