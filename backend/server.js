const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Load environment variables FIRST before anything else
dotenv.config();

// Validate required environment variables at startup
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

// Connect to Database
connectDB();

const app = express();

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
app.use(cors({
    origin: [
        "https://dvgss.in",
        "https://www.dvgss.in",
        ...allowedOrigins
    ],
    credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        next();
    });
}

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/students',   require('./routes/studentRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));
app.use('/api/users',      require('./routes/userRoutes'));
app.use('/api/teacher',    require('./routes/teacherRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/marks',      require('./routes/marksRoutes'));
app.use('/api/homework',   require('./routes/homeworkRoutes'));
app.use('/api/timetable',  require('./routes/timetableRoutes'));
app.use('/api/datesheet',  require('./routes/datesheetRoutes'));
app.use('/api/fees',       require('./routes/feeRoutes'));
app.use('/api/bus',        require('./routes/busRoutes'));

// Health check
app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'DV Convent School API is running' });
});

// 404 handler for unknown routes
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
