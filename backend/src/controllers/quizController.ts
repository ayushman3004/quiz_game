import { Request, Response, NextFunction } from 'express';
import { Quiz, IQuiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { MatchResult } from '../models/MatchResult';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { LEVEL_CONFIG, SCORING_RULES, QuizDifficulty, ExamCategory } from '../constants';
import { Types } from 'mongoose';

// Helper to resolve a quiz by ID, slug, topicId, or examType alias
const resolveQuiz = async (identifier: string | string[] | undefined): Promise<IQuiz | null> => {
  if (!identifier) return null;
  const raw = Array.isArray(identifier) ? identifier[0] : identifier;
  if (!raw) return null;
  const cleanId = String(raw).trim();

  // 1. Direct ObjectId lookup
  if (Types.ObjectId.isValid(cleanId)) {
    const quiz = await Quiz.findById(cleanId);
    if (quiz) return quiz;
  }

  const lower = cleanId.toLowerCase();

  // 2. Special aliases
  if (lower === 'daily' || lower === 'daily-challenge') {
    const dailyQuiz = await Quiz.findOne({ isDailyChallenge: true, isApproved: true });
    if (dailyQuiz) return dailyQuiz;
  }

  if (lower === 'quick' || lower === 'quick-match') {
    const quickQuiz = await Quiz.findOne({ slug: 'quick-match', isApproved: true });
    if (quickQuiz) return quickQuiz;
  }

  // 3. Slug or topicId lookup
  let quiz = await Quiz.findOne({
    $or: [{ slug: lower }, { topicId: lower }, { subCategory: new RegExp(`^${cleanId}$`, 'i') }],
    isApproved: true,
  });
  if (quiz) return quiz;

  // 4. Exam category alias (GATE, SSC, UPSC, BANKING, ECONOMICS)
  quiz = await Quiz.findOne({
    examType: cleanId.toUpperCase() as ExamCategory,
    isApproved: true,
  }).sort({ playCount: -1 });

  if (quiz) return quiz;

  // 5. Fallback general query by title or tag
  return Quiz.findOne({
    $or: [{ tags: lower }, { category: new RegExp(`^${cleanId}$`, 'i') }],
    isApproved: true,
  });
};

export const getQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, difficulty, examType, search, featured, daily, page = 1, limit = 20 } = req.query;
    const filter: Record<string, any> = { isApproved: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (examType) filter.examType = examType;
    if (featured === 'true') filter.featured = true;
    if (daily === 'true') filter.isDailyChallenge = true;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .sort({ isDailyChallenge: -1, featured: -1, playCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('creatorId', 'username displayName avatarUrl creatorRating followersCount'),
      Quiz.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      quizzes,
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

export const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quiz = await resolveQuiz(id);
    if (!quiz) throw new AppError('Quiz not found', 404);

    await quiz.populate('creatorId', 'username displayName avatarUrl bio followersCount creatorRating');

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

export const getDailyChallenge = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let quiz = await Quiz.findOne({ isDailyChallenge: true, isApproved: true }).populate(
      'creatorId',
      'username displayName avatarUrl bio followersCount creatorRating'
    );

    if (!quiz) {
      quiz = await Quiz.findOne({ isApproved: true }).populate(
        'creatorId',
        'username displayName avatarUrl bio followersCount creatorRating'
      );
    }

    if (!quiz) throw new AppError('Daily challenge not found', 404);

    return res.status(200).json({ success: true, dailyChallenge: quiz });
  } catch (error) {
    next(error);
  }
};

export const getQuizMasters = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const creators = await User.find({ role: 'QUIZ_MASTER', isBanned: false })
      .select('username displayName bio avatarUrl followersCount publishedQuizzesCount creatorRating level rating')
      .sort({ followersCount: -1 });

    const creatorsWithQuizzes = await Promise.all(
      creators.map(async (creator) => {
        const quizzes = await Quiz.find({ creatorId: creator._id, isApproved: true })
          .select('title category difficulty playCount likesCount questionCount rating')
          .limit(4);
        return {
          ...creator.toObject(),
          quizzes,
        };
      })
    );

    return res.status(200).json({ success: true, quizMasters: creatorsWithQuizzes });
  } catch (error) {
    next(error);
  }
};

