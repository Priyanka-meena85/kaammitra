# Launch checklist

Everything in the codebase is done. What remains needs your accounts and your
business decisions — no code changes required.

Run the test suites before and after any change:

```bash
cd backend
npm run test:security   # 46 checks: authorisation, abuse, rate limiting, headers
npm run test:journey    # 10 checks: full customer journey, book -> rate
```

---

## 1. Credentials (blocks first transaction)

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Where to get it |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Firebase console → Project settings → Service accounts → Generate new private key |
| `CLOUDINARY_*` | Cloudinary dashboard → Product environment credentials |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay dashboard → Settings → API Keys |
| `FRONTEND_URL` | Your deployed frontend origin — CORS rejects everything else |
| `NODE_ENV` | `production` |

Then `frontend/.env`:

```
VITE_API_URL=https://your-backend/api/v1
VITE_RAZORPAY_KEY_ID=rzp_live_xxx
VITE_ENABLE_DEMO_DATA=false
VITE_WHATSAPP_SUPPORT_NUMBER=918503396575
```

`FIREBASE_PRIVATE_KEY` contains newlines — wrap it in double quotes and keep the
`\n` escapes intact, or the Firebase Admin SDK fails to initialise.

**Firebase console:** enable Phone sign-in under Authentication → Sign-in method,
and add your production domain under Authentication → Settings → Authorised domains.
OTP silently fails on an unauthorised domain.

## 2. Razorpay activation

Razorpay will not enable live mode until your site publishes these. They are
built and linked in the footer:

- `/terms`
- `/privacy`
- `/refund-policy`

Have a lawyer review them before you go live. They are written for this business
model — marketplace, independent professionals, commission deducted from the
professional's settlement — but they are a starting point, not legal advice.
Update the placeholder support email and phone in `frontend/src/pages/Legal.jsx`.

## 3. Seed the catalogue

The booking form resolves a service name to a `Service` record. If the collection
is empty, no booking can be created:

```bash
cd backend
node seedAreas.js        # cities and areas you operate in
npm run seed:workers     # optional sample data — do NOT run against production
```

Create your admin account manually; there is no admin self-registration by design.

## 4. Before real traffic

- Run the backend under a process manager (Render restarts on exit; on a VM use `pm2`).
- Set `DISABLE_RATE_LIMIT=false` in production. It exists only for local testing.
- Confirm `trust proxy` works: hit an endpoint 15 times and check you get a 429.
  If you never do, the platform is not forwarding `X-Forwarded-For`.
- Take a MongoDB Atlas backup snapshot and confirm you can restore it.
- Test the whole flow on a real low-end Android phone on 4G, not just desktop
  Chrome. This is the device your users have.

## 5. Known limitations

- Worker phone numbers are public on worker profiles. This is deliberate — the
  call and WhatsApp buttons depend on it — but it does allow scraping. If that
  becomes a problem, put the number behind a login or a masked-calling provider.
- Once you take commission you are an *aggregator* under the Social Security
  (Central) Rules 2026 and Rajasthan's Gig Workers Act: real-time worker
  registration plus a 1–2% welfare levy. Budget for it before you scale.
- Chat history and notifications grow without bound. Add a retention policy
  before the database gets expensive.
