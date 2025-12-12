import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env from project root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

import authRouter from './routes/auth';
import userRouter from './routes/user';
import accountsRouter from './routes/accounts';
import transactionsRouter from './routes/transactions';
import budgetsRouter from './routes/budgets';
import statsRouter from './routes/stats';

const app = express();

// Basic security and logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
// CORS Configuration
// Allowlist is constructed from:
// 1. FRONTEND_URLS / FRONTEND_URL (manual env vars)
// 2. VERCEL_URL (system env var, e.g. project.vercel.app)
// 3. VERCEL_PROJECT_PRODUCTION_URL (system env var)
// 4. Localhost (default)

const allowedOrigins: string[] = [
  'http://localhost:5173',
  'http://localhost:3000'
];

if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
if (process.env.FRONTEND_URLS) {
  process.env.FRONTEND_URLS.split(',').forEach(u => allowedOrigins.push(u.trim()));
}

// Add Vercel automatically generated URLs
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}
if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
}

const frontendUrls = allowedOrigins.filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests with no origin
    if (!origin) return callback(null, true);
    // Allow explicit allowlist
    if (frontendUrls.includes(origin)) {
      return callback(null, true);
    }
    // Allow any localhost origin during development (vite default runs on 5173)
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    // deny other origins
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DEBUG: Middleware to check if request is even reaching Express
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`);
  console.log(`[${new Date().toISOString()}] DB Connection State: ${mongoose.connection.readyState} (0=disc, 1=conn, 2=connecting)`);
  next();
});

// Rate limiting
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxReq = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);
app.use(rateLimit({ windowMs, max: maxReq }));

// Health check with DB status
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const connected = readyState === 1;
  const dbName = process.env.MONGO_DB_NAME || process.env.DB_NAME || 'money-tracker';

  res.json({
    success: true,
    message: 'OK',
    db: {
      connected,
      readyState,
      dbName,
      host: mongoose.connection.host,
    },
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/stats', statsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Export app for serverless functions (Vercel)
// Using both ES6 and CommonJS exports for compatibility
export default app;
module.exports = app;

// Start server only if not in serverless environment
// Check if this file is being run directly (not imported)
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
if (!isServerless && require.main === module) {
  const PORT = Number(process.env.PORT || 5000);
  // Import connectDB for local execution from src
  // We use require because we are modifying the module structure
  // In a real TS setup we'd import it at top, but to avoid circular deps with existing imports we do it here or assume it works

  const startServer = async () => {
    try {
      // Dynamic import to avoid breaking changes if file structure varies in build
      const { connectDB } = require('./config/db');
      await connectDB();
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  };

  startServer();
}