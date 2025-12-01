import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Build a per-user key when available, else fall back to IP
const keyGenerator: (req: Request) => string = (req) => {
  const anyReq = req as any;
  const uid = anyReq.user?.userId as string | undefined;
  const ip = typeof req.ip === 'string' ? req.ip : 'unknown';
  let key: string = ip;
  if (typeof uid === 'string' && uid.length > 0) {
    key = uid;
  }
  return key;
};

// Helper to create a limiter with environment-configurable window/max
const createLimiter = (windowMsEnv: string | undefined, maxEnv: string | undefined, defaultWindowMs: number, defaultMax: number, message: string) =>
  rateLimit({
    windowMs: Number(windowMsEnv ?? defaultWindowMs),
    max: Number(maxEnv ?? defaultMax),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: { success: false, message }
  });

// Accounts-specific limiter
export const accountsLimiter = createLimiter(
  process.env.ACCOUNTS_RATE_LIMIT_WINDOW_MS,
  process.env.ACCOUNTS_RATE_LIMIT_MAX,
  10 * 60 * 1000,
  200,
  'Too many requests to accounts endpoint. Please try again later.'
);

// Transactions-specific limiter
export const transactionsLimiter = createLimiter(
  process.env.TRANSACTIONS_RATE_LIMIT_WINDOW_MS,
  process.env.TRANSACTIONS_RATE_LIMIT_MAX,
  10 * 60 * 1000,
  300,
  'Too many requests to transactions endpoint. Please try again later.'
);