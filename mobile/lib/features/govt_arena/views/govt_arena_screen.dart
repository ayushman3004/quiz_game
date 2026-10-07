import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/widgets/glass_card.dart';

class GovtArenaScreen extends ConsumerStatefulWidget {
  const GovtArenaScreen({super.key});

  @override
  ConsumerState<GovtArenaScreen> createState() => _GovtArenaScreenState();
}

class _GovtArenaScreenState extends ConsumerState<GovtArenaScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _categories = [];

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final response = await DioClient().dio.get(ApiEndpoints.examCategories);
      if (response.data['success'] == true && response.data['categories'] != null) {
        setState(() {
          _categories = List<Map<String, dynamic>>.from(response.data['categories']);
          _isLoading = false;
        });
        return;
      }
    } catch (_) {}

    // Fallback exam categories
    setState(() {
      _categories = [
        {
          'id': 'GATE',
          'name': 'GATE CS & IT Arena',
          'badge': 'Engineering Masters',
          'activeStudents': 14200,
          'subjectsCount': 12,
          'description': 'Algorithms, Operating Systems, Computer Networks, and DBMS test series.',
        },
        {
          'id': 'SSC',
          'name': 'SSC CGL / CHSL',
          'badge': 'Staff Selection',
          'activeStudents': 28500,
          'subjectsCount': 8,
          'description': 'Quantitative aptitude, reasoning speed drills, and general awareness.',
        },
        {
          'id': 'UPSC',
          'name': 'UPSC Civil Services',
          'badge': 'IAS / IPS Track',
          'activeStudents': 9400,
          'subjectsCount': 14,
          'description': 'Indian Polity, History, Environment, and CSAT aptitude simulations.',
        },
        {
          'id': 'BANKING',
          'name': 'Banking & Insurance',
          'badge': 'IBPS PO & Clerk',
          'activeStudents': 19800,
          'subjectsCount': 6,
          'description': 'Speed calculations, data interpretation, and banking awareness.',
        },
      ];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        title: const Text('Govt Job Arena'),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: GlassCard(
                      padding: const EdgeInsets.all(20),
                      onTap: () => context.push('/quiz/solo/${cat['id']}'),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  cat['badge'] ?? 'Competitive Exam',
                                  style: const TextStyle(
                                    color: AppColors.primaryLight,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              Row(
                                children: [
                                  const Icon(Icons.people, color: AppColors.accentCyan, size: 16),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${cat['activeStudents'] ?? 10000} Active',
                                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            cat['name'] ?? '',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textLight,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            cat['description'] ?? '',
                            style: const TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Text(
                                '${cat['subjectsCount'] ?? 8} Subjects Covered',
                                style: const TextStyle(fontSize: 12, color: AppColors.accentEmerald, fontWeight: FontWeight.w700),
                              ),
                              const Spacer(),
                              const Text(
                                'Start Mock Drill →',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primaryLight,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
