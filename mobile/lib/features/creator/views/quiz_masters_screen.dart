import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/live_avatar.dart';

class QuizMastersScreen extends ConsumerStatefulWidget {
  const QuizMastersScreen({super.key});

  @override
  ConsumerState<QuizMastersScreen> createState() => _QuizMastersScreenState();
}

class _QuizMastersScreenState extends ConsumerState<QuizMastersScreen> {
  List<Map<String, dynamic>> _creators = [];
  bool _isLoading = true;
  final Set<String> _followingIds = {};

  @override
  void initState() {
    super.initState();
    _fetchQuizMasters();
  }

  Future<void> _fetchQuizMasters() async {
    try {
      final res = await DioClient().dio.get(ApiEndpoints.creators);
      if (res.data['success'] == true && res.data['quizMasters'] != null) {
        if (mounted) {
          setState(() {
            _creators = List<Map<String, dynamic>>.from(res.data['quizMasters']);
            _isLoading = false;
          });
          return;
        }
      }
    } catch (_) {}

    // Fallback verified creators
    if (mounted) {
      setState(() {
        _creators = [
          {
            '_id': 'c1',
            'displayName': 'Dr. Ramesh Gupta',
            'username': 'dr_ramesh_gupta',
            'bio': 'Senior Economist, Civil Services Mentor & Author. Specializes in Macroeconomics, Banking, and Fiscal Policy.',
            'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=RameshGupta',
            'followersCount': 8420,
            'publishedQuizzesCount': 42,
            'creatorRating': 4.8,
            'quizzes': [
              {
                '_id': 'q1',
                'title': 'Economics: Demand & Supply Fundamentals',
                'difficulty': 'EASY',
                'questionCount': 4,
                'playCount': 1280,
              },
              {
                '_id': 'q2',
                'title': 'Economics: Monetary Policy & Central Banking',
                'difficulty': 'HARD',
                'questionCount': 4,
                'playCount': 2840,
              },
            ],
          },
          {
            '_id': 'c2',
            'displayName': 'Prof. Ananya Sharma',
            'username': 'prof_ananya',
            'bio': 'Competitive Programmer & CS Professor. Research in Graph Theory, Distributed Algorithms & System Design.',
            'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=AnanyaSharma',
            'followersCount': 12100,
            'publishedQuizzesCount': 36,
            'creatorRating': 4.9,
            'quizzes': [
              {
                '_id': 'q3',
                'title': 'GATE CS: Data Structures & Algorithms Drill',
                'difficulty': 'HARD',
                'questionCount': 4,
                'playCount': 1420,
              },
            ],
          },
          {
            '_id': 'c3',
            'displayName': 'QuizMaster Vikrant',
            'username': 'quizmaster_vikrant',
            'bio': 'National Trivia Champion, Quiz Show Host & Polymath. Creating the fastest, sharpest general knowledge drills.',
            'avatarUrl': 'https://api.dicebear.com/7.x/bottts/svg?seed=VikrantMaster',
            'followersCount': 16800,
            'publishedQuizzesCount': 58,
            'creatorRating': 4.85,
            'quizzes': [],
          },
        ];
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleFollow(String creatorId, String creatorName) async {
    final isFollowing = _followingIds.contains(creatorId);
    setState(() {
      if (isFollowing) {
        _followingIds.remove(creatorId);
      } else {
        _followingIds.add(creatorId);
      }
    });

    try {
      await DioClient().dio.post(ApiEndpoints.followCreator(creatorId));
    } catch (_) {}

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(!isFollowing ? 'Now following $creatorName!' : 'Unfollowed $creatorName'),
          duration: const Duration(seconds: 1),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Quiz Masters'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Substack-style Creator Ecosystem Header
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2E1065), Color(0xFF0F172A)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'QUIZ MASTERS & CREATORS',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                            color: AppColors.accentCyan,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Learn from high-ranking authors, professors and national champions.',
                          style: TextStyle(fontSize: 13, color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Creators List
                  ..._creators.map((c) {
                    final creatorId = c['_id']?.toString() ?? '';
                    final displayName = c['displayName'] ?? '';
                    final username = c['username'] ?? '';
                    final bio = c['bio'] ?? '';
                    final avatarUrl = c['avatarUrl'] ?? '';
                    final followersCount = c['followersCount'] ?? 0;
                    final publishedCount = c['publishedQuizzesCount'] ?? 0;
                    final rating = c['creatorRating'] ?? 4.8;
                    final quizzes = (c['quizzes'] as List?) ?? [];
                    final isFollowing = _followingIds.contains(creatorId);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 18),
                      child: GlassCard(
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header Row
                            Row(
                              children: [
                                LiveAvatar(avatarUrl: avatarUrl, size: 54),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            displayName,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w800,
                                              fontSize: 15.5,
                                              color: AppColors.textLight,
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          const Icon(Icons.verified, color: AppColors.accentCyan, size: 16),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '@$username',
                                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                      ),
                                    ],
                                  ),
                                ),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isFollowing ? AppColors.surfaceDarkElevated : AppColors.primary,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onPressed: () => _toggleFollow(creatorId, displayName),
                                  child: Text(
                                    isFollowing ? 'Following' : 'Follow',
                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12.5),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Bio
                            Text(
                              bio,
                              style: const TextStyle(fontSize: 12.5, height: 1.4, color: AppColors.textLight),
                            ),
                            const SizedBox(height: 14),

                            // Stats Grid: Followers, Rating, Published
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceDarkElevated,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _buildStatItem('Followers', '$followersCount'),
                                  Container(width: 1, height: 24, color: Colors.white12),
                                  _buildStatItem('Rating', '★ $rating'),
                                  Container(width: 1, height: 24, color: Colors.white12),
                                  _buildStatItem('Quizzes', '$publishedCount'),
                                ],
                              ),
                            ),

                            // Creator's Published Quizzes Tray
                            if (quizzes.isNotEmpty) ...[
                              const SizedBox(height: 16),
                              const Text(
                                'PUBLISHED CURRICULUM',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.2,
                                  color: AppColors.textMuted,
                                ),
                              ),
                              const SizedBox(height: 8),
                              ...quizzes.map((q) {
                                final qId = q['_id']?.toString() ?? '';
                                final qTitle = q['title'] ?? 'Quiz';
                                final qDiff = q['difficulty'] ?? 'MEDIUM';
                                final qPlays = q['playCount'] ?? 0;

                                return Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: Colors.black26,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: AppColors.borderGlass),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.bolt, color: AppColors.accentAmber, size: 18),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              qTitle,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 12.5,
                                                color: AppColors.textLight,
                                              ),
                                            ),
                                            Text(
                                              '$qDiff • $qPlays plays',
                                              style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                                            ),
                                          ],
                                        ),
                                      ),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppColors.accentCyan,
                                          foregroundColor: Colors.black,
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          minimumSize: Size.zero,
                                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        onPressed: () => context.push('/quiz/solo/$qId'),
                                        child: const Text('Play Drill', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11.5)),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                            ],
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.textLight),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
        ),
      ],
    );
  }
}
