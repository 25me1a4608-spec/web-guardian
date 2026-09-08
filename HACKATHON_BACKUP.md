# 🛡️ WebGuard AI — Hackathon Demo & Emergency Backup Guide

> **"Don't just detect the threat. Understand it."**  
> AI-Powered Fake Website & Phishing URL Detection

This guide is your rapid-reference cheat sheet for setting up, presenting, and troubleshooting WebGuard AI during live hackathon judging and evaluations.

---

## 🚀 1. Quick Startup Commands

Run these two commands in separate terminal tabs from the project root:

### Tab 1 — Backend Server (Port 5001)
```bash
cd backend
npm install   # If first time
node server.js
```
*Expected Output:*
```
=======================================================
  🛡️  WEGUARD AI DETECTION API — HARDENED (Step 13)
  "Don't just detect the threat. Understand it."
  Mode: DEVELOPMENT
  Rate Limit: 60 req / min
  Server running on: http://localhost:5001
=======================================================
```

### Tab 2 — Frontend Application (Port 5173)
```bash
cd frontend
npm install   # If first time
npm run dev -- --host 127.0.0.1 --port 5173
```
*Access Web App:* Open your browser to **[http://localhost:5173/](http://localhost:5173/)**

---

## 🧩 2. Chrome Extension Installation (Manifest V3)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top-right corner to **ON**.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `extension/` folder inside this project directory:
   `.../fack web site detector AN/extension`
5. The **WebGuard AI** icon will appear in your Chrome toolbar. Click the puzzle icon to pin it for easy demonstration.
6. Open the popup to verify backend connectivity (green status indicator: `● Backend Connected`).

---

## ⚙️ 3. Environment Variables

### Backend Configuration (`backend/.env` or root `.env`)
```env
# Server Port & Mode
PORT=5001
NODE_ENV=development

# Allowed CORS Origins (comma-separated)
FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173

# Optional Threat Intelligence Providers (Leave blank for autonomous local mode)
VIRUSTOTAL_API_KEY=
GOOGLE_SAFE_BROWSING_API_KEY=
```

### Frontend Configuration (`frontend/.env`)
```env
# URL pointing to the WebGuard AI backend API
VITE_API_BASE_URL=http://localhost:5001
```

*Note: WebGuard AI functions 100% autonomously in local mode even if all third-party API keys are empty!*

---

## 🎯 4. Three Canonical Demo Scenarios (Safe & Harmless)

Use these synthetic, safe test URLs to demonstrate all three risk tiers:

| Scenario | Target URL | Threat Score | Risk Level | Key Indicators Shown |
| :--- | :--- | :--- | :--- | :--- |
| **1. Low Risk** | `https://example.com` | **0 / 100** | 🟢 **LOW RISK** | No suspicious indicators, encrypted HTTPS |
| **2. Suspicious** | `https://example.com/login/verify-account` | **35 / 100** | 🟡 **SUSPICIOUS** | Suspicious Keywords (`login`, `verify-account`), Deep Path |
| **3. High Risk** | `http://192.0.2.10/login/verify-account?secure=true` | **98 / 100** | 🔴 **HIGH RISK** | Raw IP Address, Unencrypted HTTP, Phishing Keywords, Obfuscation |

*Tip: You can also click the quick-load pills located directly beneath the search bar on the WebGuard homepage!*

---

## 🌐 5. Internet Failure Fallback Plan (100% Offline Capability)

If the venue Wi-Fi drops or is unstable during judging:
- **Local Structural Analysis**: Continues running without interruption via the 10-heuristic rules engine.
- **ML Feature Risk Prediction**: Runs purely in-memory on Node.js using 8 weighted structural features.
- **Explanation Engine**: Generates transparent, natural-language rationales locally.
- **Graceful TI Status**: The UI automatically shows `Threat Intelligence: Local Analysis Mode (Offline Safe)` with a calm gray badge, without crashing, throwing errors, or blocking the scan.
- **No external network calls are required** to deliver complete, explainable verdicts!

---

## ⚡ 6. Backend Failure / Recovery Fallback Plan

If the backend stops responding during the demo:
1. **Frontend Graceful State**: The web app displays a friendly error banner:
   *"Backend service is not reachable on port 5001. Please verify the server is running."*
2. **Instant Restart**:
   ```bash
   # Check if port 5001 is stuck:
   lsof -ti :5001 | xargs kill -9
   # Restart immediately:
   cd backend && node server.js
   ```
3. **Verify Health Endpoint**:
   Visit [http://localhost:5001/api/health](http://localhost:5001/api/health) in your browser. You should receive:
   `{"success": true, "status": "ok", "service": "WebGuard AI"}`.

---

## 🛠️ 7. Quick Troubleshooting Steps

| Issue | Root Cause | Instant Fix |
| :--- | :--- | :--- |
| **CORS error in browser console** | Frontend origin mismatch or port conflict | Verify frontend is on `http://localhost:5173` and backend `PORT=5001`. |
| **Port 5001 already in use** | A previous Node instance is lingering | Run `lsof -ti :5001 \| xargs kill -9` then re-run `node server.js`. |
| **Extension shows "Connecting..."** | Extension host permission or backend offline | Ensure backend is running and extension has permissions for `http://localhost:5001/*`. Reload extension in `chrome://extensions/`. |
| **Vite port shifts to 5174** | Another app took port 5173 | Run `lsof -ti :5173 \| xargs kill -9` before launching `npm run dev`. |
| **Rate limit exceeded (HTTP 429)** | >60 requests within 1 minute from the same IP | Wait 60 seconds or increase `WINDOW_MS` / `MAX_REQUESTS` in `backend/server.js`. |

---

## 🏆 8. Key Pitch Phrases for Judges

- *"Traditional phishing detectors are black boxes that just output 'safe' or 'unsafe'. WebGuard AI doesn't just detect the threat — it explains WHY."*
- *"We combine structural heuristics, feature-based ML prediction, and transparent explanation engines to empower users with cybersecurity awareness."*
- *"Zero telemetry or private data collection: we analyze URL structures and features only, preserving 100% of user privacy."*
