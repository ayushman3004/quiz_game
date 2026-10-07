import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import '../models/quiz_models.dart';

class SoloResultsScreen extends StatelessWidget {
  final QuizResultModel result;
  final String quizTitle;

  const SoloResultsScreen({
    super.key,
    required this.result,
    required this.quizTitle,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),

              // Celebratory Icon Badge
              Center(
                child: Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    gradient: result.accuracy >= 60 ? AppColors.goldGradient : AppColors.primaryGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: (result.accuracy >= 60 ? AppColors.accentAmber : AppColors.primary).withOpacity(0.4),
                        blurRadius: 30,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Icon(
                    result.accuracy >= 60 ? Icons.emoji_events_rounded : Icons.military_tech_rounded,
                    color: Colors.white,
                    size: 48,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Title & Performance Tag
              Text(
                result.accuracy >= 80
                    ? 'OUTSTANDING!'
                    : (result.accuracy >= 50 ? 'GOOD EFFORT!' : 'KEEP PRACTICING!'),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  color: AppColors.textLight,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                quizTitle,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
              const SizedBox(height: 28),

              // Score & Accuracy Cards
              GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatCol('POINTS', '${result.score}', AppColors.accentEmerald),
                        Container(width: 1, height: 40, color: Colors.white12),
                        _buildStatCol('ACCURACY', '${result.accuracy}%', AppColors.accentCyan),
                        Container(width: 1, height: 40, color: Colors.white12),
                        _buildStatCol('CORRECT', '${result.correctCount}/${result.totalQuestions}', AppColors.accentAmber),
                      ],
                    ),
                    const SizedBox(height: 18),
                    const Divider(color: Colors.white12),
                    const SizedBox(height: 14),

                    // Rewards Bar
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.primaryLight.withOpacity(0.4)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.bolt, color: AppColors.primaryLight, size: 18),
                              const SizedBox(width: 4),
                              Text(
                                '+${result.xpEarned} XP',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.accentAmber.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.accentAmber.withOpacity(0.4)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.monetization_on, color: AppColors.accentAmber, size: 18),
                              const SizedBox(width: 4),
                              Text(
                                '+${result.coinsEarned} Coins',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // PRD Section 40: Friend Challenge Card
              GlassCard(
                gradient: const LinearGradient(
                  colors: [Color(0xFF311042), Color(0xFF13091E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderColor: AppColors.accentFlame.withOpacity(0.4),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.accentFlame.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.flash_on_rounded, color: AppColors.accentFlame, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'CAN YOUR FRIEND BEAT YOU?',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.2,
                              color: AppColors.accentFlame,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Challenge friends with your score of ${result.score} pts',
                            style: const TextStyle(fontSize: 12, color: AppColors.textLight),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentFlame,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () {
                        final code = (DateTime.now().millisecondsSinceEpoch % 1000000).toRadixString(36).toUpperCase();
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: AppColors.surfaceDark,
                            title: const Text('⚔ Friend Challenge Link'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Share room code with your friends to see if they can beat ${result.score} pts!',
                                  style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                                ),
                                const SizedBox(height: 16),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: Colors.black45,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.accentFlame),
                                  ),
                                  child: Text(
                                    code,
                                    style: const TextStyle(
                                      fontSize: 26,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 4,
                                      color: AppColors.accentFlame,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx),
                                child: const Text('Close'),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentFlame),
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  context.push('/compete/lobby/$code');
                                },
                                child: const Text('Enter Lobby'),
                              ),
                            ],
                          ),
                        );
                      },
                      child: const Text('Challenge', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // PRD Section 61: Learning Loop (Weak Area Diagnostic)
              if (result.wrongCount > 0)
                GlassCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      const Icon(Icons.lightbulb_rounded, color: AppColors.accentAmber, size: 22),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Weak Area Identified',
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.textLight),
                            ),
                            Text(
                              'Review the ${result.wrongCount} missed questions in Journey mode to master this topic.',
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.go('/journey'),
                        child: const Text('Practice →', style: TextStyle(color: AppColors.accentCyan, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                ),

              const Spacer(),

              // Action Buttons
              AppButton(
                text: 'Back to Home',
                onPressed: () => context.go('/home'),
              ),
              const SizedBox(height: 10),
              AppButton(
                text: 'Continue Journey Track',
                isSecondary: true,
                onPressed: () => context.go('/journey'),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCol(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.textMuted,
            letterSpacing: 0.8,
          ),
        ),
      ],
    );
  }
}
