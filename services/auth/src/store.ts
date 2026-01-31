/**
 * SafeLink Africa — Auth in-memory store
 * Replace with PostgreSQL when ready.
 */

import { randomUUID } from 'crypto';
import { scryptSync, timingSafeEqual } from 'crypto';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  createdAt: string;
  updatedAt: string;
}

const users = new Map<string, StoredUser>();
const usersByEmail = new Map<string, string>();

const SALT = 'safelink-africa-auth-v1';
const KEYLEN = 64;

function hashPassword(password: string): string {
  return scryptSync(password, SALT, KEYLEN).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  const buf = Buffer.from(hash, 'base64');
  const supplied = scryptSync(password, SALT, KEYLEN);
  return buf.length === supplied.length && timingSafeEqual(buf, supplied);
}

export function createUser(
  email: string,
  password: string,
  name: string,
  role: 'user' | 'moderator' | 'admin' = 'user'
): StoredUser {
  const normalized = email.trim().toLowerCase();
  if (usersByEmail.has(normalized)) {
    throw new Error('EMAIL_IN_USE');
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  const user: StoredUser = {
    id,
    email: normalized,
    passwordHash: hashPassword(password),
    name: name.trim(),
    role,
    createdAt: now,
    updatedAt: now,
  };
  users.set(id, user);
  usersByEmail.set(normalized, id);
  return user;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const id = usersByEmail.get(email.trim().toLowerCase());
  return id ? users.get(id) : undefined;
}

export function findUserById(id: string): StoredUser | undefined {
  return users.get(id);
}

export function verifyUser(email: string, password: string): StoredUser | null {
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export function toPublicUser(u: StoredUser): { id: string; email: string; name: string; role: string } {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}
