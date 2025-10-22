// API Request & Response Types
// Tương ứng với Django serializers

import type { User, Report, AirQualityLevel, NoiseLevel } from '../App';

// ==================== Authentication ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

// ==================== Reports ====================

export interface CreateReportRequest {
  type: 'air' | 'noise';
  lat: number;
  lng: number;
  air_quality?: AirQualityLevel;
  noise_level?: NoiseLevel;
  comment?: string;
  image?: File;
  audio?: File;
}

export interface CreateReportResponse {
  id: string;
  message: string;
  reputation_gained: number;
}

export interface GetReportsRequest {
  lat?: number;
  lng?: number;
  radius?: number; // km
  type?: 'air' | 'noise';
  limit?: number;
  offset?: number;
}

export interface GetReportsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Report[];
}

export interface ReportsByLocationRequest {
  lat: number;
  lng: number;
  radius: number; // km
}

// ==================== User Stats ====================

export interface UserStatsResponse {
  total_reports: number;
  accuracy_rate: number;
  current_streak: number;
  level: number;
  reputation: number;
}

export interface UserAchievementsResponse {
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    emoji: string;
    unlocked: boolean;
    unlocked_at?: string;
  }>;
}

// ==================== Upload ====================

export interface UploadImageRequest {
  image: File;
}

export interface UploadImageResponse {
  url: string;
  file_id: string;
}

export interface UploadAudioRequest {
  audio: File;
}

export interface UploadAudioResponse {
  url: string;
  file_id: string;
  duration: number;
}

// ==================== Generic API Response ====================

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status_code: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
