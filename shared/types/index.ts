/**
 * SafeLink Africa — Shared types
 * Used by services and apps for consistent API and domain models.
 */

// User & Auth
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  createdAt: string; // ISO
  updatedAt: string;
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  order: number;
}

// Emergency
export interface EmergencyAlert {
  id: string;
  userId: string;
  status: 'active' | 'resolved' | 'cancelled';
  latitude: number;
  longitude: number;
  triggeredAt: string;
  resolvedAt?: string;
}

export interface LocationUpdate {
  alertId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Community reporting
export interface CommunityReport {
  id: string;
  reporterId?: string; // optional for anonymous
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  mediaUrls?: string[];
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

// Transport
export interface TransportTrip {
  id: string;
  userId: string;
  driverId?: string;
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  status: 'active' | 'completed' | 'alert';
  startedAt: string;
  endedAt?: string;
}
