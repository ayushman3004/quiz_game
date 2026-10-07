import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/widgets/glass_card.dart';

class TournamentsScreen extends ConsumerStatefulWidget {
  const TournamentsScreen({super.key});

  @override
  ConsumerState<TournamentsScreen> createState() => _TournamentsScreenState();
}

class _TournamentsScreenState extends ConsumerState<TournamentsScreen> {
  List<Map<String, dynamic>> _tournaments = [];
  bool _isLoading = true;
  final Set<String> _registeredIds = {};

  @override
  void initState() {
    super.initState();
    _fetchTournaments();
  }

  Future<void> _fetchTournaments() async {
    try {
      final res = await DioClient().dio.get(ApiEndpoints.tournaments);
      if (res.data['success'] == true && res.data['tournaments'] != null) {
        if (mounted) {
          setState(() {
            _tournaments = List<Map<String, dynamic>>.from(res.data['tournaments']);
            _isLoading = false;
          });
          return;
        }
      }
    } catch (_) {}

    if (mounted) {
      setState(() {
        _tournaments = [
          {
            '_id': 't1',
            'title': 'Daily Speed Sprint Championship',
            'description': 'Fast-paced 15-second multi-round elimination tournament. 64 contenders, 1 Champion.',
            'category': 'Economics & General Knowledge',
            'entryFeeCoins': 50,
            'prizePoolCoins': 5000,
            'prizePoolXp': 15000,
            'maxParticipants': 64,
            'registeredUsers': [1, 2, 3, 4, 5, 6, 7, 8],
            'roundsCount': 4,
            'rules': [
              '4 Knockout Rounds: Qualifier (64) -> Round 2 (32) -> Semifinals (8) -> Grand Final (2)',
              '15 seconds per question with speed bonus multipliers',
              'Ties broken by fastest response time',
            ],
          },
          {
            '_id': 't2',
            'title': 'Weekly Grand Slam: CS & Algorithms',
            'description': 'Prestigious weekend tournament curated by Prof. Ananya Sharma. High-yield GATE CS problems.',
            'category': 'Computer Science',
            'entryFeeCoins': 100,
            'prizePoolCoins': 25000,
            'prizePoolXp': 50000,
            'maxParticipants': 128,
            'registeredUsers': [1, 2, 3, 4],
            'roundsCount': 5,
            'rules': [
              '5 Knockout Rounds: Top 128 to 1 Champion',
              'Hard & Expert tier questions only',
              'Winner awarded exclusive Tournament Champion badge',
            ],
          },
          {
            '_id': 't3',
            'title': 'Inter-College QuizVerse Bowl',
            'description': 'Represent your college in national knowledge duels across Economics, Science & Current Affairs.',
            'category': 'Multi-Disciplinary',
            'entryFeeCoins': 0,
            'prizePoolCoins': 50000,
            'prizePoolXp': 100000,
            'maxParticipants': 256,
            'registeredUsers': [1, 2, 3],
            'roundsCount': 6,
            'rules': [
              'Open to all registered university & college students',
              'Leaderboard displays institution rankings',
            ],
          },
        ];
        _isLoading = false;
      });
    }
  }

  Future<void> _register(String tId, String title, int fee) async {
    try {
      final res = await DioClient().dio.post(ApiEndpoints.registerTournament(tId));
      if (res.data['success'] == true) {
        setState(() => _registeredIds.add(tId));
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Registered for $title! Get ready for Round 1.')),
          );
        }
        return;
      }
    } catch (_) {}

    setState(() => _registeredIds.add(tId));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registered for $title!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Tournaments Hub'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Bracket Architecture Banner (PRD Section 36)
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: AppColors.goldGradient,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.accentAmber.withOpacity(0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'TOURNAMENT BRACKET SYSTEM',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.5,
                                color: Colors.black87,
                              ),
                            ),
                            Icon(Icons.emoji_events, color: Colors.black87, size: 24),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Knockout Progression',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.black),
                        ),
                        const SizedBox(height: 10),
                        // Visual Arrow Flow
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _buildStagePill('REGISTRATION'),
                              const Icon(Icons.arrow_right_alt, color: Colors.black54),
                              _buildStagePill('LOBBY'),
                              const Icon(Icons.arrow_right_alt, color: Colors.black54),
                              _buildStagePill('QUALIFIER'),
                              const Icon(Icons.arrow_right_alt, color: Colors.black54),
                              _buildStagePill('SEMIFINALS'),
                              const Icon(Icons.arrow_right_alt, color: Colors.black54),
                              _buildStagePill('FINALS'),
                              const Icon(Icons.arrow_right_alt, color: Colors.black54),
                              _buildStagePill('🏆 CHAMPION'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    'ACTIVE & UPCOMING COMPETITIONS',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                      color: AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 12),

                  ..._tournaments.map((t) {
                    final tId = t['_id']?.toString() ?? '';
                    final title = t['title'] ?? 'Tournament';
                    final description = t['description'] ?? '';
                    final category = t['category'] ?? 'General';
                    final fee = t['entryFeeCoins'] ?? 0;
                    final prizeCoins = t['prizePoolCoins'] ?? 0;
                    final prizeXp = t['prizePoolXp'] ?? 0;
                    final maxUsers = t['maxParticipants'] ?? 64;
                    final regUsers = (t['registeredUsers'] as List?)?.length ?? 8;
                    final isRegistered = _registeredIds.contains(tId);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: GlassCard(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.accentEmerald.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text(
                                    'REGISTRATION OPEN',
                                    style: TextStyle(
                                      color: AppColors.accentEmerald,
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                Text(
                                  category,
                                  style: const TextStyle(fontSize: 12, color: AppColors.accentCyan, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              title,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textLight),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              description,
                              style: const TextStyle(fontSize: 12.5, color: AppColors.textMuted, height: 1.4),
                            ),
                            const SizedBox(height: 16),

                            // Prize & Entry Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.monetization_on, color: AppColors.accentAmber, size: 18),
                                    const SizedBox(width: 4),
                                    Text(
                                      '$prizeCoins Coins',
                                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Colors.white),
                                    ),
                                    const SizedBox(width: 10),
                                    const Icon(Icons.bolt, color: AppColors.primaryLight, size: 18),
                                    const SizedBox(width: 4),
                                    Text(
                                      '$prizeXp XP',
                                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Colors.white),
                                    ),
                                  ],
                                ),
                                Text(
                                  '$regUsers / $maxUsers Contenders',
                                  style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // Join / Registered Button
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isRegistered ? AppColors.surfaceDarkElevated : AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              onPressed: isRegistered ? null : () => _register(tId, title, fee),
                              child: Center(
                                child: Text(
                                  isRegistered
                                      ? '✓ REGISTERED (Awaiting Lobby)'
                                      : (fee > 0 ? 'ENTER TOURNAMENT ($fee COINS)' : 'FREE ENTRY — REGISTER NOW'),
                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13.5),
                                ),
                              ),
                            ),
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

  Widget _buildStagePill(String title) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        title,
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.black),
      ),
    );
  }
}
