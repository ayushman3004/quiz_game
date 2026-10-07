class UserStats {
  final int gamesPlayed;
  final int gamesWon;
  final int totalQuestionsAnswered;
  final int correctAnswers;
  final int avgResponseTimeMs;

  UserStats({
    this.gamesPlayed = 0,
    this.gamesWon = 0,
    this.totalQuestionsAnswered = 0,
    this.correctAnswers = 0,
    this.avgResponseTimeMs = 0,
  });

  double get accuracy {
    if (totalQuestionsAnswered == 0) return 0.0;
    return (correctAnswers / totalQuestionsAnswered) * 100;
  }

  factory UserStats.fromJson(Map<String, dynamic>? json) {
    if (json == null) return UserStats();
    return UserStats(
      gamesPlayed: json['gamesPlayed'] ?? 0,
      gamesWon: json['gamesWon'] ?? 0,
      totalQuestionsAnswered: json['totalQuestionsAnswered'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      avgResponseTimeMs: json['avgResponseTimeMs'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'gamesPlayed': gamesPlayed,
        'gamesWon': gamesWon,
        'totalQuestionsAnswered': totalQuestionsAnswered,
        'correctAnswers': correctAnswers,
        'avgResponseTimeMs': avgResponseTimeMs,
      };
}

class UserModel {
  final String id;
  final String username;
  final String email;
  final String displayName;
  final String avatarUrl;
  final String role;
  final int xp;
  final int level;
  final int coins;
  final int currentStreak;
  final int longestStreak;
  final int rating;
  final int xpProgress;
  final int nextLevelXp;
  final UserStats stats;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.displayName,
    required this.avatarUrl,
    this.role = 'USER',
    this.xp = 0,
    this.level = 1,
    this.coins = 100,
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.rating = 1200,
    this.xpProgress = 0,
    this.nextLevelXp = 100,
    UserStats? stats,
  }) : stats = stats ?? UserStats();

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      displayName: json['displayName'] ?? json['username'] ?? 'Player',
      avatarUrl: json['avatarUrl'] ?? 'https://api.dicebear.com/7.x/bottts/svg?seed=player',
      role: json['role'] ?? 'USER',
      xp: json['xp'] ?? 0,
      level: json['level'] ?? 1,
      coins: json['coins'] ?? 100,
      currentStreak: json['currentStreak'] ?? 0,
      longestStreak: json['longestStreak'] ?? 0,
      rating: json['rating'] ?? 1200,
      xpProgress: json['xpProgress'] ?? 0,
      nextLevelXp: json['nextLevelXp'] ?? 100,
      stats: UserStats.fromJson(json['stats']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'email': email,
        'displayName': displayName,
        'avatarUrl': avatarUrl,
        'role': role,
        'xp': xp,
        'level': level,
        'coins': coins,
        'currentStreak': currentStreak,
        'longestStreak': longestStreak,
        'rating': rating,
        'xpProgress': xpProgress,
        'nextLevelXp': nextLevelXp,
        'stats': stats.toJson(),
      };
}
