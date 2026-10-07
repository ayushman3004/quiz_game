import { Request, Response, NextFunction } from 'express';
import { Quiz } from '../models/Quiz';
import { ExamCategory } from '../constants';

export const getExamCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = [
      {
        id: ExamCategory.ECONOMICS,
        name: 'Economics & Policy Arena',
        badge: 'Macroeconomics & RBI',
        icon: 'trending_up',
        activeStudents: 22100,
        subjectsCount: 6,
        description: 'Structured drills covering Demand & Supply, Money & Banking, and Monetary Policy.',
      },
      {
        id: ExamCategory.GATE,
        name: 'GATE Exam Arena',
        badge: 'Engineering & CS',
        icon: 'terminal',
        activeStudents: 14200,
        subjectsCount: 12,
        description: 'Comprehensive test series for Computer Science, Electrical, and Mechanical.',
      },
      {
        id: ExamCategory.SSC,
        name: 'SSC CGL / CHSL',
        badge: 'Staff Selection',
        icon: 'account_balance',
        activeStudents: 28500,
        subjectsCount: 8,
        description: 'Tier-1 & Tier-2 mock papers with speed and accuracy drills.',
      },
      {
        id: ExamCategory.BANKING,
        name: 'Banking & Insurance (IBPS/SBI)',
        badge: 'Financial Services',
        icon: 'payments',
        activeStudents: 19800,
        subjectsCount: 6,
        description: 'Quantitative aptitude, reasoning, and financial awareness tests.',
      },
      {
        id: ExamCategory.UPSC,
        name: 'UPSC Civil Services',
        badge: 'Civil Services',
        icon: 'policy',
        activeStudents: 9400,
        subjectsCount: 14,
        description: 'Prelims GS-1 & CSAT speed tests and current affairs quizzes.',
      },
      {
        id: ExamCategory.RAILWAYS,
        name: 'RRB NTPC & Group D',
        badge: 'Railways Board',
        icon: 'train',
        activeStudents: 15300,
        subjectsCount: 5,
        description: 'Previous year question sets and general science boosters.',
      },
    ];

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const getExamMockTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const quizzes = await Quiz.find({
      examType: String(category).toUpperCase() as ExamCategory,
      isApproved: true,
    }).sort({ playCount: -1 });

    return res.status(200).json({ success: true, mockTests: quizzes });
  } catch (error) {
    next(error);
  }
};
