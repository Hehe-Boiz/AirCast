// src/services/aqi.ts
import { apiService } from './api';
import { API_CONFIG } from '../config/api';

export type AqiFetchRequest = {
  lat_min: number;
  lon_min: number;
  lat_max: number;
  lon_max: number;
};

export type AqiFetchResponse = [number, number, number, number][];

class AqiService {
  async fetchPoints(payload: AqiFetchRequest): Promise<AqiFetchResponse> {
    // POST /api/aqi/fetch/
    return apiService.post<AqiFetchResponse>(
      API_CONFIG.ENDPOINTS.AQI_FETCH,
      payload,
      false
    );
  }
}

export const aqiService = new AqiService();