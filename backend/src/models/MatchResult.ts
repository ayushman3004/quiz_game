import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMatchResult extends Document {
  matchId: Types.ObjectId;
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  score: number;
  rank: number;
  totalPlayers: number;
  accuracy: number;
  correctCount: number;
  wrongCount: number;
  avgResponseTimeMs: number;
  xpEarned: number;
  coinsEarned: number;
  ratingDelta: number;
  createdAt: Date;
}

const MatchResultSchema = new Schema<IMatchResult>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    totalPlayers: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    avgResponseTimeMs: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    ratingDelta: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

MatchResultSchema.index({ userId: 1, createdAt: -1 });

export const MatchResult = mongoose.model<IMatchResult>('MatchResult', MatchResultSchema);
