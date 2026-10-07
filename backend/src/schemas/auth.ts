import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  avatarUrl: z.string().url().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const firebaseSyncSchema = z.object({
  firebaseToken: z.string().min(1, 'Firebase token is required'),
  email: z.string().email('Valid email is required'),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().optional(),
  fcmToken: z.string().optional(),
});
