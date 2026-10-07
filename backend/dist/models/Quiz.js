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
exports.Quiz = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../constants");
const QuizSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    subCategory: { type: String, index: true },
    topicId: { type: String, index: true },
    subjectId: { type: String, index: true },
    examType: {
        type: String,
        enum: Object.values(constants_1.ExamCategory),
        default: constants_1.ExamCategory.GENERAL,
        index: true,
    },
    difficulty: {
        type: String,
        enum: Object.values(constants_1.QuizDifficulty),
        default: constants_1.QuizDifficulty.MEDIUM,
        index: true,
    },
    timePerQuestionSec: { type: Number, default: 15 },
    questionCount: { type: Number, default: 0 },
    creatorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    visibility: {
        type: String,
        enum: Object.values(constants_1.QuizVisibility),
        default: constants_1.QuizVisibility.PUBLIC,
        index: true,
    },
    playCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    totalRatings: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true, index: true },
    isAiGenerated: { type: Boolean, default: false },
    isDailyChallenge: { type: Boolean, default: false, index: true },
    featured: { type: Boolean, default: false, index: true },
    tags: [{ type: String }],
}, {
    timestamps: true,
});
QuizSchema.index({ category: 1, difficulty: 1 });
QuizSchema.index({ examType: 1, subCategory: 1 });
exports.Quiz = mongoose_1.default.model('Quiz', QuizSchema);
