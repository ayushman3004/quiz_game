"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveQuiz = exports.toggleBanUser = exports.listUsersAdmin = exports.getAdminStats = void 0;
const User_1 = require("../models/User");
const Quiz_1 = require("../models/Quiz");
const Question_1 = require("../models/Question");
const MatchResult_1 = require("../models/MatchResult");
const errorHandler_1 = require("../middlewares/errorHandler");
const getAdminStats = async (_req, res, next) => {
    try {
        const [totalUsers, totalQuizzes, totalQuestions, totalMatches] = await Promise.all([
            User_1.User.countDocuments(),
            Quiz_1.Quiz.countDocuments(),
            Question_1.Question.countDocuments(),
            MatchResult_1.MatchResult.countDocuments(),
        ]);
        const activeUsersToday = await User_1.User.countDocuments({
            lastActiveDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });
        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsersToday,
                totalQuizzes,
                totalQuestions,
                totalMatches,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdminStats = getAdminStats;
const listUsersAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-passwordHash'),
            User_1.User.countDocuments(filter),
        ]);
        return res.status(200).json({
            success: true,
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listUsersAdmin = listUsersAdmin;
const toggleBanUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id);
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        user.isBanned = !user.isBanned;
        await user.save();
        return res.status(200).json({
            success: true,
            message: `User has been ${user.isBanned ? 'banned' : 'unbanned'}`,
            isBanned: user.isBanned,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleBanUser = toggleBanUser;
const approveQuiz = async (req, res, next) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz_1.Quiz.findById(id);
        if (!quiz)
            throw new errorHandler_1.AppError('Quiz not found', 404);
        quiz.isApproved = true;
        await quiz.save();
        return res.status(200).json({ success: true, message: 'Quiz approved successfully', quiz });
    }
    catch (error) {
        next(error);
    }
};
exports.approveQuiz = approveQuiz;
