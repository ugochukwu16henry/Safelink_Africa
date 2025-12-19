/**
 * Transport controller
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { db, redis, io } from '../index';
import { TransportStatus } from '../../../shared/types';
import { logger } from '../utils/logger';

/**
 * Start a new trip
 */
export async function startTrip(req: Request, res: Response): Promise<void> {
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
    const { startLatitude, startLongitude, endLatitude, endLongitude, vehicleId, operatorId } = req.body;

    const result = await db.query(
      `INSERT INTO transport_trips (
        user_id, vehicle_id, operator_id, start_latitude, start_longitude, end_latitude, end_longitude,
        status, started_at, start_location, end_location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP,
        ST_SetSRID(ST_MakePoint($5, $4), 4326),
        ST_SetSRID(ST_MakePoint($7, $6), 4326))
      RETURNING id, user_id, vehicle_id, operator_id, start_latitude, start_longitude, end_latitude, end_longitude,
                status, started_at`,
      [
        userId,
        vehicleId || null,
        operatorId || null,
        startLatitude,
        startLongitude,
        endLatitude,
        endLongitude,
        TransportStatus.IN_TRANSIT,
      ]
    );

    const trip = result.rows[0];

    // Store trip in Redis for quick access
    await redis.setEx(`trip:${trip.id}`, 3600, JSON.stringify(trip));

    logger.info(`Trip started: ${trip.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        trip: {
          id: trip.id,
          startLocation: {
            latitude: trip.start_latitude,
            longitude: trip.start_longitude,
          },
          endLocation: {
            latitude: trip.end_latitude,
            longitude: trip.end_longitude,
          },
          status: trip.status,
          startedAt: trip.started_at,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Start trip error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start trip',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Update trip location
 */
export async function updateTripLocation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { latitude, longitude, accuracy } = req.body;

    // Verify trip belongs to user
    const checkResult = await db.query(
      'SELECT id, status FROM transport_trips WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trip not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Update location
    await db.query(
      `UPDATE transport_trips
       SET current_latitude = $1, current_longitude = $2, current_location = ST_SetSRID(ST_MakePoint($2, $1), 4326)
       WHERE id = $3`,
      [latitude, longitude, id]
    );

    // Emit location update via Socket.IO
    io.emit(`trip:${id}:location`, {
      tripId: id,
      location: { latitude, longitude, accuracy },
      timestamp: new Date(),
    });

    res.json({
      success: true,
      data: {
        message: 'Location updated',
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Update trip location error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update location',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * End trip
 */
export async function endTrip(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await db.query(
      `UPDATE transport_trips
       SET status = $1, completed_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, status, completed_at`,
      [TransportStatus.ARRIVED, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trip not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    // Remove from Redis
    await redis.del(`trip:${id}`);

    logger.info(`Trip ended: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: {
        trip: {
          id: result.rows[0].id,
          status: result.rows[0].status,
          completedAt: result.rows[0].completed_at,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('End trip error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to end trip',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get trip details
 */
export async function getTrip(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await db.query(
      `SELECT id, user_id, vehicle_id, operator_id, start_latitude, start_longitude, end_latitude, end_longitude,
              current_latitude, current_longitude, status, started_at, completed_at, estimated_arrival
       FROM transport_trips WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trip not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    const trip = result.rows[0];

    // Check permissions
    if (trip.user_id !== userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this trip',
        },
        timestamp: new Date(),
      });
      return;
    }

    res.json({
      success: true,
      data: {
        trip: {
          id: trip.id,
          startLocation: {
            latitude: trip.start_latitude,
            longitude: trip.start_longitude,
          },
          endLocation: {
            latitude: trip.end_latitude,
            longitude: trip.end_longitude,
          },
          currentLocation: trip.current_latitude ? {
            latitude: trip.current_latitude,
            longitude: trip.current_longitude,
          } : null,
          status: trip.status,
          startedAt: trip.started_at,
          completedAt: trip.completed_at,
          estimatedArrival: trip.estimated_arrival,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch trip',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get trip history
 */
export async function getTripHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT id, start_latitude, start_longitude, end_latitude, end_longitude, status, started_at, completed_at
       FROM transport_trips
       WHERE user_id = $1
       ORDER BY started_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM transport_trips WHERE user_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        items: result.rows.map((trip) => ({
          id: trip.id,
          startLocation: {
            latitude: trip.start_latitude,
            longitude: trip.start_longitude,
          },
          endLocation: {
            latitude: trip.end_latitude,
            longitude: trip.end_longitude,
          },
          status: trip.status,
          startedAt: trip.started_at,
          completedAt: trip.completed_at,
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
    logger.error('Get trip history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch trip history',
      },
      timestamp: new Date(),
    });
  }
}

