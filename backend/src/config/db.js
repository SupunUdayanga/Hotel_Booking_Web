import mongoose from 'mongoose';

function resolveMongoUri() {
  const fallback = 'mongodb://127.0.0.1:27017/hotel_booking';
  const env = process.env.MONGODB_URI;
  if (!env) return fallback;
  const ok = env.startsWith('mongodb://') || env.startsWith('mongodb+srv://');
  if (!ok) {
    console.warn('Warning: MONGODB_URI has an invalid scheme. Falling back to default local Mongo URI.');
    return fallback;
  }
  return env;
}

export async function connectDB() {
  const uri = resolveMongoUri();
  mongoose.connection.on('connected', () => console.log('MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error', err));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // do not rethrow to keep server running; mongoose will retry
  }
}
