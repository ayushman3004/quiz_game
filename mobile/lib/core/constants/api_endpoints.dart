import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Configurable base URL
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5001/api';
    }
    if (Platform.isAndroid) {
      // Android emulator maps host machine localhost to 10.0.2.2
      return 'http://10.0.2.2:5001/api';
    }
    return 'http://localhost:5001/api';
  }

  static String get socketUrl {
    if (kIsWeb) {
      return 'http://localhost:5001';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:5001';
    }
    return 'http://localhost:5001';
  }

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String syncFirebase = '/auth/sync';
  static const String getMe = '/auth/me';

  // Users
  static const String updateProfile = '/users/profile';
  static const String matchHistory = '/users/history';

  // Quizzes & Journey
  static const String quizzes = '/quizzes';
  static const String journeyTree = '/quizzes/journey/tree';
  static String quizById(String id) => '/quizzes/$id';
  static String playSolo(String id) => '/quizzes/$id/play-solo';
  static String submitSolo(String id) => '/quizzes/$id/submit-solo';

  // Govt Exam Arena
  static const String examCategories = '/govt-exams/categories';
  static String examMockTests(String category) => '/govt-exams/$category/mock-tests';

  // Social & Clubs & Leaderboards
  static const String searchUsers = '/social/users/search';
  static const String friends = '/social/friends';
  static const String friendRequest = '/social/friends/request';
  static const String friendRespond = '/social/friends/respond';
  static const String clubs = '/social/clubs';
  static String joinClub(String id) => '/social/clubs/$id/join';
  static const String leaderboards = '/social/leaderboards';

  // AI
  static const String generateQuiz = '/ai/generate-quiz';
}
