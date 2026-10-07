import { Request, Response, NextFunction } from 'express';
import { Tournament, TournamentStatus, TournamentType } from '../models/Tournament';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { Types } from 'mongoose';

// Seed default tournaments if none exist
const seedTournamentsIfEmpty = async () => {
  const count = await Tournament.countDocuments();
  if (count === 0) {
    const now = new Date();
    const laterToday = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const thisWeekend = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    await Tournament.insertMany([
      {
        title: 'Daily Speed Sprint Championship',
        description: 'Fast-paced 15-second multi-round elimination tournament. 64 contenders, 1 Champion.',
        type: TournamentType.DAILY,
        status: TournamentStatus.REGISTRATION_OPEN,
        category: 'Economics & General Knowledge',
        entryFeeCoins: 50,
        prizePoolCoins: 5000,
        prizePoolXp: 15000,
        maxParticipants: 64,
        registeredUsers: [],
        startTime: laterToday,
        roundsCount: 4,
        rules: [
          '4 Knockout Rounds: Qualifier (64) -> Round 2 (32) -> Semifinals (8) -> Grand Final (2)',
          '15 seconds per question with speed bonus multipliers',
          'Ties broken by fastest response time',
        ],
        bannerGradient: ['#4F46E5', '#7C3AED'],
      },
      {
        title: 'Weekly Grand Slam: CS & Algorithms',
        description: 'Prestigious weekend tournament curated by Prof. Ananya Sharma. High-yield GATE CS problems.',
        type: TournamentType.WEEKLY,
        status: TournamentStatus.REGISTRATION_OPEN,
        category: 'Computer Science',
        entryFeeCoins: 100,
        prizePoolCoins: 25000,
        prizePoolXp: 50000,
        maxParticipants: 128,
        registeredUsers: [],
        startTime: thisWeekend,
        roundsCount: 5,
        rules: [
          '5 Knockout Rounds: Top 128 to 1 Champion',
          'Hard & Expert tier questions only',
          'Winner awarded exclusive Tournament Champion badge',
        ],
        bannerGradient: ['#D97706', '#EA580C'],
      },
      {
        title: 'Inter-College QuizVerse Bowl',
        description: 'Represent your college in national knowledge duels across Economics, Science & Current Affairs.',
        type: TournamentType.COLLEGE,
        status: TournamentStatus.REGISTRATION_OPEN,
        category: 'Multi-Disciplinary',
        entryFeeCoins: 0,
        prizePoolCoins: 50000,
        prizePoolXp: 100000,
        maxParticipants: 256,
        registeredUsers: [],
        startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        roundsCount: 6,
        rules: [
          'Open to all registered university & college students',
          'Leaderboard displays institution rankings',
        ],
        bannerGradient: ['#059669', '#0D9488'],
      },
    ]);
  }
};

export const getTournaments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await seedTournamentsIfEmpty();
    const tournaments = await Tournament.find()
      .sort({ startTime: 1 })
      .populate('registeredUsers', 'username displayName avatarUrl rating');

    return res.status(200).json({ success: true, tournaments });
  } catch (error) {
    next(error);
  }
};

export const registerForTournament = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;

    const tournament = await Tournament.findById(id);
    if (!tournament) throw new AppError('Tournament not found', 404);

    const userObjectId = new Types.ObjectId(req.user.userId);
    const alreadyRegistered = tournament.registeredUsers.some(
      (uId) => uId.toString() === req.user?.userId
    );

    if (alreadyRegistered) {
      throw new AppError('You are already registered for this tournament', 400);
    }

    if (tournament.registeredUsers.length >= tournament.maxParticipants) {
      throw new AppError('Tournament is at full capacity', 400);
    }

    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError('User not found', 404);

    if (tournament.entryFeeCoins > 0 && user.coins < tournament.entryFeeCoins) {
      throw new AppError(`Insufficient coins. Entry fee is ${tournament.entryFeeCoins} coins.`, 400);
    }

    // Deduct coins if entry fee
    if (tournament.entryFeeCoins > 0) {
      user.coins -= tournament.entryFeeCoins;
      await user.save();
    }

    tournament.registeredUsers.push(userObjectId);
    await tournament.save();

    return res.status(200).json({
      success: true,
      message: 'Successfully registered for tournament',
      tournament,
      remainingCoins: user.coins,
    });
  } catch (error) {
    next(error);
  }
};
