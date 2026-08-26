/* Full customer journey: book -> worker lifecycle -> rate. Guards must not break the happy path. */
const path = require('path');

// Boots the real server against an in-memory MongoDB, then probes it over HTTP.
const { spawn } = require('child_process');

const BACKEND = path.resolve(__dirname, '..');
process.chdir(BACKEND);
const mongoose = require(path.join(BACKEND, 'node_modules/mongoose'));
const { MongoMemoryServer } = require(path.join(BACKEND, 'node_modules/mongodb-memory-server'));

const PORT = 5202;
const BASE = `http://127.0.0.1:${PORT}/api/v1`;

let pass = 0, fail = 0; const results = [];
function check(name, ok, detail) {
  if (ok) { pass++; results.push(`  PASS  ${name}`); }
  else { fail++; results.push(`! FAIL  ${name}${detail ? '\n          -> ' + detail : ''}`); }
}

async function req(method, url, opts) {
  const { token, body } = opts || {};
  const headers = { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { _raw: text.slice(0, 300) }; }
  return { status: res.status, body: json };
}

(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  const child = spawn(process.execPath, ['server.js'], {
    cwd: BACKEND,
    env: Object.assign({}, process.env, {
      PORT: String(PORT), MONGO_URI: uri, JWT_SECRET: 'journey_secret_journey_secret',
      FRONTEND_URL: 'http://localhost:5173', NODE_ENV: 'development',
    }),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const log = [];
  child.stdout.on('data', d => log.push(String(d)));
  child.stderr.on('data', d => log.push('[err] ' + String(d)));
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/health`); if (r.ok) break; } catch { }
    await new Promise(r => setTimeout(r, 500));
  }

  await mongoose.connect(uri);
  const Customer = require(path.join(BACKEND, 'models/Customer'));
  const Worker = require(path.join(BACKEND, 'models/Worker'));
  const Service = require(path.join(BACKEND, 'models/Service'));

  await Customer.create({ name: 'Asha', phone: '9000000001', password: 'secret123', city: 'Jaipur' });
  const worker = await Worker.create({
    name: 'Ramesh', phone: '9111111111', password: 'secret123', services: ['Plumber'],
    city: 'Jaipur', area: 'Vaishali Nagar', isAvailable: true, isVerified: true, expectedCharge: 400,
  });
  await Service.create({ name: 'Plumber', hindiName: 'Plumber', englishName: 'Plumber', startingPrice: 300 });

  const tC = (await req('POST', '/auth/login', { body: { phone: '9000000001', password: 'secret123', role: 'customer' } })).body.token;
  const tW = (await req('POST', '/auth/login', { body: { phone: '9111111111', password: 'secret123', role: 'worker' } })).body.token;

  // 1. Search: does the customer actually find the worker?
  const suggest = await req('GET', '/bookings/suggest-workers?service=Plumber&preferredDate=2026-09-20&preferredTime=10:00&urgency=normal', { token: tC });
  check('JOURNEY 1: suggest-workers returns the matching plumber',
    suggest.status === 200 && (suggest.body.data || []).length === 1,
    `status=${suggest.status} count=${(suggest.body.data || []).length}`);

  // 2. Book
  const book = await req('POST', '/bookings', {
    token: tC, body: {
      workerId: String(worker._id), service: 'Plumber', description: 'Kitchen tap is leaking',
      address: '12 Main Street, Vaishali Nagar', date: '2026-09-20', time: '10:00', urgency: 'Normal',
    },
  });
  check('JOURNEY 2: booking created', book.status === 201, `status=${book.status} ${JSON.stringify(book.body).slice(0, 200)}`);
  const bid = book.body?.data?._id;

  // 3. Worker sees it
  const wBookings = await req('GET', `/bookings/worker/${worker._id}`, { token: tW });
  check('JOURNEY 3: worker sees the new booking',
    wBookings.status === 200 && (wBookings.body.data || []).some(b => String(b._id) === String(bid)),
    `status=${wBookings.status} count=${wBookings.body?.count}`);

  // 4. Lifecycle
  const steps = ['Accepted', 'On the Way', 'In Progress', 'Completed'];
  let lifecycleOk = true, lifecycleDetail = '';
  for (const s of steps) {
    const r = await req('PATCH', `/bookings/${bid}/status`, { token: tW, body: { status: s } });
    if (r.status !== 200) { lifecycleOk = false; lifecycleDetail = `${s} -> ${r.status} ${JSON.stringify(r.body).slice(0, 140)}`; break; }
  }
  check('JOURNEY 4: worker can drive Accepted -> On the Way -> In Progress -> Completed', lifecycleOk, lifecycleDetail);

  // 5. Customer rates the completed job
  const rate = await req('POST', '/ratings', { token: tC, body: { workerId: String(worker._id), rating: 4, comment: 'Neat work, on time' } });
  check('JOURNEY 5: customer can rate after completion', rate.status === 201, `status=${rate.status} ${JSON.stringify(rate.body).slice(0, 200)}`);
  check('JOURNEY 5b: the written comment is persisted (not silently dropped)',
    rate.body?.data?.comment === 'Neat work, on time', `comment=${JSON.stringify(rate.body?.data?.comment)}`);

  // 6. Duplicate rating blocked
  const dup = await req('POST', '/ratings', { token: tC, body: { workerId: String(worker._id), rating: 1, comment: 'changed my mind' } });
  check('JOURNEY 6: duplicate rating for the same job rejected', dup.status === 409, `status=${dup.status}`);

  // 7. Worker's public average reflects the rating (and is not NaN)
  const pub = await req('GET', `/workers/${worker._id}`);
  check('JOURNEY 7: worker averageRating updated to 4 (no NaN drift)',
    pub.body?.data?.averageRating === 4 && pub.body?.data?.totalRatings === 1,
    `averageRating=${pub.body?.data?.averageRating} totalRatings=${pub.body?.data?.totalRatings}`);

  const ratingList = await req('GET', `/ratings/worker/${worker._id}`);
  check('JOURNEY 8: rating is publicly listed on the profile',
    ratingList.status === 200 && (ratingList.body.data || []).length === 1,
    `status=${ratingList.status} count=${(ratingList.body?.data || []).length}`);

  // 9. Blocking a worker revokes their API access
  await Worker.findByIdAndUpdate(worker._id, { isBlocked: true });
  const blocked = await req('GET', `/bookings/worker/${worker._id}`, { token: tW });
  check('JOURNEY 9: blocked worker loses API access', blocked.status === 403, `status=${blocked.status}`);

  console.log('\n============ CUSTOMER JOURNEY ============');
  console.log(results.join('\n'));
  console.log(`\nPassed: ${pass}   Failed: ${fail}`);
  if (fail) console.log('\n--- server log ---\n' + log.join('').split('\n').slice(-20).join('\n'));

  await mongoose.disconnect(); child.kill(); await mongod.stop(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
