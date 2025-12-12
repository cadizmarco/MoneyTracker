// Vercel Serverless Function - Main API handler
// This wraps the Express app to work as a serverless function
// @ts-ignore - Vercel provides @vercel/node at runtime
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore - serverless-http is installed in api/package.json
const serverless = require('serverless-http');

// Import the Express app from the built backend
// Note: This requires backend to be built before deployment
let handler: any = null;

async function getHandler() {
  if (handler) return handler;

  try {
    // Import the built Express app (CommonJS)
    // The path is relative to the api/ directory
    const serverModule = require('../backend/dist/server.js');
    const expressApp = serverModule.default || serverModule;

    // Wrap Express app with serverless-http
    handler = serverless(expressApp, {
      binary: ['image/*', 'application/pdf'],
    });

    return handler;
  } catch (error) {
    console.error('Failed to load Express app:', error);
    throw error;
  }
}

// Import the database connection utility
// We need to require it because it's a TS file compiled to JS in dist
// But for type safety we can import the type if needed, or just rely on runtime import
// Since this file is compiled separately or used with ts-node in some contexts, 
// we will rely on loading the built version from backend/dist/config/db.js 

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Establish DB connection BEFORE handling request
    // We import this dynamically to ensure it uses the built file
    const dbModule = require('../backend/dist/config/db.js');
    if (dbModule && dbModule.connectDB) {
      await dbModule.connectDB();
    } else {
      console.warn('⚠️ Could not find connectDB in backend build, relying on server.ts side-effects');
    }

    // 2. Get the express handler
    const serverlessHandler = await getHandler();
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    // Graceful error response
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

