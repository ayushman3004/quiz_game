"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../constants");
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String },
    displayName: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=quiz' },
    role: { type: String, enum: Object.values(constants_1.UserRole), default: constants_1.UserRole.USER, index: true },
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
}, {
    timestamps: true,
});
UserSchema.index({ xp: -1 });
UserSchema.index({ rating: -1 });
exports.User = mongoose_1.default.model('User', UserSchema);
