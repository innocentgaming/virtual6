import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeNumber, sanitizeArray } from '../server/src/utils/sanitizer';

describe('Security Sanitizer Utilities', () => {
  it('should strip script tags and HTML injection', () => {
    const malicious = '<script>alert("XSS")</script>Hello <b>World</b><img src="x" onerror="alert(1)">';
    const cleaned = sanitizeString(malicious);
    expect(cleaned).toBe('Hello World');
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('onerror');
  });

  it('should remove control characters and truncate to max length', () => {
    const raw = 'Smog alert \x00\x08 test\x1F string';
    const cleaned = sanitizeString(raw, 10);
    expect(cleaned).toBe('Smog alert');
  });

  it('should clamp numbers within specified range and fallback gracefully', () => {
    expect(sanitizeNumber(45, 10, 100, 50)).toBe(45);
    expect(sanitizeNumber(5, 10, 100, 50)).toBe(10);
    expect(sanitizeNumber(150, 10, 100, 50)).toBe(100);
    expect(sanitizeNumber('invalid', 10, 100, 50)).toBe(50);
  });

  it('should sanitize arrays and filter invalid items', () => {
    const validator = (item: unknown): item is string => typeof item === 'string' && item.length > 2;
    const raw = ['delhi', 123, null, 'mumbai', 'a'];
    const result = sanitizeArray(raw, validator, 5);
    expect(result).toEqual(['delhi', 'mumbai']);
  });
});

