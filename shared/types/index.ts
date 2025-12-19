/**
 * Shared TypeScript types and interfaces for SafeLink Africa
 */

export enum UserRole {
  INDIVIDUAL = 'individual',
  FAMILY_MEMBER = 'family_member',
  FAMILY_ADMIN = 'family_admin',
  COMMUNITY_ADMIN = 'community_admin',
  ORGANIZATION_ADMIN = 'organization_admin',
  TRANSPORT_OPERATOR = 'transport_operator',
  SECURITY_PARTNER = 'security_partner',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  VERIFIED = 'verified',
  PENDING_VERIFICATION = 'pending_verification'
}

export enum EmergencyStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm',
  CANCELLED = 'cancelled'
}

export enum EmergencyType {
  MEDICAL = 'medical',
  SECURITY = 'security',
  FIRE = 'fire',
  ACCIDENT = 'accident',
  NATURAL_DISASTER = 'natural_disaster',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export enum ReportCategory {
  CRIME = 'crime',
  ACCIDENT = 'accident',
  HAZARD = 'hazard',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  INFRASTRUCTURE_ISSUE = 'infrastructure_issue',
  OTHER = 'other'
}

export enum TransportStatus {
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled'
}

export enum NotificationType {
  EMERGENCY_ALERT = 'emergency_alert',
  REPORT_UPDATE = 'report_update',
  TRANSPORT_UPDATE = 'transport_update',
  COMMUNITY_ALERT = 'community_alert',
  SYSTEM_NOTIFICATION = 'system_notification'
}

export enum NotificationChannel {
  PUSH = 'push',
  SMS = 'sms',
  USSD = 'ussd',
  EMAIL = 'email',
  IN_APP = 'in_app'
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: Date;
  address?: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  country: string;
  language: string;
  emergencyContacts?: EmergencyContact[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: EmergencyType;
  status: EmergencyStatus;
  location: Location;
  message?: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  responders?: string[];
  metadata?: Record<string, unknown>;
}

export interface IncidentReport {
  id: string;
  userId: string;
  category: ReportCategory;
  status: ReportStatus;
  title: string;
  description: string;
  location: Location;
  images?: string[];
  anonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface TransportTrip {
  id: string;
  userId: string;
  vehicleId?: string;
  operatorId?: string;
  startLocation: Location;
  endLocation: Location;
  status: TransportStatus;
  startedAt: Date;
  completedAt?: Date;
  estimatedArrival?: Date;
  currentLocation?: Location;
  route?: Location[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  sentAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  phoneNumber: string;
  iat?: number;
  exp?: number;
}

