/**
 * SafeLink Africa — Reports API
 * POST /reports — create report
 * GET /reports — list all (newest first)
 * GET /reports/:id — get one
 * PATCH /reports/:id — update status (pending | reviewed | resolved)
 */

import { Router, Request, Response } from 'express';
import * as store from '../store';

const VALID_STATUSES: store.ReportStatus[] = ['pending', 'reviewed', 'resolved'];

export const reportsRouter = Router();

// GET /reports — list all (newest first)
reportsRouter.get('/', (_req: Request, res: Response) => {
  const reports = store.listReports();
  res.json({ reports });
});

// POST /reports — create report
reportsRouter.post('/', (req: Request, res: Response) => {
  const { type, description, latitude, longitude, reporterId, mediaUrls } = req.body;
  if (
    typeof type !== 'string' ||
    typeof description !== 'string' ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    res.status(400).json({
      error: 'Bad request',
      message: 'type (string), description (string), latitude (number), longitude (number) required',
    });
    return;
  }
  const report = store.createReport(type, description, latitude, longitude, {
    reporterId: typeof reporterId === 'string' ? reporterId : undefined,
    mediaUrls: Array.isArray(mediaUrls) ? mediaUrls.filter((u: unknown) => typeof u === 'string') : undefined,
  });
  res.status(201).json(report);
});

// GET /reports/:id — get one
reportsRouter.get('/:id', (req: Request, res: Response) => {
  const report = store.getReport(req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Not found', message: 'Report not found' });
    return;
  }
  res.json(report);
});

// PATCH /reports/:id — update status
reportsRouter.patch('/:id', (req: Request, res: Response) => {
  const { status } = req.body;
  if (typeof status !== 'string' || !VALID_STATUSES.includes(status as store.ReportStatus)) {
    res.status(400).json({
      error: 'Bad request',
      message: 'status must be one of: pending, reviewed, resolved',
    });
    return;
  }
  const ok = store.updateReportStatus(req.params.id, status as store.ReportStatus);
  if (!ok) {
    res.status(404).json({ error: 'Not found', message: 'Report not found' });
    return;
  }
  const report = store.getReport(req.params.id);
  res.json(report);
});
