/**
 * WebGuard AI - Input Sanitizer & Validation Utility
 * Rule: Never execute or directly visit submitted URLs.
 * Treat all incoming URLs as untrusted input strings.
 */

export function sanitizeUrlInput(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      error: 'URL must be a non-empty text string.'
    };
  }

  // Trim whitespace and unprintable characters
  const trimmed = rawInput.trim();

  // Guard against oversized payload attacks
  if (trimmed.length > 2048) {
    return {
      isValid: false,
      error: 'Submitted URL exceeds maximum allowed length (2048 characters).'
    };
  }

  // Guard against javascript: or data: pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return {
      isValid: false,
      error: 'Executable pseudo-protocols (javascript:, data:) are rejected for security.'
    };
  }

  // Normalize protocol for URL parser if missing
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'http://' + normalized;
  }

  try {
    const parsed = new URL(normalized);

    // Ensure valid hostname exists
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return {
        isValid: false,
        error: 'URL lacks a valid hostname or domain name.'
      };
    }

    return {
      isValid: true,
      rawInput: trimmed,
      normalizedUrl: normalized,
      parsed
    };
  } catch (err) {
    return {
      isValid: false,
      error: `Invalid URL format: ${err.message}`
    };
  }
}
