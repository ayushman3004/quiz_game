"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const gameSocket_1 = require("./sockets/gameSocket");
const seedData_1 = require("./utils/seedData");
const app = (0, app_1.createApp)();
exports.app = app;
let isInitialized = false;
const initServerless = async () => {
    if (!isInitialized) {
        try {
            await (0, db_1.connectDB)();
            isInitialized = true;
        }
        catch (e) {
            console.error('Serverless DB connect error:', e);
        }
    }
};
// Serverless middleware to ensure DB connection on every request
app.use(async (_req, _res, next) => {
    try {
        await initServerless();
    }
    catch (e) {
        console.error('Serverless DB middleware error:', e);
    }
    next();
});
// Traditional standalone server (local dev / Docker / VPS)
if (!process.env.VERCEL) {
    const startServer = async () => {
        await (0, db_1.connectDB)();
        await (0, seedData_1.seedInitialData)();
        const httpServer = http_1.default.createServer(app);
        const io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
            transports: ['websocket', 'polling'],
        });
        (0, gameSocket_1.initializeGameSocket)(io);
        const PORT = Number(env_1.env.PORT) || 5001;
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 QuizApp Backend & Socket.IO running on http://0.0.0.0:${PORT}`);
            console.log(`📡 Environment: ${env_1.env.NODE_ENV}`);
        });
    };
    startServer().catch((err) => {
        console.error('Fatal startup error:', err);
    });
}
// Serverless entry point for Vercel
exports.default = app;
