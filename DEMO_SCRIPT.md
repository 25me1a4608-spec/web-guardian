# WebGuard AI — 2 to 3 Minute Hackathon Demo Script

> **Target Duration**: 2 minutes 45 seconds (~3 minutes max)  
> **Presenter Persona**: Enthusiastic, technically precise, and natural.  
> **Setup Required**: WebGuard AI running locally at `http://localhost:5173/` and Chrome Extension unpacked in browser.

---

### [0:00 – 0:20] 1. The Problem: Silent Phishing & Alert Fatigue
*(Presenter is on the WebGuard AI homepage showing the hero headline "Is this link safe?")*

> "Every single day, millions of phishing links are sent through emails, SMS, and messaging apps. Attackers use clever visual tricks—like look-alike domains and unencrypted ports—that easily bypass human intuition. But when modern security tools do step in, they act like black boxes: they either block the site with a generic warning or say nothing at all. Users don't know *why* a link is dangerous, so they bypass warnings and enter their credentials anyway."

---

### [0:20 – 0:40] 2. The Solution: Detect + Explain + Protect
*(Presenter points to the subtitle and brand motto)*

> "We built WebGuard AI with a simple philosophy: *'Don't just detect the threat. Understand it.'* WebGuard AI doesn't just issue a binary safe-or-unsafe flag. It combines 18 lexical and host indicators with threat intelligence and feature-based risk modeling. It calculates a transparent Threat Score from 0 to 100, highlights the exact structural red flags found, and explains in plain English what the user should do."

---

### [0:40 – 1:30] 3. Live URL Analysis Walkthrough
*(Presenter clicks on "Try Demo Scenarios" or enters test URLs)*

#### Test 1: Verified Clean Benchmark
*(Click "Verified Safe Benchmark" or type `https://accounts.google.com` and hit Analyze)*
> "Let's test a clean, verified link first. In under 2 seconds, our 7-stage pipeline completes. Notice the Threat Score centerpiece: an animated circular gauge showing **0 out of 100 — LOW RISK** in emerald green. The system confirms standard HTTPS, a clean apex domain, and zero deceptive indicators."

#### Test 2: Suspicious Disposable Domain
*(Click "Disposable Domain Clone" `http://update-security-notice.xyz/login`)*
> "Now let's test a subtle link. It's using unencrypted HTTP, a high-risk disposable `.xyz` top-level domain, and security keywords in the path. WebGuard flags it as **SUSPICIOUS with a score of 40 in amber**. The explanation engine clearly explains: *'This URL shows suspicious structural patterns. Exercise caution and do not enter credentials.'*"

#### Test 3: High-Risk Synthetic Phishing Trap
*(Click "Direct IP Phishing Trap" `http://192.168.1.100/paypal-security-update/login.php?verify=account&pass=1`)*
> "Now, look at what happens with an aggressive credential trap. The score jumps to **86 out of 100 — HIGH RISK**, with the circular gauge pulsing red. Instantly, our dedicated **High-Risk Warning Bar** triggers, alerting: *'Critical Security Warning: Phishing Link Detected. Do not enter passwords or payment credentials.'*
> And notice the user actions: rather than leaving the user stranded, we provide a one-click **'Go Back'** safe exit, or **'View Details'** which smoothly scrolls down to show the IP-based host and brand impersonation indicators."

---

### [1:30 – 2:00] 4. Cybersecurity Dashboard & Local Analytics
*(Presenter clicks the "Dashboard" tab in the header)*

> "Next, let's look at the **Cybersecurity Dashboard**. Here, users or security evaluators get complete visibility into their URL scanning activity: total links analyzed, average threat score, and a breakdown of Low vs. Suspicious vs. High Risk links. Everything is stored purely in client-side `localStorage`—no user passwords or submitted links are ever tracked or sent to a database. Users can inspect past scans, re-test URLs with one click, or export audit logs as JSON."

---

### [2:00 – 2:30] 5. Chrome Extension: Real-Time Browser Protection
*(Presenter opens the Chrome Extension popup on an active tab)*

> "Of course, security is most effective where users actually browse. Here is our **WebGuard AI Chrome Extension**, built on Manifest V3 with minimal permissions. It inspects the active tab on demand. With one click on 'Analyze Current Page', it queries the backend and displays the exact same risk score, security indicators, and 'Go Back' safe exit directly inside the browser popup. It protects users right before they enter sensitive information."

---

### [2:30 – 3:00] 6. Technical Integrity & Wrap-Up
*(Presenter returns to web app and concludes)*

> "To wrap up: WebGuard AI is technically honest. If external threat intelligence is unavailable, we declare local analysis mode rather than faking data. Our 18-feature extraction runs in under 10 milliseconds, and the entire project is 100% deployment-ready with 68 automated unit and security tests passing. 
> WebGuard AI turns security warnings into security understanding. Thank you, and we look forward to your questions!"
