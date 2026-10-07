"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFriendChallenge = exports.toggleFollowCreator = exports.getLeaderboards = exports.joinClub = exports.createClub = exports.getClubs = exports.respondFriendRequest = exports.sendFriendRequest = exports.getFriends = exports.searchUsers = void 0;
const User_1 = require("../models/User");
const Friend_1 = require("../models/Friend");
const Club_1 = require("../models/Club");
const errorHandler_1 = require("../middlewares/errorHandler");
const mongoose_1 = require("mongoose");
const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(200).json({ success: true, users: [] });
        }
        const currentUserId = req.user?.userId;
        const users = await User_1.User.find({
            _id: { $ne: currentUserId ? new mongoose_1.Types.ObjectId(currentUserId) : null },
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { displayName: { $regex: q, $options: 'i' } },
            ],
        })
            .select('username displayName avatarUrl level rating xp')
            .limit(20);
        return res.status(200).json({ success: true, users });
    }
    catch (error) {
        next(error);
    }
};
exports.searchUsers = searchUsers;
const getFriends = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Unauthorized', 401);
        const userId = new mongoose_1.Types.ObjectId(req.user.userId);
        const friendships = await Friend_1.Friend.find({
            $or: [{ requesterId: userId }, { recipientId: userId }],
        }).populate('requesterId recipientId', 'username displayName avatarUrl level rating xp currentStreak');
        const friends = friendships
            .filter((f) => f.status === Friend_1.FriendStatus.ACCEPTED)
            .map((f) => {
            const friendUser = f.requesterId._id.toString() === userId.toString() ? f.recipientId : f.requesterId;
            return {
                friendshipId: f._id,
                friend: friendUser,
                connectedSince: f.createdAt,
            };
        });
        const pendingRequests = friendships
            .filter((f) => f.status === Friend_1.FriendStatus.PENDING &&
            f.recipientId._id.toString() === userId.toString())
            .map((f) => ({
            requestId: f._id,
            sender: f.requesterId,
            sentAt: f.createdAt,
        }));
        return res.status(200).json({ success: true, friends, pendingRequests });
    }
    catch (error) {
        next(error);
    }
};
exports.getFriends = getFriends;
const sendFriendRequest = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Unauthorized', 401);
        const { targetUserId } = req.body;
        if (req.user.userId === targetUserId) {
            throw new errorHandler_1.AppError('Cannot send a friend request to yourself', 400);
        }
        const targetUser = await User_1.User.findById(targetUserId);
        if (!targetUser)
            throw new errorHandler_1.AppError('User not found', 404);
        const requesterId = new mongoose_1.Types.ObjectId(req.user.userId);
        const recipientId = new mongoose_1.Types.ObjectId(targetUserId);
        const existing = await Friend_1.Friend.findOne({
            $or: [
                { requesterId, recipientId },
                { requesterId: recipientId, recipientId: requesterId },
            ],
        });
        if (existing) {
            if (existing.status === Friend_1.FriendStatus.ACCEPTED) {
                throw new errorHandler_1.AppError('You are already friends', 400);
            }
            throw new errorHandler_1.AppError('Friend request already pending', 400);
        }
        const friendRequest = await Friend_1.Friend.create({
            requesterId,
            recipientId,
            status: Friend_1.FriendStatus.PENDING,
        });
        return res.status(201).json({ success: true, message: 'Friend request sent', friendRequest });
    }
    catch (error) {
        next(error);
    }
};
exports.sendFriendRequest = sendFriendRequest;
const respondFriendRequest = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Unauthorized', 401);
        const { requestId, action } = req.body; // 'accept' or 'reject'
        const friendRequest = await Friend_1.Friend.findById(requestId);
        if (!friendRequest)
            throw new errorHandler_1.AppError('Friend request not found', 404);
        if (friendRequest.recipientId.toString() !== req.user.userId) {
            throw new errorHandler_1.AppError('Unauthorized to respond to this request', 403);
        }
        if (action === 'accept') {
            friendRequest.status = Friend_1.FriendStatus.ACCEPTED;
            await friendRequest.save();
        }
        else {
            friendRequest.status = Friend_1.FriendStatus.REJECTED;
            await friendRequest.save();
        }
        return res.status(200).json({ success: true, message: `Request ${action}ed successfully` });
    }
    catch (error) {
        next(error);
    }
};
exports.respondFriendRequest = respondFriendRequest;
const getClubs = async (_req, res, next) => {
    try {
        const clubs = await Club_1.Club.find({ isPrivate: false })
            .sort({ totalXp: -1 })
            .populate('creatorId', 'username displayName avatarUrl')
            .limit(30);
        return res.status(200).json({ success: true, clubs });
    }
    catch (error) {
        next(error);
    }
};
exports.getClubs = getClubs;
const createClub = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Unauthorized', 401);
        const { name, description, badgeUrl, isPrivate } = req.body;
        const existing = await Club_1.Club.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing)
            throw new errorHandler_1.AppError('A club with this name already exists', 409);
        const club = await Club_1.Club.create({
            name,
            description: description || '',
            badgeUrl: badgeUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
            creatorId: new mongoose_1.Types.ObjectId(req.user.userId),
            isPrivate: !!isPrivate,
            members: [
                {
                    userId: new mongoose_1.Types.ObjectId(req.user.userId),
                    role: Club_1.ClubMemberRole.OWNER,
                    joinedAt: new Date(),
                },
            ],
        });
        return res.status(201).json({ success: true, club });
    }
    catch (error) {
        next(error);
    }
};
exports.createClub = createClub;
const joinClub = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Unauthorized', 401);
        const { id } = req.params;
        const club = await Club_1.Club.findById(id);
        if (!club)
            throw new errorHandler_1.AppError('Club not found', 404);
        const isMember = club.members.some((m) => m.userId.toString() === req.user?.userId);
        if (isMember)
            throw new errorHandler_1.AppError('You are already a member of this club', 400);
        club.members.push({
            userId: new mongoose_1.Types.ObjectId(req.user.userId),
            role: Club_1.ClubMemberRole.MEMBER,
            joinedAt: new Date(),
        });
        await club.save();
        return res.status(200).json({ success: true, message: 'Joined club successfully', club });
    }
    catch (error) {
        next(error);
    }
};
exports.joinClub = joinClub;
const getLeaderboards = async (req, res, next) => {
    try {
        const { type = 'global', limit = 50 } = req.query;
        if (type === 'global') {
            const topUsers = await User_1.User.find({ isBanned: false })
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
            const topUsers = await User_1.User.find({ isBanned: false })
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
            const topUsers = await User_1.User.find({ isBanned: false })
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
            const topCreators = await User_1.User.find({ role: 'QUIZ_MASTER', isBanned: false })
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
            const topClubs = await Club_1.Club.find()
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
    }
    catch (error) {
        next(error);
    }
};
exports.getLeaderboards = getLeaderboards;
const toggleFollowCreator = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Unauthorized', 401);
        const { id } = req.params;
        const creator = await User_1.User.findById(id);
        if (!creator)
            throw new errorHandler_1.AppError('Creator not found', 404);
        const currentUser = await User_1.User.findById(req.user.userId);
        if (!currentUser)
            throw new errorHandler_1.AppError('User not found', 404);
        // Toggle follow
        const isFollowing = (currentUser.followingCount || 0) > 0; // Or check relationship
        if (isFollowing) {
            currentUser.followingCount = Math.max(0, (currentUser.followingCount || 1) - 1);
            creator.followersCount = Math.max(0, (creator.followersCount || 1) - 1);
            await currentUser.save();
            await creator.save();
            return res.status(200).json({
                success: true,
                isFollowing: false,
                followersCount: creator.followersCount,
                message: `Unfollowed ${creator.displayName}`,
            });
        }
        else {
            currentUser.followingCount = (currentUser.followingCount || 0) + 1;
            creator.followersCount = (creator.followersCount || 0) + 1;
            await currentUser.save();
            await creator.save();
            return res.status(200).json({
                success: true,
                isFollowing: true,
                followersCount: creator.followersCount,
                message: `Following ${creator.displayName}`,
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.toggleFollowCreator = toggleFollowCreator;
const createFriendChallenge = async (req, res, next) => {
    try {
        const { score, quizTitle, friendId } = req.body;
        const roomCode = (Math.random().toString(36).substring(2, 7)).toUpperCase();
        return res.status(200).json({
            success: true,
            roomCode,
            shareMessage: `I just scored ${score} in ${quizTitle || 'QuizVerse'}! Can you beat me? Enter room code: ${roomCode}`,
            challengeUrl: `https://quizverse.io/challenge/${roomCode}?targetScore=${score}`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createFriendChallenge = createFriendChallenge;
