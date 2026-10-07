import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import '../controllers/auth_controller.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _usernameController = TextEditingController();
  final _displayNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String? _errorMessage;
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _displayNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    final username = _usernameController.text.trim();
    final displayName = _displayNameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (username.length < 3) {
      setState(() => _errorMessage = 'Username must be at least 3 characters');
      return;
    }
    if (displayName.isEmpty) {
      setState(() => _errorMessage = 'Display name cannot be empty');
      return;
    }
    if (!email.contains('@')) {
      setState(() => _errorMessage = 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setState(() => _errorMessage = 'Password must be at least 6 characters');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final success = await ref.read(authControllerProvider.notifier).register(
      username: username,
      displayName: displayName,
      email: email,
      password: password,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        context.go('/home');
      } else {
        setState(() => _errorMessage = 'Registration failed. Username or email may already be taken.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: AppColors.cyanGradient,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(Icons.person_add_alt_1_rounded, color: Colors.white, size: 34),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Create Player Profile',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textLight,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Join thousands of players in real-time academic & esports duels',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                ),
                const SizedBox(height: 28),

                GlassCard(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (_errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.accentRose.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.accentRose.withOpacity(0.3)),
                          ),
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(color: AppColors.accentRose, fontSize: 13),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Username
                      const Text(
                        'Username (Unique handle)',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textLight),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _usernameController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'e.g. shadow_ninja',
                          prefixIcon: Icon(Icons.alternate_email, color: AppColors.textMuted),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Display Name
                      const Text(
                        'Display Name',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textLight),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _displayNameController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'e.g. Alex Hunter',
                          prefixIcon: Icon(Icons.badge_outlined, color: AppColors.textMuted),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Email
                      const Text(
                        'Email Address',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textLight),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'alex@domain.com',
                          prefixIcon: Icon(Icons.mail_outline, color: AppColors.textMuted),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Password
                      const Text(
                        'Password',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textLight),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'At least 6 characters',
                          prefixIcon: const Icon(Icons.lock_outline, color: AppColors.textMuted),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off : Icons.visibility,
                              color: AppColors.textMuted,
                            ),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      AppButton(
                        text: 'Register Account',
                        isLoading: _isLoading,
                        onPressed: _handleRegister,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Already registered? ',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 14),
                    ),
                    GestureDetector(
                      onTap: () => context.go('/auth/login'),
                      child: const Text(
                        'Sign In',
                        style: TextStyle(
                          color: AppColors.accentCyan,
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
