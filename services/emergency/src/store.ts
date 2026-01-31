/**
 * SafeLink Africa — Emergency in-memory store
 * Replace with PostgreSQL when ready (see Technical Manual).
 */

import { randomUUID } from 'crypto';

export interface StoredAlert {
  id: string;
  userId: string;
  status: 'active' | 'resolved' | 'cancelled';
  latitude: number;
  longitude: number;
  triggeredAt: string;
  resolvedAt?: string;
}

export interface StoredLocation {
  alertId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

const alerts = new Map<string, StoredAlert>();
const locationLogs = new Map<string, StoredLocation[]>();

export function createAlert(userId: string, latitude: number, longitude: number): StoredAlert {
  const id = randomUUID();
  const now = new Date().toISOString();
  const alert: StoredAlert = {
    id,
    userId,
    status: 'active',
    latitude,
    longitude,
    triggeredAt: now,
  };
  alerts.set(id, alert);
  locationLogs.set(id, [{ alertId: id, latitude, longitude, timestamp: now }]);
  return alert;
}

export function getAlert(id: string): StoredAlert | undefined {
  return alerts.get(id);
}

export function addLocation(alertId: string, latitude: number, longitude: number): boolean {
  const alert = alerts.get(alertId);
  if (!alert || alert.status !== 'active') return false;
  const list = locationLogs.get(alertId) ?? [];
  list.push({
    alertId,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  });
  locationLogs.set(alertId, list);
  return true;
}

export function resolveAlert(id: string): boolean {
  const alert = alerts.get(id);
  if (!alert || alert.status !== 'active') return false;
  alert.status = 'resolved';
  alert.resolvedAt = new Date().toISOString();
  return true;
}

export function getLocations(alertId: string): StoredLocation[] {
  return locationLogs.get(alertId) ?? [];
}

/** List all alerts, newest first. */
export function listAlerts(): StoredAlert[] {
  return Array.from(alerts.values()).sort(
    (a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
  );
}
