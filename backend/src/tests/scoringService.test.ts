import { ScoringService } from '../services/scoringService';

describe('ScoringService', () => {
  it('awards 0 points and resets streak on incorrect answer', () => {
    const result = ScoringService.calculateQuestionScore({
      isCorrect: false,
      timeTakenMs: 4000,
      totalQuestionTimeMs: 15000,
      currentStreak: 3,
    });

    expect(result.isCorrect).toBe(false);
    expect(result.totalPoints).toBe(0);
    expect(result.newStreak).toBe(0);
  });

  it('calculates base points + speed bonus + streak bonus correctly for fast answer', () => {
    // 15 seconds total, answered in 3 seconds (12 seconds remaining => 80% speed)
    const result = ScoringService.calculateQuestionScore({
      isCorrect: true,
      timeTakenMs: 3000,
      totalQuestionTimeMs: 15000,
      currentStreak: 2,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.basePoints).toBe(100);
    expect(result.newStreak).toBe(3);
    // Speed bonus: 50 * (12000 / 15000) = 40
    expect(result.speedBonus).toBe(40);
    // Streak bonus: min(25, 3 * 5) = 15
    expect(result.streakBonus).toBe(15);
    expect(result.totalPoints).toBe(155);
  });

  it('caps streak bonus at 25 points maximum', () => {
    const result = ScoringService.calculateQuestionScore({
      isCorrect: true,
      timeTakenMs: 14000,
      totalQuestionTimeMs: 15000,
      currentStreak: 10,
    });

    expect(result.streakBonus).toBe(25);
  });

  it('calculates rating deltas based on rank', () => {
    expect(ScoringService.calculateRatingDelta(1, 4)).toBe(25);
    expect(ScoringService.calculateRatingDelta(2, 4)).toBe(10);
    expect(ScoringService.calculateRatingDelta(4, 4)).toBe(-15);
  });
});
