// Users Service
// Xử lý thống kê người dùng, achievements, profile management, etc.

import { apiService } from './api';
import { API_CONFIG } from '../config/api';
import type { 
  UserStatsResponse, 
  UserAchievementsResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UploadAvatarResponse,
} from '../types/api';
import type { User } from '../App';

class UsersService {
  // ==================== Profile Management ====================
  
  // Update user profile (name, email)
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Update user data
      const updatedUser: User = {
        ...currentUser,
        name: data.name || currentUser.name,
        email: data.email || currentUser.email,
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    }

    // REAL API CALL
    const response = await apiService.put<UpdateProfileResponse>(
      API_CONFIG.ENDPOINTS.UPDATE_PROFILE,
      data
    );
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response.user;
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate password validation
      if (data.new_password !== data.new_password_confirm) {
        throw new Error('Mật khẩu mới không khớp');
      }
      
      if (data.new_password.length < 8) {
        throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
      }
      
      return;
    }

    // REAL API CALL
    await apiService.post<ChangePasswordResponse>(
      API_CONFIG.ENDPOINTS.CHANGE_PASSWORD,
      data
    );
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock avatar URL
      const mockAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&size=200&background=10b981&color=fff`;
      
      // Get current user and update avatar
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.avatar = mockAvatarUrl;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      return mockAvatarUrl;
    }

    // REAL API CALL
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiService.upload<UploadAvatarResponse>(
      API_CONFIG.ENDPOINTS.UPLOAD_AVATAR,
      formData
    );
    
    // Update user avatar in localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentUser.avatar = response.avatar_url;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    return response.avatar_url;
  }

  // ==================== User Stats & Achievements ====================
  
  // Get user statistics
  async getUserStats(): Promise<UserStatsResponse> {

    // total_reports: 47,
    // accuracy_rate: 94,
    // current_streak: 12,
    // level: 8,
    // reputation: 85,

    // REAL API CALL
    return apiService.get<UserStatsResponse>(API_CONFIG.ENDPOINTS.USER_STATS);
  }

  // Get user achievements
  async getUserAchievements(): Promise<UserAchievementsResponse> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        achievements: [
          {
            id: '1',
            name: 'Người đi đầu',
            description: 'Tạo báo cáo đầu tiên',
            emoji: '🏆',
            unlocked: true,
            unlocked_at: '2024-01-15T10:00:00Z',
          },
          {
            id: '2',
            name: '50 báo cáo',
            description: 'Đã tạo 50 báo cáo',
            emoji: '🎯',
            unlocked: true,
            unlocked_at: '2024-02-20T14:30:00Z',
          },
          {
            id: '3',
            name: 'Chính xác',
            description: 'Đạt 90% độ chính xác',
            emoji: '⭐',
            unlocked: true,
            unlocked_at: '2024-03-10T09:15:00Z',
          },
          {
            id: '4',
            name: '10 ngày liên tiếp',
            description: 'Báo cáo 10 ngày liên tục',
            emoji: '🔥',
            unlocked: true,
            unlocked_at: '2024-04-05T16:45:00Z',
          },
          {
            id: '5',
            name: 'Tinh hoa',
            description: 'Đạt cấp độ 5',
            emoji: '💎',
            unlocked: true,
            unlocked_at: '2024-05-12T11:20:00Z',
          },
          {
            id: '6',
            name: 'Siêu sao',
            description: 'Đạt 100 điểm uy tín',
            emoji: '🌟',
            unlocked: false,
          },
        ],
      };
    }

    // REAL API CALL
    return apiService.get<UserAchievementsResponse>(
      API_CONFIG.ENDPOINTS.USER_ACHIEVEMENTS
    );
  }
}

export const usersService = new UsersService();
