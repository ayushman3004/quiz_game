"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringService = void 0;
const constants_1 = require("../constants");
class ScoringService {
    static calculateQuestionScore(params) {
        const { isCorrect, timeTakenMs, totalQuestionTimeMs, currentStreak } = params;
        if (!isCorrect) {
            return {
                isCorrect: false,
                basePoints: 0,
                speedBonus: 0,
                streakBonus: 0,
                totalPoints: 0,
                newStreak: 0,
            };
        }
        const newStreak = currentStreak + 1;
        const remainingTimeMs = Math.max(0, totalQuestionTimeMs - timeTakenMs);
        const speedRatio = totalQuestionTimeMs > 0 ? remainingTimeMs / totalQuestionTimeMs : 0;
        const speedBonus = Math.round(constants_1.SCORING_RULES.MAX_SPEED_BONUS * speedRatio);
        const streakBonus = Math.min(constants_1.SCORING_RULES.MAX_STREAK_BONUS, newStreak * constants_1.SCORING_RULES.STREAK_POINT_STEP);
        const totalPoints = constants_1.SCORING_RULES.BASE_POINTS + speedBonus + streakBonus;
        return {
            isCorrect: true,
            basePoints: constants_1.SCORING_RULES.BASE_POINTS,
            speedBonus,
            streakBonus,
            totalPoints,
            newStreak,
        };
    }
    static calculateRatingDelta(playerRank, totalPlayers) {
        if (totalPlayers <= 1)
            return 0;
        if (playerRank === 1)
            return 25;
        if (playerRank === 2 && totalPlayers > 2)
            return 10;
        if (playerRank === totalPlayers)
            return -15;
        return 0;
    }
}
exports.ScoringService = ScoringService;
