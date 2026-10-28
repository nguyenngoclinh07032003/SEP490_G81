/**
 * ==============================================================================
 * DỊCH VỤ MINH ĐỨC - AUTHENTICATION SERVICE (TẬP TRUNG)
 * ==============================================================================
 * Xử lý toàn bộ logic gọi API xác thực:
 * - Đăng nhập tài khoản
 * - Đăng ký tài khoản
 * - Đăng xuất & hủy Token
 * - Lấy thông tin tài khoản hiện tại (/me)
 */

import apiClient from './apiClient';

/**
 * Đăng nhập hệ thống
 * @param {Object} credentials - { username, password } hoặc { identifier, password }
 * @returns {Promise<Object>} Response từ backend
 */
export async function loginApi(credentials) {
  const payload = {
    username: credentials.username || credentials.identifier,
    email: credentials.email,
    identifier: credentials.identifier || credentials.username || credentials.email,
    password: credentials.password,
  };

  const response = await apiClient.post('/api/auth/login', payload);
  if (response?.success && response?.data) {
    const { token, accessToken, refreshToken } = response.data;
    apiClient.setTokens(accessToken || token, refreshToken);
  }
  return response;
}

/**
 * Đăng ký tài khoản người dùng mới
 * @param {Object} userData - { username, password, fullName, phone, email, roleCode }
 * @returns {Promise<Object>} Response từ backend
 */
export async function registerApi(userData) {
  const payload = {
    username: userData.username,
    password: userData.password,
    fullName: userData.fullName || userData.full_name,
    phone: userData.phone,
    email: userData.email,
    roleCode: userData.roleCode || userData.role_code || 'CUSTOMER',
  };

  return await apiClient.post('/api/auth/register', payload);
}

/**
 * Làm mới Access Token (15 phút) bằng Refresh Token
 * @returns {Promise<Object>}
 */
export async function refreshTokenApi() {
  const refreshToken = apiClient.getRefreshToken();
  const oldAccessToken = apiClient.getToken();
  return await apiClient.post('/api/auth/refresh-token', { refreshToken, oldAccessToken });
}

/**
 * Đăng xuất hệ thống (Hủy token trên Redis & Backend)
 * @returns {Promise<Object>}
 */
export async function logoutApi() {
  const refreshToken = apiClient.getRefreshToken();
  try {
    return await apiClient.post('/api/auth/logout', { refreshToken });
  } finally {
    apiClient.clearTokens();
  }
}

/**
 * Lấy hồ sơ tài khoản hiện tại từ Token
 * @returns {Promise<Object>}
 */
export async function getMeApi() {
  return await apiClient.get('/api/auth/me');
}

export const authService = {
  login: loginApi,
  register: registerApi,
  refreshToken: refreshTokenApi,
  logout: logoutApi,
  getMe: getMeApi,
};

export default authService;
