import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/socket/socket_service.dart';
import '../../quiz_engine/models/quiz_models.dart';
import '../models/match_models.dart';

enum MatchScreenState { lobby, starting, questionActive, questionEnded, finished }

class LiveMatchState {
  final String roomCode;
  final String hostId;
  final MatchScreenState screenState;
  final List<RoomPlayerModel> players;
  final int totalQuestions;
  final int currentQIndex;
  final QuestionModel? currentQuestion;
  final int remainingSeconds;
  final String? selectedOptionId;
  final bool isAnswerLocked;
  final String? correctOptionId;
  final String? explanation;
  final List<LiveLeaderboardEntry> leaderboard;
  final List<MatchFinalResult> finalResults;
  final String? lastAddedPoints;
  final int countdownSec;

  LiveMatchState({
    this.roomCode = '',
    this.hostId = '',
    this.screenState = MatchScreenState.lobby,
    this.players = const [],
    this.totalQuestions = 5,
    this.currentQIndex = 0,
    this.currentQuestion,
    this.remainingSeconds = 15,
    this.selectedOptionId,
    this.isAnswerLocked = false,
    this.correctOptionId,
    this.explanation,
    this.leaderboard = const [],
    this.finalResults = const [],
    this.lastAddedPoints,
    this.countdownSec = 3,
  });

  LiveMatchState copyWith({
    String? roomCode,
    String? hostId,
    MatchScreenState? screenState,
    List<RoomPlayerModel>? players,
    int? totalQuestions,
    int? currentQIndex,
    QuestionModel? currentQuestion,
    int? remainingSeconds,
    String? selectedOptionId,
    bool? isAnswerLocked,
    String? correctOptionId,
    String? explanation,
    List<LiveLeaderboardEntry>? leaderboard,
    List<MatchFinalResult>? finalResults,
    String? lastAddedPoints,
    int? countdownSec,
  }) {
    return LiveMatchState(
      roomCode: roomCode ?? this.roomCode,
      hostId: hostId ?? this.hostId,
      screenState: screenState ?? this.screenState,
      players: players ?? this.players,
      totalQuestions: totalQuestions ?? this.totalQuestions,
      currentQIndex: currentQIndex ?? this.currentQIndex,
      currentQuestion: currentQuestion ?? this.currentQuestion,
      remainingSeconds: remainingSeconds ?? this.remainingSeconds,
      selectedOptionId: selectedOptionId ?? this.selectedOptionId,
      isAnswerLocked: isAnswerLocked ?? this.isAnswerLocked,
      correctOptionId: correctOptionId ?? this.correctOptionId,
      explanation: explanation ?? this.explanation,
      leaderboard: leaderboard ?? this.leaderboard,
      finalResults: finalResults ?? this.finalResults,
      lastAddedPoints: lastAddedPoints ?? this.lastAddedPoints,
      countdownSec: countdownSec ?? this.countdownSec,
    );
  }
}

final matchControllerProvider =
    StateNotifierProvider.autoDispose.family<MatchController, LiveMatchState, String>((ref, roomCode) {
  return MatchController(roomCode);
});

class MatchController extends StateNotifier<LiveMatchState> {
  final String roomCode;
  final SocketService _socket = SocketService();
  final List<StreamSubscription> _subscriptions = [];
  Timer? _countdownTimer;

  MatchController(this.roomCode) : super(LiveMatchState(roomCode: roomCode)) {
    _initSubscriptions();
    _socket.joinRoom(roomCode);
  }

