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
// Allowlist is read from FRONTEND_URLS (comma-separated) or FRONTEND_URL.
// If the incoming request's Origin header matches one entry, the server
// will echo that origin in Access-Control-Allow-Origin so the preflight
// check passes for that origin. Requests with no Origin (curl, mobile)
// are allowed.
const rawFrontend = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrls = rawFrontend.split(',').map((u) => u.trim()).filter(Boolean);

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

// Rate limiting
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxReq = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);
app.use(rateLimit({ windowMs, max: maxReq }));

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const dbName = process.env.MONGO_DB_NAME || process.env.DB_NAME || 'money-tracker';

if (!mongoUri) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
} else {
  // Check if we are already connected or connecting
  if (mongoose.connection.readyState === 0) {
    mongoose
      .connect(mongoUri, { dbName })
      .then(() => {
        console.log(`✓ MongoDB connected (db: ${dbName})`);
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        // Do NOT exit process in serverless; let the request fail gracefully
        // process.exit(1);
      });
  }
}

// Health check with DB status
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const connected = readyState === 1;
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
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}