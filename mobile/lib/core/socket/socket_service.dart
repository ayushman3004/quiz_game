import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/api_endpoints.dart';
import '../storage/storage_service.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  bool get isConnected => _socket?.connected ?? false;

  // Event Streams
  final _roomUpdatedController = StreamController<Map<String, dynamic>>.broadcast();
  final _matchmakingFoundController = StreamController<Map<String, dynamic>>.broadcast();
  final _gameStartedController = StreamController<Map<String, dynamic>>.broadcast();
  final _questionStartedController = StreamController<Map<String, dynamic>>.broadcast();
  final _questionEndedController = StreamController<Map<String, dynamic>>.broadcast();
  final _scoreUpdatedController = StreamController<Map<String, dynamic>>.broadcast();
  final _leaderboardUpdatedController = StreamController<List<dynamic>>.broadcast();
  final _gameFinishedController = StreamController<Map<String, dynamic>>.broadcast();
  final _playerDisconnectedController = StreamController<Map<String, dynamic>>.broadcast();
  final _playerReconnectedController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get onRoomUpdated => _roomUpdatedController.stream;
  Stream<Map<String, dynamic>> get onMatchmakingFound => _matchmakingFoundController.stream;
  Stream<Map<String, dynamic>> get onGameStarted => _gameStartedController.stream;
  Stream<Map<String, dynamic>> get onQuestionStarted => _questionStartedController.stream;
  Stream<Map<String, dynamic>> get onQuestionEnded => _questionEndedController.stream;
  Stream<Map<String, dynamic>> get onScoreUpdated => _scoreUpdatedController.stream;
  Stream<List<dynamic>> get onLeaderboardUpdated => _leaderboardUpdatedController.stream;
  Stream<Map<String, dynamic>> get onGameFinished => _gameFinishedController.stream;
  Stream<Map<String, dynamic>> get onPlayerDisconnected => _playerDisconnectedController.stream;
  Stream<Map<String, dynamic>> get onPlayerReconnected => _playerReconnectedController.stream;

  Future<void> connect() async {
    if (_socket != null && _socket!.connected) return;

    final token = await StorageService().getToken();

    _socket = IO.io(
      ApiEndpoints.socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionDelay(1000)
          .setReconnectionAttempts(10)
          .setAuth({'token': token ?? ''})
          .build(),
    );

    _socket!.onConnect((_) {
      print('⚡ Socket connected: ${_socket!.id}');
    });

    _socket!.onDisconnect((_) {
      print('🔌 Socket disconnected');
    });

    _socket!.on('room_updated', (data) {
      if (data is Map) _roomUpdatedController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('matchmaking_found', (data) {
      if (data is Map) _matchmakingFoundController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('game_started', (data) {
      if (data is Map) _gameStartedController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('question_started', (data) {
      if (data is Map) _questionStartedController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('question_ended', (data) {
      if (data is Map) _questionEndedController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('score_updated', (data) {
      if (data is Map) _scoreUpdatedController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('leaderboard_updated', (data) {
      if (data is List) _leaderboardUpdatedController.add(data);
    });

    _socket!.on('game_finished', (data) {
      if (data is Map) _gameFinishedController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('player_disconnected', (data) {
      if (data is Map) _playerDisconnectedController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('player_reconnected', (data) {
      if (data is Map) _playerReconnectedController.add(Map<String, dynamic>.from(data));
    });
  }

  void emit(String event, dynamic data) {
    if (_socket != null) {
      _socket!.emit(event, data);
    }
  }

  void joinRoom(String roomCode, [String? quizId]) {
    emit('join_room', {'roomCode': roomCode, if (quizId != null) 'quizId': quizId});
  }

  void setReady(String roomCode, bool isReady) {
    emit('player_ready', {'roomCode': roomCode, 'isReady': isReady});
  }

  void startGame(String roomCode) {
    emit('start_game', {'roomCode': roomCode});
  }

  void submitAnswer({
    required String roomCode,
    required int questionIndex,
    required String optionId,
  }) {
    emit('submit_answer', {
      'roomCode': roomCode,
      'questionIndex': questionIndex,
      'optionId': optionId,
    });
  }

  void startMatchmaking(String category, String difficulty) {
    emit('matchmaking_queue', {'category': category, 'difficulty': difficulty});
  }

  void cancelMatchmaking() {
    emit('matchmaking_cancel', {});
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
