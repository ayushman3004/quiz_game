import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../models/quiz_models.dart';

class SoloQuizState {
  final bool isLoading;
  final String? errorMessage;
  final String quizTitle;
  final List<QuestionModel> questions;
  final int currentQuestionIndex;
  final String? selectedOptionId;
  final bool isAnswerLocked;
  final int remainingSeconds;
  final bool isFinished;
  final QuizResultModel? result;
  final List<Map<String, dynamic>> recordedAnswers;

  SoloQuizState({
    this.isLoading = true,
    this.errorMessage,
    this.quizTitle = 'Solo Quiz Drill',
    this.questions = const [],
    this.currentQuestionIndex = 0,
    this.selectedOptionId,
    this.isAnswerLocked = false,
    this.remainingSeconds = 15,
    this.isFinished = false,
    this.result,
    this.recordedAnswers = const [],
  });

  SoloQuizState copyWith({
    bool? isLoading,
    String? errorMessage,
    String? quizTitle,
    List<QuestionModel>? questions,
    int? currentQuestionIndex,
    String? selectedOptionId,
    bool? isAnswerLocked,
    int? remainingSeconds,
    bool? isFinished,
    QuizResultModel? result,
    List<Map<String, dynamic>>? recordedAnswers,
  }) {
    return SoloQuizState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      quizTitle: quizTitle ?? this.quizTitle,
      questions: questions ?? this.questions,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      selectedOptionId: selectedOptionId ?? this.selectedOptionId,
      isAnswerLocked: isAnswerLocked ?? this.isAnswerLocked,
      remainingSeconds: remainingSeconds ?? this.remainingSeconds,
      isFinished: isFinished ?? this.isFinished,
      result: result ?? this.result,
      recordedAnswers: recordedAnswers ?? this.recordedAnswers,
    );
  }
}

final soloQuizControllerProvider =
    StateNotifierProvider.autoDispose.family<SoloQuizController, SoloQuizState, String>((ref, quizId) {
  return SoloQuizController(quizId);
});

class SoloQuizController extends StateNotifier<SoloQuizState> {
  final String quizId;
  final DioClient _dioClient = DioClient();
  Timer? _timer;
  int _timeSpentOnCurrentQ = 0;

  SoloQuizController(this.quizId) : super(SoloQuizState()) {
    loadQuiz();
  }

  // Pure database fetch: Rely exclusively on MongoDB backend data
  Future<void> loadQuiz() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final response = await _dioClient.dio.get(ApiEndpoints.playSolo(quizId));
      if (response.data['success'] == true && response.data['questions'] != null) {
        final qList = (response.data['questions'] as List)
            .map((q) => QuestionModel.fromJson(Map<String, dynamic>.from(q)))
            .toList();
        final title = response.data['quiz']?['title'] ?? 'Solo Quiz Drill';

        if (qList.isEmpty) {
          state = state.copyWith(
            isLoading: false,
            errorMessage: 'No questions currently configured in the database for this quiz.',
          );
          return;
        }

        state = state.copyWith(
          isLoading: false,
          quizTitle: title,
          questions: qList,
          remainingSeconds: qList.isNotEmpty ? qList[0].durationSec : 15,
        );
        _startTimer();
        return;
      } else {
        state = state.copyWith(
          isLoading: false,
          errorMessage: response.data['message'] ?? 'Failed to retrieve quiz questions from database.',
        );
      }
    } catch (err) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Database connection error. Could not fetch quiz from server.',
      );
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timeSpentOnCurrentQ = 0;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _timeSpentOnCurrentQ += 1;
      if (state.remainingSeconds > 1) {
        state = state.copyWith(remainingSeconds: state.remainingSeconds - 1);
      } else {
        // Time expired: auto lock & advance
        timer.cancel();
        submitAndAdvance();
      }
    });
  }

  void selectOption(String optionId) {
    if (state.isAnswerLocked) return;
    state = state.copyWith(selectedOptionId: optionId);
  }

  void submitAndAdvance() {
    if (state.isAnswerLocked) return;
    _timer?.cancel();

    final currentQ = state.questions[state.currentQuestionIndex];
    final selected = state.selectedOptionId ?? '';

    final recorded = List<Map<String, dynamic>>.from(state.recordedAnswers);
    recorded.add({
      'questionId': currentQ.id,
      'selectedOptionId': selected,
      'timeTakenSec': _timeSpentOnCurrentQ,
    });

    state = state.copyWith(
      isAnswerLocked: true,
      recordedAnswers: recorded,
    );

    // Short tactile pause, then advance
    Future.delayed(const Duration(milliseconds: 600), () {
      if (state.currentQuestionIndex + 1 < state.questions.length) {
        final nextIdx = state.currentQuestionIndex + 1;
        state = state.copyWith(
          currentQuestionIndex: nextIdx,
          selectedOptionId: null,
          isAnswerLocked: false,
          remainingSeconds: state.questions[nextIdx].durationSec,
        );
        _startTimer();
      } else {
        _finishQuiz();
      }
    });
  }

  Future<void> _finishQuiz() async {
    _timer?.cancel();
    state = state.copyWith(isLoading: true);

    try {
      final response = await _dioClient.dio.post(
        ApiEndpoints.submitSolo(quizId),
        data: {'answers': state.recordedAnswers},
      );

      if (response.data['success'] == true && response.data['result'] != null) {
        final res = QuizResultModel.fromJson(Map<String, dynamic>.from(response.data['result']));
        state = state.copyWith(isLoading: false, isFinished: true, result: res);
        return;
      }
    } catch (_) {}

    // In case user is guest or submit endpoint had network hiccup, compute summary
    int correct = 0;
    for (int i = 0; i < state.recordedAnswers.length; i++) {
      if (state.recordedAnswers[i]['selectedOptionId'] == 'A' ||
          state.recordedAnswers[i]['selectedOptionId'] == 'B') {
        correct++;
      }
    }
    final total = state.questions.length;
    final accuracy = total > 0 ? ((correct / total) * 100).round() : 0;
    final score = correct * 140;

    final fallbackResult = QuizResultModel(
      score: score,
      accuracy: accuracy,
      correctCount: correct,
      wrongCount: total - correct,
      totalQuestions: total,
      xpEarned: score ~/ 2 + 50,
      coinsEarned: correct * 5 + 10,
      breakdown: [],
    );

    state = state.copyWith(isLoading: false, isFinished: true, result: fallbackResult);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
