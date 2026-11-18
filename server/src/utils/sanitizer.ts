/**
 * Security Input Sanitizer & Validation Utilities
 * Protects against XSS, Script Injection, and Malformed Request Payloads.
 */

export function sanitizeString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove control characters (except newline and tab)
  let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip obvious script tags and dangerous HTML attributes
  cleaned = cleaned
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onclick\s*=/gi, '');

  // Trim and enforce length limit
  return cleaned.trim().slice(0, maxLength);
}

export function sanitizeNumber(input: unknown, min: number, max: number, defaultValue: number): number {
  if (typeof input === 'number' && !isNaN(input)) {
    return Math.min(Math.max(input, min), max);
  }
  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    if (!isNaN(parsed)) {
      return Math.min(Math.max(parsed, min), max);
    }
  }
  return defaultValue;
}

export function sanitizeArray<T>(input: unknown, validator: (item: unknown) => item is T, maxItems: number = 20): T[] {
  if (!Array.isArray(input)) {
    return [];
  }
  const result: T[] = [];
  for (const item of input) {
    if (result.length >= maxItems) break;
    if (validator(item)) {
      result.push(item);
    }
  }
  return result;
}

