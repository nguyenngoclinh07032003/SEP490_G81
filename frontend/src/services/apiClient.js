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
  }

  /**
   * Lấy token xác thực từ LocalStorage
   */
  getToken() {
    return localStorage.getItem('hrmss_token') || localStorage.getItem('token') || null;
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
   * Thực hiện HTTP request cơ sở
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
