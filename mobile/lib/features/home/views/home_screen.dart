import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/live_avatar.dart';
import '../../../core/widgets/stat_chip.dart';
import '../../../core/widgets/streak_badge.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../auth/models/user_model.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  List<Map<String, dynamic>> _trendingQuizzes = [];
  bool _isLoadingTrending = true;

  @override
  void initState() {
    super.initState();
    _fetchTrendingQuizzes();
  }

  Future<void> _fetchTrendingQuizzes() async {
    try {
      final response = await DioClient().dio.get('${ApiEndpoints.quizzes}?limit=4');
      if (response.data['success'] == true && response.data['quizzes'] != null) {
        if (mounted) {
          setState(() {
            _trendingQuizzes = List<Map<String, dynamic>>.from(response.data['quizzes']);
            _isLoadingTrending = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingTrending = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.asData?.value ??
        UserModel(
          id: 'demo',
          username: 'player',
          email: 'player@quizverse.io',
          displayName: 'Ayushman',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ayushman',
          level: 18,
          xp: 14200,
          coins: 480,
          currentStreak: 7,
          rating: 1650,
          xpProgress: 75,
        );

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.read(authControllerProvider.notifier).checkAuth();
            await _fetchTrendingQuizzes();
          },
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top App Bar Header
                Row(
                  children: [
                    LiveAvatar(
                      avatarUrl: user.avatarUrl,
                      size: 48,
                      level: user.level,
                      isOnline: true,
                      onTap: () => context.go('/profile'),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hey, ${user.displayName} ⚡',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textLight,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Level ${user.level} Competitor',
                            style: const TextStyle(
                              fontSize: 12.5,
                              color: AppColors.accentCyan,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    StreakBadge(streakDays: user.currentStreak > 0 ? user.currentStreak : 7),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.leaderboard_rounded, color: AppColors.accentAmber, size: 22),
                      tooltip: 'Leaderboard',
                      onPressed: () => context.push('/leaderboard'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Currency & Stats Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    StatChip(type: StatType.xp, value: '${user.xp}'),
                    StatChip(type: StatType.coins, value: '${user.coins}'),
                    StatChip(type: StatType.rating, value: '${user.rating}'),
                  ],
                ),
                const SizedBox(height: 16),

                // XP Progress to Next Level Bar
                GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Level ${user.level} Progress',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                          ),
                          Text(
                            '${user.xpProgress}%',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryLight),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: (user.xpProgress / 100.0).clamp(0.0, 1.0),
                          minHeight: 8,
                          backgroundColor: AppColors.surfaceDarkElevated,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // CTA 1: Continue Journey Banner (Economics Track)
                GlassCard(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E1B4B), Color(0xFF0F172A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderColor: AppColors.primary.withOpacity(0.4),
                  padding: const EdgeInsets.all(20),
                  onTap: () => context.go('/journey'),
                  child: Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.school, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'CONTINUE JOURNEY',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.2,
                                color: AppColors.accentCyan,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Economics: Monetary Policy & Central Banking',
                              style: TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textLight,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'RBI Mandate • Topic 5 of 6',
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, color: AppColors.primaryLight, size: 16),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // CTA 2: Quick Match Esports Action Button
                AppButton(
                  text: '⚔ QUICK MATCH (THE RING)',
                  height: 60,
                  gradient: AppColors.streakGradient,
                  onPressed: () => context.go('/compete'),
                ),
                const SizedBox(height: 24),

                // Daily Challenge Card (Polymath Knowledge Sprint)
                const Text(
                  'Daily Challenge',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textLight),
                ),
                const SizedBox(height: 12),
                GlassCard(
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppColors.accentAmber.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.star_rounded, color: AppColors.accentAmber, size: 26),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Polymath Knowledge Sprint',
                              style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: AppColors.textLight),
                            ),
                            SizedBox(height: 3),
                            Text(
                              '5 questions • 2x XP + Coin Bonus today',
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () => context.push('/quiz/solo/daily'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentAmber,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Play', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // PRD Section 29 & 36: Ecosystem Hubs (Quiz Masters & Tournaments)
                Row(
                  children: [
                    // Quiz Masters Card
                    Expanded(
                      child: GlassCard(
                        padding: const EdgeInsets.all(16),
                        onTap: () => context.push('/creators'),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.psychology, color: AppColors.primaryLight, size: 22),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Quiz Masters',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5, color: AppColors.textLight),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Top authors & mentors',
                              style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Tournaments Card
                    Expanded(
                      child: GlassCard(
                        padding: const EdgeInsets.all(16),
                        onTap: () => context.push('/tournaments'),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.accentAmber.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.emoji_events, color: AppColors.accentAmber, size: 22),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Tournaments',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5, color: AppColors.textLight),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Daily sprint cups',
                              style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Trending Quizzes Section (From Database)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Trending Quizzes',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textLight),
                    ),
                    Text(
                      '${_trendingQuizzes.length} Live from DB',
                      style: const TextStyle(color: AppColors.accentCyan, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (_isLoadingTrending)
                  const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
                else
                  ..._trendingQuizzes.map((quiz) {
                    final quizId = quiz['_id']?.toString() ?? '';
                    final title = quiz['title'] ?? 'Quiz';
                    final category = quiz['category'] ?? 'General';
                    final playCount = quiz['playCount'] ?? 0;
                    final difficulty = quiz['difficulty'] ?? 'MEDIUM';
                    final questionCount = quiz['questionCount'] ?? 4;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        onTap: () => context.push('/quiz/solo/$quizId'),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.bolt_rounded, color: AppColors.primaryLight, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13.5,
                                      color: AppColors.textLight,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '$category • $questionCount Qs • $playCount plays',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: difficulty == 'HARD'
                                    ? AppColors.accentRose.withOpacity(0.15)
                                    : AppColors.accentAmber.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                difficulty,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: difficulty == 'HARD' ? AppColors.accentRose : AppColors.accentAmber,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                const SizedBox(height: 20),

                // Govt Job Arena Section Banner
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Govt Job Arena',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textLight),
                    ),
                    GestureDetector(
                      onTap: () => context.push('/govt-arena'),
                      child: const Text(
                        'View All Exams →',
                        style: TextStyle(color: AppColors.primaryLight, fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildExamChip(context, 'Economics', 'RBI & Policy', Icons.trending_up, AppColors.accentAmber, 'ECONOMICS'),
                      _buildExamChip(context, 'GATE CS', 'CS & IT', Icons.terminal, AppColors.primary, 'GATE'),
                      _buildExamChip(context, 'SSC CGL', 'Govt Staff', Icons.account_balance, AppColors.accentEmerald, 'SSC'),
                      _buildExamChip(context, 'UPSC', 'Civil Services', Icons.policy, AppColors.accentRose, 'UPSC'),
                      _buildExamChip(context, 'Banking', 'IBPS/SBI', Icons.payments, AppColors.accentCyan, 'BANKING'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Friends Online Tray
                const Text(
                  'Friends Online (3)',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textLight),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFriendBubble('Rahul S.', 'https://api.dicebear.com/7.x/bottts/svg?seed=rahul', true),
                      _buildFriendBubble('Simran K.', 'https://api.dicebear.com/7.x/bottts/svg?seed=simran', true),
                      _buildFriendBubble('Aman V.', 'https://api.dicebear.com/7.x/bottts/svg?seed=aman', true),
                      _buildFriendBubble('Vikram', 'https://api.dicebear.com/7.x/bottts/svg?seed=vikram', false),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildExamChip(BuildContext context, String name, String sub, IconData icon, Color color, String categoryId) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      width: 140,
      child: GlassCard(
        padding: const EdgeInsets.all(14),
        onTap: () => context.push('/quiz/solo/$categoryId'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 10),
            Text(
              name,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textLight),
            ),
            const SizedBox(height: 2),
            Text(
              sub,
              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFriendBubble(String name, String avatarUrl, bool isOnline) {
    return Container(
      margin: const EdgeInsets.only(right: 16),
      child: Column(
        children: [
          LiveAvatar(avatarUrl: avatarUrl, size: 48, isOnline: isOnline),
          const SizedBox(height: 6),
          Text(
            name,
            style: const TextStyle(fontSize: 11.5, color: AppColors.textLight, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
