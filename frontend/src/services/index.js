/**
 * ==============================================================================
 * DỊCH VỤ MINH ĐỨC - SERVICES INDEX (ĐẦU MỐI GỌI API TẬP TRUNG)
 * ==============================================================================
 * Toàn bộ việc kết nối API của ứng dụng được quy hoạch tập trung tại folder này.
 * JSX Components và Hooks CHỈ CẦN import từ thư mục services:
 *
 * Ví dụ sử dụng trong JSX:
 *   import { authService, healthService } from '../services';
 *   // hoặc:
 *   import { loginApi, registerApi, getHealth } from '../services';
 */

import apiClient from './apiClient';
import authService, { loginApi, registerApi, logoutApi, getMeApi } from './auth.service';
import healthService, { getHealth } from './health.service';

// Export các instance service theo module
export { apiClient, authService, healthService };

// Export trực tiếp các hàm nghiệp vụ để import gọn gàng
export {
  loginApi,
  registerApi,
  logoutApi,
  getMeApi,
  getHealth,
};

// Mặc định xuất apiClient
export default apiClient;
