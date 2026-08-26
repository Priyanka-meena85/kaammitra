const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

if (!process.env.JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET is not configured. Authentication will fail.");
}

// Connect to database
connectDB();

const http = require('http');
const { Server } = require('socket.io');

const helmet = require('helmet');
const sanitize = require('./middlewares/sanitize');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter, authLimiter, sensitiveLimiter, publicWriteLimiter } = require('./middlewares/rateLimit');

const app = express();
const server = http.createServer(app);

// Render/Vercel terminate TLS upstream, so the client IP arrives in
// X-Forwarded-For. Without this every request looks like the proxy to the rate
// limiter and one visitor could exhaust everyone's quota.
app.set('trust proxy', 1);

// Security headers. crossOriginResourcePolicy is relaxed so uploaded images
// still render on the frontend origin.
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Enable CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : [process.env.FRONTEND_URL || 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parser. The explicit cap stops a single huge payload from exhausting memory.
app.use(express.json({ limit: '1mb' }));
app.use(sanitize);

// Broad ceiling across the API; tighter limits are applied per-route below.
app.use('/api', apiLimiter);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const socketConfig = require('./socket');
socketConfig.setIo(io);
socketConfig(io);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Credential and account-creation endpoints get their own strict limiters.
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/firebase-login', authLimiter);
app.use('/api/v1/auth/register', sensitiveLimiter);
app.use('/api/v1/auth/reset-password', sensitiveLimiter);

// Endpoints a logged-out visitor can write to. Scoped to POST so a worker
// refreshing their own leads list is never throttled.
const postOnly = (limiter) => (req, res, next) =>
    (req.method === 'POST' ? limiter(req, res, next) : next());

app.use('/api/v1/leads', postOnly(publicWriteLimiter));
app.use('/api/v1/callback-requests', postOnly(publicWriteLimiter));
app.use('/api/v1/emergency-leads', postOnly(publicWriteLimiter));
app.use('/api/v1/areas/launch', postOnly(publicWriteLimiter));

// Mount routers
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/workers', require('./routes/workers'));
app.use('/api/v1/services', require('./routes/services'));
app.use('/api/v1/bookings', require('./routes/bookings'));
app.use('/api/v1/payments', require('./routes/paymentRoutes'));
app.use('/api/v1/chats', require('./routes/chats'));
app.use('/api/v1/ratings', require('./routes/ratings'));
app.use('/api/v1/complaints', require('./routes/complaints'));
app.use('/api/v1/leads', require('./routes/leads'));
app.use('/api/v1/emergency-leads', require('./routes/emergencyLeads'));
app.use('/api/v1/callback-requests', require('./routes/callback'));
app.use('/api/v1/areas', require('./routes/areas'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/api/v1/upload', require('./routes/upload'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/admin/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/admin/audit-logs', require('./routes/auditRoutes'));
app.use('/api/v1/admin/exports', require('./routes/exportRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));
app.use('/api/v1/safety', require('./routes/safetyRoutes'));

app.get('/', (req, res) => {
    res.send('KaamMitra API is running...');
});

app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'KaamMitra backend is running' });
});

// 404 and error handling must come after every route is mounted.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// A rejected promise somewhere in a request must not take the whole site down
// for every other user. Log it loudly and keep serving.
process.on('unhandledRejection', (err) => {
    console.error('Unhandled promise rejection:', err && err.stack ? err.stack : err);
});

// An uncaught exception leaves the process in an undefined state, so here we do
// exit — but only after letting in-flight requests finish.
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err && err.stack ? err.stack : err);
    server.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 10000).unref();
});

// Render and other platforms send SIGTERM before replacing an instance.
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully.');
    server.close(() => process.exit(0));
});
