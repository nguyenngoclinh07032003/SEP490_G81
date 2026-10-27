/**
 * ==============================================================================
 * DỊCH VỤ MINH ĐỨC - API CLIENT & HTTP SERVICE WRAPPER
 * ==============================================================================
 * Cung cấp HTTP client tập trung:
 * - Tự động quản lý baseURL (VITE_API_URL hoặc mặc định http://localhost:5000)
 * - Tự động gắn Token xác thực JWT (Bearer) vào Authorization header
 * - Chuẩn hóa xử lý lỗi và JSON response
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  /**
   * Lấy Access Token từ LocalStorage
   */
  getToken() {
    return localStorage.getItem('hrmss_token') || localStorage.getItem('token') || null;
  }

  /**
   * Lấy Refresh Token từ LocalStorage
   */
  getRefreshToken() {
    return localStorage.getItem('hrmss_refresh_token') || null;
  }

  /**
   * Lưu trữ cặp Token mới vào LocalStorage
   */
  setTokens(accessToken, refreshToken = null) {
    if (accessToken) {
      localStorage.setItem('hrmss_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('hrmss_refresh_token', refreshToken);
    }
  }

  /**
   * Xóa toàn bộ token khi đăng xuất hoặc hết hạn phiên
   */
  clearTokens() {
    localStorage.removeItem('hrmss_token');
    localStorage.removeItem('hrmss_refresh_token');
    localStorage.removeItem('token');
  }

  /**
   * Đăng ký callback chờ nhận Token mới khi đang refresh
   */
  subscribeTokenRefresh(callback) {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Đẩy Token mới cho tất cả các request đang xếp hàng chờ
   */
  onRefreshed(newAccessToken) {
    this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
    this.refreshSubscribers = [];
  }

  /**
   * Gọi API làm mới token (/api/auth/refresh-token)
   */
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    const oldAccessToken = this.getToken();

    if (!refreshToken) {
      throw new Error('Không có Refresh Token.');
    }

    const response = await fetch(`${this.baseURL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, oldAccessToken }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      this.clearTokens();
      throw new Error(data.message || 'Làm mới token thất bại.');
    }

    const { accessToken, refreshToken: newRefreshToken } = data.data;
    this.setTokens(accessToken, newRefreshToken);
    return accessToken;
  }

  /**
   * Tạo headers chuẩn kèm Authorization nếu đã đăng nhập
   */
  getHeaders(customHeaders = {}, isFormData = false) {
    const headers = { ...customHeaders };
    
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Thực hiện HTTP request cơ sở kèm cơ chế Tự động làm mới Token (Silent Refresh)
   */
  async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const config = {
      ...options,
      headers: this.getHeaders(options.headers, isFormData),
    };

    try {
      const response = await fetch(url, config);
      
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Xử lý khi Access Token hết hạn sau 15 phút (mã 401 TOKEN_EXPIRED)
      if (response.status === 401 && !options._isRetry && !endpoint.includes('/refresh-token')) {
        const isExpired = (data && typeof data === 'object' && (data.code === 'TOKEN_EXPIRED' || data.message?.includes('hết hạn')));
        const refreshToken = this.getRefreshToken();

        if (isExpired && refreshToken) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            try {
              const newAccessToken = await this.refreshAccessToken();
              this.isRefreshing = false;
              this.onRefreshed(newAccessToken);
            } catch (refreshErr) {
              this.isRefreshing = false;
              this.refreshSubscribers = [];
              this.clearTokens();
              throw refreshErr;
            }
          }

          // Xếp hàng các request chờ Token mới và tự động gửi lại
          return new Promise((resolve, reject) => {
            this.subscribeTokenRefresh(async (newToken) => {
              try {
                const retryOptions = {
                  ...options,
                  _isRetry: true,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                  },
                };
                const retryResult = await this.request(endpoint, retryOptions);
                resolve(retryResult);
              } catch (retryErr) {
                reject(retryErr);
              }
            });
          });
        }
      }

      if (!response.ok) {
        const errorMessage = (data && typeof data === 'object' && (data.message || data.error)) 
          ? (data.message || data.error) 
          : `Yêu cầu thất bại với mã lỗi HTTP ${response.status}`;
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Re-throw để các service hoặc UI component xử lý theo nghiệp vụ
      throw err;
    }
  }

  /**
   * [GET] Request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * [POST] Request
   */
  post(endpoint, body = {}, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  /**
   * [PUT] Request
   */
  put(endpoint, body = {}, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  /**
   * [PATCH] Request
   */
  patch(endpoint, body = {}, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  /**
   * [DELETE] Request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
