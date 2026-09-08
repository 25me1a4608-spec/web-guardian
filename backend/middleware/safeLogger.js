/**
 * WebGuard AI — Privacy-Preserving Safe Logger Middleware
 * backend/middleware/safeLogger.js
 *
 * Step 9: Operational Visibility without Sensitive Data Exposure
 *
 * Logs:
 *  - Request timestamp
 *  - Method & clean route endpoint
 *  - Response status code & response time (ms)
 *  - Client category (Chrome Extension / Web App / API Client)
 *
 * NEVER logs:
 *  - Passwords, cookies, tokens, or authorization headers
 *  - Raw query strings or sensitive form payloads
 *  - Internal API keys or server filesystem paths
 */

export function safeLogger(req, res, next) {
  const start = Date.now();

  // Identify client source without tracking personal identifiers
  const origin = req.headers.origin || '';
  let clientSource = 'API Client';
  if (origin.startsWith('chrome-extension://')) {
    clientSource = 'Chrome Extension';
  } else if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    clientSource = 'Web App';
  }

  // Hook into response finish event
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    const timestamp = new Date().toISOString();

    // Sanitize path: strip query parameters to avoid logging sensitive query strings
    const cleanPath = req.baseUrl + req.path;

    console.log(
      `[WebGuard ${level}] ${timestamp} | ${req.method} ${cleanPath} | Status: ${status} | ${duration}ms | Source: ${clientSource}`
    );
  });

  next();
}
