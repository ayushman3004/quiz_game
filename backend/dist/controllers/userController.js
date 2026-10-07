"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchHistory = exports.getUserById = exports.updateProfile = void 0;
const User_1 = require("../models/User");
const MatchResult_1 = require("../models/MatchResult");
const errorHandler_1 = require("../middlewares/errorHandler");
const auth_1 = require("../schemas/auth");
const Achievement_1 = require("../models/Achievement");
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Unauthorized', 401);
        const validated = auth_1.updateProfileSchema.parse(req.body);
        const user = await User_1.User.findById(req.user.userId);
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        if (validated.displayName)
            user.displayName = validated.displayName;
        if (validated.avatarUrl)
            user.avatarUrl = validated.avatarUrl;
        if (validated.fcmToken)
            user.fcmToken = validated.fcmToken;
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                level: user.level,
                xp: user.xp,
                coins: user.coins,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id).select('-passwordHash -fcmToken -email');
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const achievements = await Achievement_1.UserAchievement.find({ userId: user._id });
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                level: user.level,
                xp: user.xp,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                rating: user.rating,
                stats: user.stats,
                achievementsCount: achievements.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const getMatchHistory = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Unauthorized', 401);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const results = await MatchResult_1.MatchResult.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('quizId', 'title category difficulty examType');
        const total = await MatchResult_1.MatchResult.countDocuments({ userId: req.user.userId });
        return res.status(200).json({
            success: true,
            results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMatchHistory = getMatchHistory;
