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
  VoteReport,
  VoteAction
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

  async voteReport(id:string, action:VoteAction ): Promise<VoteReport>{
    //  const { id, action } = reportVoteData;

    if (API_CONFIG.USE_MOCK_DATA) {
      // Giả lập delay
      await new Promise((r) => setTimeout(r, 200));

      const target = mockReports.find(r => r.id === id);
      if (!target) throw new Error('Report not found (MOCK)');
    }

    // API thật
    const url = `${API_CONFIG.BASE_URL}/reports/${id}/${action}/`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',

      },
      credentials: 'include', // nếu dùng cookie session
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Vote failed: ${res.status} ${msg || res.statusText}`);
    }

    // Server trả về { upvotes, downvotes }
    const data: { upvotes: number; downvotes: number } = await res.json();

    return { id, action, ...data };
  }
  async getReports(params: GetReportsRequest = {}): Promise<GetReportsResponse> {
  // MOCK MODE
  if (API_CONFIG.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filteredReports = [...mockReports];

    // Lọc vị trí
    if (params.lat && params.lng && params.radius) {
      filteredReports = filteredReports.filter(report => {
        const distance = this.calculateDistance(params.lat!, params.lng!, report.lat, report.lng);
        return distance <= params.radius!;
      });
    }

    // Lọc loại
    if (params.type) {
      filteredReports = filteredReports.filter(r => r.type === params.type);
    }

    // Phân trang
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const paginatedReports = filteredReports.slice(offset, offset + limit);

    return {
      count: filteredReports.length,
      next: offset + limit < filteredReports.length ? 'next_url' : null,
      previous: offset > 0 ? 'prev_url' : null,
      reports: paginatedReports,
    };
  }

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${API_CONFIG.BASE_URL}/reports/?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ Kiểm tra HTTP response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
    }

    // ✅ Kiểm tra định dạng JSON
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    const data = await response.json();
    return {
      count: data.count ?? 0,
      next: data.next ?? null,
      previous: data.previous ?? null,
      reports: data,
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy dữ liệu reports:', error);
    throw error;
  }
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

}

export const reportsService = new ReportsService();
