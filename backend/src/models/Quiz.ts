import mongoose, { Document, Schema, Types } from 'mongoose';
import { ExamCategory, QuizDifficulty, QuizVisibility } from '../constants';

export interface IQuiz extends Document {
  title: string;
  slug?: string;
  description: string;
  category: string;
  subCategory?: string;
  topicId?: string;
  subjectId?: string;
  examType: ExamCategory;
  difficulty: QuizDifficulty;
  timePerQuestionSec: number;
  questionCount: number;
  creatorId?: Types.ObjectId;
  visibility: QuizVisibility;
  playCount: number;
  likesCount: number;
  rating?: number;
  totalRatings?: number;
  isApproved: boolean;
  isAiGenerated: boolean;
  isDailyChallenge?: boolean;
  featured?: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    subCategory: { type: String, index: true },
    topicId: { type: String, index: true },
    subjectId: { type: String, index: true },
    examType: {
      type: String,
      enum: Object.values(ExamCategory),
      default: ExamCategory.GENERAL,
      index: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(QuizDifficulty),
      default: QuizDifficulty.MEDIUM,
      index: true,
    },
    timePerQuestionSec: { type: Number, default: 15 },
    questionCount: { type: Number, default: 0 },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    visibility: {
      type: String,
      enum: Object.values(QuizVisibility),
      default: QuizVisibility.PUBLIC,
      index: true,
    },
    playCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    totalRatings: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true, index: true },
    isAiGenerated: { type: Boolean, default: false },
    isDailyChallenge: { type: Boolean, default: false, index: true },
    featured: { type: Boolean, default: false, index: true },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

QuizSchema.index({ category: 1, difficulty: 1 });
QuizSchema.index({ examType: 1, subCategory: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
