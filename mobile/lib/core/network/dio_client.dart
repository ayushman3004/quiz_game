import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';
import '../storage/storage_service.dart';

class DioClient {
  late final Dio dio;
  final StorageService _storage = StorageService();

  DioClient() {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) {
          // Format user-friendly error message
          String message = 'Network connection issue. Please check your internet.';
          if (error.response?.data != null && error.response?.data is Map) {
            final data = error.response!.data as Map;
            if (data['message'] != null) {
              message = data['message'].toString();
            }
          }
          return handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              response: error.response,
              type: error.type,
              error: message,
            ),
          );
        },
      ),
    );
  }
}
