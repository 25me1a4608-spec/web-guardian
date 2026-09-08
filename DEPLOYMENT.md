# WebGuard AI — Production Deployment Guide

> **Architecture Overview**  
> `User Browser / Chrome Extension` ➔ `WebGuard AI Frontend (Vercel / Netlify)` ➔ `WebGuard AI Backend API (Render / Railway / Docker)` ➔ `Multi-Signal Analysis Engine (Lexical + Heuristic + Threat Intel + ML Feature Model)`

This guide details step-by-step production deployment for both the Node.js Backend API and the React + Vite Frontend, as well as production configuration for the Chrome Extension.

---

## 1. Backend Deployment (Render, Railway, or Docker)

The WebGuard AI backend is a lightweight, hardened Express service. It requires **no persistent database** because analysis is passive and real-time.

### Option A: Render (Recommended Web Service)
1. Fork or push the repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** ➔ **Web Service**.
3. Select your repository.
4. Configure settings:
   - **Name**: `webguard-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
   - **Instance Type**: Free / Starter
5. Add Environment Variables (under **Environment** tab):
   ```ini
   PORT=10000
   HOST=0.0.0.0
   NODE_ENV=production
   FRONTEND_ORIGIN=https://YOUR-FRONTEND-DOMAIN.vercel.app
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=60
   ```
   *(Optional Threat Intel keys):*
   ```ini
   VIRUSTOTAL_API_KEY=your_virustotal_key_here
   GOOGLE_SAFE_BROWSING_API_KEY=your_gsb_key_here
   ```
6. Click **Deploy Web Service**.
7. Note your live backend URL: `https://webguard-api.onrender.com` (or your custom domain).

### Option B: Railway
1. In [Railway](https://railway.app/), click **New Project** ➔ **Deploy from GitHub repo**.
2. Set root directory to `/backend`.
3. Add the same environment variables as above (`PORT`, `HOST=0.0.0.0`, `NODE_ENV=production`, `FRONTEND_ORIGIN`).
4. Railway will detect `package.json` and start `node server.js`.

---

## 2. Frontend Deployment (Vercel or Netlify)

The frontend is a React 19 Single-Page Application (SPA) built with Vite.

### Option A: Vercel (Recommended)
1. In the [Vercel Dashboard](https://vercel.com/), click **Add New...** ➔ **Project**.
2. Import your GitHub repository.
3. In **Project Configuration**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   ```ini
   VITE_API_BASE_URL=https://webguard-api.onrender.com
   ```
   *(Replace with your actual deployed backend URL from Step 1).*
5. Click **Deploy**.
6. Note your live frontend URL (e.g., `https://webguard-ai.vercel.app`).
7. **Important**: Copy your live frontend URL back to the Backend's `FRONTEND_ORIGIN` environment variable so CORS allows requests.

### Option B: Netlify
1. Connect repository in Netlify.
2. Base directory: `frontend`, Build command: `npm run build`, Publish directory: `frontend/dist`.
3. Add environment variable `VITE_API_BASE_URL=https://webguard-api.onrender.com`.
4. Deploy site.

---

## 3. Chrome Extension Production Configuration

The Chrome Extension communicates directly with the WebGuard AI Backend API.

1. Open [`extension/config.js`](file:///Users/achantiabhishek/fack%20web%20site%20detector%20AN/extension/config.js):
   ```javascript
   // Switch active environment from 'development' to 'production':
   export const ACTIVE_ENV = 'production';

   export const ENVIRONMENTS = {
     development: {
       BACKEND_URL: 'http://localhost:5001',
       WEBAPP_URL: 'http://localhost:5173'
     },
     production: {
       // REPLACE_AFTER_DEPLOYMENT with your actual deployed URLs:
       BACKEND_URL: 'https://webguard-api.onrender.com',
       WEBAPP_URL:  'https://webguard-ai.vercel.app'
     }
   };
   ```
2. In [`extension/manifest.json`](file:///Users/achantiabhishek/fack%20web%20site%20detector%20AN/extension/manifest.json), add your deployed backend domain to `host_permissions`:
   ```json
   "host_permissions": [
     "http://localhost:5001/*",
     "https://webguard-api.onrender.com/*"
   ]
   ```
3. Load the extension in Chrome:
   - Navigate to `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked** and select the `extension/` directory.

---

## 4. Post-Deployment Verification Checklist

After deploying the backend and frontend:

- [ ] **Health Check**:
  ```bash
  curl -X GET https://YOUR-BACKEND-DOMAIN/api/health
  ```
  Expected output:
  ```json
  {
    "success": true,
    "status": "ok",
    "service": "WebGuard AI",
    "version": "6.0.0",
    "readiness": {
      "backend": "connected",
      "threatIntelligence": "unavailable",
      "localAnalysis": "available",
      "mlPredictor": "available"
    }
  }
  ```

- [ ] **URL Analysis Check**:
  ```bash
  curl -X POST https://YOUR-BACKEND-DOMAIN/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com"}'
  ```
  Confirm HTTP 200 response with `score`, `riskLevel: "LOW"`, `indicators: []`, and explanation.

- [ ] **CORS Verification**:
  Open the deployed frontend URL in your browser, enter `https://example.com`, and click **Analyze URL**. Ensure the scan succeeds without CORS console errors.

- [ ] **Extension Verification**:
  Open the Chrome Extension popup, click **Analyze Current Page**, and confirm backend connectivity indicator shows a green dot (`Active`).

---

## 5. Security & Privacy Safeguards in Production

- **Passive Lexical Inspection**: No submitted URL is ever fetched, executed, or rendered on the client or server.
- **Zero Database / Zero PII**: Scan history is stored purely in client browser memory (`localStorage` and `chrome.storage.local`).
- **No Secret Leakage**: VirusTotal / Google Safe Browsing keys reside strictly in server-side environment variables; they are never sent to the client or extension.
- **Defensive HTTP Headers**: The API automatically sends `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and removes `X-Powered-By`.
- **Sliding-Window Rate Limiting**: Built-in 60 requests/minute protection per IP address prevents denial of service.
