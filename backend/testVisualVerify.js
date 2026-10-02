/**
 * WebGuard AI — Visual Verification Test Suite
 * backend/testVisualVerify.js
 */

import { identifyBrand, verifyVisualAuthenticity, BRAND_TARGETS } from './services/visualComparison.js';

let pass = 0, fail = 0;

function test(label, condition) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    pass++;
  } else {
    console.log(`  ❌ FAIL: ${label}`);
    fail++;
  }
}

console.log('\n══════════════════════════════════════════════════════');
console.log('  WebGuard AI — Visual Verification Test Suite');
console.log('══════════════════════════════════════════════════════\n');

// 1. Brand Identification Tests
console.log('1. BRAND IDENTIFICATION\n');

{
  const r = identifyBrand('https://paypa1-security-login.com');
  test('Detects paypal brand on lookalike domain', r && r.brandKey === 'paypal' && r.isAuthentic === false);
}

{
  const r = identifyBrand('https://www.paypal.com/signin');
  test('Identifies authentic paypal domain', r && r.brandKey === 'paypal' && r.isAuthentic === true);
}

{
  const r = identifyBrand('https://accounts.google.com/ServiceLogin');
  test('Identifies authentic google domain', r && r.brandKey === 'google' && r.isAuthentic === true);
}

{
  const r = identifyBrand('https://netflix-account-verify.net');
  test('Detects netflix brand impersonation', r && r.brandKey === 'netflix' && r.isAuthentic === false);
}

{
  const r = identifyBrand('https://random-unknown-blog-1234.com');
  test('Returns null for unbranded neutral URL', r === null);
}

// 2. Visual Authenticity Verification Flow
console.log('\n2. VISUAL AUTHENTICITY EVALUATION\n');

async function runAsyncTests() {
  {
    const rep = await verifyVisualAuthenticity({
      url: 'https://paypa1-security-login.com',
      screenshot: 'data:image/jpeg;base64,mockClientScreenshotData'
    });

    test('Flags visual clone on phishing URL', rep.isVisualClone === true);
    test('Calculates similarity score >= 80%', rep.similarityScore >= 80);
    test('Calculates SSIM score >= 80%', rep.ssimScore >= 80);
    test('Metric specifies SSIM', rep.metric.includes('SSIM'));
    test('Identifies official target URL', rep.officialUrl === BRAND_TARGETS.paypal.targetUrl);
    test('Returns original and suspect screenshots', !!rep.originalScreenshot && !!rep.suspectScreenshot);
    test('Verdict title highlights visual clone', rep.verdictTitle.includes('Clone'));
  }

  {
    const rep = await verifyVisualAuthenticity({
      url: 'https://www.paypal.com/signin'
    });

    test('Flags authentic domain as authentic', rep.isAuthentic === true);
    test('Calculates 100% similarity for authentic site', rep.similarityScore === 100);
    test('Calculates 100% SSIM for authentic site', rep.ssimScore === 100);
    test('isVisualClone is false for authentic site', rep.isVisualClone === false);
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${pass} PASS / ${fail} FAIL / ${pass + fail} TOTAL`);
  console.log(`  STATUS: ${fail === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('══════════════════════════════════════════════════════\n');

  process.exit(fail === 0 ? 0 : 1);
}

runAsyncTests();