export const getSoloQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quiz = await resolveQuiz(id);
    if (!quiz) throw new AppError(`Quiz not found for identifier: ${id}`, 404);

    const questions = await Question.find({ quizId: quiz._id }).sort({ order: 1 });

    if (!questions || questions.length === 0) {
      throw new AppError('No questions configured for this quiz yet', 404);
    }

    // Cheat-proof sanitization: do not expose correctOptionId to the client during gameplay
    const sanitizedQuestions = questions.map((q) => ({
      id: q._id,
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
      questionType: q.questionType || 'MULTIPLE_CHOICE',
      imageUrl: q.imageUrl,
      codeSnippet: q.codeSnippet,
      durationSec: q.durationSec || quiz.timePerQuestionSec || 15,
      order: q.order,
    }));

    return res.status(200).json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        slug: quiz.slug,
        category: quiz.category,
        subCategory: quiz.subCategory,
        difficulty: quiz.difficulty,
        timePerQuestionSec: quiz.timePerQuestionSec,
        questionCount: questions.length,
      },
      questions: sanitizedQuestions,
    });
  } catch (error) {
    next(error);
  }
};

export const submitSoloQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { answers } = req.body as {
      answers: Array<{ questionId: string; selectedOptionId: string; timeTakenSec: number }>;
    };

    if (!Array.isArray(answers)) {
      throw new AppError('Invalid answers format', 400);
    }

    const quiz = await resolveQuiz(id);
    if (!quiz) throw new AppError('Quiz not found', 404);

    const questions = await Question.find({ quizId: quiz._id });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let currentStreak = 0;
    let totalResponseTimeMs = 0;

    // Difficulty multiplier based on PRD Section 15.3
    const difficultyMultiplier =
      SCORING_RULES.DIFFICULTY_MULTIPLIER[quiz.difficulty as keyof typeof SCORING_RULES.DIFFICULTY_MULTIPLIER] || 1.0;

    const breakdown = answers.map((ans) => {
      const q = questionMap.get(ans.questionId);
      if (!q) {
        return {
          questionId: ans.questionId,
          isCorrect: false,
          points: 0,
          correctOptionId: '',
          explanation: '',
        };
      }

      const isCorrect = q.correctOptionId === ans.selectedOptionId;
      let points = 0;
      const durationSec = q.durationSec || quiz.timePerQuestionSec || 15;
      const timeTaken = Math.min(ans.timeTakenSec || durationSec, durationSec);
      totalResponseTimeMs += timeTaken * 1000;

      if (isCorrect) {
        correctCount += 1;
        currentStreak += 1;

        // Speed bonus from PRD Section 15.2 (Answer in 1-2s +80, 3-4s +60, 5-6s +40, 7-8s +20, 9-10s +10)
        let speedBonus = 10;
        if (timeTaken <= 2) speedBonus = 80;
        else if (timeTaken <= 4) speedBonus = 60;
        else if (timeTaken <= 6) speedBonus = 40;
        else if (timeTaken <= 8) speedBonus = 20;

        // Streak bonus from PRD Section 15.4 (3 correct +5%, 5 correct +10%, 10 correct +15%)
        let streakMultiplier = 1.0;
        if (currentStreak >= 10) streakMultiplier = 1.15;
        else if (currentStreak >= 5) streakMultiplier = 1.10;
        else if (currentStreak >= 3) streakMultiplier = 1.05;

        // Base Points = 100
        const rawPoints = (SCORING_RULES.BASE_POINTS + speedBonus) * streakMultiplier * difficultyMultiplier;
        points = Math.round(rawPoints);
        score += points;
      } else {
        wrongCount += 1;
        currentStreak = 0;
      }

      return {
        questionId: q._id,
        selectedOptionId: ans.selectedOptionId,
        correctOptionId: q.correctOptionId,
        isCorrect,
        points,
        explanation: q.explanation,
      };
    });

    const totalQuestions = questions.length || 1;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const avgResponseTimeMs = Math.round(totalResponseTimeMs / (answers.length || 1));

    // Award XP and coins per PRD Section 42 & 44
    const xpEarned = Math.round(score * 0.75) + (accuracy === 100 ? 100 : 25);
    const coinsEarned = Math.max(10, Math.round(correctCount * 5) + (accuracy >= 80 ? 25 : 0));

    let userId = req.user?.userId;
    if (userId && Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user) {
        user.xp += xpEarned;
        user.coins += coinsEarned;
        user.level = LEVEL_CONFIG.calculateLevel(user.xp);
        user.stats.gamesPlayed += 1;
        user.stats.totalQuestionsAnswered += answers.length;
        user.stats.correctAnswers += correctCount;
        if (accuracy >= 60) {
          user.stats.gamesWon += 1;
        }
        user.stats.avgResponseTimeMs = Math.round(
          (user.stats.avgResponseTimeMs + avgResponseTimeMs) / 2
        );
        await user.save();

        // Save match result
        await MatchResult.create({
          matchId: new Types.ObjectId(),
          userId: user._id,
          quizId: quiz._id,
          score,
          rank: 1,
          totalPlayers: 1,
          accuracy,
          correctCount,
          wrongCount,
          avgResponseTimeMs,
          xpEarned,
          coinsEarned,
          ratingDelta: 0,
        });
      }
    }

    // Increment play count
    await Quiz.findByIdAndUpdate(quiz._id, { $inc: { playCount: 1 } });

    return res.status(200).json({
      success: true,
      result: {
        score,
        accuracy,
        correctCount,
        wrongCount,
        totalQuestions,
        xpEarned,
        coinsEarned,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Pure database-driven Journey Tree generator (Section 22)
export const getJourneyTree = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Query all journey-eligible quizzes from MongoDB
    const quizzes = await Quiz.find({ isApproved: true }).sort({ createdAt: 1 });

    // Group into exams & subjects dynamically
    // 1. Economics track (PRD Section 22 exact sequence)
    const econQuizzes = quizzes.filter(
      (q) => q.examType === ExamCategory.ECONOMICS || q.category === 'Economics'
    );

    const gateQuizzes = quizzes.filter(
      (q) => q.examType === ExamCategory.GATE || q.category === 'Computer Science'
    );

    const sscQuizzes = quizzes.filter(
      (q) => q.examType === ExamCategory.SSC || q.category === 'Quantitative Aptitude'
    );

    const upscQuizzes = quizzes.filter(
      (q) => q.examType === ExamCategory.UPSC || q.category === 'Indian Polity'
    );

    const bankingQuizzes = quizzes.filter(
      (q) => q.examType === ExamCategory.BANKING || q.category === 'Banking'
    );

    const journeyData = [
      {
        id: 'economics-master',
        title: 'Economics (Structured Journey)',
        category: 'ECONOMICS',
        subjects: [
          {
            id: 'macro-micro',
            name: 'Core Economic Principles',
            progress: 65,
            topics: econQuizzes.map((q, idx) => ({
              id: q._id.toString(),
              name: q.subCategory || q.title,
              slug: q.slug,
              difficulty: q.difficulty,
              completed: idx < 2,
              questionsCount: q.questionCount || 4,
            })),
          },
        ],
      },
      {
        id: 'gate-cs',
        title: 'GATE Computer Science',
        category: 'GATE',
        subjects: [
          {
            id: 'dsa',
            name: 'Data Structures & Algorithms',
            progress: 75,
            topics: gateQuizzes
              .filter((q) => q.subCategory?.includes('Algorithms') || q.slug?.includes('dsa'))
              .map((q, idx) => ({
                id: q._id.toString(),
                name: q.title,
                slug: q.slug,
                difficulty: q.difficulty,
                completed: idx === 0,
                questionsCount: q.questionCount || 4,
              })),
          },
          {
            id: 'os',
            name: 'Operating Systems & Concurrency',
            progress: 40,
            topics: gateQuizzes
              .filter((q) => q.subCategory?.includes('Operating') || q.slug?.includes('os'))
              .map((q) => ({
                id: q._id.toString(),
                name: q.title,
                slug: q.slug,
                difficulty: q.difficulty,
                completed: false,
                questionsCount: q.questionCount || 4,
              })),
          },
        ],
      },
      {
        id: 'ssc-cgl',
        title: 'SSC CGL Master Track',
        category: 'SSC',
        subjects: [
          {
            id: 'quant',
            name: 'Quantitative Aptitude & Arithmetic',
            progress: 80,
            topics: sscQuizzes.map((q) => ({
              id: q._id.toString(),
              name: q.title,
              slug: q.slug,
              difficulty: q.difficulty,
              completed: true,
              questionsCount: q.questionCount || 4,
            })),
          },
        ],
      },
      {
        id: 'upsc-civil',
        title: 'UPSC Civil Services Prelims',
        category: 'UPSC',
        subjects: [
          {
            id: 'polity',
            name: 'Indian Polity & Constitution',
            progress: 50,
            topics: upscQuizzes.map((q) => ({
              id: q._id.toString(),
              name: q.title,
              slug: q.slug,
              difficulty: q.difficulty,
              completed: false,
              questionsCount: q.questionCount || 4,
            })),
          },
        ],
      },
      {
        id: 'banking-arena',
        title: 'Banking & Financial Awareness',
        category: 'BANKING',
        subjects: [
          {
            id: 'banking-awareness',
            name: 'Financial Systems & Regulations',
            progress: 30,
            topics: bankingQuizzes.map((q) => ({
              id: q._id.toString(),
              name: q.title,
              slug: q.slug,
              difficulty: q.difficulty,
              completed: false,
              questionsCount: q.questionCount || 4,
            })),
          },
        ],
      },
    ];

    return res.status(200).json({ success: true, journey: journeyData });
  } catch (error) {
    next(error);
  }
};
