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

class PlayerArchetype {
  final String name;
  final String label;
  final String icon;
  final String description;

  PlayerArchetype({
    required this.name,
    required this.label,
    required this.icon,
    required this.description,
  });

  factory PlayerArchetype.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return PlayerArchetype(
        name: 'Specialist',
        label: 'Focused Competitor',
        icon: '🔬',
        description: 'Dominates specialized high-yield drills.',
      );
    }
    return PlayerArchetype(
      name: json['name'] ?? 'Specialist',
      label: json['label'] ?? 'Focused Competitor',
      icon: json['icon'] ?? '🔬',
      description: json['description'] ?? '',
    );
  }
}

class PlayerAchievement {
  final String id;
  final String name;
  final String description;
  final String icon;
  final bool isUnlocked;

  PlayerAchievement({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.isUnlocked,
  });

  factory PlayerAchievement.fromJson(Map<String, dynamic> json) {
    return PlayerAchievement(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? '🏆',
      isUnlocked: json['isUnlocked'] == true,
    );
  }
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
  final int followersCount;
  final int followingCount;
  final UserStats stats;
  final PlayerArchetype archetype;
  final List<PlayerAchievement> achievements;

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
    this.followersCount = 0,
    this.followingCount = 0,
    UserStats? stats,
    PlayerArchetype? archetype,
    List<PlayerAchievement>? achievements,
  })  : stats = stats ?? UserStats(),
        archetype = archetype ??
            PlayerArchetype(
              name: 'Specialist',
              label: 'Focused Competitor',
              icon: '🔬',
              description: 'Dominates specialized high-yield drills.',
            ),
        achievements = achievements ?? [];

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
      followersCount: json['followersCount'] ?? 0,
      followingCount: json['followingCount'] ?? 0,
      stats: UserStats.fromJson(json['stats']),
      archetype: PlayerArchetype.fromJson(json['archetype']),
      achievements: (json['achievements'] as List?)
              ?.map((a) => PlayerAchievement.fromJson(Map<String, dynamic>.from(a)))
              .toList() ??
          [],
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
        'followersCount': followersCount,
        'followingCount': followingCount,
        'stats': stats.toJson(),
      };
}
