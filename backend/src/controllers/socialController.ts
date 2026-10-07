import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { Friend, FriendStatus } from '../models/Friend';
import { Club, ClubMemberRole } from '../models/Club';
import { AppError } from '../middlewares/errorHandler';
import { Types } from 'mongoose';

export const searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(200).json({ success: true, users: [] });
    }

    const currentUserId = req.user?.userId;
    const users = await User.find({
      _id: { $ne: currentUserId ? new Types.ObjectId(currentUserId) : null },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
      ],
    })
      .select('username displayName avatarUrl level rating xp')
      .limit(20);

    return res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const getFriends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const userId = new Types.ObjectId(req.user.userId);

    const friendships = await Friend.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
    }).populate('requesterId recipientId', 'username displayName avatarUrl level rating xp currentStreak');

    const friends = friendships
      .filter((f) => f.status === FriendStatus.ACCEPTED)
      .map((f) => {
        const friendUser =
          f.requesterId._id.toString() === userId.toString() ? f.recipientId : f.requesterId;
        return {
          friendshipId: f._id,
          friend: friendUser,
          connectedSince: f.createdAt,
        };
      });

    const pendingRequests = friendships
      .filter(
        (f) =>
          f.status === FriendStatus.PENDING &&
          f.recipientId._id.toString() === userId.toString()
      )
      .map((f) => ({
        requestId: f._id,
        sender: f.requesterId,
        sentAt: f.createdAt,
      }));

    return res.status(200).json({ success: true, friends, pendingRequests });
  } catch (error) {
    next(error);
  }
};

export const sendFriendRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { targetUserId } = req.body;

    if (req.user.userId === targetUserId) {
      throw new AppError('Cannot send a friend request to yourself', 400);
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new AppError('User not found', 404);

    const requesterId = new Types.ObjectId(req.user.userId);
    const recipientId = new Types.ObjectId(targetUserId);

    const existing = await Friend.findOne({
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === FriendStatus.ACCEPTED) {
        throw new AppError('You are already friends', 400);
      }
      throw new AppError('Friend request already pending', 400);
    }

    const friendRequest = await Friend.create({
      requesterId,
      recipientId,
      status: FriendStatus.PENDING,
    });

    return res.status(201).json({ success: true, message: 'Friend request sent', friendRequest });
  } catch (error) {
    next(error);
  }
};

export const respondFriendRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { requestId, action } = req.body; // 'accept' or 'reject'

    const friendRequest = await Friend.findById(requestId);
    if (!friendRequest) throw new AppError('Friend request not found', 404);

    if (friendRequest.recipientId.toString() !== req.user.userId) {
      throw new AppError('Unauthorized to respond to this request', 403);
    }

    if (action === 'accept') {
      friendRequest.status = FriendStatus.ACCEPTED;
      await friendRequest.save();
    } else {
      friendRequest.status = FriendStatus.REJECTED;
      await friendRequest.save();
    }

    return res.status(200).json({ success: true, message: `Request ${action}ed successfully` });
  } catch (error) {
    next(error);
  }
};

export const getClubs = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clubs = await Club.find({ isPrivate: false })
      .sort({ totalXp: -1 })
      .populate('creatorId', 'username displayName avatarUrl')
      .limit(30);

    return res.status(200).json({ success: true, clubs });
  } catch (error) {
    next(error);
  }
};

export const createClub = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { name, description, badgeUrl, isPrivate } = req.body;

    const existing = await Club.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) throw new AppError('A club with this name already exists', 409);

    const club = await Club.create({
      name,
      description: description || '',
      badgeUrl: badgeUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      creatorId: new Types.ObjectId(req.user.userId),
      isPrivate: !!isPrivate,
      members: [
        {
          userId: new Types.ObjectId(req.user.userId),
          role: ClubMemberRole.OWNER,
          joinedAt: new Date(),
        },
      ],
    });

    return res.status(201).json({ success: true, club });
  } catch (error) {
    next(error);
  }
};

export const joinClub = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;

    const club = await Club.findById(id);
    if (!club) throw new AppError('Club not found', 404);

    const isMember = club.members.some((m) => m.userId.toString() === req.user?.userId);
    if (isMember) throw new AppError('You are already a member of this club', 400);

    club.members.push({
      userId: new Types.ObjectId(req.user.userId),
      role: ClubMemberRole.MEMBER,
      joinedAt: new Date(),
    });

    await club.save();

    return res.status(200).json({ success: true, message: 'Joined club successfully', club });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type = 'global', limit = 50 } = req.query;

    if (type === 'global') {
      const topUsers = await User.find({ isBanned: false })
        .sort({ xp: -1, rating: -1 })
        .limit(Number(limit))
        .select('username displayName avatarUrl xp level rating stats currentStreak');

      return res.status(200).json({
        success: true,
        type: 'global',
        leaderboard: topUsers.map((u, idx) => ({
          rank: idx + 1,
          id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          xp: u.xp,
          level: u.level,
          rating: u.rating,
          streak: u.currentStreak,
        })),
      });
    }

    if (type === 'competitive') {
      const topUsers = await User.find({ isBanned: false })
        .sort({ rating: -1, xp: -1 })
        .limit(Number(limit))
        .select('username displayName avatarUrl xp level rating stats currentStreak');

      return res.status(200).json({
        success: true,
        type: 'competitive',
        leaderboard: topUsers.map((u, idx) => ({
          rank: idx + 1,
          id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          xp: u.xp,
          level: u.level,
          rating: u.rating,
          streak: u.currentStreak,
        })),
      });
    }

    if (type === 'streak') {
      const topUsers = await User.find({ isBanned: false })
        .sort({ currentStreak: -1, rating: -1 })
        .limit(Number(limit))
        .select('username displayName avatarUrl xp level rating stats currentStreak');

      return res.status(200).json({
        success: true,
        type: 'streak',
        leaderboard: topUsers.map((u, idx) => ({
          rank: idx + 1,
          id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          xp: u.xp,
          level: u.level,
          rating: u.rating,
          streak: u.currentStreak,
        })),
      });
    }

    if (type === 'creators') {
      const topCreators = await User.find({ role: 'QUIZ_MASTER', isBanned: false })
        .sort({ followersCount: -1, creatorRating: -1 })
        .limit(Number(limit))
        .select('username displayName avatarUrl followersCount creatorRating publishedQuizzesCount level rating');

      return res.status(200).json({
        success: true,
        type: 'creators',
        leaderboard: topCreators.map((c, idx) => ({
          rank: idx + 1,
          id: c._id,
          username: c.username,
          displayName: c.displayName,
          avatarUrl: c.avatarUrl,
          rating: c.creatorRating,
          followers: c.followersCount,
          publishedQuizzes: c.publishedQuizzesCount,
        })),
      });
    }

    if (type === 'clubs') {
      const topClubs = await Club.find()
        .sort({ weeklyXp: -1, totalXp: -1 })
        .limit(Number(limit))
        .select('name description badgeUrl weeklyXp totalXp members');

      return res.status(200).json({
        success: true,
        type: 'clubs',
        leaderboard: topClubs.map((c, idx) => ({
          rank: idx + 1,
          id: c._id,
          name: c.name,
          badgeUrl: c.badgeUrl,
          weeklyXp: c.weeklyXp,
          totalXp: c.totalXp,
          memberCount: c.members.length,
        })),
      });
    }

    return res.status(200).json({ success: true, leaderboard: [] });
  } catch (error) {
    next(error);
  }
};
