import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/live_avatar.dart';
import '../../../core/widgets/stat_chip.dart';
import '../../../core/widgets/streak_badge.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../auth/models/user_model.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.asData?.value ??
        UserModel(
          id: 'demo',
          username: 'ayushman_pro',
          email: 'ayushman@quizarena.io',
          displayName: 'Ayushman B.',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ayushman',
          level: 18,
          xp: 14200,
          coins: 480,
          currentStreak: 7,
          longestStreak: 15,
          rating: 1650,
          stats: UserStats(
            gamesPlayed: 54,
            gamesWon: 42,
            totalQuestionsAnswered: 270,
            correctAnswers: 228,
            avgResponseTimeMs: 2400,
          ),
        );

    final winRate = user.stats.gamesPlayed > 0
        ? ((user.stats.gamesWon / user.stats.gamesPlayed) * 100).round()
        : 0;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Player Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.accentRose),
            tooltip: 'Sign Out',
            onPressed: () => _confirmSignOut(context, ref),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Profile Header Card
              GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    LiveAvatar(avatarUrl: user.avatarUrl, size: 72, level: user.level),
                    const SizedBox(height: 14),
                    Text(
                      user.displayName,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textLight),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '@${user.username} • Level ${user.level}',
                      style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 16),

                    // Streaks & Stats Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        StreakBadge(streakDays: user.currentStreak > 0 ? user.currentStreak : 7),
                        const SizedBox(width: 10),
                        StatChip(type: StatType.coins, value: '${user.coins}'),
                        const SizedBox(width: 10),
                        StatChip(type: StatType.rating, value: '${user.rating}'),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // PRD Section 46: Player Archetype Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(user.archetype.icon, style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 6),
                          Text(
                            '${user.archetype.name.toUpperCase()} ARCHETYPE',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.white, letterSpacing: 1.0),
                          ),
                          const SizedBox(width: 6),
                          Text('• ${user.archetype.label}', style: const TextStyle(fontSize: 11, color: Colors.white70)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // PRD Section 41: Achievements & Badges Tray
              const Text(
                'ACHIEVEMENTS & BADGES',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildAchievementBadge('First Victory', '🏆', true, 'Won match'),
                    _buildAchievementBadge('Speed Demon', '⚡', user.stats.avgResponseTimeMs <= 2500 && user.stats.totalQuestionsAnswered >= 4, '< 2.5s answer'),
                    _buildAchievementBadge('Streak Master', '🔥', user.currentStreak >= 7, '7+ day streak'),
                    _buildAchievementBadge('Polymath', '🧠', user.stats.correctAnswers >= 50, '50+ correct'),
                    _buildAchievementBadge('Quiz Architect', '🏛️', user.publishedQuizzesCount > 0, 'Created quiz'),
                    _buildAchievementBadge('Tournament Pro', '🥇', user.rating >= 1600, 'Rating 1600+'),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Performance Analytics Card
              const Text(
                'PERFORMANCE ANALYSIS',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildMetricCol('WIN RATE', '$winRate%', AppColors.accentEmerald),
                        Container(width: 1, height: 40, color: Colors.white12),
                        _buildMetricCol('ACCURACY', '${user.stats.accuracy.round()}%', AppColors.accentCyan),
                        Container(width: 1, height: 40, color: Colors.white12),
                        _buildMetricCol('AVG SPEED', '${(user.stats.avgResponseTimeMs / 1000).toStringAsFixed(1)}s', AppColors.accentAmber),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Divider(color: Colors.white12),
                    const SizedBox(height: 16),

                    // Topic-Wise Accuracy Breakdown
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Topic Mastery',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textLight),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildTopicBar('Economics: Monetary Policy', 0.90, '90%', AppColors.accentAmber),
                    _buildTopicBar('Computer Science: Algorithms', 0.85, '85%', AppColors.primary),
                    _buildTopicBar('Quantitative Aptitude', 0.70, '70%', AppColors.accentEmerald),
                    _buildTopicBar('Indian Polity & UPSC', 0.75, '75%', AppColors.accentCyan),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Match History Teaser
              const Text(
                'RECENT MATCH HISTORY',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              _buildHistoryCard('Economics: Monetary Policy 1v1', 'Rank #1 • Won against Rahul', '+150 XP', '+25 ELO', true),
              _buildHistoryCard('GATE CS: Algorithms Drill', 'Rank #1 • Won against Simran', '+130 XP', '+18 ELO', true),
              _buildHistoryCard('UPSC Prelims Mock', 'Rank #2 • 4-Player Match', '+60 XP', '-10 ELO', false),
              const SizedBox(height: 20),

              // Sign out button
              AppButton(
                text: 'Sign Out',
                isSecondary: true,
                onPressed: () => _confirmSignOut(context, ref),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCol(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: color)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
      ],
    );
  }

  Widget _buildTopicBar(String topic, double progress, String label, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(topic, style: const TextStyle(fontSize: 12.5, color: AppColors.textLight, fontWeight: FontWeight.w600)),
              Text(label, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppColors.surfaceDarkElevated,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(String title, String sub, String xp, String elo, bool isWin) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isWin ? AppColors.accentEmerald.withOpacity(0.15) : AppColors.accentRose.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                isWin ? Icons.check_circle : Icons.remove_circle_outline,
                color: isWin ? AppColors.accentEmerald : AppColors.accentRose,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5, color: AppColors.textLight)),
                  Text(sub, style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(xp, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12.5, color: AppColors.primaryLight)),
                Text(elo, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: isWin ? AppColors.accentEmerald : AppColors.accentRose)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAchievementBadge(String name, String icon, bool isUnlocked, String req) {
    return Container(
      width: 100,
      margin: const EdgeInsets.only(right: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(12),
        backgroundColor: isUnlocked ? AppColors.surfaceDarkElevated : Colors.black38,
        borderColor: isUnlocked ? AppColors.accentAmber.withOpacity(0.4) : AppColors.borderGlass,
        child: Column(
          children: [
            Text(icon, style: TextStyle(fontSize: 26, color: isUnlocked ? null : Colors.grey)),
            const SizedBox(height: 6),
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 11.5,
                color: isUnlocked ? AppColors.textLight : AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              isUnlocked ? 'Unlocked' : req,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: isUnlocked ? AppColors.accentEmerald : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmSignOut(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceDark,
        title: const Text('Sign Out?'),
        content: const Text('Are you sure you want to sign out from QuizArena?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRose),
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(authControllerProvider.notifier).logout();
              context.go('/auth/login');
            },
            child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
