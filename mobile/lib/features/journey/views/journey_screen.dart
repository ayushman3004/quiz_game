import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/widgets/glass_card.dart';
import '../models/journey_model.dart';

class JourneyScreen extends ConsumerStatefulWidget {
  const JourneyScreen({super.key});

  @override
  ConsumerState<JourneyScreen> createState() => _JourneyScreenState();
}

class _JourneyScreenState extends ConsumerState<JourneyScreen> {
  int _selectedExamIndex = 0;
  bool _isLoading = true;
  List<JourneyExam> _exams = [];

  @override
  void initState() {
    super.initState();
    _fetchJourney();
  }

  String? _errorMessage;

  Future<void> _fetchJourney() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await DioClient().dio.get(ApiEndpoints.journeyTree);
      if (response.data['success'] == true && response.data['journey'] != null) {
        final list = (response.data['journey'] as List)
            .map((e) => JourneyExam.fromJson(Map<String, dynamic>.from(e)))
            .toList();
        if (mounted) {
          setState(() {
            _exams = list;
            _isLoading = false;
          });
          return;
        }
      } else {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage = response.data['message'] ?? 'Failed to load journey curriculum from database.';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Could not load curriculum from database. Please ensure backend is running.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.bgDark,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: AppColors.bgDark,
        appBar: AppBar(title: const Text('Learning Journey')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.cloud_off_rounded, color: AppColors.accentRose, size: 56),
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textLight, fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _fetchJourney,
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                  child: const Text('🔄 Retry DB Fetch'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final activeExam = _exams.isNotEmpty ? _exams[_selectedExamIndex] : null;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Learning Journey'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() => _isLoading = true);
              _fetchJourney();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Exam Selector Tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.generate(_exams.length, (index) {
                  final isSelected = index == _selectedExamIndex;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedExamIndex = index),
                    child: Container(
                      margin: const EdgeInsets.only(right: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        gradient: isSelected ? AppColors.primaryGradient : null,
                        color: isSelected ? null : AppColors.surfaceDarkElevated,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? Colors.transparent : AppColors.borderGlass,
                        ),
                      ),
                      child: Text(
                        _exams[index].title,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textMuted,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),

          // Subject Hierarchy Tree
          Expanded(
            child: activeExam == null
                ? const Center(child: Text('No curriculum tracks found.'))
                : ListView.builder(
                    padding: const EdgeInsets.all(18),
                    itemCount: activeExam.subjects.length,
                    itemBuilder: (context, sIdx) {
                      final subject = activeExam.subjects[sIdx];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 20),
                        child: GlassCard(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Subject Header
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      subject.name,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textLight,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${subject.progress}%',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.accentCyan,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: LinearProgressIndicator(
                                  value: subject.progress / 100.0,
                                  minHeight: 6,
                                  backgroundColor: AppColors.surfaceDarkElevated,
                                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accentCyan),
                                ),
                              ),
                              const SizedBox(height: 18),

                              // Topics Flow
                              ...subject.topics.map((topic) {
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceDarkElevated,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: topic.isCompleted
                                          ? AppColors.accentEmerald.withOpacity(0.3)
                                          : AppColors.borderGlass,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: topic.isCompleted
                                              ? AppColors.accentEmerald.withOpacity(0.2)
                                              : AppColors.surfaceDarkHighlight,
                                        ),
                                        child: Icon(
                                          topic.isCompleted ? Icons.check_circle : Icons.play_arrow_rounded,
                                          color: topic.isCompleted ? AppColors.accentEmerald : AppColors.primaryLight,
                                          size: 18,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              topic.name,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w600,
                                                fontSize: 13.5,
                                                color: AppColors.textLight,
                                              ),
                                            ),
                                            Text(
                                              '${topic.questionsCount} high-yield questions',
                                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                            ),
                                          ],
                                        ),
                                      ),
                                      ElevatedButton(
                                        onPressed: () => context.push('/quiz/solo/${topic.id}'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppColors.primary,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                        ),
                                        child: Text(
                                          topic.isCompleted ? 'Review' : 'Start',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
