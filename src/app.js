const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const historyRoutes = require('./routes/history.routes');
const continueRoutes = require('./routes/continue.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const bannedRoutes = require('./routes/banned.routes');

const globalErrorHandler = require('./middleware/error.middleware');
const { errorResponse } = require('./utils/response.util');

const app = express();

// Trust reverse proxy (Nginx / Cloudflare / VPS reverse proxy) for accurate client IP rate limiting
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());

// Dynamic CORS configuration supporting single origin, comma-separated list, or wildcard
const getCorsOrigin = () => {
  const envOrigin = process.env.CORS_ORIGIN;
  if (!envOrigin || envOrigin === '*') {
    return true; // Allow any origin dynamically
  }
  if (envOrigin.includes(',')) {
    return envOrigin.split(',').map((o) => o.trim());
  }
  return envOrigin.trim();
};

const corsOptions = {
  origin: getCorsOrigin(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/continue-watching', continueRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/banned-content', bannedRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  return errorResponse(res, 404, `Cannot ${req.method} ${req.originalUrl}`);
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
