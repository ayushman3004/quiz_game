import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'main_shell.dart';
import '../features/auth/views/splash_screen.dart';
import '../features/auth/views/login_screen.dart';
import '../features/auth/views/register_screen.dart';
import '../features/home/views/home_screen.dart';
import '../features/journey/views/journey_screen.dart';
import '../features/compete/views/compete_screen.dart';
import '../features/compete/views/lobby_screen.dart';
import '../features/compete/views/live_arena_screen.dart';
import '../features/quiz_engine/views/solo_quiz_screen.dart';
import '../features/govt_arena/views/govt_arena_screen.dart';
import '../features/creator/views/quiz_creator_screen.dart';
import '../features/creator/views/quiz_masters_screen.dart';
import '../features/compete/views/tournaments_screen.dart';
import '../features/social/views/social_screen.dart';
import '../features/social/views/leaderboard_screen.dart';
import '../features/profile/views/profile_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      // Splash & Auth Routes
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // Main Navigation Shell (Tabs)
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/journey',
            builder: (context, state) => const JourneyScreen(),
          ),
          GoRoute(
            path: '/compete',
            builder: (context, state) => const CompeteScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),

      // Quiz Engine Overlays
      GoRoute(
        path: '/quiz/solo/:quizId',
        builder: (context, state) {
          final quizId = state.pathParameters['quizId'] ?? 'general';
          return SoloQuizScreen(quizId: quizId);
        },
      ),

      // Multiplayer Overlays
      GoRoute(
        path: '/compete/lobby/:roomCode',
        builder: (context, state) {
          final roomCode = state.pathParameters['roomCode'] ?? 'QZ8K2';
          return LobbyScreen(roomCode: roomCode);
        },
      ),
      GoRoute(
        path: '/compete/arena/:roomCode',
        builder: (context, state) {
          final roomCode = state.pathParameters['roomCode'] ?? 'QZ8K2';
          return LiveArenaScreen(roomCode: roomCode);
        },
      ),

      // Additional Sections
      GoRoute(
        path: '/govt-arena',
        builder: (context, state) => const GovtArenaScreen(),
      ),
      GoRoute(
        path: '/creator/new',
        builder: (context, state) => const QuizCreatorScreen(),
      ),
      GoRoute(
        path: '/creators',
        builder: (context, state) => const QuizMastersScreen(),
      ),
      GoRoute(
        path: '/tournaments',
        builder: (context, state) => const TournamentsScreen(),
      ),
      GoRoute(
        path: '/social',
        builder: (context, state) => const SocialScreen(),
      ),
      GoRoute(
        path: '/leaderboard',
        builder: (context, state) => const LeaderboardScreen(),
      ),
    ],
  );
});
