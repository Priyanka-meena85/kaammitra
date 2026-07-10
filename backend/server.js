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

const app = express();
const server = http.createServer(app);

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

// Body parser
app.use(express.json());

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

app.get('/', (req, res) => {
    res.send('KaamMitra API is running...');
});

app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'KaamMitra backend is running' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
