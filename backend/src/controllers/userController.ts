import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { MatchResult } from '../models/MatchResult';
import { AppError } from '../middlewares/errorHandler';
import { updateProfileSchema } from '../schemas/auth';
import { UserAchievement } from '../models/Achievement';

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const validated = updateProfileSchema.parse(req.body);
    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError('User not found', 404);

    if (validated.displayName) user.displayName = validated.displayName;
    if (validated.avatarUrl) user.avatarUrl = validated.avatarUrl;
    if (validated.fcmToken) user.fcmToken = validated.fcmToken;

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
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash -fcmToken -email');
    if (!user) throw new AppError('User not found', 404);

    const achievements = await UserAchievement.find({ userId: user._id });

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
  } catch (error) {
    next(error);
  }
};

export const getMatchHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const results = await MatchResult.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('quizId', 'title category difficulty examType');

    const total = await MatchResult.countDocuments({ userId: req.user.userId });

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
  } catch (error) {
    next(error);
  }
};
