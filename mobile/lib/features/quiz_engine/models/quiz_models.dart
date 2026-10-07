class OptionModel {
  final String id;
  final String text;

  OptionModel({required this.id, required this.text});

  factory OptionModel.fromJson(Map<String, dynamic> json) {
    return OptionModel(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
    );
  }
}

class QuestionModel {
  final String id;
  final String questionText;
  final List<OptionModel> options;
  final int durationSec;
  final String? codeSnippet;
  final String? imageUrl;
  final String? explanation;

  QuestionModel({
    required this.id,
    required this.questionText,
    required this.options,
    this.durationSec = 15,
    this.codeSnippet,
    this.imageUrl,
    this.explanation,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    return QuestionModel(
      id: json['id'] ?? json['_id'] ?? '',
      questionText: json['questionText'] ?? '',
      options: (json['options'] as List? ?? [])
          .map((o) => OptionModel.fromJson(Map<String, dynamic>.from(o)))
          .toList(),
      durationSec: json['durationSec'] ?? 15,
      codeSnippet: json['codeSnippet'],
      imageUrl: json['imageUrl'],
      explanation: json['explanation'],
    );
  }
}

class QuestionBreakdown {
  final String questionId;
  final String selectedOptionId;
  final String correctOptionId;
  final bool isCorrect;
  final int points;
  final String explanation;

  QuestionBreakdown({
    required this.questionId,
    required this.selectedOptionId,
    required this.correctOptionId,
    required this.isCorrect,
    required this.points,
    required this.explanation,
  });

  factory QuestionBreakdown.fromJson(Map<String, dynamic> json) {
    return QuestionBreakdown(
      questionId: json['questionId'] ?? '',
      selectedOptionId: json['selectedOptionId'] ?? '',
      correctOptionId: json['correctOptionId'] ?? '',
      isCorrect: json['isCorrect'] ?? false,
      points: json['points'] ?? 0,
      explanation: json['explanation'] ?? '',
    );
  }
}

class QuizResultModel {
  final int score;
  final int accuracy;
  final int correctCount;
  final int wrongCount;
  final int totalQuestions;
  final int xpEarned;
  final int coinsEarned;
  final List<QuestionBreakdown> breakdown;

  QuizResultModel({
    required this.score,
    required this.accuracy,
    required this.correctCount,
    required this.wrongCount,
    required this.totalQuestions,
    required this.xpEarned,
    required this.coinsEarned,
    required this.breakdown,
  });

  factory QuizResultModel.fromJson(Map<String, dynamic> json) {
    return QuizResultModel(
      score: json['score'] ?? 0,
      accuracy: json['accuracy'] ?? 0,
      correctCount: json['correctCount'] ?? 0,
      wrongCount: json['wrongCount'] ?? 0,
      totalQuestions: json['totalQuestions'] ?? 0,
      xpEarned: json['xpEarned'] ?? 0,
      coinsEarned: json['coinsEarned'] ?? 0,
      breakdown: (json['breakdown'] as List? ?? [])
          .map((b) => QuestionBreakdown.fromJson(Map<String, dynamic>.from(b)))
          .toList(),
    );
  }
}
