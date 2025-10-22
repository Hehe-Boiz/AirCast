// Users Service
// Xử lý thống kê người dùng, achievements, etc.

import { apiService } from './api';
import { API_CONFIG } from '../config/api';
import type { UserStatsResponse, UserAchievementsResponse } from '../types/api';

class UsersService {
  // Get user statistics
  async getUserStats(): Promise<UserStatsResponse> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        total_reports: 47,
        accuracy_rate: 94,
        current_streak: 12,
        level: 8,
        reputation: 85,
      };
    }

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
