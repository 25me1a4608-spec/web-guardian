/**
 * WebGuard AI — Visual Verification & Puppeteer Comparison Routes
 * backend/routes/visualVerifyRoutes.js
 *
 * Provides:
 *   POST /api/visual-verify        - Verifies URL & client screenshot against original website using Puppeteer
 *   GET  /api/visual-verify/brands - Returns list of recognized target brands
 */

import express from 'express';
import { validateUrl } from '../utils/urlValidation.js';
import { verifyVisualAuthenticity, BRAND_TARGETS } from '../services/visualComparison.js';

const router = express.Router();

/**
 * GET /api/visual-verify/brands
 * List supported target brands
 */
router.get('/visual-verify/brands', (_req, res) => {
  const brands = Object.entries(BRAND_TARGETS).map(([key, item]) => ({
    key,
    name: item.name,
    officialDomains: item.officialDomains,
    officialUrl: item.targetUrl
  }));

  res.json({
    success: true,
    count: brands.length,
    brands
  });
});

/**
 * POST /api/visual-verify
 * Main visual verification handler
 * Body: { url: string, screenshot?: string (base64 data URL), brandHint?: string }
 */
router.post('/visual-verify', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request payload format.'
      });
    }

    const { url, screenshot, brandHint } = req.body;

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Run visual verification using Puppeteer engine
    const visualReport = await verifyVisualAuthenticity({
      url: validation.url,
      screenshot: typeof screenshot === 'string' && screenshot.startsWith('data:image/') ? screenshot : null,
      brandHint: typeof brandHint === 'string' ? brandHint : null
    });

    return res.json({
      success: true,
      url: validation.url,
      ...visualReport,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[WebGuard /api/visual-verify Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Visual verification could not be completed.'
    });
  }
});

export default router;
