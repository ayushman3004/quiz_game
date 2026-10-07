import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { MatchResult } from '../models/MatchResult';
import { AppError } from '../middlewares/errorHandler';

export const getAdminStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalQuizzes, totalQuestions, totalMatches] = await Promise.all([
      User.countDocuments(),
      Quiz.countDocuments(),
      Question.countDocuments(),
      MatchResult.countDocuments(),
    ]);

    const activeUsersToday = await User.countDocuments({
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
  } catch (error) {
    next(error);
  }
};

export const listUsersAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-passwordHash'),
      User.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

export const toggleBanUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw new AppError('User not found', 404);

    user.isBanned = !user.isBanned;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User has been ${user.isBanned ? 'banned' : 'unbanned'}`,
      isBanned: user.isBanned,
    });
  } catch (error) {
    next(error);
  }
};

export const approveQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) throw new AppError('Quiz not found', 404);

    quiz.isApproved = true;
    await quiz.save();

    return res.status(200).json({ success: true, message: 'Quiz approved successfully', quiz });
  } catch (error) {
    next(error);
  }
};
