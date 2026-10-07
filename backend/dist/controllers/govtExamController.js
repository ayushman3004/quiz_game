"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExamMockTests = exports.getExamCategories = void 0;
const Quiz_1 = require("../models/Quiz");
const constants_1 = require("../constants");
const getExamCategories = async (_req, res, next) => {
    try {
        const categories = [
            {
                id: constants_1.ExamCategory.ECONOMICS,
                name: 'Economics & Policy Arena',
                badge: 'Macroeconomics & RBI',
                icon: 'trending_up',
                activeStudents: 22100,
                subjectsCount: 6,
                description: 'Structured drills covering Demand & Supply, Money & Banking, and Monetary Policy.',
            },
            {
                id: constants_1.ExamCategory.GATE,
                name: 'GATE Exam Arena',
                badge: 'Engineering & CS',
                icon: 'terminal',
                activeStudents: 14200,
                subjectsCount: 12,
                description: 'Comprehensive test series for Computer Science, Electrical, and Mechanical.',
            },
            {
                id: constants_1.ExamCategory.SSC,
                name: 'SSC CGL / CHSL',
                badge: 'Staff Selection',
                icon: 'account_balance',
                activeStudents: 28500,
                subjectsCount: 8,
                description: 'Tier-1 & Tier-2 mock papers with speed and accuracy drills.',
            },
            {
                id: constants_1.ExamCategory.BANKING,
                name: 'Banking & Insurance (IBPS/SBI)',
                badge: 'Financial Services',
                icon: 'payments',
                activeStudents: 19800,
                subjectsCount: 6,
                description: 'Quantitative aptitude, reasoning, and financial awareness tests.',
            },
            {
                id: constants_1.ExamCategory.UPSC,
                name: 'UPSC Civil Services',
                badge: 'Civil Services',
                icon: 'policy',
                activeStudents: 9400,
                subjectsCount: 14,
                description: 'Prelims GS-1 & CSAT speed tests and current affairs quizzes.',
            },
            {
                id: constants_1.ExamCategory.RAILWAYS,
                name: 'RRB NTPC & Group D',
                badge: 'Railways Board',
                icon: 'train',
                activeStudents: 15300,
                subjectsCount: 5,
                description: 'Previous year question sets and general science boosters.',
            },
        ];
        return res.status(200).json({ success: true, categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getExamCategories = getExamCategories;
const getExamMockTests = async (req, res, next) => {
    try {
        const { category } = req.params;
        const quizzes = await Quiz_1.Quiz.find({
            examType: String(category).toUpperCase(),
            isApproved: true,
        }).sort({ playCount: -1 });
        return res.status(200).json({ success: true, mockTests: quizzes });
    }
    catch (error) {
        next(error);
    }
};
exports.getExamMockTests = getExamMockTests;
