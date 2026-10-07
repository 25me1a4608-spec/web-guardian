
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRoutes from './routes/analyzeRoutes.js';
import visualVerifyRoutes from './routes/visualVerifyRoutes.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { safeLogger } from './middleware/safeLogger.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5001;
const HOST = process.env.HOST || '0.0.0.0';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ── 1. Safe HTTP Security Headers ───────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Remove X-Powered-By to prevent framework fingerprinting
  res.removeHeader('X-Powered-By');
  next();
});

// ── 2. Hardened CORS Configuration ──────────────────────────────────────────
const defaultAllowed = [
  'https://web-guardian-jo5g.vercel.app',
  'https://web-guardian-seven.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? [...process.env.FRONTEND_ORIGIN.split(',').map(s => s.trim().replace(/\/+$/, '')), ...defaultAllowed]
  : defaultAllowed;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (such as curl, mobile apps, or background extension service workers)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Always allow Chrome Extension origins in development and production
    if (normalizedOrigin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }

    // Always allow Vercel hosted apps (production and preview branches)
    if (normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // In development mode, allow localhost and loopback interfaces
    if (!IS_PRODUCTION) {
      if (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // Check against explicit allowlist
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    if (IS_PRODUCTION) {
      // Disallow origin cleanly without crashing the request pipeline
      return callback(null, false);
    }

    // Dev fallback
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

// ── 3. Route-Specific & Strict Payload Size Limits ──────────────────────────
// Dedicated 10MB parser for visual screenshot verification from Chrome Extension
app.use('/api/visual-verify', express.json({ limit: '10mb' }));

// Strict 10KB parser for standard URL analysis routes
app.use(express.json({ limit: '10kb' }));

// ── 4. JSON Syntax & Payload Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format in request body.'
    });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload exceeds 10KB size limit.'
    });
  }
  next(err);
});

// ── 5. Privacy-Safe Request Logger ──────────────────────────────────────────
app.use(safeLogger);

// ── 6. DoS Protection Rate Limiting ─────────────────────────────────────────
app.use('/api', rateLimiter);

// ── 7. API Routes ───────────────────────────────────────────────────────────
app.use('/api', analyzeRoutes);
app.use('/api', visualVerifyRoutes);

// ── 8. Root Informational Route ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    project: 'WebGuard AI',
    motto: "Don't just detect the threat. Understand it.",
    status: 'online',
    version: '6.0.0',
    mode: IS_PRODUCTION ? 'production' : 'development',
    endpoints: {
      health: 'GET /api/health',
      analyze: 'POST /api/analyze',
      visualVerify: 'POST /api/visual-verify',
      supportedBrands: 'GET /api/visual-verify/brands'
    }
  });
});

// ── 9. 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found.'
  });
});

// ── 10. Central Production Error Handler ────────────────────────────────────
// Ensures no internal stack traces, API keys, or paths leak to the client
app.use((err, req, res, next) => {
  console.error('[WebGuard Internal Server Error]', err.message);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    error: 'Analysis could not be completed. Please try again.'
  });
});

// ── 11. Start Server ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(`  🛡️  WEGUARD AI DETECTION API — HARDENED (Step 13)`);
    console.log(`  "Don't just detect the threat. Understand it."`);
    console.log(`  Mode: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`  Rate Limit: ${process.env.RATE_LIMIT_MAX || 60} req / min`);
    console.log(`  Server running on: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`=======================================================`);
  });
}

export default app;

