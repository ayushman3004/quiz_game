import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/storage_service.dart';
import '../../../core/socket/socket_service.dart';
import '../models/user_model.dart';

final authControllerProvider = StateNotifierProvider<AuthController, AsyncValue<UserModel?>>((ref) {
  return AuthController();
});

class AuthController extends StateNotifier<AsyncValue<UserModel?>> {
  final DioClient _dioClient = DioClient();
  final StorageService _storage = StorageService();

  AuthController() : super(const AsyncValue.loading()) {
    checkAuth();
  }

  Future<void> checkAuth() async {
    try {
      await _storage.init();
      final token = await _storage.getToken();

      if (token == null) {
        state = const AsyncValue.data(null);
        return;
      }

      // Try fetching active profile from backend
      try {
        final response = await _dioClient.dio.get(ApiEndpoints.getMe);
        if (response.data['success'] == true && response.data['user'] != null) {
          final user = UserModel.fromJson(response.data['user']);
          await _storage.saveUserProfile(user.toJson());
          state = AsyncValue.data(user);
          // Connect socket on successful auth
          SocketService().connect();
          return;
        }
      } catch (_) {
        // Fallback to cached profile if offline
        final cached = _storage.getUserProfile();
        if (cached != null) {
          state = AsyncValue.data(UserModel.fromJson(cached));
          return;
        }
      }

      state = const AsyncValue.data(null);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<bool> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await _dioClient.dio.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );

      if (response.data['success'] == true) {
        final token = response.data['token'] as String;
        final user = UserModel.fromJson(response.data['user']);

        await _storage.saveToken(token);
        await _storage.saveUserProfile(user.toJson());
        state = AsyncValue.data(user);

        SocketService().connect();
        return true;
      }
      return false;
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      return false;
    }
  }

  Future<bool> register({
    required String username,
    required String email,
    required String password,
    required String displayName,
  }) async {
    state = const AsyncValue.loading();
    try {
      final response = await _dioClient.dio.post(
        ApiEndpoints.register,
        data: {
          'username': username,
          'email': email,
          'password': password,
          'displayName': displayName,
        },
      );

      if (response.data['success'] == true) {
        final token = response.data['token'] as String;
        final user = UserModel.fromJson(response.data['user']);

        await _storage.saveToken(token);
        await _storage.saveUserProfile(user.toJson());
        state = AsyncValue.data(user);

        SocketService().connect();
        return true;
      }
      return false;
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      return false;
    }
  }

  Future<void> updateProfile({String? displayName, String? avatarUrl}) async {
    try {
      final response = await _dioClient.dio.patch(
        ApiEndpoints.updateProfile,
        data: {
          if (displayName != null) 'displayName': displayName,
          if (avatarUrl != null) 'avatarUrl': avatarUrl,
        },
      );

      if (response.data['success'] == true) {
        await checkAuth(); // reload profile
      }
    } catch (_) {}
  }

  Future<void> logout() async {
    SocketService().disconnect();
    await _storage.clearAll();
    state = const AsyncValue.data(null);
  }
}
