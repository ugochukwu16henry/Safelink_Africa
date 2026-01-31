/**
 * SafeLink Africa — Reports in-memory store
 * Replace with PostgreSQL when ready.
 */

import { randomUUID } from 'crypto';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export interface StoredReport {
  id: string;
  reporterId?: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  mediaUrls?: string[];
  status: ReportStatus;
  createdAt: string;
}

const reports = new Map<string, StoredReport>();

export function createReport(
  type: string,
  description: string,
  latitude: number,
  longitude: number,
  options?: { reporterId?: string; mediaUrls?: string[] }
): StoredReport {
  const id = randomUUID();
  const now = new Date().toISOString();
  const report: StoredReport = {
    id,
    type,
    description,
    latitude,
    longitude,
    status: 'pending',
    createdAt: now,
  };
  if (options?.reporterId !== undefined) report.reporterId = options.reporterId;
  if (options?.mediaUrls?.length) report.mediaUrls = options.mediaUrls;
  reports.set(id, report);
  return report;
}

export function getReport(id: string): StoredReport | undefined {
  return reports.get(id);
}

export function listReports(): StoredReport[] {
  return Array.from(reports.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateReportStatus(id: string, status: ReportStatus): boolean {
  const report = reports.get(id);
  if (!report) return false;
  report.status = status;
  return true;
}
