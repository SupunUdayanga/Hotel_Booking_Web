import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import hotelRoutes from './routes/hotels.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import roomRoutes from './routes/rooms.routes.js';
import reportRoutes from './routes/reports.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

// Security & common middleware
// Use Helmet baseline, but relax policies for dev cross-origin asset loading
app.use(helmet({
  // Disable CSP to avoid blocking images/scripts when frontend runs on a different origin during dev
  contentSecurityPolicy: false,
  // Not required for our app and can interfere with cross-origin embedding during dev
  crossOriginOpenerPolicy: false,
  // Disable default CORP header so we can set our own explicitly below
  crossOriginResourcePolicy: false,
}));
// Explicitly allow other origins to consume our static assets (images under /uploads)
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
// Configure CORS: allow configured origins or common localhost dev ports
const defaultOrigins = [
  'http://localhost:3000', 'http://127.0.0.1:3000',
  'http://localhost:5173', 'http://127.0.0.1:5173'
];
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : defaultOrigins;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Rate limit API requests; skip lightweight health checks to avoid noisy 429s in dev
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});
app.use('/api', limiter);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reports', reportRoutes);

// Not found and errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Start server immediately; connect DB in background with logs
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB().catch((err) => {
    console.error('Initial Mongo connection failed:', err.message);
  });
});
