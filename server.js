const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Load environment variables
require('dotenv').config({ path: './config/config.env' });

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Security middleware
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 1*60*1000, // 1 min
    max: 10000
});
app.use(limiter);

// Import Routes
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/car');
const reservationRoutes = require('./routes/reservation');
const membershipRoutes = require('./routes/membership');

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cars', carRoutes); // This includes rating routes via nested routing
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/membership', membershipRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Server Error'
    });
});

// Start Server
const PORT = process.env.PORT || 5003;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    server.close(() => process.exit(1));
});
