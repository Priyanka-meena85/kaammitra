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
app.use(cors());

// Mount routers (placeholders for now)
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/workers', require('./routes/workers'));
// app.use('/api/v1/services', require('./routes/services'));
// app.use('/api/v1/bookings', require('./routes/bookings'));

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
