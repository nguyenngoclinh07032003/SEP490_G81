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
    password: credentials.password,
  };

  return await apiClient.post('/api/auth/login', payload);
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
 * Đăng xuất hệ thống (Hủy token trên Redis & Backend)
 * @returns {Promise<Object>}
 */
export async function logoutApi() {
  return await apiClient.post('/api/auth/logout');
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
  logout: logoutApi,
  getMe: getMeApi,
};

export default authService;
