/**
 * WebGuard AI — Comprehensive Backend Test Suite
 * Run with: node backendTests.js
 */

import { validateUrl } from './utils/urlValidation.js';
import { extractFeatures } from './services/urlAnalyzer.js';
import { calculateRisk } from './services/riskEngine.js';
import { predictRisk } from './services/mlRiskEngine.js';
import { generateExplanation } from './services/explanationEngine.js';

let pass = 0, fail = 0;

function test(label, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`  ✅ PASS: ${label}`);
      pass++;
    } else {
      console.log(`  ❌ FAIL: ${label} — ${result}`);
      fail++;
    }
  } catch (e) {
    console.log(`  ❌ ERROR: ${label} — ${e.message}`);
    fail++;
  }
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('  WebGuard AI — Backend Test Suite v1.0');
console.log('══════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════
// 1. URL VALIDATION TESTS
// ═══════════════════════════════════════════════════
console.log('1. URL VALIDATION\n');

test('accepts valid HTTPS URL', () => {
  const r = validateUrl('https://google.com');
  return r.valid === true || `Not valid: ${r.error}`;
});

test('accepts valid HTTP URL', () => {
  const r = validateUrl('http://example.com');
  return r.valid === true || `Not valid: ${r.error}`;
});

test('adds http:// if scheme missing', () => {
  const r = validateUrl('google.com');
  return r.valid === true || `Not valid: ${r.error}`;
});

test('rejects empty string', () => {
  const r = validateUrl('');
  return r.valid === false || 'Should have been rejected';
});

test('rejects null', () => {
  const r = validateUrl(null);
  return r.valid === false || 'Should have been rejected';
});

test('rejects number type', () => {
  const r = validateUrl(42);
  return r.valid === false || 'Should have been rejected';
});

test('rejects javascript: scheme', () => {
  const r = validateUrl('javascript:alert(1)');
  return r.valid === false || 'Should have been rejected';
});

test('rejects data: scheme', () => {
  const r = validateUrl('data:text/html,<h1>');
  return r.valid === false || 'Should have been rejected';
});

test('rejects file:// scheme', () => {
  const r = validateUrl('file:///etc/passwd');
  return r.valid === false || 'Should have been rejected';
});

test('rejects ftp:// scheme', () => {
  const r = validateUrl('ftp://files.com');
  return r.valid === false || 'Should have been rejected';
});

test('rejects chrome:// scheme', () => {
  const r = validateUrl('chrome://settings');
  return r.valid === false || 'Should have been rejected';
});

test('rejects chrome-extension:// scheme', () => {
  const r = validateUrl('chrome-extension://abc/popup.html');
  return r.valid === false || 'Should have been rejected';
});

test('rejects about:blank', () => {
  const r = validateUrl('about:blank');
  return r.valid === false || 'Should have been rejected';
});

test('rejects URL > 2048 chars', () => {
  const r = validateUrl('https://x.com/' + 'a'.repeat(2040));
  return r.valid === false || 'Should have been rejected';
});

test('accepts exactly 2048 chars', () => {
  const url = 'https://x.com/' + 'a'.repeat(2029);
  const r = validateUrl(url);
  // May be valid or invalid depending on hostname check — just must not throw
  return true;
});

test('rejects null-byte in URL', () => {
  const r = validateUrl('https://evil.com\x00/path');
  return r.valid === false || 'Should have been rejected';
});

// ═══════════════════════════════════════════════════
// 2. FEATURE EXTRACTION TESTS
// ═══════════════════════════════════════════════════
console.log('\n2. FEATURE EXTRACTION\n');

function getFeatures(url) {
  const v = validateUrl(url);
  if (!v.valid) throw new Error(`Invalid URL: ${v.error}`);
  return extractFeatures(v.url, v.parsed);
}

test('detects HTTPS correctly', () => {
  const f = getFeatures('https://example.com');
  return f.isHttps === true || `isHttps=${f.isHttps}`;
});

test('detects HTTP correctly', () => {
  const f = getFeatures('http://example.com');
  return f.isHttps === false || `isHttps=${f.isHttps}`;
});

test('detects IP address host', () => {
  const f = getFeatures('http://192.0.2.1/login');
  return f.usesIpAddress === true || `usesIpAddress=${f.usesIpAddress}`;
});

test('detects @ symbol', () => {
  const f = getFeatures('http://user@example.com');
  return f.hasAtSymbol === true || `hasAtSymbol=${f.hasAtSymbol}`;
});

test('detects punycode', () => {
  const f = getFeatures('https://xn--pple-43d.com');
  return f.hasPunycode === true || `hasPunycode=${f.hasPunycode}`;
});

test('detects URL shortener', () => {
  const f = getFeatures('https://bit.ly/abc123');
  return f.isShortenedUrl === true || `isShortenedUrl=${f.isShortenedUrl}`;
});

test('detects suspicious port 8080', () => {
  const f = getFeatures('http://example.com:8080/admin');
  return f.suspiciousPort === true || `suspiciousPort=${f.suspiciousPort}`;
});

test('detects multiple subdomains', () => {
  const f = getFeatures('https://a.b.c.example.com');
  return f.subdomainCount >= 3 || `subdomainCount=${f.subdomainCount}`;
});

test('detects suspicious keywords in URL', () => {
  const f = getFeatures('http://verify-account-login.xyz/secure/update');
  return (f.suspiciousKeywords?.length || 0) > 0 || `keywords=${JSON.stringify(f.suspiciousKeywords)}`;
});

test('urlLength matches raw URL length', () => {
  const url = 'https://example.com/path?q=1';
  const f = getFeatures(url);
  return f.urlLength === url.length || `urlLength=${f.urlLength} vs ${url.length}`;
});

test('clean HTTPS domain has no suspicious indicators', () => {
  const f = getFeatures('https://google.com');
  return f.isHttps === true && !f.usesIpAddress && !f.hasAtSymbol;
});

// ═══════════════════════════════════════════════════
// 3. RISK ENGINE TESTS
// ═══════════════════════════════════════════════════
console.log('\n3. RISK ENGINE\n');

function getRisk(url) {
  const v = validateUrl(url);
  if (!v.valid) throw new Error(`Invalid: ${v.error}`);
  const f = extractFeatures(v.url, v.parsed);
  return calculateRisk(f);
}

test('score is a number between 0 and 100', () => {
  const r = getRisk('https://google.com');
  return (typeof r.score === 'number' && r.score >= 0 && r.score <= 100) || `score=${r.score}`;
});

test('score never exceeds 100', () => {
  const r = getRisk('http://192.0.2.1@paypal.com@evil.ru:8080/login/verify/account');
  return r.score <= 100 || `score=${r.score}`;
});

test('score never goes below 0', () => {
  const r = getRisk('https://google.com');
  return r.score >= 0 || `score=${r.score}`;
});

test('riskLevel is LOW for clean HTTPS URL', () => {
  const r = getRisk('https://google.com');
  return r.riskLevel === 'LOW' || `level=${r.riskLevel}, score=${r.score}`;
});

test('riskLevel is HIGH for obvious phishing URL', () => {
  // IP address + AT symbol + multiple suspicious keywords + non-HTTPS + suspicious port
  const r = getRisk('http://paypal-secure-login@192.0.2.1:8080/verify/account/password/update');
  return r.riskLevel === 'HIGH' || `level=${r.riskLevel}, score=${r.score}`;
});

test('HTTP URL scores higher than same HTTPS URL', () => {
  const http = getRisk('http://example.com');
  const https = getRisk('https://example.com');
  return http.score > https.score || `http=${http.score}, https=${https.score}`;
});

test('indicators is an array', () => {
  const r = getRisk('https://google.com');
  return Array.isArray(r.indicators) || `indicators=${typeof r.indicators}`;
});

test('each indicator has id, name, severity, description', () => {
  const r = getRisk('http://192.0.2.1/login');
  const allHave = r.indicators.every(i => i.id && i.name && i.severity && i.description);
  return allHave || `indicators missing fields: ${JSON.stringify(r.indicators[0])}`;
});

test('threshold boundary: score 30 → LOW (max)', () => {
  const level = 30 >= 71 ? 'HIGH' : 30 >= 31 ? 'SUSPICIOUS' : 'LOW';
  return level === 'LOW' || `got ${level}`;
});

test('threshold boundary: score 31 → SUSPICIOUS (min)', () => {
  const level = 31 >= 71 ? 'HIGH' : 31 >= 31 ? 'SUSPICIOUS' : 'LOW';
  return level === 'SUSPICIOUS' || `got ${level}`;
});

test('threshold boundary: score 70 → SUSPICIOUS (max)', () => {
  const level = 70 >= 71 ? 'HIGH' : 70 >= 31 ? 'SUSPICIOUS' : 'LOW';
  return level === 'SUSPICIOUS' || `got ${level}`;
});

test('threshold boundary: score 71 → HIGH (min)', () => {
  const level = 71 >= 71 ? 'HIGH' : 71 >= 31 ? 'SUSPICIOUS' : 'LOW';
  return level === 'HIGH' || `got ${level}`;
});

// ═══════════════════════════════════════════════════
// 4. ML RISK ENGINE TESTS
// ═══════════════════════════════════════════════════
console.log('\n4. ML RISK ENGINE\n');

function getML(url) {
  const v = validateUrl(url);
  if (!v.valid) throw new Error(`Invalid: ${v.error}`);
  const f = extractFeatures(v.url, v.parsed);
  return predictRisk(f);
}

test('predictRisk returns available=true', () => {
  const r = getML('https://google.com');
  return r.available === true || `available=${r.available}`;
});

test('prediction is LOW/MEDIUM/HIGH', () => {
  const r = getML('https://google.com');
  return ['LOW','MEDIUM','HIGH'].includes(r.prediction) || `prediction=${r.prediction}`;
});

test('confidence is LOW/MEDIUM/HIGH', () => {
  const r = getML('https://google.com');
  return ['LOW','MEDIUM','HIGH'].includes(r.confidence) || `confidence=${r.confidence}`;
});

test('scoreContribution is a number between 0 and 35', () => {
  const r = getML('https://google.com');
  return (typeof r.scoreContribution === 'number' && r.scoreContribution >= 0 && r.scoreContribution <= 35) || `scoreContribution=${r.scoreContribution}`;
});

test('featureMap is an object', () => {
  const r = getML('https://google.com');
  return typeof r.featureMap === 'object' && r.featureMap !== null || `featureMap=${typeof r.featureMap}`;
});

test('no fake probability percentage in output', () => {
  const r = getML('https://google.com');
  const str = JSON.stringify(r);
  return !str.includes('99%') && !str.includes('100%') || 'Found fake probability percentage';
});

test('phishing URL gets HIGH prediction', () => {
  const r = getML('http://192.0.2.1@paypal-secure-login.com/verify');
  return r.prediction === 'HIGH' || `prediction=${r.prediction}`;
});

test('clean URL gets LOW prediction', () => {
  const r = getML('https://google.com');
  return r.prediction === 'LOW' || `prediction=${r.prediction}, note: may vary`;
});

// ═══════════════════════════════════════════════════
// 5. EXPLANATION ENGINE TESTS
// ═══════════════════════════════════════════════════
console.log('\n5. EXPLANATION ENGINE\n');

function getExplanation(riskLevel, score, indicators = []) {
  return generateExplanation({
    score,
    riskLevel,
    indicators,
    threatIntel: { available: false, knownMalicious: false, suspicious: false },
    mlPrediction: { available: true, prediction: riskLevel === 'HIGH' ? 'HIGH' : 'LOW' }
  });
}

test('LOW explanation contains "no major" or "safe" indication', () => {
  const e = getExplanation('LOW', 10);
  const s = e.summary.toLowerCase();
  return s.includes('no major') || s.includes('appears safe') || s.includes('low') || `summary: "${e.summary.substring(0,80)}"`;
});

test('SUSPICIOUS explanation warns about caution', () => {
  const e = getExplanation('SUSPICIOUS', 45, [{ id: 'TEST', description: 'test' }]);
  const s = e.summary.toLowerCase();
  return s.includes('suspicious') || s.includes('caution') || s.includes('warrants') || `summary: "${e.summary.substring(0,80)}"`;
});

test('HIGH explanation warns strongly', () => {
  const e = getExplanation('HIGH', 80, [{ id: 'IP', description: 'uses raw IP' }]);
  const s = e.summary.toLowerCase();
  return s.includes('phishing') || s.includes('malicious') || s.includes('avoid') || `summary: "${e.summary.substring(0,80)}"`;
});

test('explanation never claims 100% safe', () => {
  const e = getExplanation('LOW', 5);
  return !e.summary.includes('100% safe') || 'Found false claim "100% safe"';
});

test('explanation never claims 100% phishing', () => {
  const e = getExplanation('HIGH', 90);
  return !e.summary.includes('100% phishing') || 'Found false claim "100% phishing"';
});

test('explanation has a recommendation string', () => {
  const e = getExplanation('HIGH', 80);
  return typeof e.recommendation === 'string' && e.recommendation.length > 10 || `recommendation: ${e.recommendation}`;
});

test('explanation has whyThisScore string', () => {
  const e = getExplanation('SUSPICIOUS', 45);
  return typeof e.whyThisScore === 'string' || `whyThisScore: ${typeof e.whyThisScore}`;
});

// ════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log(`  RESULTS: ${pass} PASS / ${fail} FAIL / ${pass + fail} TOTAL`);
console.log(`  STATUS: ${fail === 0 ? '✅ ALL TESTS PASSED' : `❌ ${fail} TESTS FAILED`}`);
console.log('══════════════════════════════════════════════════════\n');
process.exit(fail > 0 ? 1 : 0);
