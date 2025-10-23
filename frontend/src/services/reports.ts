// Reports Service
// Xử lý tất cả API calls liên quan đến báo cáo môi trường

import { apiService } from './api';
import { API_CONFIG } from '../config/api';
import type {
  CreateReportRequest,
  CreateReportResponse,
  GetReportsRequest,
  GetReportsResponse,
  ReportsByLocationRequest,
  UploadImageResponse,
  UploadAudioResponse,
} from '../types/api';
import type { Report } from '../App';
import { mockReports } from '../data/mockData';

class ReportsService {
  // Create a new report
  async createReport(reportData: CreateReportRequest): Promise<CreateReportResponse> {
    // MOCK MODE - Remove this block when connecting to Django
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: `report_${Date.now()}`,
        message: 'Báo cáo đã được tạo thành công',
        reputation_gained: 5,
      };
    }

    // REAL API CALL
    // Upload image nếu có
    let imageUrl: string | undefined;
    if (reportData.image) {
      const imageUploadResponse = await this.uploadImage(reportData.image);
      imageUrl = imageUploadResponse.url;
    }

    // Upload audio nếu có
    let audioUrl: string | undefined;
    if (reportData.audio) {
      const audioUploadResponse = await this.uploadAudio(reportData.audio);
      audioUrl = audioUploadResponse.url;
    }

    // Create report với URLs của uploaded files
    const payload = {
      type: reportData.type,
      lat: reportData.lat,
      lng: reportData.lng,
      air_quality: reportData.air_quality,
      noise_level: reportData.noise_level,
      comment: reportData.comment,
      image_url: imageUrl,
      audio_url: audioUrl,
    };

    return apiService.post<CreateReportResponse>(
      API_CONFIG.ENDPOINTS.REPORTS,
      payload
    );
  }

  // Get reports with filters
  async getReports(params: GetReportsRequest = {}): Promise<GetReportsResponse> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredReports = [...mockReports];
      
      // Filter by location
      if (params.lat && params.lng && params.radius) {
        filteredReports = filteredReports.filter(report => {
          const distance = this.calculateDistance(
            params.lat!,
            params.lng!,
            report.lat,
            report.lng
          );
          return distance <= params.radius!;
        });
      }
      
      // Filter by type
      if (params.type) {
        filteredReports = filteredReports.filter(r => r.type === params.type);
      }
      
      // Apply pagination
      const limit = params.limit || 20;
      const offset = params.offset || 0;
      const paginatedReports = filteredReports.slice(offset, offset + limit);
      
      return {
        count: filteredReports.length,
        next: offset + limit < filteredReports.length ? 'next_url' : null,
        previous: offset > 0 ? 'prev_url' : null,
        results: paginatedReports,
      };
    }

    // REAL API CALL
    const queryParams = new URLSearchParams();
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.lng) queryParams.append('lng', params.lng.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.REPORTS}?${queryParams.toString()}`;
    return apiService.get<GetReportsResponse>(endpoint);
  }

  // Get reports by location (trong radius cụ thể)
  async getReportsByLocation(
    lat: number,
    lng: number,
    radius: number = 1
  ): Promise<Report[]> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockReports.filter(report => {
        const distance = this.calculateDistance(lat, lng, report.lat, report.lng);
        return distance <= radius;
      });
    }

    // REAL API CALL
    const request: ReportsByLocationRequest = { lat, lng, radius };
    const response = await apiService.post<Report[]>(
      API_CONFIG.ENDPOINTS.REPORTS_BY_LOCATION,
      request
    );
    return response;
  }

  // Get single report by ID
  async getReportById(id: string): Promise<Report> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const report = mockReports.find(r => r.id === id);
      if (!report) throw new Error('Report not found');
      return report;
    }

    // REAL API CALL
    return apiService.get<Report>(API_CONFIG.ENDPOINTS.REPORT_DETAIL(id));
  }

  // Upload image
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return apiService.upload<UploadImageResponse>(
      API_CONFIG.ENDPOINTS.UPLOAD_IMAGE,
      formData
    );
  }

  // Upload audio
  async uploadAudio(file: File): Promise<UploadAudioResponse> {
    const formData = new FormData();
    formData.append('audio', file);

    return apiService.upload<UploadAudioResponse>(
      API_CONFIG.ENDPOINTS.UPLOAD_AUDIO,
      formData
    );
  }

  // Helper: Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Radius of Earth in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Vote on report (validate or dispute)
  async voteReport(reportId: string, voteType: 'up' | 'down'): Promise<{ success: boolean; upvotes: number; downvotes: number }> {
    // MOCK MODE
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const report = mockReports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');
      
      // Toggle vote
      if (report.userVote === voteType) {
        // Remove vote
        if (voteType === 'up') {
          report.upvotes--;
        } else {
          report.downvotes--;
        }
        report.userVote = null;
      } else {
        // Remove previous vote if exists
        if (report.userVote === 'up') {
          report.upvotes--;
        } else if (report.userVote === 'down') {
          report.downvotes--;
        }
        
        // Add new vote
        if (voteType === 'up') {
          report.upvotes++;
        } else {
          report.downvotes++;
        }
        report.userVote = voteType;
      }
      
      return {
        success: true,
        upvotes: report.upvotes,
        downvotes: report.downvotes,
      };
    }

    // REAL API CALL
    return apiService.post<{ success: boolean; upvotes: number; downvotes: number }>(
      `/api/reports/${reportId}/vote/`,
      { vote_type: voteType }
    );
  }
}

export const reportsService = new ReportsService();
