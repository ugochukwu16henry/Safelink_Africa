/**
 * Validation utilities
 */

import { Location } from '../types';

/**
 * Validate phone number (supports African formats)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, and plus signs
  const cleaned = phone.replace(/[\s\-+]/g, '');
  
  // Check if it's a valid number (8-15 digits)
  if (!/^\d{8,15}$/.test(cleaned)) {
    return false;
  }
  
  // Common African country codes
  const africanCountryCodes = [
    '234', // Nigeria
    '254', // Kenya
    '233', // Ghana
    '27',  // South Africa
    '20',  // Egypt
    '256', // Uganda
    '255', // Tanzania
    '234', // Nigeria
  ];
  
  return true; // Simplified validation
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate location coordinates
 */
export function isValidLocation(location: Location): boolean {
  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate emergency type
 */
export function isValidEmergencyType(type: string): boolean {
  const validTypes = ['medical', 'security', 'fire', 'accident', 'natural_disaster', 'other'];
  return validTypes.includes(type.toLowerCase());
}

