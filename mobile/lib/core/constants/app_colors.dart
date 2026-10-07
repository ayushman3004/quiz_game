import 'package:flutter/material.dart';

class AppColors {
  // Brand & Primary
  static const Color primary = Color(0xFF6366F1);
  static const Color primaryDark = Color(0xFF7C3AED);
  static const Color primaryLight = Color(0xFF818CF8);

  // Accents
  static const Color accentCyan = Color(0xFF06B6D4);
  static const Color accentEmerald = Color(0xFF10B981);
  static const Color accentAmber = Color(0xFFF59E0B);
  static const Color accentFlame = Color(0xFFF97316);
  static const Color accentRose = Color(0xFFEF4444);

  // Dark Theme Surfaces (Esports Aesthetic)
  static const Color bgDark = Color(0xFF0B0E14);
  static const Color surfaceDark = Color(0xFF151B26);
  static const Color surfaceDarkElevated = Color(0xFF1E2638);
  static const Color surfaceDarkHighlight = Color(0xFF28334A);

  // Light Theme Surfaces
  static const Color bgLight = Color(0xFFF8FAFC);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceLightElevated = Color(0xFFF1F5F9);

  // Text Colors
  static const Color textLight = Color(0xFFF8FAFC);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color textDark = Color(0xFF0F172A);
  static const Color textDarkMuted = Color(0xFF64748B);

  // Glass & Borders
  static const Color borderGlass = Color(0x14FFFFFF); // rgba(255,255,255,0.08)
  static const Color borderHighlight = Color(0x336366F1);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFF6366F1)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cyanGradient = LinearGradient(
    colors: [Color(0xFF06B6D4), Color(0xFF3B82F6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient streakGradient = LinearGradient(
    colors: [Color(0xFFF97316), Color(0xFFEF4444)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient emeraldGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient silverPodiumGradient = LinearGradient(
    colors: [Color(0xFFE2E8F0), Color(0xFF94A3B8)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient bronzePodiumGradient = LinearGradient(
    colors: [Color(0xFFFDBA74), Color(0xFFC2410C)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
