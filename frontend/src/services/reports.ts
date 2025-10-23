// src/services/reports.ts

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
  AIR_LEVEL,
  NOISE_LEVEL
} from '../types/api';
import type { Report } from '../App';

// ================= MOCK DATA =================
// Một "cơ sở dữ liệu giả" trong bộ nhớ để lưu trữ các báo cáo khi ở chế độ mock
const mockReports: Report[] = [
    {
      id: 'report_1',
      userId: '1',
      userName: 'Người dùng Demo',
      userReputation: 85,
      lat: 10.7769,
      lng: 10.7009,
      type: 'air',
      airQuality: 2 as AIR_LEVEL,
      timestamp: new Date('2024-05-20T10:30:00Z'),
      comment: 'Không khí hôm nay khá dễ chịu.',
      upvotes: 10,
      downvotes: 1,
    },
    {
      id: 'report_2',
      userId: '2',
      userName: 'Jane Doe',
      userReputation: 95,
      lat: 10.775,
      lng: 10.705,
      type: 'noise',
      noiseLevel: 3 as NOISE_LEVEL,
      timestamp: new Date('2024-05-20T11:00:00Z'),
      comment: 'Công trường xây dựng đang làm việc rất ồn ào.',
      imageUrl: 'https://via.placeholder.com/150',
      upvotes: 25,
      downvotes: 2,
    },
];
// =============================================

class ReportsService {
  // Create a new report
  async createReport(reportData: CreateReportRequest): Promise<CreateReportResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      console.log("Creating report in MOCK mode:", reportData);
      await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập độ trễ mạng

      // Tạo một report mới và thêm vào "cơ sở dữ liệu giả"
      const newReport: Report = {
        id: `report_${Date.now()}`,
        userId: '1', // Giả sử là người dùng hiện tại
        userName: 'Người dùng Demo',
        userReputation: 85,
        lat: reportData.lat,
        lng: reportData.lng,
        type: reportData.type,
        airQuality: reportData.air_quality,
        noiseLevel: reportData.noise_level,
        comment: reportData.comment,
        imageUrl: reportData.image ? URL.createObjectURL(reportData.image) : undefined,
        audioUrl: reportData.audio ? URL.createObjectURL(reportData.audio) : undefined,
        timestamp: new Date(),
        upvotes: 0,
        downvotes: 0,
        userVote: null,
      };

      mockReports.push(newReport);
      console.log("New report added to mock DB. Total reports:", mockReports.length);
      
      return {
        id: newReport.id,
        message: 'Báo cáo đã được tạo thành công (Mock)',
        reputation_gained: 5,
      };
    }

    // REAL API CALL
    let imageUrl: string | undefined;
    if (reportData.image) {
      const imageUploadResponse = await this.uploadImage(reportData.image);
      imageUrl = imageUploadResponse.url;
    }

    let audioUrl: string | undefined;
    if (reportData.audio) {
      const audioUploadResponse = await this.uploadAudio(reportData.audio);
      audioUrl = audioUploadResponse.url;
    }

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
    if (API_CONFIG.USE_MOCK_DATA) {
      console.log("Getting reports in MOCK mode.");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Lọc các báo cáo dựa trên vị trí (đơn giản)
      const filteredReports = mockReports.filter(report => {
        if (params.lat && params.lng && params.radius) {
          const distance = this.calculateDistance(params.lat, params.lng, report.lat, report.lng);
          return distance <= params.radius;
        }
        return true;
      });

      return {
        count: filteredReports.length,
        next: null,
        previous: null,
        results: filteredReports,
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
    if (API_CONFIG.USE_MOCK_DATA) {
      return mockReports.filter(report => this.calculateDistance(lat, lng, report.lat, report.lng) <= radius);
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
    if (API_CONFIG.USE_MOCK_DATA) {
      const report = mockReports.find(r => r.id === id);
      if (report) return report;
      throw new Error("Report not found");
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
    if (API_CONFIG.USE_MOCK_DATA) {
      const report = mockReports.find(r => r.id === reportId);
      if (report) {
        if (voteType === 'up') report.upvotes++;
        else report.downvotes++;
        return { success: true, upvotes: report.upvotes, downvotes: report.downvotes };
      }
      throw new Error("Report not found");
    }
    // REAL API CALL
    return apiService.post<{ success: boolean; upvotes: number; downvotes: number }>(
      `/api/reports/${reportId}/vote/`,
      { vote_type: voteType }
    );
  }
}

export const reportsService = new ReportsService();