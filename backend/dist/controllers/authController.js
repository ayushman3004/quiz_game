"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.firebaseSync = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const auth_1 = require("../schemas/auth");
const errorHandler_1 = require("../middlewares/errorHandler");
const token_1 = require("../utils/token");
const constants_1 = require("../constants");
const register = async (req, res, next) => {
    try {
        const validated = auth_1.registerSchema.parse(req.body);
        const existingUser = await User_1.User.findOne({
            $or: [{ email: validated.email.toLowerCase() }, { username: validated.username.toLowerCase() }],
        });
        if (existingUser) {
            if (existingUser.email === validated.email.toLowerCase()) {
                throw new errorHandler_1.AppError('Email is already registered', 409);
            }
            throw new errorHandler_1.AppError('Username is already taken', 409);
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(validated.password, salt);
        const user = await User_1.User.create({
            username: validated.username.toLowerCase(),
            email: validated.email.toLowerCase(),
            passwordHash,
            displayName: validated.displayName,
            avatarUrl: validated.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${validated.username}`,
            role: constants_1.UserRole.USER,
            level: 1,
            xp: 0,
            coins: 100,
            currentStreak: 1,
            longestStreak: 1,
            lastActiveDate: new Date(),
        });
        const token = (0, token_1.signToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });
        return res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                xp: user.xp,
                level: user.level,
                coins: user.coins,
                currentStreak: user.currentStreak,
                rating: user.rating,
                stats: user.stats,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const validated = auth_1.loginSchema.parse(req.body);
        const user = await User_1.User.findOne({ email: validated.email.toLowerCase() });
        if (!user) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        if (user.isBanned) {
            throw new errorHandler_1.AppError('This account has been suspended', 403);
        }
        if (!user.passwordHash) {
            throw new errorHandler_1.AppError('Please sign in with your social provider', 400);
        }
        const isMatch = await bcryptjs_1.default.compare(validated.password, user.passwordHash);
        if (!isMatch) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        // Update streak if active on a new day
        const now = new Date();
        const lastActive = new Date(user.lastActiveDate);
        const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        if (diffHours >= 24 && diffHours < 48) {
            user.currentStreak += 1;
            if (user.currentStreak > user.longestStreak) {
                user.longestStreak = user.currentStreak;
            }
        }
        else if (diffHours >= 48) {
            user.currentStreak = 1;
        }
        user.lastActiveDate = now;
        await user.save();
        const token = (0, token_1.signToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                xp: user.xp,
                level: user.level,
                coins: user.coins,
                currentStreak: user.currentStreak,
                rating: user.rating,
                stats: user.stats,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const firebaseSync = async (req, res, next) => {
    try {
        const validated = auth_1.firebaseSyncSchema.parse(req.body);
        // In production, verify with firebase-admin verifyIdToken(validated.firebaseToken)
        // Here we support the verified token claims
        let user = await User_1.User.findOne({ email: validated.email.toLowerCase() });
        if (!user) {
            const generatedUsername = validated.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') +
                Math.floor(100 + Math.random() * 900);
            user = await User_1.User.create({
                username: generatedUsername.toLowerCase(),
                email: validated.email.toLowerCase(),
                displayName: validated.displayName || generatedUsername,
                avatarUrl: validated.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${generatedUsername}`,
                role: constants_1.UserRole.USER,
                level: 1,
                xp: 0,
                coins: 100,
                currentStreak: 1,
                longestStreak: 1,
                lastActiveDate: new Date(),
            });
        }
        const token = (0, token_1.signToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                xp: user.xp,
                level: user.level,
                coins: user.coins,
                currentStreak: user.currentStreak,
                rating: user.rating,
                stats: user.stats,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.firebaseSync = firebaseSync;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401);
        }
        const user = await User_1.User.findById(req.user.userId).select('-passwordHash');
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        const nextLevelXp = constants_1.LEVEL_CONFIG.xpForNextLevel(user.level);
        const currentLevelBaseXp = user.level === 1 ? 0 : constants_1.LEVEL_CONFIG.xpForNextLevel(user.level - 1);
        const xpProgress = Math.min(100, Math.max(0, Math.round(((user.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100)));
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                xp: user.xp,
                level: user.level,
                coins: user.coins,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                rating: user.rating,
                stats: user.stats,
                xpProgress,
                nextLevelXp,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
