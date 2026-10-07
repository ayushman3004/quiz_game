import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/glass_card.dart';
import 'ai_quiz_dialog.dart';

class QuizCreatorScreen extends ConsumerStatefulWidget {
  const QuizCreatorScreen({super.key});

  @override
  ConsumerState<QuizCreatorScreen> createState() => _QuizCreatorScreenState();
}

class _QuizCreatorScreenState extends ConsumerState<QuizCreatorScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _category = 'Computer Science';
  String _difficulty = 'MEDIUM';
  String _visibility = 'PUBLIC';
  int _timePerQuestionSec = 15;

  final List<Map<String, dynamic>> _questions = [
    {
      'questionText': '',
      'options': [
        {'id': 'A', 'text': ''},
        {'id': 'B', 'text': ''},
        {'id': 'C', 'text': ''},
        {'id': 'D', 'text': ''},
      ],
      'correctOptionId': 'A',
      'explanation': '',
    }
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _addQuestion() {
    setState(() {
      _questions.add({
        'questionText': '',
        'options': [
          {'id': 'A', 'text': ''},
          {'id': 'B', 'text': ''},
          {'id': 'C', 'text': ''},
          {'id': 'D', 'text': ''},
        ],
        'correctOptionId': 'A',
        'explanation': '',
      });
    });
  }

  void _publishQuiz() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Quiz created successfully and submitted for moderation!')),
    );
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Create Quiz'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: AppColors.accentCyan),
            tooltip: 'Generate with AI',
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => const AiQuizDialog(),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // AI Assistant Header Callout
              GlassCard(
                padding: const EdgeInsets.all(16),
                gradient: const LinearGradient(
                  colors: [Color(0xFF0C4A6E), Color(0xFF1E293B)],
                ),
                child: Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: AppColors.accentCyan, size: 26),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Want AI to build this for you?',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5, color: Colors.white),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Generate questions instantly with Gemini.',
                            style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentCyan,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (ctx) => const AiQuizDialog(),
                        );
                      },
                      child: const Text('Try AI', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Basic Quiz Details
              GlassCard(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Quiz Title', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textLight)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _titleController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(hintText: 'e.g. Master Operating System Deadlocks'),
                    ),
                    const SizedBox(height: 16),

                    const Text('Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textLight)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _category,
                      dropdownColor: AppColors.surfaceDarkElevated,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(),
                      items: const [
                        DropdownMenuItem(value: 'Computer Science', child: Text('Computer Science')),
                        DropdownMenuItem(value: 'Quantitative Aptitude', child: Text('Quantitative Aptitude')),
                        DropdownMenuItem(value: 'General Studies', child: Text('General Studies')),
                        DropdownMenuItem(value: 'Reasoning', child: Text('Reasoning')),
                      ],
                      onChanged: (val) => setState(() => _category = val ?? 'Computer Science'),
                    ),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
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
                                ],
                                onChanged: (val) => setState(() => _difficulty = val ?? 'MEDIUM'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Timer / Question', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textLight)),
                              const SizedBox(height: 6),
                              DropdownButtonFormField<int>(
                                value: _timePerQuestionSec,
                                dropdownColor: AppColors.surfaceDarkElevated,
                                style: const TextStyle(color: Colors.white),
                                decoration: const InputDecoration(),
                                items: const [
                                  DropdownMenuItem(value: 10, child: Text('10 Seconds')),
                                  DropdownMenuItem(value: 15, child: Text('15 Seconds')),
                                  DropdownMenuItem(value: 20, child: Text('20 Seconds')),
                                  DropdownMenuItem(value: 30, child: Text('30 Seconds')),
                                ],
                                onChanged: (val) => setState(() => _timePerQuestionSec = val ?? 15),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Questions List Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'QUESTIONS (${_questions.length})',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.textLight),
                  ),
                  TextButton.icon(
                    icon: const Icon(Icons.add, size: 18, color: AppColors.primaryLight),
                    label: const Text('Add Question', style: TextStyle(color: AppColors.primaryLight, fontWeight: FontWeight.w700)),
                    onPressed: _addQuestion,
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Question Cards
              ...List.generate(_questions.length, (qIdx) {
                final q = _questions[qIdx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: GlassCard(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Question #${qIdx + 1}',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.accentCyan),
                            ),
                            if (_questions.length > 1)
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: AppColors.accentRose, size: 20),
                                onPressed: () => setState(() => _questions.removeAt(qIdx)),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          initialValue: q['questionText'],
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(hintText: 'Enter question text here...'),
                          onChanged: (val) => q['questionText'] = val,
                        ),
                        const SizedBox(height: 14),

                        // 4 Options
                        ...List.generate(4, (oIdx) {
                          final optId = ['A', 'B', 'C', 'D'][oIdx];
                          final isCorrect = q['correctOptionId'] == optId;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              children: [
                                GestureDetector(
                                  onTap: () => setState(() => q['correctOptionId'] = optId),
                                  child: Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isCorrect ? AppColors.accentEmerald : AppColors.surfaceDarkHighlight,
                                    ),
                                    child: Center(
                                      child: Text(
                                        optId,
                                        style: TextStyle(
                                          color: isCorrect ? Colors.black : Colors.white,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: TextFormField(
                                    initialValue: q['options'][oIdx]['text'],
                                    style: const TextStyle(color: Colors.white, fontSize: 13.5),
                                    decoration: InputDecoration(
                                      hintText: 'Option $optId text',
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                    ),
                                    onChanged: (val) => q['options'][oIdx]['text'] = val,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                        const SizedBox(height: 10),
                        TextFormField(
                          initialValue: q['explanation'],
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: const InputDecoration(
                            hintText: 'Explanation for correct answer (optional)',
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          onChanged: (val) => q['explanation'] = val,
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 16),

              // Publish Button
              AppButton(
                text: 'Publish Quiz',
                onPressed: _publishQuiz,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
