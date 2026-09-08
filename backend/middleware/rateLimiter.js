/**
 * WebGuard AI — Sliding Window Rate Limiting Middleware
 * backend/middleware/rateLimiter.js
 *
 * Step 9: DoS Prevention & Rate Limiting
 *
 * Implements an in-memory sliding window rate limiter.
 * Zero external dependencies. Highly efficient with automatic LRU cleanup.
 *
 * Configuration:
 *  - RATE_LIMIT_WINDOW_MS (default: 60000 = 1 minute)
 *  - RATE_LIMIT_MAX (default: 60 requests per minute)
 */

const ipRequests = new Map(); // ip -> Array of timestamps

// Automatic cleanup every 2 minutes
setInterval(() => {
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  for (const [ip, timestamps] of ipRequests.entries()) {
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    if (validTimestamps.length === 0) {
      ipRequests.delete(ip);
    } else {
      ipRequests.set(ip, validTimestamps);
    }
  }
}, 2 * 60 * 1000).unref(); // .unref() ensures this doesn't hold open test runners

/**
 * Express middleware for rate limiting.
 */
export function rateLimiter(req, res, next) {
  // Exempt health checks and options preflight from rate limiting
  if (req.method === 'OPTIONS' || req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '60', 10);

  // Extract client IP address safely
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0])
    : (req.socket?.remoteAddress || 'unknown');

  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = ipRequests.get(ip) || [];
  // Filter only timestamps in the current window
  const activeTimestamps = timestamps.filter(t => t > windowStart);

  if (activeTimestamps.length >= maxRequests) {
    const oldestTimestamp = activeTimestamps[0];
    const retryAfterSec = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    res.set('Retry-After', String(Math.max(1, retryAfterSec)));
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', '0');
    res.set('X-RateLimit-Reset', String(Math.ceil((oldestTimestamp + windowMs) / 1000)));

    console.warn(`[WebGuard Security] Rate limit exceeded for IP: ${ip} on ${req.method} ${req.originalUrl}`);

    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }

  activeTimestamps.push(now);
  ipRequests.set(ip, activeTimestamps);

  // Informative rate limit headers
  res.set('X-RateLimit-Limit', String(maxRequests));
  res.set('X-RateLimit-Remaining', String(maxRequests - activeTimestamps.length));

  next();
}
