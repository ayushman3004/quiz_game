import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import '../controllers/solo_quiz_controller.dart';
import 'solo_results_screen.dart';

class SoloQuizScreen extends ConsumerWidget {
  final String quizId;

  const SoloQuizScreen({super.key, required this.quizId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quizState = ref.watch(soloQuizControllerProvider(quizId));
    final controller = ref.read(soloQuizControllerProvider(quizId).notifier);

    if (quizState.isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.bgDark,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (quizState.isFinished && quizState.result != null) {
      return SoloResultsScreen(result: quizState.result!, quizTitle: quizState.quizTitle);
    }

    if (quizState.errorMessage != null || quizState.questions.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.bgDark,
        appBar: AppBar(title: const Text('Quiz Drill')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.cloud_off_rounded, color: AppColors.accentRose, size: 56),
                const SizedBox(height: 16),
                Text(
                  quizState.errorMessage ?? 'No questions found in database.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textLight, fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 20),
                AppButton(
                  text: '🔄 Retry DB Fetch',
                  onPressed: () => controller.loadQuiz(),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final currentQ = quizState.questions[quizState.currentQuestionIndex];
    final totalQ = quizState.questions.length;
    final isTimerLow = quizState.remainingSeconds <= 4;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: Text(
          quizState.quizTitle,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => _confirmExit(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Progress Bar & Question Counter
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'QUESTION ${quizState.currentQuestionIndex + 1} OF $totalQ',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                      color: AppColors.textMuted,
                    ),
                  ),

                  // Timer Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isTimerLow
                          ? AppColors.accentRose.withOpacity(0.2)
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
                          '${quizState.remainingSeconds}s',
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
              const SizedBox(height: 8),

              // Animated linear progress
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: (quizState.currentQuestionIndex + 1) / totalQ,
                  minHeight: 5,
                  backgroundColor: AppColors.surfaceDarkElevated,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              ),
              const SizedBox(height: 20),

              // Question Card
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      GlassCard(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              currentQ.questionText,
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                height: 1.4,
                                color: AppColors.textLight,
                              ),
                            ),
                            if (currentQ.codeSnippet != null) ...[
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.black54,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.white12),
                                ),
                                child: Text(
                                  currentQ.codeSnippet!,
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 13,
                                    color: AppColors.accentCyan,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Options (A, B, C, D)
                      ...currentQ.options.map((option) {
                        final isSelected = quizState.selectedOptionId == option.id;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: GlassCard(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            backgroundColor: isSelected
                                ? AppColors.primary.withOpacity(0.18)
                                : AppColors.surfaceDark,
                            borderColor: isSelected ? AppColors.primary : AppColors.borderGlass,
                            onTap: quizState.isAnswerLocked
                                ? null
                                : () => controller.selectOption(option.id),
                            child: Row(
                              children: [
                                Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isSelected ? AppColors.primary : AppColors.surfaceDarkHighlight,
                                    border: Border.all(
                                      color: isSelected ? Colors.white : Colors.transparent,
                                      width: 1.5,
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      option.id,
                                      style: TextStyle(
                                        color: isSelected ? Colors.white : AppColors.textLight,
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
                                      color: isSelected ? Colors.white : AppColors.textLight,
                                    ),
                                  ),
                                ),
                                if (isSelected)
                                  const Icon(Icons.check_circle, color: AppColors.primaryLight, size: 20),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Submit / Next Button
              AppButton(
                text: quizState.currentQuestionIndex + 1 == totalQ ? 'Submit Quiz' : 'Lock & Next Question',
                onPressed: quizState.selectedOptionId != null && !quizState.isAnswerLocked
                    ? () => controller.submitAndAdvance()
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmExit(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceDark,
        title: const Text('Leave Quiz?'),
        content: const Text('Your current attempt progress will be discarded.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Continue Quiz', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRose),
            onPressed: () {
              Navigator.pop(ctx);
              context.pop();
            },
            child: const Text('Exit', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
