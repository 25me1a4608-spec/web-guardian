# WebGuard AI — Security Architecture & Threat Model

> *"Don't just detect the threat. Understand it."*

---

## 1. Project Overview & Threat Model

**WebGuard AI** is a defense-in-depth URL analysis and phishing awareness application designed for hackathons and educational demonstrations. It accepts user-submitted URLs and classifies them into **LOW RISK**, **SUSPICIOUS**, or **HIGH RISK** tiers while providing transparent explanations of the detected risk factors.

### Threat Assumptions & Attack Vectors Considered
| Attack Vector | Threat Scenario | WebGuard AI Mitigation |
|---|---|---|
| **Malicious URL Execution** | Attacker inputs a URL pointing to malware, drive-by downloads, or exploit kits. | **Passive Text-Only Analysis.** WebGuard AI never opens, fetches, executes, or renders the target website. The URL is treated purely as a text string. |
| **Protocol Confusion / XSS** | Attacker inputs `javascript:alert(1)`, `data:text/html,...`, or `vbscript:...`. | **Strict Scheme Allowlist.** Only `http://` and `https://` are permitted. All pseudo-protocols and exotic schemes are rejected at both API and client levels with HTTP 400. |
| **Server Resource Exhaustion (DoS)** | Attacker floods the API or sends massive payloads to exhaust memory or CPU. | **Payload Size Limits & Rate Limiting.** 10KB JSON body limit; in-memory sliding window rate limiting (default: 60 req/min/IP); URL length capped at 2048 characters. |
| **Sensitive Data Leakage** | Attacker or user submits links containing credentials, auth tokens, or PII. | **Privacy-Preserving Logs & Zero Storage.** Server logs sanitize query strings; passwords and cookies are never captured or retained. |
| **API Key Exposure** | Third-party reputation keys (VirusTotal, Google Safe Browsing) leaked to clients or version control. | **Strict Server-Side Isolation.** Keys exist only in backend `process.env`. `.env` is git-ignored. Client code and responses never receive or contain credentials. |
| **Provider Outage / Dependency Failure** | VirusTotal or Google Safe Browsing becomes unreachable or rate-limited. | **Graceful Local Fallback.** Provider failures never crash the system and are never treated as evidence of maliciousness. The local heuristic and ML predictors continue seamlessly. |

---

## 2. Untrusted URL Handling & Sanitization

WebGuard AI enforces rigorous input validation in [`backend/utils/urlValidation.js`](file:///Users/achantiabhishek/fack%20web%20site%20detector%20AN/backend/utils/urlValidation.js):

1. **Protocol Allowlist**:
   - Only `http:` and `https:` schemes are accepted.
   - Forbidden schemes rejected: `javascript:`, `data:`, `file:`, `ftp:`, `chrome:`, `chrome-extension:`, `about:`, `blob:`, `vbscript:`, `ws:`, `wss:`, `ssh:`, `sftp:`, `tel:`, `mailto:`, `ldap:`, `gopher:`, `view-source:`.
2. **Length Constraints**:
   - Hard cap at 2,048 characters (RFC 7230 / browser safe limit).
3. **Control Character Sanitization**:
   - URLs containing null bytes (`\0`) or ASCII control characters (`[\x00-\x1F\x7F]`) are rejected.
4. **Structural & Hostname Verification**:
   - Evaluated using WHATWG standard URL parser.
   - Hostnames with whitespace, invalid characters, or missing domain hierarchy are rejected.
5. **No Code Execution**:
   - Input strings are never passed to `eval()`, `new Function()`, `child_process`, or template execution engines.

---

## 3. API Key Handling & Environment Isolation

- **Zero Client Exposure**:
  All external provider integrations (VirusTotal v3, Google Safe Browsing v4) are managed exclusively in `backend/services/threatIntelligence.js`.
- **Environment Separation**:
  Configuration is loaded via `dotenv`. The template is documented in [`backend/.env.example`](file:///Users/achantiabhishek/fack%20web%20site%20detector%20AN/backend/.env.example).
- **Git Protection**:
  `.gitignore` excludes `.env`, `backend/.env`, `*.pem`, `*.key`, and related secret formats.
- **Zero-Key Operational Baseline**:
  WebGuard AI functions fully in offline local heuristic mode without requiring any third-party API keys.

---

## 4. Privacy & Data Minimization

WebGuard AI adheres to data minimization principles:

* **What is Analyzed**: Only the submitted URL string (hostname, protocol, path, query parameters).
* **Why URLs are Processed**: Solely to evaluate lexical, structural, and reputation indicators of phishing or impersonation.
* **Storage Mechanics**:
  * Web application history is stored exclusively in client `window.localStorage`.
  * Chrome Extension logs are stored exclusively in `chrome.storage.local`.
  * **No remote databases, external tracking analytics, or user telemetry cookies are used.**
* **What is NEVER Stored or Requested**:
  * Passwords, login credentials, payment details, or personal identity documents.
  * Web page DOM contents or form input values.
* **History Management**: Users can permanently clear all local records at any time with 1-click confirmation.

---

## 5. Chrome Extension Security (Manifest V3)

The WebGuard AI Chrome Extension conforms strictly to Chrome Manifest V3 guidelines:

* **Minimal Permissions**:
  * `activeTab`: Used only when the user clicks the extension to inspect the current tab URL.
  * `storage`: Used solely to cache scan findings locally on the user's device (`chrome.storage.local`).
  * `notifications`: Used only to alert the user if a page is flagged as HIGH RISK while active.
  * **Explicitly Omitted**: `cookies`, `history`, `bookmarks`, `webRequestBlocking`, `downloads`, `<all_urls>`.
* **Content Security Policy**:
  * Defined as `"extension_pages": "script-src 'self'; object-src 'self'"`.
  * No external script loading, no dynamic code execution (`eval`), and no inline scripts.
* **Internal Page Protection**:
  * Extension automatically detects and skips Chrome internal pages (`chrome://`, `chrome-extension://`, `about:blank`), informing the user that browser settings pages are protected system resources.

---

## 6. HTTP Security Headers & Network Hardening

The backend Express server enforces defensive HTTP response headers on every route:
* `X-Content-Type-Options: nosniff` (prevents MIME type sniffing)
* `X-Frame-Options: DENY` (clickjacking defense)
* `X-XSS-Protection: 1; mode=block` (legacy XSS filtering)
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy: camera=(), microphone=(), geolocation=()`
* `X-Powered-By` header stripped to prevent framework fingerprinting.

---

## 7. Known Hackathon Limitations & Future Roadmap

As an educational hackathon prototype, WebGuard AI documents the following limitations:

1. **Passive Heuristics**:
   Structural analysis cannot inspect dynamically generated DOM payloads or JavaScript redirections that occur after rendering.
2. **In-Memory Rate Limiting**:
   The sliding-window rate limiter stores IP counters in Node.js process memory. In a distributed multi-node production deployment, this would be upgraded to Redis.
3. **Local Storage Scopes**:
   Web app history and extension history exist in independent local sandboxes. A privacy-preserving end-to-end encrypted sync mechanism could be implemented in future releases.
4. **Machine Learning Model**:
   The current ML layer is a lightweight, explainable feature-weight model. A production deployment would train on large-scale datasets (e.g., PhishTank, OpenPhish) with continuous model re-training.
5. **Scientifically Responsible Output**:
   WebGuard AI never claims "100% security" or "guaranteed detection". All scores represent probabilistic risk assessments based on available structural and intelligence signals.
