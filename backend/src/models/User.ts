import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../constants';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash?: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  rating: number;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalQuestionsAnswered: number;
    correctAnswers: number;
    avgResponseTimeMs: number;
  };
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  publishedQuizzesCount?: number;
  creatorRating?: number;
  fcmToken?: string;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String },
    displayName: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=quiz' },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER, index: true },
    xp: { type: Number, default: 0, index: true },
    level: { type: Number, default: 1 },
    coins: { type: Number, default: 100 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    rating: { type: Number, default: 1200, index: true },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    publishedQuizzesCount: { type: Number, default: 0 },
    creatorRating: { type: Number, default: 4.8 },
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      totalQuestionsAnswered: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      avgResponseTimeMs: { type: Number, default: 0 },
    },
    fcmToken: { type: String },
    isBanned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ xp: -1 });
UserSchema.index({ rating: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
