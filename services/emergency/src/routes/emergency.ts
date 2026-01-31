/**
 * SafeLink Africa — Emergency API
 * POST /emergency/trigger — one-tap SOS
 * POST /emergency/location — update location for active alert
 * GET /emergency/:id — get alert status (optional)
 */

import { Router, Request, Response } from 'express';
import * as store from '../store';

export const emergencyRouter = Router();

// POST /emergency/trigger — create new emergency alert
emergencyRouter.post('/trigger', (req: Request, res: Response) => {
  const { userId, latitude, longitude } = req.body;
  if (typeof userId !== 'string' || typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({
      error: 'Bad request',
      message: 'userId (string), latitude (number), longitude (number) required',
    });
    return;
  }
  const alert = store.createAlert(userId, latitude, longitude);
  res.status(201).json(alert);
});

// POST /emergency/location — append location for active alert
emergencyRouter.post('/location', (req: Request, res: Response) => {
  const { alertId, latitude, longitude } = req.body;
  if (
    typeof alertId !== 'string' ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    res.status(400).json({
      error: 'Bad request',
      message: 'alertId (string), latitude (number), longitude (number) required',
    });
    return;
  }
  const ok = store.addLocation(alertId, latitude, longitude);
  if (!ok) {
    res.status(404).json({
      error: 'Not found',
      message: 'Alert not found or no longer active',
    });
    return;
  }
  res.status(200).json({ ok: true });
});

// GET /emergency/:id — get alert and latest location
emergencyRouter.get('/:id', (req: Request, res: Response) => {
  const alert = store.getAlert(req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Not found', message: 'Alert not found' });
    return;
  }
  const locations = store.getLocations(alert.id);
  const latest = locations.length > 0 ? locations[locations.length - 1] : null;
  res.json({ alert, latestLocation: latest });
});
