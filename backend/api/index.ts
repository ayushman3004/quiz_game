import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

const app = createApp();

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in Vercel handler:', err);
  }
  return app(req, res);
}
