import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/widgets/app_button.dart';

class AiQuizDialog extends StatefulWidget {
  const AiQuizDialog({super.key});

  @override
  State<AiQuizDialog> createState() => _AiQuizDialogState();
}

class _AiQuizDialogState extends State<AiQuizDialog> {
  final _topicController = TextEditingController();
  String _difficulty = 'MEDIUM';
  int _questionCount = 5;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _topicController.dispose();
    super.dispose();
  }

  Future<void> _handleGenerate() async {
    final topic = _topicController.text.trim();
    if (topic.isEmpty) {
      setState(() => _errorMessage = 'Please enter a topic');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await DioClient().dio.post(
        ApiEndpoints.generateQuiz,
        data: {
          'topic': topic,
          'difficulty': _difficulty,
          'questionCount': _questionCount,
        },
      );

      if (response.data['success'] == true && response.data['quiz'] != null) {
        final quizId = response.data['quiz']['id'];
        if (mounted) {
          Navigator.pop(context);
          context.push('/quiz/solo/$quizId');
        }
        return;
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Failed to generate quiz. Try another topic.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.surfaceDark,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: AppColors.cyanGradient,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.auto_awesome, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          const Text(
            'AI Quiz Generator',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textLight),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Powered by Google Gemini. Enter any academic or gaming topic to generate a full competitive drill.',
              style: TextStyle(fontSize: 12.5, color: AppColors.textMuted, height: 1.4),
            ),
            const SizedBox(height: 18),

            if (_errorMessage != null) ...[
              Text(_errorMessage!, style: const TextStyle(color: AppColors.accentRose, fontSize: 12)),
              const SizedBox(height: 8),
            ],

            const Text('Topic or Subject', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textLight)),
            const SizedBox(height: 6),
            TextField(
              controller: _topicController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                hintText: 'e.g. Graph BFS, World War 2, Quantum Computing',
              ),
            ),
            const SizedBox(height: 16),

            const Text('Difficulty', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textLight)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _difficulty,
              dropdownColor: AppColors.surfaceDarkElevated,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(),
              items: const [
                DropdownMenuItem(value: 'EASY', child: Text('Easy')),
                DropdownMenuItem(value: 'MEDIUM', child: Text('Medium')),
                DropdownMenuItem(value: 'HARD', child: Text('Hard')),
                DropdownMenuItem(value: 'EXPERT', child: Text('Expert')),
              ],
              onChanged: (val) => setState(() => _difficulty = val ?? 'MEDIUM'),
            ),
            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Question Count', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textLight)),
                Text('$_questionCount questions', style: const TextStyle(fontSize: 12, color: AppColors.accentCyan, fontWeight: FontWeight.w700)),
              ],
            ),
            Slider(
              value: _questionCount.toDouble(),
              min: 3,
              max: 10,
              divisions: 7,
              activeColor: AppColors.primary,
              inactiveColor: AppColors.surfaceDarkElevated,
              onChanged: (val) => setState(() => _questionCount = val.round()),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
        ),
        AppButton(
          text: 'Generate Quiz',
          width: 140,
          height: 44,
          gradient: AppColors.cyanGradient,
          isLoading: _isLoading,
          onPressed: _handleGenerate,
        ),
      ],
    );
  }
}
