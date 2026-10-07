class RoomPlayerModel {
  final String userId;
  final String displayName;
  final String avatarUrl;
  final int score;
  final int streak;
  final bool isReady;
  final bool isHost;
  final bool isConnected;

  RoomPlayerModel({
    required this.userId,
    required this.displayName,
    required this.avatarUrl,
    this.score = 0,
    this.streak = 0,
    this.isReady = false,
    this.isHost = false,
    this.isConnected = true,
  });

  factory RoomPlayerModel.fromJson(Map<String, dynamic> json) {
    return RoomPlayerModel(
      userId: json['userId'] ?? '',
      displayName: json['displayName'] ?? 'Player',
      avatarUrl: json['avatarUrl'] ?? 'https://api.dicebear.com/7.x/bottts/svg?seed=player',
      score: json['score'] ?? 0,
      streak: json['streak'] ?? 0,
      isReady: json['isReady'] ?? false,
      isHost: json['isHost'] ?? false,
      isConnected: json['isConnected'] ?? true,
    );
  }
}

class LiveLeaderboardEntry {
  final int rank;
  final String userId;
  final String displayName;
  final String avatarUrl;
  final int score;
  final int streak;

  LiveLeaderboardEntry({
    required this.rank,
    required this.userId,
    required this.displayName,
    required this.avatarUrl,
    required this.score,
    this.streak = 0,
  });

  factory LiveLeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LiveLeaderboardEntry(
      rank: json['rank'] ?? 1,
      userId: json['userId'] ?? '',
      displayName: json['displayName'] ?? 'Player',
      avatarUrl: json['avatarUrl'] ?? 'https://api.dicebear.com/7.x/bottts/svg?seed=player',
      score: json['score'] ?? 0,
      streak: json['streak'] ?? 0,
    );
  }
}

class MatchFinalResult {
  final int rank;
  final String userId;
  final String displayName;
  final String avatarUrl;
  final int score;
  final int accuracy;
  final int correctCount;
  final int wrongCount;
  final int xpEarned;
  final int coinsEarned;
  final int ratingDelta;

  MatchFinalResult({
    required this.rank,
    required this.userId,
    required this.displayName,
    required this.avatarUrl,
    required this.score,
    required this.accuracy,
    required this.correctCount,
    required this.wrongCount,
    required this.xpEarned,
    required this.coinsEarned,
    required this.ratingDelta,
  });

  factory MatchFinalResult.fromJson(Map<String, dynamic> json) {
    return MatchFinalResult(
      rank: json['rank'] ?? 1,
      userId: json['userId'] ?? '',
      displayName: json['displayName'] ?? 'Player',
      avatarUrl: json['avatarUrl'] ?? 'https://api.dicebear.com/7.x/bottts/svg?seed=player',
      score: json['score'] ?? 0,
      accuracy: json['accuracy'] ?? 0,
      correctCount: json['correctCount'] ?? 0,
      wrongCount: json['wrongCount'] ?? 0,
      xpEarned: json['xpEarned'] ?? 0,
      coinsEarned: json['coinsEarned'] ?? 0,
      ratingDelta: json['ratingDelta'] ?? 0,
    );
  }
}
