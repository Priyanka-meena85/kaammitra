const API_BASE = 'https://kaammitra-1.onrender.com/api/v1';
const HEALTH_URL = 'https://kaammitra-1.onrender.com/health';

async function runTests() {
  console.log('--- STARTING E2E TESTS ---');

  // 1. Health
  try {
    const res = await fetch(HEALTH_URL);
    const data = await res.json();
    console.log('[PASS] /health', data);
  } catch (err) {
    console.error('[FAIL] /health', err.message);
  }

  // 2. Firebase Status
  try {
    const res = await fetch(`${API_BASE}/auth/firebase-status`);
    const data = await res.json();
    console.log('[PASS] /auth/firebase-status', data);
  } catch (err) {
    console.error('[FAIL] /auth/firebase-status', err.message);
  }

  // 3. Firebase Login (Empty Body) -> Expect 400
  try {
    const res = await fetch(`${API_BASE}/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (res.status === 400) {
      console.log('[PASS] /auth/firebase-login empty body correctly returned 400');
    } else {
      console.error('[FAIL] /auth/firebase-login expected 400, got', res.status);
    }
  } catch (err) {
    console.error('[FAIL] /auth/firebase-login', err.message);
  }

  // 4. Services List
  try {
    const res = await fetch(`${API_BASE}/services`);
    const data = await res.json();
    console.log(`[PASS] /services fetched ${data.data?.length || 0} services`);
  } catch (err) {
    console.error('[FAIL] /services', err.message);
  }

  console.log('--- E2E TESTS FINISHED ---');
}

runTests();
