/* Senior-QA runtime probe for KaamMitra backend. */
const path = require('path');

// Boots the real server against an in-memory MongoDB, then probes it over HTTP.
const { spawn } = require('child_process');

const BACKEND = path.resolve(__dirname, '..');
process.chdir(BACKEND);
const mongoose = require(path.join(BACKEND, 'node_modules/mongoose'));
const { MongoMemoryServer } = require(path.join(BACKEND, 'node_modules/mongodb-memory-server'));

const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}/api/v1`;
const JWT_SECRET = 'qa_test_secret_qa_test_secret_qa_test_secret';

let pass = 0, fail = 0;
const results = [];
function check(name, ok, detail) {
  if (ok) { pass++; results.push(`  PASS  ${name}`); }
  else { fail++; results.push(`! FAIL  ${name}${detail ? '\n          -> ' + detail : ''}`); }
}

async function req(method, url, opts) {
  const { token, body } = opts || {};
  const headers = { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let json = null;
  const text = await res.text();
  try { json = JSON.parse(text); } catch { json = { _raw: text.slice(0, 200) }; }
  return { status: res.status, body: json };
}

async function waitForServer(ms) {
  const start = Date.now();
  while (Date.now() - start < (ms || 90000)) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/health`);
      if (r.ok) return true;
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('Mongo (in-memory):', uri);

  const child = spawn(process.execPath, ['server.js'], {
    cwd: BACKEND,
    env: Object.assign({}, process.env, {
      PORT: String(PORT), MONGO_URI: uri, JWT_SECRET,
      FRONTEND_URL: 'http://localhost:5173', NODE_ENV: 'development',
    }),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const serverLog = [];
  child.stdout.on('data', d => serverLog.push(String(d)));
  child.stderr.on('data', d => serverLog.push('[err] ' + String(d)));

  const up = await waitForServer();
  if (!up) {
    console.log('SERVER FAILED TO START:\n' + serverLog.join(''));
    child.kill(); await mongod.stop(); process.exit(1);
  }

  await mongoose.connect(uri);
  const Customer = require(path.join(BACKEND, 'models/Customer'));
  const Worker = require(path.join(BACKEND, 'models/Worker'));
  const Admin = require(path.join(BACKEND, 'models/Admin'));
  const Service = require(path.join(BACKEND, 'models/Service'));

  const custA = await Customer.create({ name: 'Cust A', phone: '9000000001', password: 'secret123', city: 'Jaipur', area: 'Vaishali Nagar' });
  const custB = await Customer.create({ name: 'Cust B', phone: '9000000002', password: 'secret123', city: 'Jaipur', area: 'Malviya Nagar' });
  // Stored exactly the way authController.register writes it (E.164):
  await Customer.create({ name: 'Cust E164', phone: '+919000000003', password: 'secret123', city: 'Jaipur' });
  const worker = await Worker.create({ name: 'Worker W', phone: '9111111111', password: 'secret123', services: ['Plumber'], city: 'Jaipur', area: 'Vaishali Nagar', isAvailable: true, isVerified: true, verificationStatus: 'Verified', expectedCharge: 400 });
  const worker2 = await Worker.create({ name: 'Worker X', phone: '9111111112', password: 'secret123', services: ['Electrician'], city: 'Jaipur', isAvailable: true });
  await Admin.create({ username: 'admin', password: 'secret123' });
  const service = await Service.create({ name: 'Plumber', hindiName: 'Plumber-hi', englishName: 'Plumber', startingPrice: 300 });

  const ids = {
    custA: custA._id.toString(), custB: custB._id.toString(),
    worker: worker._id.toString(), worker2: worker2._id.toString(),
    service: service._id.toString(),
  };

  // ============ AUTH ============
  const loginA = await req('POST', '/auth/login', { body: { phone: '9000000001', password: 'secret123', role: 'customer' } });
  check('AUTH: customer login with 10-digit phone succeeds', loginA.status === 200 && !!loginA.body.token,
    `status=${loginA.status} body=${JSON.stringify(loginA.body).slice(0, 200)}`);

  check('AUTH: login response does NOT leak password hash',
    !(loginA.body && loginA.body.user && loginA.body.user.password),
    `user.password = ${loginA.body && loginA.body.user ? JSON.stringify(loginA.body.user.password) : 'n/a'}`);

  const loginE164 = await req('POST', '/auth/login', { body: { phone: '+919000000003', password: 'secret123', role: 'customer' } });
  check('AUTH: user stored in E.164 (as register() writes) can log in',
    loginE164.status === 200, `status=${loginE164.status} body=${JSON.stringify(loginE164.body).slice(0, 160)}`);

  const loginBadPw = await req('POST', '/auth/login', { body: { phone: '9000000001', password: 'wrongpass', role: 'customer' } });
  check('AUTH: wrong password rejected with 401', loginBadPw.status === 401, `status=${loginBadPw.status}`);

  const loginB = await req('POST', '/auth/login', { body: { phone: '9000000002', password: 'secret123', role: 'customer' } });
  const loginW = await req('POST', '/auth/login', { body: { phone: '9111111111', password: 'secret123', role: 'worker' } });
  const loginAdm = await req('POST', '/auth/login', { body: { phone: 'admin', password: 'secret123', role: 'admin' } });
  const tA = loginA.body.token, tB = loginB.body.token, tW = loginW.body.token, tAdm = loginAdm.body.token;
  check('AUTH: worker + admin login succeed', !!tW && !!tAdm, `worker=${loginW.status} admin=${loginAdm.status}`);

  const noTok = await req('GET', '/auth/me');
  check('AUTH: /me without token returns 401', noTok.status === 401, `status=${noTok.status}`);

  // ============ WORKER PII ============
  const wList = await req('GET', '/workers');
  const w0 = (wList.body.data || [])[0] || {};
  check('WORKERS: public list omits password', !('password' in w0), `keys=${Object.keys(w0).join(',')}`);

  // ============ BOOKING: mass assignment ============
  const mass = await req('POST', '/bookings', {
    token: tA, body: {
      workerId: ids.worker, serviceId: ids.service, description: 'Tap leaking', address: '12 Main St',
      time: '10:00', date: '2026-09-01',
      status: 'Completed', paymentStatus: 'paid', totalAmount: 5000, advanceAmount: 5000, customerId: ids.custB,
    },
  });
  const mb = mass.body.data || {};
  check('BOOKING: client cannot force status=Completed on create', mb.status !== 'Completed', `status=${mb.status}`);
  check('BOOKING: client cannot force paymentStatus=paid on create', mb.paymentStatus !== 'paid', `paymentStatus=${mb.paymentStatus}`);
  check('BOOKING: client cannot spoof customerId on create', String(mb.customerId) === ids.custA, `customerId=${mb.customerId} (expected ${ids.custA})`);

  // Exactly what BookingForm.jsx sends: a service NAME, no serviceId.
  const realPayload = await req('POST', '/bookings', {
    token: tA, body: {
      workerId: ids.worker, service: 'Plumber', description: 'Tap is leaking badly',
      address: '12 Main Street, Jaipur', date: '2026-09-05', time: '09:00',
      urgency: 'Normal', contactNumber: '9000000001',
    },
  });
  check('BOOKING: real frontend payload (service name, no serviceId) succeeds',
    realPayload.status === 201, `status=${realPayload.status} ${JSON.stringify(realPayload.body).slice(0, 220)}`);
  check('BOOKING: totalAmount is taken from the worker rate, not the client',
    realPayload.body?.data?.totalAmount === 400, `totalAmount=${realPayload.body?.data?.totalAmount} (worker.expectedCharge=400)`);

  const pastDate = await req('POST', '/bookings', {
    token: tA, body: { workerId: ids.worker, service: 'Plumber', description: 'Old job', address: '12 Main Street', date: '2020-01-01', time: '09:00' },
  });
  check('BOOKING: past dates rejected', pastDate.status === 400, `status=${pastDate.status}`);

  const bookA = await req('POST', '/bookings', {
    token: tA, body: { workerId: ids.worker, serviceId: ids.service, description: 'Fix pipe', address: '12 Main St', time: '11:00', date: '2026-09-02' },
  });
  check('BOOKING: customer can create a booking', bookA.status === 201, `status=${bookA.status} ${JSON.stringify(bookA.body).slice(0, 160)}`);
  const bookAId = bookA.body && bookA.body.data && bookA.body.data._id;

  // ============ BOOKING IDOR ============
  if (bookAId) {
    const idor = await req('PATCH', `/bookings/${bookAId}/status`, { token: tB, body: { status: 'Cancelled' } });
    check("BOOKING: customer B cannot cancel customer A's booking (IDOR)", idor.status === 403,
      `status=${idor.status} body=${JSON.stringify(idor.body).slice(0, 160)}`);
  }

  const loginW2 = await req('POST', '/auth/login', { body: { phone: '9111111112', password: 'secret123', role: 'worker' } });
  if (bookAId && loginW2.body.token) {
    const idor2 = await req('PATCH', `/bookings/${bookAId}/status`, { token: loginW2.body.token, body: { status: 'Accepted' } });
    check("BOOKING: unassigned worker cannot accept another worker's booking", idor2.status === 403, `status=${idor2.status}`);
  }

  const crossRead = await req('GET', `/bookings/customer/${ids.custB}`, { token: tA });
  check("BOOKING: customer cannot read another customer's bookings", crossRead.status === 403, `status=${crossRead.status}`);

  // ============ RATINGS ============
  const anonRate = await req('POST', '/ratings', { body: { workerId: ids.worker, rating: 5, comment: 'anon 5 star' } });
  check('RATINGS: anonymous rating rejected (auth required)', anonRate.status === 401 || anonRate.status === 403,
    `status=${anonRate.status} body=${JSON.stringify(anonRate.body).slice(0, 160)}`);

  const noBookingRate = await req('POST', '/ratings', { token: tB, body: { workerId: ids.worker, rating: 5, comment: 'never hired them' } });
  check('RATINGS: customer with no completed booking cannot rate worker',
    noBookingRate.status >= 400, `status=${noBookingRate.status} body=${JSON.stringify(noBookingRate.body).slice(0, 160)}`);

  // ============ ADMIN GUARDS ============
  const custHitsAdmin = await req('GET', '/admin/stats', { token: tA });
  check('ADMIN: customer token rejected on /admin/stats', custHitsAdmin.status === 403, `status=${custHitsAdmin.status}`);
  const admOk = await req('GET', '/admin/stats', { token: tAdm });
  check('ADMIN: admin token accepted on /admin/stats', admOk.status === 200, `status=${admOk.status} ${JSON.stringify(admOk.body).slice(0, 160)}`);
  const areaLaunchAnon = await req('GET', '/areas/launch');
  check('AREAS: /areas/launch requires admin', areaLaunchAnon.status === 401, `status=${areaLaunchAnon.status}`);

  const adminCustomers = await req('GET', '/admin/customers', { token: tAdm });
  const ac0 = ((adminCustomers.body && adminCustomers.body.data) || [])[0] || {};
  check('ADMIN: customer list omits password hash', !('password' in ac0), `keys=${Object.keys(ac0).join(',')}`);

  // ============ WORKER SELF-SERVICE IDOR ============
  const availIdor = await req('PATCH', `/workers/${ids.worker2}/availability`, { token: tW, body: { isAvailable: false } });
  check("WORKERS: worker cannot toggle another worker's availability", availIdor.status === 403, `status=${availIdor.status}`);

  // ============ LEADS ============
  const leadAnon = await req('POST', '/leads', { body: { workerId: ids.worker, source: 'call', customerId: ids.custA } });
  check('LEADS: lead creation works (call/whatsapp tracking)', leadAnon.status === 201, `status=${leadAnon.status} ${JSON.stringify(leadAnon.body).slice(0, 160)}`);
  const leadsAsWorker = await req('GET', '/leads', { token: tW });
  const leadRows = (leadsAsWorker.body && leadsAsWorker.body.data) || [];
  check('LEADS: worker sees only own leads',
    leadsAsWorker.status === 200 && leadRows.every(l => String((l.workerId && l.workerId._id) || l.workerId) === ids.worker),
    `status=${leadsAsWorker.status} count=${leadsAsWorker.body && leadsAsWorker.body.count}`);

  // ============ PAYMENTS ============
  const payCross = await req('GET', `/payments/booking/${bookAId}`, { token: tB });
  check('PAYMENTS: non-participant cannot read booking payments', payCross.status === 403, `status=${payCross.status}`);

  // ============ INPUT VALIDATION ============
  const badStatus = bookAId
    ? await req('PATCH', `/bookings/${bookAId}/status`, { token: tW, body: { status: 'Hacked' } })
    : { status: 'n/a' };
  check('VALIDATION: invalid booking status rejected', badStatus.status === 400, `status=${badStatus.status}`);

  const regexBomb = await req('GET', '/workers/smart-match?service=.*&city=.*');
  const rbCount = ((regexBomb.body && regexBomb.body.data) || []).length;
  check('VALIDATION: regex metacharacters in search do not match everything',
    regexBomb.status === 200 && rbCount === 0,
    `status=${regexBomb.status} matched=${rbCount} (".*" should match no literal service name)`);

  const badId = await req('GET', '/workers/not-a-valid-objectid');
  check('VALIDATION: malformed ObjectId returns 4xx not 500', badId.status >= 400 && badId.status < 500,
    `status=${badId.status} ${JSON.stringify(badId.body).slice(0, 120)}`);

  // ============ COMPLAINTS ============
  const anonComplaint = await req('POST', '/complaints', { body: { bookingId: bookAId, workerId: ids.worker, customerId: ids.custA, reason: 'Fake', description: 'anonymous smear' } });
  check('COMPLAINTS: anonymous complaint rejected', anonComplaint.status === 401, `status=${anonComplaint.status}`);

  const foreignComplaint = await req('POST', '/complaints', { token: tB, body: { bookingId: bookAId, reason: 'Bad behavior', description: 'not my booking' } });
  check("COMPLAINTS: cannot complain about someone else's booking", foreignComplaint.status === 403, `status=${foreignComplaint.status}`);

  const ownComplaint = await req('POST', '/complaints', { token: tA, body: { bookingId: bookAId, reason: 'High price', description: 'Charged more than quoted amount' } });
  check('COMPLAINTS: customer can complain about their own booking', ownComplaint.status === 201, `status=${ownComplaint.status} ${JSON.stringify(ownComplaint.body).slice(0, 160)}`);
  check('COMPLAINTS: workerId is derived from the booking, not the client',
    String(ownComplaint.body?.data?.workerId) === ids.worker, `workerId=${ownComplaint.body?.data?.workerId}`);

  // ============ PUBLIC WRITE ENDPOINTS: mass assignment ============
  const cb = await req('POST', '/callback-requests', { body: { name: 'Spammer', phone: '9999999999', service: 'Plumber', status: 'Closed', assignedWorkerId: ids.worker } });
  check('CALLBACK: caller cannot preset status/assignedWorkerId',
    cb.status === 201 && cb.body?.data?.status === 'New' && !cb.body?.data?.assignedWorkerId,
    `status=${cb.status} body=${JSON.stringify(cb.body?.data).slice(0, 180)}`);

  const el = await req('POST', '/emergency-leads', { body: { service: 'Electrician', phone: '9999999999', status: 'Closed', assignedWorkerId: ids.worker } });
  check('EMERGENCY LEAD: caller cannot preset status/assignedWorkerId',
    el.status === 201 && el.body?.data?.status === 'New' && !el.body?.data?.assignedWorkerId,
    `status=${el.status} body=${JSON.stringify(el.body?.data).slice(0, 180)}`);

  const leadSpoof = await req('POST', '/leads', { body: { workerId: ids.worker, source: 'call', status: 'Converted' } });
  check('LEADS: caller cannot preset lead status',
    leadSpoof.status === 201 && leadSpoof.body?.data?.status === 'New', `status=${leadSpoof.body?.data?.status}`);

  // ============ CHAT ============
  const convo = `${ids.custA}_${ids.worker}`;
  const chatAsAdmin = await req('POST', `/chats/${convo}/messages`, { token: tAdm, body: { text: 'admin speaking as a participant' } });
  check('CHAT: admin cannot post into a customer/worker conversation', chatAsAdmin.status === 403, `status=${chatAsAdmin.status}`);

  const chatAsOutsider = await req('POST', `/chats/${convo}/messages`, { token: tB, body: { text: 'not my chat' } });
  check('CHAT: outsider cannot post into a conversation', chatAsOutsider.status === 403, `status=${chatAsOutsider.status}`);

  const chatAsOwner = await req('POST', `/chats/${convo}/messages`, { token: tA, body: { text: 'Hello, when can you come?' } });
  check('CHAT: participant can post', chatAsOwner.status === 201, `status=${chatAsOwner.status} ${JSON.stringify(chatAsOwner.body).slice(0, 140)}`);

  const emgStub = await req('POST', '/emergency', { body: {} });
  check('EMERGENCY STUB: dead placeholder route no longer answers', emgStub.status === 404, `status=${emgStub.status}`);

  console.log('\n================ QA RESULTS ================');
  console.log(results.join('\n'));
  console.log(`\nPassed: ${pass}   Failed: ${fail}`);
  console.log('\n--- server log tail ---\n' + serverLog.join('').split('\n').slice(-15).join('\n'));

  await mongoose.disconnect();
  child.kill();
  await mongod.stop();
  process.exit(0);
})().catch(async (e) => { console.error('HARNESS ERROR', e); process.exit(1); });
