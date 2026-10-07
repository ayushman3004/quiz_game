import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

enum StatType { xp, coins, rating }

class StatChip extends StatelessWidget {
  final StatType type;
  final String value;
  final bool showLabel;

  const StatChip({
    super.key,
    required this.type,
    required this.value,
    this.showLabel = true,
  });

  @override
  Widget build(BuildContext context) {
    Color iconColor;
    IconData icon;
    String label;

    switch (type) {
      case StatType.xp:
        iconColor = AppColors.primaryLight;
        icon = Icons.bolt;
        label = 'XP';
        break;
      case StatType.coins:
        iconColor = AppColors.accentAmber;
        icon = Icons.monetization_on;
        label = 'Coins';
        break;
      case StatType.rating:
        iconColor = AppColors.accentCyan;
        icon = Icons.shield;
        label = 'Rating';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceDarkElevated,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderGlass),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor, size: 16),
          const SizedBox(width: 5),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.textLight,
              fontWeight: FontWeight.w700,
              fontSize: 12.5,
            ),
          ),
          if (showLabel) ...[
            const SizedBox(width: 3),
            Text(
              label,
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
