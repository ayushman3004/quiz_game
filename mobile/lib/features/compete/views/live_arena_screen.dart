import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/live_avatar.dart';
import '../controllers/match_controller.dart';
import 'match_result_screen.dart';

class LiveArenaScreen extends ConsumerWidget {
  final String roomCode;

  const LiveArenaScreen({super.key, required this.roomCode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final matchState = ref.watch(matchControllerProvider(roomCode));
    final controller = ref.read(matchControllerProvider(roomCode).notifier);

    // If game finished, route to results
    if (matchState.screenState == MatchScreenState.finished && matchState.finalResults.isNotEmpty) {
      return MatchResultScreen(
        results: matchState.finalResults,
        roomCode: roomCode,
      );
    }

    // 3-second Start Countdown Screen
    if (matchState.screenState == MatchScreenState.starting) {
      return Scaffold(
        backgroundColor: AppColors.bgDark,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'MATCH STARTING IN',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.0,
                  color: AppColors.accentCyan,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppColors.primaryGradient,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.5),
                      blurRadius: 36,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    '${matchState.countdownSec}',
                    style: const TextStyle(
                      fontSize: 54,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Get ready! Speed and streaks grant bonus points.',
                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              ),
            ],
          ),
        ),
      );
    }

    final currentQ = matchState.currentQuestion;
    final isTimerLow = matchState.remainingSeconds <= 4;
    final isQuestionEnded = matchState.screenState == MatchScreenState.questionEnded;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Top Bar: Room info & Live Points indicator
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDarkElevated,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderGlass),
                    ),
                    child: Text(
                      'ROOM $roomCode',
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w800,
                        color: AppColors.accentCyan,
                        fontSize: 12,
                      ),
                    ),
                  ),

                  // Added Points floating pill
                  if (matchState.lastAddedPoints != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.accentEmerald.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.accentEmerald),
                      ),
                      child: Text(
                        matchState.lastAddedPoints!,
                        style: const TextStyle(
                          color: AppColors.accentEmerald,
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                        ),
                      ),
                    ),

                  // Timer Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: isTimerLow
                          ? AppColors.accentRose.withOpacity(0.25)
                          : AppColors.surfaceDarkElevated,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isTimerLow ? AppColors.accentRose : AppColors.borderGlass,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.timer,
                          size: 14,
                          color: isTimerLow ? AppColors.accentRose : AppColors.accentCyan,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${matchState.remainingSeconds}s',
                          style: TextStyle(
                            color: isTimerLow ? AppColors.accentRose : AppColors.textLight,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Live Leaderboard Pill Bar
              if (matchState.leaderboard.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceDark,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderGlass),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: matchState.leaderboard.take(3).map((entry) {
                      final isFirst = entry.rank == 1;
                      return Row(
                        children: [
                          Text(
                            entry.rank == 1 ? '🥇 ' : (entry.rank == 2 ? '🥈 ' : '🥉 '),
                            style: const TextStyle(fontSize: 12),
                          ),
                          Text(
                            entry.displayName,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isFirst ? FontWeight.w800 : FontWeight.w600,
                              color: isFirst ? AppColors.accentAmber : AppColors.textLight,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${entry.score}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: AppColors.accentEmerald,
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // Linear Countdown Indicator
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: (matchState.currentQIndex + 1) / matchState.totalQuestions,
                  minHeight: 5,
                  backgroundColor: AppColors.surfaceDarkElevated,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              ),
              const SizedBox(height: 16),

              // Question Card & Options
              Expanded(
                child: currentQ == null
                    ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                    : SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            GlassCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'QUESTION ${matchState.currentQIndex + 1} OF ${matchState.totalQuestions}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1.2,
                                      color: AppColors.accentCyan,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    currentQ.questionText,
                                    style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                      height: 1.4,
                                      color: AppColors.textLight,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Options
                            ...currentQ.options.map((option) {
                              final isSelected = matchState.selectedOptionId == option.id;
                              final isCorrect = matchState.correctOptionId == option.id;
                              final isWrongSelection = isQuestionEnded && isSelected && !isCorrect;

                              Color bgColor = AppColors.surfaceDark;
                              Color borderColor = AppColors.borderGlass;

                              if (isQuestionEnded) {
                                if (isCorrect) {
                                  bgColor = AppColors.accentEmerald.withOpacity(0.2);
                                  borderColor = AppColors.accentEmerald;
                                } else if (isWrongSelection) {
                                  bgColor = AppColors.accentRose.withOpacity(0.2);
                                  borderColor = AppColors.accentRose;
                                }
                              } else if (isSelected) {
                                bgColor = AppColors.primary.withOpacity(0.2);
                                borderColor = AppColors.primary;
                              }

                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: GlassCard(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                  backgroundColor: bgColor,
                                  borderColor: borderColor,
                                  onTap: matchState.isAnswerLocked || isQuestionEnded
                                      ? null
                                      : () {
                                          HapticFeedback.lightImpact();
                                          controller.selectAndSubmitOption(option.id);
                                        },
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: isSelected ? AppColors.primary : AppColors.surfaceDarkHighlight,
                                        ),
                                        child: Center(
                                          child: Text(
                                            option.id,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w800,
                                              fontSize: 13,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Text(
                                          option.text,
                                          style: TextStyle(
                                            fontSize: 14.5,
                                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                      if (isQuestionEnded && isCorrect)
                                        const Icon(Icons.check_circle, color: AppColors.accentEmerald, size: 22)
                                      else if (isQuestionEnded && isWrongSelection)
                                        const Icon(Icons.cancel, color: AppColors.accentRose, size: 22)
                                      else if (isSelected)
                                        const Icon(Icons.lock, color: AppColors.primaryLight, size: 18),
                                    ],
                                  ),
                                ),
                              );
                            }),

                            // Explanation Reveal after Question Ended
                            if (isQuestionEnded && matchState.explanation != null) ...[
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceDarkElevated,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.primaryLight.withOpacity(0.3)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'EXPLANATION',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 1.2,
                                        color: AppColors.primaryLight,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      matchState.explanation!,
                                      style: const TextStyle(fontSize: 13, color: AppColors.textLight),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
              ),

              // Answer Status Footer
              if (matchState.isAnswerLocked && !isQuestionEnded)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceDarkElevated,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.lock, color: AppColors.accentCyan, size: 16),
                      SizedBox(width: 8),
                      Text(
                        'Answer locked! Waiting for opponent...',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
