import mongoose, { Document, Schema, Types } from 'mongoose';
import { GameState, MatchMode } from '../constants';

export interface IMatchPlayer {
  userId: Types.ObjectId;
  displayName: string;
  avatarUrl: string;
  score: number;
  accuracy: number;
  rank?: number;
  isHost: boolean;
  isReady: boolean;
  disconnectedAt?: Date;
}

export interface IMatch extends Document {
  roomCode: string;
  mode: MatchMode;
  quizId: Types.ObjectId;
  hostId: Types.ObjectId;
  players: IMatchPlayer[];
  status: GameState;
  questionCount: number;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    roomCode: { type: String, required: true, uppercase: true, index: true },
    mode: { type: String, enum: Object.values(MatchMode), default: MatchMode.QUICK_MATCH },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    players: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        displayName: { type: String, required: true },
        avatarUrl: { type: String },
        score: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        rank: { type: Number },
        isHost: { type: Boolean, default: false },
        isReady: { type: Boolean, default: false },
        disconnectedAt: { type: Date },
      },
    ],
    status: {
      type: String,
      enum: Object.values(GameState),
      default: GameState.WAITING,
      index: true,
    },
    questionCount: { type: Number, default: 5 },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

MatchSchema.index({ 'players.userId': 1, createdAt: -1 });

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
