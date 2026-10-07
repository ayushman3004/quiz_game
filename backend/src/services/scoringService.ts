import { SCORING_RULES } from '../constants';

export interface ScoreCalculationResult {
  isCorrect: boolean;
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  totalPoints: number;
  newStreak: number;
}

export class ScoringService {
  public static calculateQuestionScore(params: {
    isCorrect: boolean;
    timeTakenMs: number;
    totalQuestionTimeMs: number;
    currentStreak: number;
  }): ScoreCalculationResult {
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
    const speedBonus = Math.round(SCORING_RULES.MAX_SPEED_BONUS * speedRatio);
    const streakBonus = Math.min(
      SCORING_RULES.MAX_STREAK_BONUS,
      newStreak * SCORING_RULES.STREAK_POINT_STEP
    );

    const totalPoints = SCORING_RULES.BASE_POINTS + speedBonus + streakBonus;

    return {
      isCorrect: true,
      basePoints: SCORING_RULES.BASE_POINTS,
      speedBonus,
      streakBonus,
      totalPoints,
      newStreak,
    };
  }

  public static calculateRatingDelta(playerRank: number, totalPlayers: number): number {
    if (totalPlayers <= 1) return 0;
    if (playerRank === 1) return 25;
    if (playerRank === 2 && totalPlayers > 2) return 10;
    if (playerRank === totalPlayers) return -15;
    return 0;
  }
}
