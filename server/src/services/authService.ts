import crypto from 'crypto';
import { UserAccount, AuthResponse, UserLifestyleProfile } from '../types';

// In-memory user store with email index
const usersByEmail = new Map<string, UserAccount>();
const usersById = new Map<string, UserAccount>();
const activeTokens = new Map<string, string>(); // token -> userId

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
}

export function generateToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, userId);
  return token;
}

export function verifyToken(token: string): string | null {
  return activeTokens.get(token) || null;
}

export function registerUser(email: string, password: string, name: string): AuthResponse {
  const normalizedEmail = email.trim().toLowerCase();
  if (usersByEmail.has(normalizedEmail)) {
    throw new Error('User already exists with this email address');
  }

  const { hash, salt } = hashPassword(password);
  const id = `usr_${crypto.randomUUID()}`;
  const user: UserAccount = {
    id,
    email: normalizedEmail,
    passwordHash: hash,
    salt,
    name: name.trim(),
    createdAt: new Date().toISOString()
  };

  usersByEmail.set(normalizedEmail, user);
  usersById.set(id, user);

  const token = generateToken(id);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token
  };
}

export function loginUser(email: string, password: string): AuthResponse {
  const normalizedEmail = email.trim().toLowerCase();
  const user = usersByEmail.get(normalizedEmail);
  if (!user) {
    throw new Error('Invalid email or password credentials');
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    throw new Error('Invalid email or password credentials');
  }

  const token = generateToken(user.id);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token
  };
}

export function getUserProfile(userId: string): UserAccount | null {
  return usersById.get(userId) || null;
}

export function updateUserProfile(userId: string, profile: UserLifestyleProfile): UserAccount {
  const user = usersById.get(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.profile = profile;
  return user;
}

export function exportUserData(userId: string): Record<string, unknown> {
  const user = usersById.get(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // Data minimization: export profile and preferences, strictly excluding hashes and salts
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    profile: user.profile || null,
    exportTimestamp: new Date().toISOString(),
    privacyNotice: 'Exported under BreatheSmart AI Data Portability & Minimization protocol.'
  };
}

export function deleteUserData(userId: string): boolean {
  const user = usersById.get(userId);
  if (!user) return false;

  usersByEmail.delete(user.email);
  usersById.delete(userId);

  // Invalidate any active sessions
  for (const [token, uid] of activeTokens.entries()) {
    if (uid === userId) {
      activeTokens.delete(token);
    }
  }
  return true;
}

// Reset store helper for test isolation
export function _resetAuthStore(): void {
  usersByEmail.clear;
  usersById.clear;
  activeTokens.clear;
}
