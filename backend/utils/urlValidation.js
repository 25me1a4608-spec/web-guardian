/**
 * WebGuard AI — Hardened URL Validation Utility
 * backend/utils/urlValidation.js
 *
 * Step 9: Security Hardening, Strict Protocol Whitelisting & Input Sanitization
 *
 * SECURITY:
 *  - Only http:// and https:// schemes are permitted.
 *  - Explicitly rejects dangerous schemes: javascript:, data:, file:, ftp:, chrome:,
 *    chrome-extension:, about:, blob:, vbscript:, ws:, wss:, etc.
 *  - Validates hostname syntax (no spaces, no unprintable characters, valid structure).
 *  - Enforces max length 2048 chars to prevent buffer/regex Denial of Service.
 *  - NEVER decodes or executes arbitrary user code or scripts.
 */

// Explicitly rejected schemes & pseudo-protocols
const FORBIDDEN_SCHEMES = [
  'javascript:',
  'data:',
  'file:',
  'ftp:',
  'chrome:',
  'chrome-extension:',
  'about:',
  'blob:',
  'vbscript:',
  'ws:',
  'wss:',
  'ssh:',
  'sftp:',
  'tel:',
  'mailto:',
  'ldap:',
  'gopher:',
  'view-source:'
];

/**
 * Validate and safely normalize a raw URL input string.
 *
 * @param {any} raw - Input received from the request body
 * @returns {{ valid: boolean, url: string, normalized?: string, parsed?: URL, error?: string }}
 */
export function validateUrl(raw) {
  // 1. Existence and type verification
  if (raw === undefined || raw === null || typeof raw !== 'string') {
    return {
      valid: false,
      error: 'Please enter a URL to analyze.'
    };
  }

  const trimmed = raw.trim();

  // 2. Empty string check
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Please enter a URL to analyze.'
    };
  }

  // 3. Length guard (prevent ReDoS and memory exhaustion attacks)
  if (trimmed.length > 2048) {
    return {
      valid: false,
      error: 'URL is too long (maximum 2048 characters).'
    };
  }

  // 4. Strip control characters and check for null bytes
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return {
      valid: false,
      error: 'URL contains invalid control characters.'
    };
  }

  // 5. Check for explicitly forbidden protocols (case-insensitive)
  const lower = trimmed.toLowerCase();
  for (const scheme of FORBIDDEN_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return {
        valid: false,
        error: 'Invalid protocol. Only HTTP and HTTPS URLs are supported.'
      };
    }
  }

  // 6. Check if input contains an unsupported explicit scheme
  // Matches any pattern like 'custom-scheme://' or 'scheme:'
  const schemeMatch = lower.match(/^([a-z0-9+.-]+):/i);
  if (schemeMatch) {
    const detectedScheme = schemeMatch[1].toLowerCase();
    if (detectedScheme !== 'http' && detectedScheme !== 'https') {
      return {
        valid: false,
        error: 'Invalid protocol. Only HTTP and HTTPS URLs are supported.'
      };
    }
  }

  // 7. Normalize scheme: prepend http:// if input is a domain/path without scheme
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    // If it contains "://" but not http/https, it was caught above or is invalid
    if (normalized.includes('://')) {
      return {
        valid: false,
        error: 'Please enter a valid HTTP or HTTPS URL.'
      };
    }
    normalized = 'http://' + normalized;
  }

  // 8. Structural parse using standard WHATWG URL parser
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid HTTP or HTTPS URL.'
    };
  }

  // 9. Strict protocol check on parsed object
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: 'Invalid protocol. Only HTTP and HTTPS URLs are supported.'
    };
  }

  // 10. Hostname validation
  const hostname = parsed.hostname;
  if (!hostname || hostname.length === 0) {
    return {
      valid: false,
      error: 'The URL does not contain a valid hostname.'
    };
  }

  // Hostname must not contain whitespace or unencoded special characters
  if (/\s/.test(hostname)) {
    return {
      valid: false,
      error: 'The URL hostname contains invalid whitespace.'
    };
  }

  // Hostname must be valid: either IPv4, IPv6, localhost, or domain with at least 1 dot
  const isIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6 = hostname.startsWith('[') && hostname.endsWith(']');
  const isLocalhost = hostname === 'localhost';
  const hasDot = hostname.includes('.');

  if (!isIpv4 && !isIpv6 && !isLocalhost && !hasDot) {
    return {
      valid: false,
      error: 'The URL does not contain a valid top-level domain or hostname.'
    };
  }

  // Hostname length limit (RFC 1035 max is 253 chars)
  if (hostname.length > 253) {
    return {
      valid: false,
      error: 'The URL hostname exceeds maximum permissible length.'
    };
  }

  return {
    valid: true,
    url: trimmed,
    normalized,
    parsed
  };
}
