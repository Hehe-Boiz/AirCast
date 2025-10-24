// Authentication Service
// Xử lý đăng nhập, đăng ký, logout và quản lý tokens

import { apiService } from './api';
import { API_CONFIG } from '../config/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/api';
import type { User } from '../App';

class AuthService {
  // Login
  async login(email: string, password: string): Promise<User> {
    // MOCK MODE - Remove this block when connecting to Django
    if (API_CONFIG.USE_MOCK_DATA) {
      const mockUser: User = {
        id: '1',
        name: 'Người dùng Demo',
        email: email,
        reputation: 85,
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store mock tokens
      localStorage.setItem('access_token', 'mock_access_token');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return mockUser;
    }

    // REAL API CALL - Uncomment when connecting to Django
    const request: LoginRequest = { email, password };
    const response = await apiService.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.LOGIN,
      request,
      false // No auth header for login
    );

    // Store tokens and user data
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response.user;
  }

  // Register
  async register(
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ): Promise<User> {
    // MOCK MODE - Remove this block when connecting to Django
    if (API_CONFIG.USE_MOCK_DATA) {
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        reputation: 0, // New users start with 0 reputation
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store mock tokens
      localStorage.setItem('access_token', 'mock_access_token');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return mockUser;
    }

    // REAL API CALL - Uncomment when connecting to Django
    const request: RegisterRequest = {
      name,
      email,
      password,
      password_confirm: passwordConfirm,
    };

    const response = await apiService.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.REGISTER,
      request,
      false
    );

    // Store tokens and user data
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response.user;
  }

  // Logout
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!API_CONFIG.USE_MOCK_DATA && refreshToken && refreshToken.length > 0) {
        try {
            // Gửi refresh token lên backend để black list (vô hiệu hóa)
            // Body PHẢI chứa key 'refresh_token' như yêu cầu của Backend
            await apiService.post(
              API_CONFIG.ENDPOINTS.LOGOUT, 
              { refresh_token: refreshToken } 
            );
        } catch (error) {
            // Log lỗi nhưng không re-throw, vì chúng ta vẫn muốn xóa token cục bộ.
            console.error("Lỗi khi blacklisting token trên server:", error);
        }
    } 
    
    // 3. Luôn luôn xóa token khỏi local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
    

  // Refresh access token
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    const response = await apiService.post<RefreshTokenResponse>(
      API_CONFIG.ENDPOINTS.REFRESH_TOKEN,
      request,
      false
    );

    localStorage.setItem('access_token', response.access_token);
    return response.access_token;
  }

  // Get current user from local storage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Get user profile from API
  async getUserProfile(): Promise<User> {
    return apiService.get<User>(API_CONFIG.ENDPOINTS.USER_PROFILE);
  }
}

export const authService = new AuthService();
