# WebGuard AI — Chrome Extension (Manifest V3)

> "Don't just detect the threat. Understand it."

The **WebGuard AI Chrome Extension** brings real-time phishing and domain spoofing analysis directly into the Chromium browser toolbar. It communicates with the WebGuard AI backend via a secure service worker flow.

---

## 🏛️ Extension Architecture & Data Flow

```
WebGuard AI Chrome Extension Flow:
┌────────────────────────────────────────────────────────┐
│  Popup (popup.html / popup.js)                         │
│  - Reads active tab URL via activeTab (no auto-scan)   │
│  - Displays domain & state UI (IDLE / SCANNING / etc.) │
└──────────────────────────┬─────────────────────────────┘
                           │ chrome.runtime.sendMessage({ type: 'ANALYZE_URL' })
                           ▼
┌────────────────────────────────────────────────────────┐
│  Background Service Worker (background.js)             │
│  - Reads central configuration from config.js          │
│  - Manages timeouts (AbortController 12s)              │
│  - Fetches from WebGuard API (No analysis duplication) │
│  - Validates response schema strictly                  │
│  - Updates toolbar badge (✓ Safe, ? Suspicious, ! High)│
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/analyze { "url": "..." }
                           ▼
┌────────────────────────────────────────────────────────┐
│  WebGuard AI Backend API (localhost:5001)              │
│  ├── URL Feature Extraction (18 structural features)   │
│  ├── Heuristic Risk Scoring Engine                     │
│  ├── AI/ML Feature-Based Prediction                    │
│  └── Threat Intelligence Check (when configured)       │
└────────────────────────────────────────────────────────┘
```

---

## ⚙️ Central API Configuration (`config.js`)

All endpoint URLs, timeouts, and storage keys are centralized in [`extension/config.js`](file:///Users/achantiabhishek/fack%20web%20site%20detector%20AN/extension/config.js):

```javascript
export const CONFIG = {
  // Local backend server (Express on port 5001)
  BACKEND_URL: 'http://localhost:5001',

  // Production backend URL (toggle when deployed)
  // BACKEND_URL: 'https://api.webguard-ai.com',

  // Web application dashboard URL
  WEBAPP_URL: 'http://localhost:5173',

  // Request timeout in milliseconds
  REQUEST_TIMEOUT_MS: 12000,

  // Risk Score Thresholds (strictly consistent across backend & UI)
  THRESHOLDS: {
    LOW_MAX: 30,        // 0 – 30  : LOW RISK
    SUSPICIOUS_MAX: 70  // 31 – 70 : SUSPICIOUS
                        // 71 – 100: HIGH RISK
  }
};
```

---

## 🔒 Security & Privacy Guarantee

We adhere strictly to the principle of least privilege:

| Permission | Purpose |
|---|---|
| `activeTab` | Accesses only the URL of the focused tab **upon user click**. Never scans tabs in the background. |
| `storage` | Stores the user's last 10 explicit scans locally in `chrome.storage.local` with "Clear History" support. |
| `http://localhost:5001/*` | Connects exclusively to the local WebGuard AI analysis server. |

* **Zero Page Scraping**: Never reads DOM content, cookies, passwords, or input fields.
* **No Arbitrary Script Injection**: Does not inject content scripts into visited pages.
* **Safe Analysis**: Parses and evaluates URL structure as text — **never visits or executes links**.

---

## 📦 Installation Guide (Developer Mode)

1. **Verify Backend is Running**:
   ```bash
   cd backend
   node server.js
   ```
   Backend should confirm: `Server running on: http://localhost:5001`.

2. **Open Chrome Extensions**:
   * Navigate to `chrome://extensions` in your browser.
   * Or click Menu (⋮) -> **Extensions** -> **Manage Extensions**.

3. **Enable Developer Mode**:
   * Toggle the **Developer mode** switch in the top-right corner.

4. **Load Unpacked Extension**:
   * Click **Load unpacked** (top-left).
   * Select the folder:
     ```
     /Users/achantiabhishek/fack web site detector AN/extension
     ```
   * Click **Select / Open**.

5. **Pin Extension**:
   * Click the Chrome Extensions puzzle icon in your toolbar and pin **WebGuard AI**.

---

## 🧪 Verified Integration Tests

| # | Test Scenario | Input URL | Classification | Key Verification |
|---|---|---|---|---|
| **1** | **Legitimate Safe Site** | `https://example.com` | `LOW RISK` (0/100) | Valid HTTPS, domain extracted, 0 indicators. |
| **2** | **Suspicious Structure** | `https://login.paypal.com.account-update.xyz/verify` | `HIGH RISK` (62/100) | Flagged brand impersonation, high-risk Tld, stacked subdomains. |
| **3** | **Manual URL Mode** | `http://192.168.1.1/banking/login.php` | `HIGH RISK` | Raw IP host flagged, tested without visiting page. |
| **4** | **Invalid URL Format** | `not-a-valid-url` | Error Card | Friendly error: "Please enter a valid HTTP or HTTPS URL." |
| **5** | **Backend Offline** | Server down simulation | Error Card | "WebGuard backend is unavailable." with "Try Again" button. |
| **6** | **Browser Restricted Page** | `chrome://extensions` | Restricted State | "This browser page cannot be analyzed." Disable current scan. |
| **7** | **Long URL (220+ chars)** | Long parameterized URL | Compact + Expandable | UI remains completely usable, toggle expands full URL. |
| **8** | **Scan History Sync** | Multiple scans | `chrome.storage.local` | Top 10 scans recorded, timestamps shown, 1-click Clear History. |

---

## 📂 Extension Files

```
extension/
├── manifest.json       # Manifest V3 configuration, activeTab & storage permissions
├── config.js           # Single source of truth for API URLs & settings
├── popup.html          # Semantic HTML layout (IDLE, SCANNING, RESULT, ERROR, HISTORY)
├── popup.css           # Glassmorphic cybersecurity dark theme
├── popup.js            # Tab detection, background messaging, storage & result UI
├── background.js       # Service worker handling API fetch, timeouts & badges
├── icons/              # PNG icons (16px, 32px, 48px, 128px)
└── README.md           # Documentation & verification guide
```
