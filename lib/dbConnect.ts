// lib/dbConnect.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/* eslint-disable no-var */
declare global {
  var __MONGOOSE_CACHE__: MongooseCache | undefined;
}
/* eslint-enable no-var */

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
const cached: MongooseCache = globalThis.__MONGOOSE_CACHE__ || {conn: null, promise: null};

if (!globalThis.__MONGOOSE_CACHE__) {
  globalThis.__MONGOOSE_CACHE__ = cached;
}

async function dbConnect() {
  if (cached.conn) {
    console.log('🚀 Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ New database connection established');
      return mongoose;
    }).catch(error => {
        console.error('❌ Database connection failed:', error);
        console.error(MONGODB_URI);
        throw error; // Rethrow or handle as needed
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on error
    throw e;
  }

  return cached.conn;
}

export default dbConnect;