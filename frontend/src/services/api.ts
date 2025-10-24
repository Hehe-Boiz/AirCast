// Base API Service
// Wrapper cho fetch API với error handling và token management

import { API_CONFIG, getHeaders, getMultipartHeaders } from '../config/api';
import type { ApiError } from '../types/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Generic fetch wrapper
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  // Handle API errors
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: 'Đã xảy ra lỗi khi kết nối với server',
          status_code: response.status,
        };
      }
      console.info(`[API SUCCESS] ${response.url}: Status ${response.status}`); 
      if (response.status === 204 || response.status === 205) { //
        return {} as T;
      }
    
      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        // Attempt to refresh token
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) {
          // Redirect to login or clear auth
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // window.location.href = '/login';
        }
      }

      throw errorData;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204 || response.status === 205) {
      return {} as T;
    }

    return response.json();
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await this.post<{ access_token: string }>(
        API_CONFIG.ENDPOINTS.REFRESH_TOKEN,
        { refresh_token: refreshToken },
        false // Don't include auth header
      );

      localStorage.setItem('access_token', response.access_token);
      return true;
    } catch {
      return false;
    }
  }

  // GET request
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: getHeaders(includeAuth),
    });
    return this.handleResponse<T>(response);
  }

  // POST request
  async post<T>(
    endpoint: string,
    data: any,
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data: any,
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data: any,
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'PATCH',
      headers: getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  // DELETE request
  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: getHeaders(includeAuth),
    });
    return this.handleResponse<T>(response);
  }

  // Upload file (multipart/form-data)
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiService = new ApiService();
