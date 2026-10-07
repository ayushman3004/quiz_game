import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/socket/socket_service.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';

class CompeteScreen extends ConsumerStatefulWidget {
  const CompeteScreen({super.key});

  @override
  ConsumerState<CompeteScreen> createState() => _CompeteScreenState();
}

class _CompeteScreenState extends ConsumerState<CompeteScreen> {
  bool _isSearchingMatch = false;

  @override
  void initState() {
    super.initState();
    // Listen for matchmaking match found
    SocketService().onMatchmakingFound.listen((data) {
      if (mounted) {
        setState(() => _isSearchingMatch = false);
        final roomCode = data['roomCode'];
        if (roomCode != null) {
          context.push('/compete/arena/$roomCode');
        }
      }
    });
  }

  void _startQuickMatch(String category, String difficulty) {
    setState(() => _isSearchingMatch = true);
    SocketService().startMatchmaking(category, difficulty);

    // Show searching bottom sheet
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isDismissible: false,
      enableDrag: false,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(28),
        decoration: const BoxDecoration(
          color: AppColors.surfaceDark,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          border: Border(top: BorderSide(color: AppColors.borderGlass)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 54,
              height: 54,
              child: CircularProgressIndicator(
                color: AppColors.primaryLight,
                strokeWidth: 4,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'SEARCHING FOR OPPONENT...',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
                color: AppColors.textLight,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Matching rating & category: $category ($difficulty)',
              style: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
            ),
            const SizedBox(height: 28),
            AppButton(
              text: 'Cancel Search',
              isSecondary: true,
              height: 48,
              onPressed: () {
                SocketService().cancelMatchmaking();
                setState(() => _isSearchingMatch = false);
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showJoinRoomDialog() {
    final codeController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Enter Room Code',
          style: TextStyle(color: AppColors.textLight, fontWeight: FontWeight.w800),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Enter the 6-character room code shared by your friend.',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: codeController,
              textCapitalization: TextCapitalization.characters,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                letterSpacing: 4,
                color: AppColors.accentCyan,
              ),
              decoration: const InputDecoration(
                hintText: 'e.g. QZ8K2',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              final code = codeController.text.trim().toUpperCase();
              if (code.isNotEmpty) {
                Navigator.pop(ctx);
                context.push('/compete/lobby/$code');
              }
            },
            child: const Text('Join Lobby', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _createPrivateRoom() {
    final newCode = (DateTime.now().millisecondsSinceEpoch % 1000000).toRadixString(36).toUpperCase();
    context.push('/compete/lobby/$newCode');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Compete Arena'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Hero Quick Match Mode Card
              GlassCard(
                gradient: AppColors.streakGradient,
                padding: const EdgeInsets.all(22),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black38,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            children: [
                              Text('● ', style: TextStyle(color: AppColors.accentEmerald, fontSize: 12)),
                              Text(
                                '3,120 PLAYERS ONLINE',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.flash_on_rounded, color: Colors.white, size: 28),
                      ],
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'QUICK MATCH 1v1',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Jump into an instant high-stakes duel. Ranked matching with live scoring.',
                      style: TextStyle(fontSize: 13.5, color: Colors.white70),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.accentFlame,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      onPressed: () => _startQuickMatch('Computer Science', 'MEDIUM'),
                      child: const Center(
                        child: Text(
                          '⚔ FIND MATCH NOW',
                          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Secondary Modes Grid
              Row(
                children: [
                  // Private Room (Host)
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(18),
                      onTap: _createPrivateRoom,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.add_circle_outline, color: AppColors.primaryLight, size: 24),
                          ),
                          const SizedBox(height: 14),
                          const Text(
                            'Create Room',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textLight),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Host friends with code',
                            style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),

                  // Join Room
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(18),
                      onTap: _showJoinRoomDialog,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.accentCyan.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.pin_outlined, color: AppColors.accentCyan, size: 24),
                          ),
                          const SizedBox(height: 14),
                          const Text(
                            'Enter Code',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textLight),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Join existing lobby',
                            style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Matchmaking Categories Selector
              const Text(
                'Duel by Category',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textLight),
              ),
              const SizedBox(height: 12),
              _buildCategoryTile('GATE CS & Algorithms', 'Hard • 20s per question', Icons.terminal, AppColors.primary),
              _buildCategoryTile('SSC CGL Quantitative', 'Medium • 15s speed test', Icons.calculate, AppColors.accentEmerald),
              _buildCategoryTile('UPSC General Knowledge', 'Hard • 20s per question', Icons.policy, AppColors.accentAmber),
              _buildCategoryTile('Banking & Financial Awareness', 'Medium • 15s speed test', Icons.account_balance, AppColors.accentCyan),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryTile(String title, String sub, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        onTap: () => _startQuickMatch(title, 'MEDIUM'),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textLight),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    sub,
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
