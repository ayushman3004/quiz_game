"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5001'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: zod_1.z
        .string()
        .default('mongodb+srv://ayushmanrick007_db_user:ayushman2004@cluster0.pbvwe1r.mongodb.net/quizapp?retryWrites=true&w=majority'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    JWT_SECRET: zod_1.z.string().default('super_secret_quiz_jwt_key_2026_change_in_production'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    GEMINI_API_KEY: zod_1.z.string().optional().default(''),
    CORS_ORIGIN: zod_1.z.string().default('*'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
