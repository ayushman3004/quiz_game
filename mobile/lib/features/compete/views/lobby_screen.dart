import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/live_avatar.dart';
import '../controllers/match_controller.dart';
import '../../auth/controllers/auth_controller.dart';

class LobbyScreen extends ConsumerStatefulWidget {
  final String roomCode;

  const LobbyScreen({super.key, required this.roomCode});

  @override
  ConsumerState<LobbyScreen> createState() => _LobbyScreenState();
}

class _LobbyScreenState extends ConsumerState<LobbyScreen> {
  bool _isReady = false;

  @override
  Widget build(BuildContext context) {
    final matchState = ref.watch(matchControllerProvider(widget.roomCode));
    final controller = ref.read(matchControllerProvider(widget.roomCode).notifier);
    final currentUserId = ref.watch(authControllerProvider).asData?.value?.id ?? '';

    // If game has started or is in progress, navigate to Live Arena
    if (matchState.screenState == MatchScreenState.starting ||
        matchState.screenState == MatchScreenState.questionActive) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.pushReplacement('/compete/arena/${widget.roomCode}');
      });
    }

    final isHost = matchState.hostId == currentUserId || matchState.players.isEmpty;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Match Lobby'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Room Code Card
              GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  children: [
                    const Text(
                      'ROOM CODE',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.5,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          widget.roomCode,
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 6,
                            color: AppColors.accentCyan,
                          ),
                        ),
                        const SizedBox(width: 12),
                        IconButton(
                          icon: const Icon(Icons.copy, color: AppColors.primaryLight, size: 20),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: widget.roomCode));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Room code copied to clipboard!')),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Share this code with friends to join the match',
                      style: TextStyle(fontSize: 12.5, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Players in Room
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'PLAYERS (${matchState.players.length}/4)',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                      color: AppColors.textLight,
                    ),
                  ),
                  const Text(
                    'Best of 5 Questions',
                    style: TextStyle(fontSize: 12, color: AppColors.accentEmerald, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Player List
              Expanded(
                child: matchState.players.isEmpty
                    ? _buildEmptyLobby()
                    : ListView.builder(
                        itemCount: matchState.players.length,
                        itemBuilder: (context, index) {
                          final player = matchState.players[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              child: Row(
                                children: [
                                  LiveAvatar(avatarUrl: player.avatarUrl, size: 44),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Text(
                                              player.displayName,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 15,
                                                color: AppColors.textLight,
                                              ),
                                            ),
                                            if (player.isHost) ...[
                                              const SizedBox(width: 6),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: AppColors.primary.withOpacity(0.2),
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: const Text(
                                                  'HOST',
                                                  style: TextStyle(
                                                    color: AppColors.primaryLight,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.w800,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                        Text(
                                          player.isConnected ? 'Connected' : 'Disconnected',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: player.isConnected ? AppColors.accentEmerald : AppColors.accentRose,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: player.isReady
                                          ? AppColors.accentEmerald.withOpacity(0.15)
                                          : AppColors.surfaceDarkElevated,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          player.isReady ? Icons.check_circle : Icons.circle_outlined,
                                          color: player.isReady ? AppColors.accentEmerald : AppColors.textMuted,
                                          size: 16,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          player.isReady ? 'Ready' : 'Waiting',
                                          style: TextStyle(
                                            color: player.isReady ? AppColors.accentEmerald : AppColors.textMuted,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),

              // Action Buttons
              if (isHost) ...[
                AppButton(
                  text: 'START GAME',
                  gradient: AppColors.streakGradient,
                  onPressed: () => controller.startGame(),
                ),
                const SizedBox(height: 12),
              ],

              AppButton(
                text: _isReady ? 'CANCEL READY' : 'I AM READY ✓',
                isSecondary: isHost,
                onPressed: () {
                  setState(() => _isReady = !_isReady);
                  controller.toggleReady(_isReady);
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyLobby() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: AppColors.primary),
          const SizedBox(height: 16),
          Text(
            'Connecting to room ${widget.roomCode}...',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 14),
          ),
        ],
      ),
    );
  }
}
