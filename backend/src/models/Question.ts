import mongoose, { Document, Schema, Types } from 'mongoose';
import { QuizDifficulty } from '../constants';

export interface IOption {
  id: string;
  text: string;
}

export interface IQuestion extends Document {
  quizId: Types.ObjectId;
  questionText: string;
  options: IOption[];
  correctOptionId: string;
  correctOptionIds?: string[];
  explanation: string;
  difficulty: QuizDifficulty;
  questionType?: string;
  imageUrl?: string;
  codeSnippet?: string;
  durationSec: number;
  order: number;
  tags: string[];
}

const QuestionSchema = new Schema<IQuestion>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionText: { type: String, required: true, trim: true },
    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    correctOptionId: { type: String, required: true },
    correctOptionIds: [{ type: String }],
    explanation: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: Object.values(QuizDifficulty),
      default: QuizDifficulty.MEDIUM,
    },
    questionType: { type: String, default: 'MULTIPLE_CHOICE' },
    imageUrl: { type: String },
    codeSnippet: { type: String },
    durationSec: { type: Number, default: 15 },
    order: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ quizId: 1, order: 1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
