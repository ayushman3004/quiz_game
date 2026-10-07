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
exports.Match = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../constants");
const MatchSchema = new mongoose_1.Schema({
    roomCode: { type: String, required: true, uppercase: true, index: true },
    mode: { type: String, enum: Object.values(constants_1.MatchMode), default: constants_1.MatchMode.QUICK_MATCH },
    quizId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    hostId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    players: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            displayName: { type: String, required: true },
            avatarUrl: { type: String },
            score: { type: Number, default: 0 },
            accuracy: { type: Number, default: 0 },
            rank: { type: Number },
            isHost: { type: Boolean, default: false },
            isReady: { type: Boolean, default: false },
            disconnectedAt: { type: Date },
        },
    ],
    status: {
        type: String,
        enum: Object.values(constants_1.GameState),
        default: constants_1.GameState.WAITING,
        index: true,
    },
    questionCount: { type: Number, default: 5 },
    startedAt: { type: Date },
    endedAt: { type: Date },
}, {
    timestamps: true,
});
MatchSchema.index({ 'players.userId': 1, createdAt: -1 });
exports.Match = mongoose_1.default.model('Match', MatchSchema);
