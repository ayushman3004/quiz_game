import mongoose, { Document, Schema } from 'mongoose';

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TournamentType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  COLLEGE = 'COLLEGE',
  CORPORATE = 'CORPORATE',
}

export interface ITournament extends Document {
  title: string;
  description: string;
  type: TournamentType;
  status: TournamentStatus;
  category: string;
  entryFeeCoins: number;
  prizePoolCoins: number;
  prizePoolXp: number;
  maxParticipants: number;
  registeredUsers: mongoose.Types.ObjectId[];
  startTime: Date;
  endTime?: Date;
  roundsCount: number;
  currentRound: number;
  bannerGradient: string[];
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: Object.values(TournamentType), default: TournamentType.DAILY },
    status: { type: String, enum: Object.values(TournamentStatus), default: TournamentStatus.REGISTRATION_OPEN },
    category: { type: String, default: 'General' },
    entryFeeCoins: { type: Number, default: 0 },
    prizePoolCoins: { type: Number, default: 1000 },
    prizePoolXp: { type: Number, default: 2500 },
    maxParticipants: { type: Number, default: 64 },
    registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    roundsCount: { type: Number, default: 4 }, // Qualifier -> Round 2 -> Semifinal -> Final
    currentRound: { type: Number, default: 1 },
    bannerGradient: [{ type: String }],
    rules: [{ type: String }],
  },
  { timestamps: true }
);

TournamentSchema.index({ status: 1, startTime: 1 });

export const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema);
