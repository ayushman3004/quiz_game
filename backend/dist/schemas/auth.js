"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.firebaseSyncSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    displayName: zod_1.z.string().min(2, 'Display name must be at least 2 characters'),
    avatarUrl: zod_1.z.string().url().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.firebaseSyncSchema = zod_1.z.object({
    firebaseToken: zod_1.z.string().min(1, 'Firebase token is required'),
    email: zod_1.z.string().email('Valid email is required'),
    displayName: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(2).max(50).optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    fcmToken: zod_1.z.string().optional(),
});
