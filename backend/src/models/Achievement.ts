import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAchievement extends Document {
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinsReward: number;
  metric: string;
  threshold: number;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    xpReward: { type: Number, default: 50 },
    coinsReward: { type: Number, default: 20 },
    metric: { type: String, required: true }, // e.g. gamesWon, streak, totalCorrect
    threshold: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

export interface IUserAchievement extends Document {
  userId: Types.ObjectId;
  achievementKey: string;
  unlockedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    achievementKey: { type: String, required: true, index: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

UserAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true });

export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
