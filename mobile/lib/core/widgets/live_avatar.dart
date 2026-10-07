import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class LiveAvatar extends StatelessWidget {
  final String? avatarUrl;
  final double size;
  final int? level;
  final bool isOnline;
  final VoidCallback? onTap;

  const LiveAvatar({
    super.key,
    this.avatarUrl,
    this.size = 50,
    this.level,
    this.isOnline = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget avatar = Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.primaryGradient,
            border: Border.all(color: AppColors.primaryLight, width: 2),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: ClipOval(
            child: avatarUrl != null && avatarUrl!.startsWith('http')
                ? Image.network(
                    avatarUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _fallback(),
                  )
                : _fallback(),
          ),
        ),

        // Online Indicator Dot
        if (isOnline)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: size * 0.28,
              height: size * 0.28,
              decoration: BoxDecoration(
                color: AppColors.accentEmerald,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.surfaceDark, width: 2),
              ),
            ),
          ),

        // Level Badge
        if (level != null)
          Positioned(
            bottom: -4,
            left: (size - 24) / 2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
              decoration: BoxDecoration(
                color: AppColors.primaryDark,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.white, width: 1),
              ),
              child: Text(
                '$level',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 10,
                ),
              ),
            ),
          ),
      ],
    );

    if (onTap != null) {
      return GestureDetector(onTap: onTap, child: avatar);
    }
    return avatar;
  }

  Widget _fallback() {
    return Container(
      color: AppColors.surfaceDarkElevated,
      child: Icon(Icons.person, color: Colors.white70, size: size * 0.55),
    );
  }
}
