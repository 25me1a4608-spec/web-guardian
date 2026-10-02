
import http from 'http';

const API_HOST = '127.0.0.1';
const API_PORT = 5001;

function makeRequest(method, path, body = null, customHeaders = {}) {
  return new Promise((resolve) => {
    const payload = body !== null ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    if (payload !== null) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path,
        method,
        headers
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(responseData);
          } catch (_) { }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseData,
            json
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });

    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

async function runSecurityAudit() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🛡️  WEGUARD AI — STEP 9 AUTOMATED SECURITY AUDIT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];

  // Helper
  function record(testName, passed, details) {
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName}`);
    if (details) console.log(`   └─ ${details}`);
    results.push({ testName, passed, details });
  }

  // TEST 1: Empty URL
  {
    const res = await makeRequest('POST', '/api/analyze', { url: '' });
    const passed = res.status === 400 && res.json?.success === false;
    record('TEST 1: Empty URL', passed, `Status: ${res.status}, Error: "${res.json?.error}"`);
  }

  // TEST 2: Malformed URL (bad hostname / spaces)
  {
    const res = await makeRequest('POST', '/api/analyze', { url: 'http://invalid host with spaces' });
    const passed = res.status === 400 && res.json?.success === false;
    record('TEST 2: Malformed URL', passed, `Status: ${res.status}, Error: "${res.json?.error}"`);
  }

  // TEST 3: javascript: URL
  {
    const res = await makeRequest('POST', '/api/analyze', { url: 'javascript:alert(1)' });
    const passed = res.status === 400 && res.json?.success === false && res.json?.error?.includes('protocol');
    record('TEST 3: javascript: URL Protocol Injection', passed, `Status: ${res.status}, Error: "${res.json?.error}"`);
  }

  // TEST 4: data: URL
  {
    const res = await makeRequest('POST', '/api/analyze', { url: 'data:text/html,<script>alert(1)</script>' });
    const passed = res.status === 400 && res.json?.success === false && res.json?.error?.includes('protocol');
    record('TEST 4: data: URL Protocol Injection', passed, `Status: ${res.status}, Error: "${res.json?.error}"`);
  }

  // TEST 5: Very long input (> 2048 chars)
  {
    const longUrl = 'https://example.com/' + 'a'.repeat(2500);
    const res = await makeRequest('POST', '/api/analyze', { url: longUrl });
    const passed = res.status === 400 && res.json?.success === false && res.json?.error?.includes('too long');
    record('TEST 5: Very Long Input Guard', passed, `Status: ${res.status}, Error: "${res.json?.error}"`);
  }

  // TEST 6: Unexpected JSON body
  {
    const res = await makeRequest('POST', '/api/analyze', { unexpectedField: 12345 });
    const passed = res.status === 400 && res.json?.success === false;
    record('TEST 6: Unexpected JSON Body Fields', passed, `Status: ${res.status}, Error: "${res.json?.error}"`);
  }

  // TEST 7: Rate Limiting Verification
  {
    // Check rate limit headers exist on single request
    const res = await makeRequest('POST', '/api/analyze', { url: 'https://example.com' });
    const hasHeaders = !!res.headers['x-ratelimit-limit'] && !!res.headers['x-ratelimit-remaining'];
    record('TEST 7: Rate Limiting Headers Present', hasHeaders, `Limit: ${res.headers['x-ratelimit-limit']}, Remaining: ${res.headers['x-ratelimit-remaining']}`);
  }

  // TEST 8: Threat Intelligence Unavailable Fallback
  {
    const res = await makeRequest('POST', '/api/analyze', { url: 'https://github.com' });
    const ti = res.json?.threatIntelligence;
    const passed = res.status === 200 && ti !== undefined && ti.available === false && ti.scoreContribution === 0;
    record('TEST 8: TI Unavailable Safe Fallback', passed, `Available: ${ti?.available}, Message: "${ti?.message}"`);
  }

  // TEST 9: Health Readiness Distinction
  {
    const res = await makeRequest('GET', '/api/health');
    const rd = res.json?.readiness;
    const passed = res.status === 200 && rd?.backend === 'connected' && rd?.localAnalysis === 'available';
    record('TEST 9: Health / Readiness Status Distinction', passed, `Backend: ${rd?.backend}, TI: ${rd?.threatIntelligence}, Local: ${rd?.localAnalysis}`);
  }

  // TEST 10: Security Headers
  {
    const res = await makeRequest('GET', '/api/health');
    const h = res.headers;
    const passed = h['x-content-type-options'] === 'nosniff' && h['x-frame-options'] === 'DENY';
    record('TEST 10: Defensive HTTP Security Headers', passed, `nosniff: ${h['x-content-type-options']}, X-Frame: ${h['x-frame-options']}`);
  }

  // TEST 11: Malformed JSON Syntax (SyntaxError 400, not 500)
  {
    const res = await makeRequest('POST', '/api/analyze', '{"url": "broken');
    const passed = res.status === 400 && res.json?.success === false && res.json?.error?.includes('Invalid JSON');
    record('TEST 11: Malformed JSON Payload Handling', passed, `Status: ${res.status}, Error: "${res.json?.error}"`);
  }

  // TEST 12: Oversized Body (>10KB) (PayloadTooLarge 413, not 500)
  {
    const hugeBody = JSON.stringify({ url: 'https://example.com/' + 'z'.repeat(15000) });
    const res = await makeRequest('POST', '/api/analyze', hugeBody);
    const passed = res.status === 413 && res.json?.success === false && res.json?.error?.includes('exceeds');
    record('TEST 12: Payload Size Limit (413 Payload Too Large)', passed, `Status: ${res.status}, Error: "${res.json?.error}"`);
  }

  // TEST 13: Protocol Filtering for chrome:// and chrome-extension://
  {
    const res1 = await makeRequest('POST', '/api/analyze', { url: 'chrome://settings' });
    const res2 = await makeRequest('POST', '/api/analyze', { url: 'chrome-extension://abcdef/popup.html' });
    const res3 = await makeRequest('POST', '/api/analyze', { url: 'ftp://ftp.is.co.za' });
    const passed = res1.status === 400 && res2.status === 400 && res3.status === 400;
    record('TEST 13: Internal & Unsupported Schemes Rejected', passed, `chrome: ${res1.status}, extension: ${res2.status}, ftp: ${res3.status}`);
  }

  // TEST 14: Valid Normal HTTPS URL
  {
    const res = await makeRequest('POST', '/api/analyze', { url: 'https://google.com' });
    const passed = res.status === 200 && res.json?.success === true && res.json?.riskLevel === 'LOW' && res.json?.score === 0;
    record('TEST 14: Valid HTTPS URL Normal Analysis', passed, `Score: ${res.json?.score}/100, Risk: ${res.json?.riskLevel}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.filter(r => r.passed).length} | FAILED: ${results.filter(r => !r.passed).length}`);
  console.log(`OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runSecurityAudit();
