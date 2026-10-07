/**
 * WebGuard AI — Trusted Domain & Local Development Verification
 * backend/utils/trustedDomains.js
 *
 * Implements strict, cryptographically safe hostname verification:
 * - Localhost / local development addresses (localhost, 127.0.0.1, ::1, etc.)
 * - Official legitimate brand domains (Microsoft, Google/Gmail, WhatsApp, Instagram, PayPal, Apple, etc.)
 *
 * A domain is trusted ONLY when the hostname exactly matches an approved domain
 * or is a valid subdomain of that domain (e.g., mail.google.com -> google.com).
 * Substring matches (e.g., microsoft-login.com, google-security.com) are REJECTED.
 */

export const TRUSTED_OFFICIAL_DOMAINS = {
  microsoft: {
    brand: 'Microsoft',
    domains: [
      'microsoft.com',
      'live.com',
      'outlook.com',
      'office.com',
      'office365.com',
      'microsoftonline.com',
      'msn.com',
      'azure.com',
      'visualstudio.com',
      'windows.com',
      'bing.com'
    ]
  },
  google: {
    brand: 'Google / Gmail',
    domains: [
      'google.com',
      'gmail.com',
      'google.co.in',
      'google.co.uk',
      'google.ca',
      'google.de',
      'google.fr',
      'google.it',
      'google.es',
      'google.com.br',
      'google.co.jp',
      'youtube.com',
      'googledrive.com',
      'googleusercontent.com',
      'gstatic.com',
      'googlemail.com'
    ]
  },
  whatsapp: {
    brand: 'WhatsApp',
    domains: [
      'whatsapp.com',
      'whatsapp.net'
    ]
  },
  instagram: {
    brand: 'Instagram',
    domains: [
      'instagram.com',
      'cdninstagram.com'
    ]
  },
  facebook: {
    brand: 'Meta / Facebook',
    domains: [
      'facebook.com',
      'meta.com',
      'fb.com',
      'messenger.com'
    ]
  },
  apple: {
    brand: 'Apple',
    domains: [
      'apple.com',
      'icloud.com',
      'me.com'
    ]
  },
  paypal: {
    brand: 'PayPal',
    domains: [
      'paypal.com',
      'paypal.me'
    ]
  },
  flipkart: {
    brand: 'Flipkart',
    domains: [
      'flipkart.com',
      'flipkart.net'
    ]
  },
  amazon: {
    brand: 'Amazon',
    domains: [
      'amazon.com',
      'amazon.in',
      'amazon.co.uk',
      'amazon.de',
      'amazon.co.jp',
      'amazon.ca',
      'amazon.fr',
      'amazon.es',
      'amazon.it',
      'aws.amazon.com'
    ]
  },
  netflix: {
    brand: 'Netflix',
    domains: [
      'netflix.com'
    ]
  },
  github: {
    brand: 'GitHub',
    domains: [
      'github.com',
      'github.io'
    ]
  },
  chase: {
    brand: 'Chase Bank',
    domains: [
      'chase.com'
    ]
  },
  wellsfargo: {
    brand: 'Wells Fargo',
    domains: [
      'wellsfargo.com'
    ]
  },
  binance: {
    brand: 'Binance',
    domains: [
      'binance.com'
    ]
  },
  steam: {
    brand: 'Steam',
    domains: [
      'steampowered.com',
      'steamcommunity.com'
    ]
  }
};

/**
 * Check whether a hostname represents a local development / loopback address
 *
 * @param {string} hostname
 * @returns {boolean}
 */
export function isLocalDevelopmentAddress(hostname) {
  if (!hostname || typeof hostname !== 'string') return false;
  const h = hostname.toLowerCase().trim().replace(/^\[|\]$/g, '');
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h.startsWith('127.') ||
    h === '::1' ||
    h === '0.0.0.0' ||
    h.endsWith('.localhost') ||
    h.endsWith('.local')
  );
}

/**
 * Strict hostname verification against approved legitimate domains and local development.
 *
 * A domain is trusted ONLY when the hostname exactly matches an approved domain
 * or is a valid subdomain of that domain.
 *
 * @param {string} hostname - The hostname to verify
 * @returns {{
 *   isTrusted: boolean,
 *   isLocalDev: boolean,
 *   brandKey?: string | null,
 *   brand?: string | null,
 *   domain?: string | null,
 *   matchedHost?: string,
 *   reason: string | null
 * }}
 */
export function checkDomainTrust(hostname) {
  if (!hostname || typeof hostname !== 'string') {
    return {
      isTrusted: false,
      isLocalDev: false,
      brandKey: null,
      brand: null,
      domain: null,
      matchedHost: '',
      reason: null
    };
  }

  const cleanHost = hostname.toLowerCase().trim().replace(/^\[|\]$/g, '');

  // 1. Check local development addresses
  if (isLocalDevelopmentAddress(cleanHost)) {
    return {
      isTrusted: true,
      isLocalDev: true,
      brandKey: 'localhost',
      brand: 'Local Development',
      domain: cleanHost,
      matchedHost: cleanHost,
      reason: 'Local development address'
    };
  }

  // 2. Strict matching against approved official domains
  for (const [key, entry] of Object.entries(TRUSTED_OFFICIAL_DOMAINS)) {
    for (const legitDomain of entry.domains) {
      if (cleanHost === legitDomain || cleanHost.endsWith('.' + legitDomain)) {
        return {
          isTrusted: true,
          isLocalDev: false,
          brandKey: key,
          brand: entry.brand,
          domain: legitDomain,
          matchedHost: cleanHost,
          reason: 'Verified legitimate domain'
        };
      }
    }
  }

  return {
    isTrusted: false,
    isLocalDev: false,
    brandKey: null,
    brand: null,
    domain: null,
    matchedHost: cleanHost,
    reason: null
  };
}
