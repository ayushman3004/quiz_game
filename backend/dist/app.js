"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middlewares/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const govtExamRoutes_1 = __importDefault(require("./routes/govtExamRoutes"));
const socialRoutes_1 = __importDefault(require("./routes/socialRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const tournamentRoutes_1 = __importDefault(require("./routes/tournamentRoutes"));
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN === '*' ? true : env_1.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    if (env_1.env.NODE_ENV !== 'test') {
        app.use((0, morgan_1.default)('dev'));
    }
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });
    // Root status and welcome endpoint
    app.get(['/', '/api'], (_req, res) => {
        res.status(200).json({
            name: 'QuizVerse API',
            status: 'healthy',
            version: '1.0.0',
            message: 'QuizVerse Backend is live and running!',
            endpoints: {
                health: '/health',
                auth: '/api/auth',
                quizzes: '/api/quizzes',
                tournaments: '/api/tournaments',
                creators: '/api/quizzes/creators',
                social: '/api/social',
            },
        });
    });
    // REST API Routes
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/users', userRoutes_1.default);
    app.use('/api/quizzes', quizRoutes_1.default);
    app.use('/api/govt-exams', govtExamRoutes_1.default);
    app.use('/api/social', socialRoutes_1.default);
    app.use('/api/tournaments', tournamentRoutes_1.default);
    app.use('/api/ai', aiRoutes_1.default);
    app.use('/api/admin', adminRoutes_1.default);
    // 404 handler for unhandled routes
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Cannot ${req.method} ${req.url}`,
        });
    });
    // Global Error Handler
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
