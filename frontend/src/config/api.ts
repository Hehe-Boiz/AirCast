// API Configuration
// Thay đổi BASE_URL này khi deploy hoặc sử dụng environment variables

export const API_CONFIG = {
  // Django Backend URL
  // Trong production, thay đổi URL này hoặc sử dụng environment config
  BASE_URL: 'http://localhost:8000/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH_TOKEN: '/auth/refresh/',
    USER_PROFILE: '/auth/profile/',
    
    // User Profile Management
    UPDATE_PROFILE: '/users/profile/',
    CHANGE_PASSWORD: '/users/change-password/',
    UPLOAD_AVATAR: '/users/avatar/',
    
    // Reports
    REPORTS: '/reports/',
    REPORT_DETAIL: (id: string) => `/reports/${id}/`,
    REPORTS_BY_LOCATION: '/reports/by-location/',
    REPORT_UP_VOTE: (id:string) => `/reports/${id}/upvote/`,
    REPORT_DOWN_VOTE:(id:string) => `/reports/${id}/downvote/`,
    // REPORT_VOTE: (id:string) => `/reports/${id}/vote/`,
    // Users
    USER_STATS: '/auth/profile/',
    USER_ACHIEVEMENTS: '/profiles/achievements/',
    // AQI
    AQI_FETCH: '/aqi/fetch/',
    

    // Uploads
    UPLOAD_IMAGE: '/uploads/image/',
    UPLOAD_AUDIO: '/uploads/audio/',
  },
  
  // Request timeout (ms)
  TIMEOUT: 30000,
  
  // Mock mode - set to false khi kết nối với Django
  USE_MOCK_DATA: false,
};

// Headers configuration
export const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Headers for multipart/form-data
export const getMultipartHeaders = (): HeadersInit => {
  const headers: HeadersInit = {};
  
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Không set Content-Type để browser tự động set boundary cho multipart
  return headers;
};