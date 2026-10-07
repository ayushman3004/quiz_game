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
exports.Tournament = exports.TournamentType = exports.TournamentStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["UPCOMING"] = "UPCOMING";
    TournamentStatus["REGISTRATION_OPEN"] = "REGISTRATION_OPEN";
    TournamentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TournamentStatus["COMPLETED"] = "COMPLETED";
})(TournamentStatus || (exports.TournamentStatus = TournamentStatus = {}));
var TournamentType;
(function (TournamentType) {
    TournamentType["DAILY"] = "DAILY";
    TournamentType["WEEKLY"] = "WEEKLY";
    TournamentType["MONTHLY"] = "MONTHLY";
    TournamentType["COLLEGE"] = "COLLEGE";
    TournamentType["CORPORATE"] = "CORPORATE";
})(TournamentType || (exports.TournamentType = TournamentType = {}));
const TournamentSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: Object.values(TournamentType), default: TournamentType.DAILY },
    status: { type: String, enum: Object.values(TournamentStatus), default: TournamentStatus.REGISTRATION_OPEN },
    category: { type: String, default: 'General' },
    entryFeeCoins: { type: Number, default: 0 },
    prizePoolCoins: { type: Number, default: 1000 },
    prizePoolXp: { type: Number, default: 2500 },
    maxParticipants: { type: Number, default: 64 },
    registeredUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    roundsCount: { type: Number, default: 4 }, // Qualifier -> Round 2 -> Semifinal -> Final
    currentRound: { type: Number, default: 1 },
    bannerGradient: [{ type: String }],
    rules: [{ type: String }],
}, { timestamps: true });
TournamentSchema.index({ status: 1, startTime: 1 });
exports.Tournament = mongoose_1.default.model('Tournament', TournamentSchema);
