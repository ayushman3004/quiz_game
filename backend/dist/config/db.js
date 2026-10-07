"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
            autoIndex: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Don't crash immediately in dev mode if mongo isn't started yet, allow app to log warnings
        if (env_1.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};
exports.connectDB = connectDB;
