import mongoose, { Document, Schema, Types } from 'mongoose';

export enum FriendStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

export interface IFriend extends Document {
  requesterId: Types.ObjectId;
  recipientId: Types.ObjectId;
  status: FriendStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FriendSchema = new Schema<IFriend>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(FriendStatus),
      default: FriendStatus.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FriendSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

export const Friend = mongoose.model<IFriend>('Friend', FriendSchema);
