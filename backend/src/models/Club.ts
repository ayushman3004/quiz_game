import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ClubMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface IClubMember {
  userId: Types.ObjectId;
  role: ClubMemberRole;
  joinedAt: Date;
}

export interface IClub extends Document {
  name: string;
  description: string;
  badgeUrl: string;
  creatorId: Types.ObjectId;
  members: IClubMember[];
  weeklyXp: number;
  totalXp: number;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: '' },
    badgeUrl: { type: String, default: 'https://api.dicebear.com/7.x/identicon/svg?seed=club' },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: Object.values(ClubMemberRole),
          default: ClubMemberRole.MEMBER,
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    weeklyXp: { type: Number, default: 0, index: true },
    totalXp: { type: Number, default: 0, index: true },
    isPrivate: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Club = mongoose.model<IClub>('Club', ClubSchema);
