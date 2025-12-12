import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // We don't throw immediately so we can log better errors at runtime if it's missing
    console.error('❌ MONGO_URI is not defined in environment variables');
}

// Global variable to cache the connection across invocations in serverless
let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGO_URI environment variable inside .env.local');
    }

    if (cachedPromise) {
        return cachedPromise;
    }

    const opts = {
        bufferCommands: false,
        dbName: process.env.MONGO_DB_NAME || process.env.DB_NAME || 'money-tracker',
    };

    cachedPromise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log(`✓ New MongoDB connection established (db: ${opts.dbName})`);
        return mongoose;
    });

    try {
        const cached = await cachedPromise;
        return cached;
    } catch (e) {
        cachedPromise = null;
        console.error('❌ MongoDB connection failed:', e);
        throw e;
    }
};
