import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/widgets/app_button.dart';
import 'package:mobile/core/widgets/streak_badge.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:mobile/features/quiz_engine/models/quiz_models.dart';
import 'package:mobile/features/quiz_engine/controllers/solo_quiz_controller.dart';

void main() {
  group('UserModel Tests', () {
    test('Calculates user accuracy correctly', () {
      final stats = UserStats(
        gamesPlayed: 10,
        gamesWon: 8,
        totalQuestionsAnswered: 50,
        correctAnswers: 40,
        avgResponseTimeMs: 2200,
      );

      expect(stats.accuracy, 80.0);
    });

    test('Serializes and deserializes UserModel accurately', () {
      final user = UserModel(
        id: 'user_123',
        username: 'coder_pro',
        email: 'coder@quiz.io',
        displayName: 'Coder Pro',
        avatarUrl: 'https://example.com/avatar.png',
        level: 5,
        xp: 2400,
        coins: 350,
        currentStreak: 9,
      );

      final json = user.toJson();
      final parsed = UserModel.fromJson(json);

      expect(parsed.id, 'user_123');
      expect(parsed.username, 'coder_pro');
      expect(parsed.level, 5);
      expect(parsed.coins, 350);
      expect(parsed.currentStreak, 9);
    });
  });

  group('SoloQuizState Tests', () {
    test('State copyWith updates current index and option locking', () {
      final state = SoloQuizState(
        questions: [
          QuestionModel(
            id: 'q1',
            questionText: 'What is 2 + 2?',
            options: [OptionModel(id: 'A', text: '4')],
          ),
        ],
      );

      final updated = state.copyWith(
        selectedOptionId: 'A',
        isAnswerLocked: true,
      );

      expect(updated.selectedOptionId, 'A');
      expect(updated.isAnswerLocked, true);
    });
  });

  group('Widget Tests', () {
    testWidgets('StreakBadge displays flame and day count', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StreakBadge(streakDays: 14),
          ),
        ),
      );

      expect(find.text('🔥'), findsOneWidget);
      expect(find.text('14 Days'), findsOneWidget);
    });

    testWidgets('AppButton triggers onPressed callback when tapped', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              text: 'Start Duel',
              onPressed: () => tapped = true,
            ),
          ),
        ),
      );

      expect(find.text('Start Duel'), findsOneWidget);
      await tester.tap(find.text('Start Duel'));
      await tester.pump();

      expect(tapped, true);
    });
  });
}
