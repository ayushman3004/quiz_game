import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  late SharedPreferences _prefs;
  bool _initialized = false;

  static const String _keyToken = 'auth_jwt_token';
  static const String _keyUser = 'cached_user_profile';
  static const String _keyThemeMode = 'app_theme_mode';

  Future<void> init() async {
    if (!_initialized) {
      _prefs = await SharedPreferences.getInstance();
      _initialized = true;
    }
  }

  // Token methods
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _keyToken, value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: _keyToken);
  }

  Future<void> clearToken() async {
    await _secureStorage.delete(key: _keyToken);
  }

  // User Profile methods
  Future<void> saveUserProfile(Map<String, dynamic> userMap) async {
    await _prefs.setString(_keyUser, jsonEncode(userMap));
  }

  Map<String, dynamic>? getUserProfile() {
    final raw = _prefs.getString(_keyUser);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs.clear();
  }

  // Settings
  bool get isDarkMode => _prefs.getBool(_keyThemeMode) ?? true;
  Future<void> setDarkMode(bool value) async {
    await _prefs.setBool(_keyThemeMode, value);
  }
}
