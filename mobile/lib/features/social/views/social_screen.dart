import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/live_avatar.dart';

class SocialScreen extends ConsumerStatefulWidget {
  const SocialScreen({super.key});

  @override
  ConsumerState<SocialScreen> createState() => _SocialScreenState();
}

class _SocialScreenState extends ConsumerState<SocialScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  List<Map<String, dynamic>> _friends = [];
  List<Map<String, dynamic>> _clubs = [];
  List<Map<String, dynamic>> _searchResults = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadSocialData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadSocialData() async {
    try {
      final dio = DioClient().dio;
      final friendsRes = await dio.get(ApiEndpoints.friends);
      final clubsRes = await dio.get(ApiEndpoints.clubs);

      if (mounted) {
        setState(() {
          if (friendsRes.data['friends'] != null) {
            _friends = List<Map<String, dynamic>>.from(friendsRes.data['friends']);
          }
          if (clubsRes.data['clubs'] != null) {
            _clubs = List<Map<String, dynamic>>.from(clubsRes.data['clubs']);
          }
          _isLoading = false;
        });
        return;
      }
    } catch (_) {}

    // Fallback demo social data
    if (mounted) {
      setState(() {
        _friends = [
          {
            'friend': {
              'id': 'u1',
              'displayName': 'Rahul Sharma',
              'username': 'rahul_s',
              'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=rahul',
              'level': 14,
              'rating': 1520,
              'currentStreak': 5,
            }
          },
          {
            'friend': {
              'id': 'u2',
              'displayName': 'Simran Kaur',
              'username': 'simran_k',
              'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=simran',
              'level': 16,
              'rating': 1680,
              'currentStreak': 12,
            }
          },
          {
            'friend': {
              'id': 'u3',
              'displayName': 'Aman Verma',
              'username': 'aman_v',
              'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=aman',
              'level': 11,
              'rating': 1390,
              'currentStreak': 2,
            }
          },
        ];
        _clubs = [
          {
            'id': 'c1',
            'name': 'GATE CS Conquerors',
            'description': 'Daily algorithms and OS practice group.',
            'weeklyXp': 45200,
            'membersCount': 128,
            'badgeUrl': 'https://api.dicebear.com/7.x/identicon/svg?seed=gate',
          },
          {
            'id': 'c2',
            'name': 'SSC Speed Demons',
            'description': 'Lightning math & quantitative tricks.',
            'weeklyXp': 38900,
            'membersCount': 94,
            'badgeUrl': 'https://api.dicebear.com/7.x/identicon/svg?seed=ssc',
          },
        ];
        _isLoading = false;
      });
    }
  }

  void _challengeFriend(String friendName) {
    final code = (DateTime.now().millisecondsSinceEpoch % 1000000).toRadixString(36).toUpperCase();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Challenge sent to $friendName! Room: $code')),
    );
    context.push('/compete/lobby/$code');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Social & Clubs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.leaderboard_rounded, color: AppColors.accentCyan),
            tooltip: 'Leaderboards',
            onPressed: () => context.push('/leaderboard'),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelColor: AppColors.primaryLight,
          unselectedLabelColor: AppColors.textMuted,
          tabs: const [
            Tab(text: 'Friends'),
            Tab(text: 'Clubs'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildFriendsTab(),
                _buildClubsTab(),
              ],
            ),
    );
  }

  Widget _buildFriendsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Search Friends Bar
          TextField(
            controller: _searchController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              hintText: 'Search by username or name...',
              prefixIcon: Icon(Icons.search, color: AppColors.textMuted),
            ),
          ),
          const SizedBox(height: 20),

          // Friends List
          Text(
            'MY FRIENDS (${_friends.length})',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.textMuted),
          ),
          const SizedBox(height: 12),

          ..._friends.map((f) {
            final friend = f['friend'] ?? {};
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              child: GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    LiveAvatar(
                      avatarUrl: friend['avatarUrl'],
                      size: 46,
                      level: friend['level'],
                      isOnline: true,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            friend['displayName'] ?? 'Friend',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textLight),
                          ),
                          Text(
                            '@${friend['username']} • Rating: ${friend['rating']}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.flash_on, size: 16),
                      label: const Text('Duel', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () => _challengeFriend(friend['displayName'] ?? 'Friend'),
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

  Widget _buildClubsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'ACTIVE CLUBS',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.textMuted),
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Create Club', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentCyan,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Club created! Invite your friends.')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 14),

          ..._clubs.map((c) {
            return Container(
              margin: const EdgeInsets.only(bottom: 14),
              child: GlassCard(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        LiveAvatar(avatarUrl: c['badgeUrl'], size: 44),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                c['name'] ?? '',
                                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textLight),
                              ),
                              Text(
                                '${c['membersCount'] ?? 50} members • ${c['weeklyXp'] ?? 0} Weekly XP',
                                style: const TextStyle(fontSize: 12, color: AppColors.accentEmerald),
                              ),
                            ],
                          ),
                        ),
                        OutlinedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Joined club successfully!')),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.primary),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          ),
                          child: const Text('Join', style: TextStyle(color: AppColors.primaryLight, fontSize: 12)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      c['description'] ?? '',
                      style: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
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
}
