class JourneyTopic {
  final String id;
  final String name;
  final bool isCompleted;
  final int questionsCount;

  JourneyTopic({
    required this.id,
    required this.name,
    required this.isCompleted,
    required this.questionsCount,
  });

  factory JourneyTopic.fromJson(Map<String, dynamic> json) {
    return JourneyTopic(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      isCompleted: json['completed'] ?? false,
      questionsCount: json['questionsCount'] ?? 10,
    );
  }
}

class JourneySubject {
  final String id;
  final String name;
  final int progress;
  final List<JourneyTopic> topics;

  JourneySubject({
    required this.id,
    required this.name,
    required this.progress,
    required this.topics,
  });

  factory JourneySubject.fromJson(Map<String, dynamic> json) {
    return JourneySubject(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      progress: json['progress'] ?? 0,
      topics: (json['topics'] as List? ?? [])
          .map((t) => JourneyTopic.fromJson(Map<String, dynamic>.from(t)))
          .toList(),
    );
  }
}

class JourneyExam {
  final String id;
  final String title;
  final String category;
  final List<JourneySubject> subjects;

  JourneyExam({
    required this.id,
    required this.title,
    required this.category,
    required this.subjects,
  });

  factory JourneyExam.fromJson(Map<String, dynamic> json) {
    return JourneyExam(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      category: json['category'] ?? '',
      subjects: (json['subjects'] as List? ?? [])
          .map((s) => JourneySubject.fromJson(Map<String, dynamic>.from(s)))
          .toList(),
    );
  }
}
