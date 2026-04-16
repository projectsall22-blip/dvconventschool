// v5 - CORS fix
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');

dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`Missing env: ${key}`);
        process.exit(1);
    }
});

connectDB();

const app = express();

// CORS - must be first middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(helmet({ crossOriginResourcePolicy: false, crossOriginOpenerPolicy: false }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

app.get('/', (_req, res) => res.json({ status: 'ok', version: 5 }));

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server v5 running on port ${PORT}`);
});
