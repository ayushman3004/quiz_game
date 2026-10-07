import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/live_avatar.dart';

class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _globalBoard = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadLeaderboard();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadLeaderboard() async {
    try {
      final res = await DioClient().dio.get('${ApiEndpoints.leaderboards}?type=global');
      if (res.data['success'] == true && res.data['leaderboard'] != null) {
        setState(() {
          _globalBoard = List<Map<String, dynamic>>.from(res.data['leaderboard']);
          _isLoading = false;
        });
        return;
      }
    } catch (_) {}

    // Fallback esports leaderboard
    setState(() {
      _globalBoard = [
        {
          'rank': 1,
          'displayName': 'Ayushman B.',
          'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=Ayushman',
          'xp': 28400,
          'level': 24,
          'rating': 1890,
          'streak': 14,
        },
        {
          'rank': 2,
          'displayName': 'Rahul Sharma',
          'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=rahul',
          'xp': 24100,
          'level': 21,
          'rating': 1750,
          'streak': 8,
        },
        {
          'rank': 3,
          'displayName': 'Simran Kaur',
          'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=simran',
          'xp': 21900,
          'level': 19,
          'rating': 1680,
          'streak': 12,
        },
        {
          'rank': 4,
          'displayName': 'Aman Verma',
          'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=aman',
          'xp': 18400,
          'level': 17,
          'rating': 1590,
          'streak': 5,
        },
        {
          'rank': 5,
          'displayName': 'Pooja Nair',
          'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=pooja',
          'xp': 16200,
          'level': 15,
          'rating': 1510,
          'streak': 3,
        },
      ];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Global Leaderboard'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelColor: AppColors.primaryLight,
          unselectedLabelColor: AppColors.textMuted,
          tabs: const [
            Tab(text: 'Global'),
            Tab(text: 'Weekly'),
            Tab(text: 'Friends'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildLeaderboardList(_globalBoard),
                _buildLeaderboardList(_globalBoard),
                _buildLeaderboardList(_globalBoard),
              ],
            ),
    );
  }

  Widget _buildLeaderboardList(List<Map<String, dynamic>> list) {
    if (list.isEmpty) return const Center(child: Text('No rank data available.'));

    final top3 = list.take(3).toList();
    final remaining = list.skip(3).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Top 3 Podium
          if (top3.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (top3.length > 1) _buildPodiumColumn(top3[1], 2, 110, AppColors.silverPodiumGradient),
                _buildPodiumColumn(top3[0], 1, 140, AppColors.goldGradient),
                if (top3.length > 2) _buildPodiumColumn(top3[2], 3, 95, AppColors.bronzePodiumGradient),
              ],
            ),
            const SizedBox(height: 28),
          ],

          // Remaining Table
          ...remaining.map((item) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              child: GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    SizedBox(
                      width: 30,
                      child: Text(
                        '#${item['rank']}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ),
                    LiveAvatar(avatarUrl: item['avatarUrl'], size: 40),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['displayName'] ?? '',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5, color: AppColors.textLight),
                          ),
                          Text(
                            'Level ${item['level']} • Rating ${item['rating']}',
                            style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '${item['xp']} XP',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.primaryLight),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildPodiumColumn(Map<String, dynamic> item, int rank, double height, LinearGradient gradient) {
    return Container(
      width: 100,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      child: Column(
        children: [
          LiveAvatar(
            avatarUrl: item['avatarUrl'],
            size: rank == 1 ? 60 : 50,
          ),
          const SizedBox(height: 6),
          Text(
            item['displayName'] ?? '',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textLight),
          ),
          Text(
            '${item['xp']} XP',
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.accentCyan),
          ),
          const SizedBox(height: 8),
          Container(
            height: height,
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              boxShadow: [
                BoxShadow(
                  color: gradient.colors.first.withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Text(
                rank == 1 ? '🥇 1st' : (rank == 2 ? '🥈 2nd' : '🥉 3rd'),
                style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.black, fontSize: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
