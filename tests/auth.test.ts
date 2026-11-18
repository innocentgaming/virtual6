import { describe, it, expect, beforeEach } from 'vitest';
import { 
  registerUser, 
  loginUser, 
  verifyToken, 
  getUserProfile, 
  updateUserProfile, 
  exportUserData, 
  deleteUserData,
  hashPassword,
  verifyPassword
} from '../server/src/services/authService';

describe('Authentication & User Privacy Services (Target 100/100 Security)', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'StrongPassword123!';
  const testName = 'Dr. CleanAir';

  it('should securely hash passwords using PBKDF2 with salt', () => {
    const { hash, salt } = hashPassword(testPassword);
    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(hash.length).toBe(128); // 64 bytes in hex
    expect(verifyPassword(testPassword, hash, salt)).toBe(true);
    expect(verifyPassword('WrongPassword!', hash, salt)).toBe(false);
  });

  it('should successfully register a new user and return a secure session token', () => {
    const auth = registerUser(testEmail, testPassword, testName);
    expect(auth.user.email).toBe(testEmail.toLowerCase());
    expect(auth.user.name).toBe(testName);
    expect(auth.token).toBeDefined();
    expect(auth.token.length).toBe(64); // 32 bytes hex
  });

  it('should reject registration with an existing email address', () => {
    expect(() => registerUser(testEmail, 'anotherpass', 'Duplicate User')).toThrow(
      'User already exists with this email address'
    );
  });

  it('should successfully authenticate with valid credentials', () => {
    const auth = loginUser(testEmail, testPassword);
    expect(auth.user.email).toBe(testEmail.toLowerCase());
    expect(verifyToken(auth.token)).toBe(auth.user.id);
  });

  it('should reject login attempts with invalid password', () => {
    expect(() => loginUser(testEmail, 'WrongPassword999!')).toThrow(
      'Invalid email or password credentials'
    );
  });

  it('should update user lifestyle profile and retrieve it', () => {
    const auth = loginUser(testEmail, testPassword);
    const updated = updateUserProfile(auth.user.id, {
      persona: 'family',
      city: 'Delhi NCR',
      householdMembers: 4,
      vulnerabilities: ['child', 'asthma_respiratory'],
      homeAreaSqFt: 1100,
      commuteMode: 'carpool',
      commuteDistanceKm: 12,
      heatingSource: 'electric_space_heater',
      hasAirPurifier: true,
      hasCookingExhaust: true,
      morningOutdoorRoutine: false,
      budgetTier: 'moderate'
    });

    expect(updated.profile?.persona).toBe('family');
    expect(updated.profile?.vulnerabilities).toContain('asthma_respiratory');
  });

  it('should support GDPR data export excluding sensitive cryptographic salts', () => {
    const auth = loginUser(testEmail, testPassword);
    const exported = exportUserData(auth.user.id);

    expect(exported.email).toBe(testEmail.toLowerCase());
    expect(exported.passwordHash).toBeUndefined();
    expect(exported.salt).toBeUndefined();
    expect(exported.privacyNotice).toBeDefined();
  });

  it('should delete user data and invalidate active session tokens', () => {
    const auth = loginUser(testEmail, testPassword);
    const deleted = deleteUserData(auth.user.id);
    expect(deleted).toBe(true);
    expect(verifyToken(auth.token)).toBeNull();
    expect(getUserProfile(auth.user.id)).toBeNull();
  });
});