  void _initSubscriptions() {
    _subscriptions.add(
      _socket.onRoomUpdated.listen((data) {
        if (data['roomCode'] != roomCode) return;
        final pList = (data['players'] as List? ?? [])
            .map((p) => RoomPlayerModel.fromJson(Map<String, dynamic>.from(p)))
            .toList();

        state = state.copyWith(
          hostId: data['hostId'] ?? state.hostId,
          totalQuestions: data['totalQuestions'] ?? state.totalQuestions,
          players: pList,
        );
      }),
    );

    _subscriptions.add(
      _socket.onGameStarted.listen((data) {
        final sec = data['countdownSec'] ?? 3;
        state = state.copyWith(
          screenState: MatchScreenState.starting,
          countdownSec: sec,
        );
        _startStartingCountdown(sec);
      }),
    );

    _subscriptions.add(
      _socket.onQuestionStarted.listen((data) {
        _countdownTimer?.cancel();
        final qIndex = data['qIndex'] ?? 0;
        final endsAt = data['endsAt'] ?? (DateTime.now().millisecondsSinceEpoch + 15000);
        final now = DateTime.now().millisecondsSinceEpoch;
        final remainingMs = endsAt - now;
        final remainingSec = remainingMs > 0 ? (remainingMs / 1000).ceil() : 15;

        final question = QuestionModel(
          id: '$qIndex',
          questionText: data['questionText'] ?? '',
          options: (data['options'] as List? ?? [])
              .map((o) => OptionModel.fromJson(Map<String, dynamic>.from(o)))
              .toList(),
          durationSec: data['durationSec'] ?? 15,
        );

        state = state.copyWith(
          screenState: MatchScreenState.questionActive,
          currentQIndex: qIndex,
          currentQuestion: question,
          remainingSeconds: remainingSec,
          selectedOptionId: null,
          isAnswerLocked: false,
          correctOptionId: null,
          explanation: null,
        );

        _startQuestionClock();
      }),
    );

    _subscriptions.add(
      _socket.onQuestionEnded.listen((data) {
        _countdownTimer?.cancel();
        state = state.copyWith(
          screenState: MatchScreenState.questionEnded,
          correctOptionId: data['correctOptionId'],
          explanation: data['explanation'],
        );
      }),
    );

    _subscriptions.add(
      _socket.onScoreUpdated.listen((data) {
        final pts = data['addedPoints'];
        final isCorrect = data['isCorrect'] ?? false;
        state = state.copyWith(
          lastAddedPoints: isCorrect ? '+$pts' : '0',
        );
      }),
    );

    _subscriptions.add(
      _socket.onLeaderboardUpdated.listen((list) {
        final entries = list
            .map((e) => LiveLeaderboardEntry.fromJson(Map<String, dynamic>.from(e)))
            .toList();
        state = state.copyWith(leaderboard: entries);
      }),
    );

    _subscriptions.add(
      _socket.onGameFinished.listen((data) {
        _countdownTimer?.cancel();
        final resList = (data['results'] as List? ?? [])
            .map((r) => MatchFinalResult.fromJson(Map<String, dynamic>.from(r)))
            .toList();

        state = state.copyWith(
          screenState: MatchScreenState.finished,
          finalResults: resList,
        );
      }),
    );
  }

  void _startStartingCountdown(int seconds) {
    _countdownTimer?.cancel();
    int count = seconds;
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      count -= 1;
      if (count >= 0) {
        state = state.copyWith(countdownSec: count);
      } else {
        timer.cancel();
      }
    });
  }

  void _startQuestionClock() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.remainingSeconds > 0) {
        state = state.copyWith(remainingSeconds: state.remainingSeconds - 1);
      } else {
        timer.cancel();
      }
    });
  }

  void toggleReady(bool isReady) {
    _socket.setReady(roomCode, isReady);
  }

  void startGame() {
    _socket.startGame(roomCode);
  }

  void selectAndSubmitOption(String optionId) {
    if (state.isAnswerLocked || state.screenState != MatchScreenState.questionActive) return;

    state = state.copyWith(
      selectedOptionId: optionId,
      isAnswerLocked: true,
    );

    _socket.submitAnswer(
      roomCode: roomCode,
      questionIndex: state.currentQIndex,
      optionId: optionId,
    );
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    for (final sub in _subscriptions) {
      sub.cancel();
    }
    super.dispose();
  }
}
