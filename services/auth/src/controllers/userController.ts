/**
 * User controller
 */

import { Request, Response } from 'express';
import { db } from '../index';
import { logger } from '../utils/logger';

/**
 * Get user profile
 */
export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    const result = await db.query(
      `SELECT id, phone_number, email, first_name, last_name, role, status, country, language, created_at, last_active_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        timestamp: new Date(),
      });
      return;
    }

    const user = result.rows[0];

    // Get emergency contacts
    const contactsResult = await db.query(
      'SELECT id, name, phone_number, relationship, is_primary FROM emergency_contacts WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          country: user.country,
          language: user.language,
          createdAt: user.created_at,
          lastActiveAt: user.last_active_at,
        },
        emergencyContacts: contactsResult.rows.map((contact) => ({
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phone_number,
          relationship: contact.relationship,
          isPrimary: contact.is_primary,
        })),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user profile',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, email, language } = req.body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (firstName) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (language) {
      updates.push(`language = $${paramCount++}`);
      values.push(language);
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update',
        },
        timestamp: new Date(),
      });
      return;
    }

    values.push(userId);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, phone_number, email, first_name, last_name, role, status, country, language`,
      values
    );

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          country: user.country,
          language: user.language,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user profile',
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Add emergency contact
 */
export async function addEmergencyContact(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { name, phoneNumber, relationship, isPrimary } = req.body;

    if (!name || !phoneNumber) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name and phone number are required',
        },
        timestamp: new Date(),
      });
      return;
    }

    // If this is set as primary, unset other primary contacts
    if (isPrimary) {
      await db.query(
        'UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = $1',
        [userId]
      );
    }

    const result = await db.query(
      `INSERT INTO emergency_contacts (user_id, name, phone_number, relationship, is_primary)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, phone_number, relationship, is_primary, created_at`,
      [userId, name, phoneNumber, relationship || null, isPrimary || false]
    );

    const contact = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        contact: {
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phone_number,
          relationship: contact.relationship,
          isPrimary: contact.is_primary,
          createdAt: contact.created_at,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Add emergency contact error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add emergency contact',
      },
      timestamp: new Date(),
    });
  }
}

