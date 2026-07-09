const API_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('--- Phase 2 E2E Tests ---');

  try {
    // 1. Fetch Areas
    console.log('1. Fetching Areas...');
    const areasRes = await fetch(`${API_URL}/areas`);
    const areas = await areasRes.json();
    console.log(`PASS: Found ${areas.data.length} areas`);

    // 2. Submit Area Launch Request
    console.log('2. Submitting Area Launch Request...');
    const launchRes = await fetch(`${API_URL}/areas/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        phone: '9998887776',
        city: 'Delhi',
        area: 'CP',
        service: 'Plumber'
      })
    });
    const launch = await launchRes.json();
    console.log(`PASS: Submitted request for ${launch.data.city}`);

    console.log('All public Phase 2 endpoints PASS.');
  } catch (err) {
    console.error('FAIL:', err.message);
  }
}

runTests();
