// Vercel Serverless Function - Main API handler
// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Track initialization to avoid repeated work
let isInitialized = false;
let initError: Error | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  try {
    console.log(`[${new Date().toISOString()}] Function invoked: ${req.method} ${req.url}`);
    console.log(`[${new Date().toISOString()}] Environment check:`, {
      mongoUri: !!(process.env.MONGO_URI || process.env.MONGODB_URI),
      mongoDbName: process.env.MONGO_DB_NAME || process.env.DB_NAME,
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL
    });

    // Initialize the database connection with timeout
    if (!isInitialized && !initError) {
      console.log(`[${new Date().toISOString()}] Initializing database connection...`);

      try {
        const initPromise = (async () => {
          const dbModule = require('../backend/dist/config/db.js');
          if (dbModule && dbModule.connectDB) {
            await dbModule.connectDB();
            console.log(`[${new Date().toISOString()}] Database connected successfully`);
          }
        })();

        // 3-second timeout for initialization
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database connection timeout (3s)')), 3000);
        });

        await Promise.race([initPromise, timeoutPromise]);
        isInitialized = true;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Database initialization failed:`, error);
        initError = error as Error;
        throw error;
      }
    }

    if (initError) {
      throw initError;
    }

    // Load Express app
    console.log(`[${new Date().toISOString()}] Loading Express handler...`);
    const serverless = require('serverless-http');
    const serverModule = require('../backend/dist/server.js');
    const expressApp = serverModule.default || serverModule;
    const expressHandler = serverless(expressApp);

    console.log(`[${new Date().toISOString()}] Forwarding request to Express (took ${Date.now() - startTime}ms)`);
    return expressHandler(req, res);

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Handler error after ${elapsed}ms:`, error);

    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: String(error),
      details: {
        message: (error as Error).message,
        mongoUriConfigured: !!(process.env.MONGO_URI || process.env.MONGODB_URI),
        elapsedMs: elapsed
      }
    });
  }
}
