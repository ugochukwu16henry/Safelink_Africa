/**
 * OTP generation and verification utilities
 */

import { redis } from '../index';

/**
 * Generate 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verify OTP
 */
export async function verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
  const key = `otp:${phoneNumber}`;
  const storedOTP = await redis.get(key);
  
  if (!storedOTP || storedOTP !== otp) {
    return false;
  }
  
  // Delete OTP after verification
  await redis.del(key);
  return true;
}

