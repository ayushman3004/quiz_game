import mongoose, { Document, Schema, Types } from 'mongoose';

export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  QUIZ_CHALLENGE = 'QUIZ_CHALLENGE',
  ROOM_INVITE = 'ROOM_INVITE',
  DAILY_CHALLENGE = 'DAILY_CHALLENGE',
  STREAK_REMINDER = 'STREAK_REMINDER',
  RANK_CHANGE = 'RANK_CHANGE',
  SYSTEM = 'SYSTEM',
}

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.SYSTEM,
      index: true,
    },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
