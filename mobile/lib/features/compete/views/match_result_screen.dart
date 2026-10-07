import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/live_avatar.dart';
import '../models/match_models.dart';
import '../../auth/controllers/auth_controller.dart';

class MatchResultScreen extends ConsumerWidget {
  final List<MatchFinalResult> results;
  final String roomCode;

  const MatchResultScreen({
    super.key,
    required this.results,
    required this.roomCode,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUserId = ref.watch(authControllerProvider).asData?.value?.id ?? '';
    final myResult = results.firstWhere(
      (r) => r.userId == currentUserId,
      orElse: () => results.isNotEmpty ? results.first : MatchFinalResult(
        rank: 1,
        userId: 'demo',
        displayName: 'Player',
        avatarUrl: '',
        score: 1240,
        accuracy: 80,
        correctCount: 8,
        wrongCount: 2,
        xpEarned: 150,
        coinsEarned: 40,
        ratingDelta: 25,
      ),
    );

    final isWinner = myResult.rank == 1;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),

              // Podium Rank Crown / Badge
              Center(
                child: Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    gradient: isWinner ? AppColors.goldGradient : AppColors.primaryGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: (isWinner ? AppColors.accentAmber : AppColors.primary).withOpacity(0.4),
                        blurRadius: 28,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      isWinner ? '👑' : '#${myResult.rank}',
                      style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Text(
                isWinner ? 'VICTORY!' : 'YOU FINISHED #${myResult.rank}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  color: AppColors.textLight,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${myResult.score} POINTS',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.accentEmerald,
                ),
              ),
              const SizedBox(height: 20),

              // Performance Summary Card
              GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatCol('ACCURACY', '${myResult.accuracy}%', AppColors.accentCyan),
                        Container(width: 1, height: 38, color: Colors.white12),
                        _buildStatCol('CORRECT', '${myResult.correctCount}', AppColors.accentEmerald),
                        Container(width: 1, height: 38, color: Colors.white12),
                        _buildStatCol('WRONG', '${myResult.wrongCount}', AppColors.accentRose),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(color: Colors.white12),
                    const SizedBox(height: 14),

                    // Rewards Bar (XP, Coins, Rating)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildRewardPill('+${myResult.xpEarned} XP', Icons.bolt, AppColors.primaryLight),
                        const SizedBox(width: 8),
                        _buildRewardPill('+${myResult.coinsEarned} Coins', Icons.monetization_on, AppColors.accentAmber),
                        const SizedBox(width: 8),
                        _buildRewardPill(
                          '${myResult.ratingDelta >= 0 ? '+' : ''}${myResult.ratingDelta} ELO',
                          Icons.shield,
                          AppColors.accentCyan,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Final Leaderboard Table
              const Text(
                'FINAL RANKINGS',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.textMuted),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: ListView.builder(
                  itemCount: results.length,
                  itemBuilder: (context, idx) {
                    final p = results[idx];
                    final isMe = p.userId == currentUserId;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: GlassCard(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        backgroundColor: isMe ? AppColors.primary.withOpacity(0.18) : AppColors.surfaceDark,
                        borderColor: isMe ? AppColors.primary : AppColors.borderGlass,
                        child: Row(
                          children: [
                            Text(
                              '#${p.rank}',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 14,
                                color: p.rank == 1 ? AppColors.accentAmber : AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(width: 12),
                            LiveAvatar(avatarUrl: p.avatarUrl, size: 36),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                p.displayName,
                                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textLight),
                              ),
                            ),
                            Text(
                              '${p.score} pts',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: AppColors.accentEmerald),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      text: '⚔ Rematch',
                      onPressed: () => context.pushReplacement('/compete/lobby/$roomCode'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppButton(
                      text: 'Home',
                      isSecondary: true,
                      onPressed: () => context.go('/home'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCol(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color)),
        const SizedBox(height: 3),
        Text(label, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.8)),
      ],
    );
  }

  Widget _buildRewardPill(String text, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 4),
          Text(text, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: Colors.white)),
        ],
      ),
    );
  }
}
