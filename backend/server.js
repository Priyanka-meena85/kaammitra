const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Mount routers
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/workers', require('./routes/workers'));
app.use('/api/v1/services', require('./routes/services'));
app.use('/api/v1/bookings', require('./routes/bookings'));
app.use('/api/v1/chats', require('./routes/chats'));
app.use('/api/v1/ratings', require('./routes/ratings'));
app.use('/api/v1/complaints', require('./routes/complaints'));
app.use('/api/v1/leads', require('./routes/leads'));
app.use('/api/v1/emergency-leads', require('./routes/emergencyLeads'));
app.use('/api/v1/callback-requests', require('./routes/callback'));
app.use('/api/v1/areas', require('./routes/areas'));
app.use('/api/v1/admin', require('./routes/admin'));

app.get('/', (req, res) => {
    res.send('KaamMitra API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
