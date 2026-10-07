import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { registerSchema, loginSchema, firebaseSyncSchema } from '../schemas/auth';
import { AppError } from '../middlewares/errorHandler';
import { signToken } from '../utils/token';
import { LEVEL_CONFIG, UserRole } from '../constants';
import { AuthRequest } from '../middlewares/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [{ email: validated.email.toLowerCase() }, { username: validated.username.toLowerCase() }],
    });

    if (existingUser) {
      if (existingUser.email === validated.email.toLowerCase()) {
        throw new AppError('Email is already registered', 409);
      }
      throw new AppError('Username is already taken', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const user = await User.create({
      username: validated.username.toLowerCase(),
      email: validated.email.toLowerCase(),
      passwordHash,
      displayName: validated.displayName,
      avatarUrl: validated.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${validated.username}`,
      role: UserRole.USER,
      level: 1,
      xp: 0,
      coins: 100,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Date(),
    });

    const token = signToken({
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
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.isBanned) {
      throw new AppError('This account has been suspended', 403);
    }

    if (!user.passwordHash) {
      throw new AppError('Please sign in with your social provider', 400);
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
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
    } else if (diffHours >= 48) {
      user.currentStreak = 1;
    }
    user.lastActiveDate = now;
    await user.save();

    const token = signToken({
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
  } catch (error) {
    next(error);
  }
};

export const firebaseSync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = firebaseSyncSchema.parse(req.body);
    // In production, verify with firebase-admin verifyIdToken(validated.firebaseToken)
    // Here we support the verified token claims
    let user = await User.findOne({ email: validated.email.toLowerCase() });

    if (!user) {
      const generatedUsername =
        validated.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') +
        Math.floor(100 + Math.random() * 900);

      user = await User.create({
        username: generatedUsername.toLowerCase(),
        email: validated.email.toLowerCase(),
        displayName: validated.displayName || generatedUsername,
        avatarUrl: validated.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${generatedUsername}`,
        role: UserRole.USER,
        level: 1,
        xp: 0,
        coins: 100,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
      });
    }

    const token = signToken({
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
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const nextLevelXp = LEVEL_CONFIG.xpForNextLevel(user.level);
    const currentLevelBaseXp = user.level === 1 ? 0 : LEVEL_CONFIG.xpForNextLevel(user.level - 1);
    const xpProgress = Math.min(
      100,
      Math.max(0, Math.round(((user.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100))
    );

    // Dynamic archetype per PRD Section 46
    const totalQ = user.stats.totalQuestionsAnswered || 0;
    const accuracy = totalQ > 0 ? (user.stats.correctAnswers / totalQ) * 100 : 0;
    const avgSpeed = user.stats.avgResponseTimeMs || 0;
    const winRate = user.stats.gamesPlayed > 0 ? (user.stats.gamesWon / user.stats.gamesPlayed) * 100 : 0;

    let archetype = { name: 'Specialist', label: 'Focused Competitor', icon: '🔬', description: 'Dominates specialized high-yield drills.' };
    if (avgSpeed > 0 && avgSpeed <= 2500 && accuracy >= 70) {
      archetype = { name: 'Speedster', label: 'Lightning Instincts', icon: '⚡', description: 'Answers with unmatched reflexes and rapid precision.' };
    } else if (accuracy >= 80 && totalQ >= 10) {
      archetype = { name: 'Strategist', label: 'High Accuracy Tactician', icon: '🎯', description: 'Calculates every choice with pinpoint accuracy.' };
    } else if (winRate >= 65 && user.stats.gamesPlayed >= 5) {
      archetype = { name: 'Clutcher', label: 'Comeback Victor', icon: '👑', description: 'Excels under tournament pressure in clutch moments.' };
    } else if (totalQ >= 50) {
      archetype = { name: 'Scholar', label: 'Multi-Discipline Mind', icon: '📚', description: 'Vast knowledge breadth across multiple subject tracks.' };
    }

    const achievements = [
      {
        id: 'first_victory',
        name: 'First Victory',
        description: 'Win your first competitive match',
        icon: '🏆',
        isUnlocked: (user.stats.gamesWon || 0) >= 1,
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Average response under 2.5s',
        icon: '⚡',
        isUnlocked: avgSpeed > 0 && avgSpeed <= 2500 && totalQ >= 4,
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain a 7+ day active streak',
        icon: '🔥',
        isUnlocked: (user.currentStreak || 0) >= 7 || (user.longestStreak || 0) >= 7,
      },
      {
        id: 'polymath',
        name: 'Polymath',
        description: 'Answer 50+ questions correctly',
        icon: '🧠',
        isUnlocked: (user.stats.correctAnswers || 0) >= 50,
      },
      {
        id: 'quiz_architect',
        name: 'Quiz Architect',
        description: 'Publish verified quizzes',
        icon: '🏛️',
        isUnlocked: (user.publishedQuizzesCount || 0) >= 1,
      },
      {
        id: 'tournament_champ',
        name: 'Tournament Contender',
        description: 'Achieve 1600+ Competitive Rating',
        icon: '🥇',
        isUnlocked: (user.rating || 0) >= 1600,
      },
    ];

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
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        stats: user.stats,
        archetype,
        achievements,
        xpProgress,
        nextLevelXp,
      },
    });
  } catch (error) {
    next(error);
  }
};
