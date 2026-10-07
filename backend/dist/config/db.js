"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    if (mongoose_1.default.connection.readyState >= 1) {
        return;
    }
    try {
        const conn = await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
            autoIndex: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    }
    catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        throw error;
    }
};
exports.connectDB = connectDB;
