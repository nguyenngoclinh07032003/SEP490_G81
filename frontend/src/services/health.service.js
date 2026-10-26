/**
 * ==============================================================================
 * DỊCH VỤ MINH ĐỨC - SYSTEM & HEALTH CHECK SERVICE
 * ==============================================================================
 * Kiểm tra trạng thái hoạt động của Backend, Database PostgreSQL và Redis.
 */

import apiClient from './apiClient';

/**
 * Kiểm tra kết nối Backend & Hạ tầng
 * @returns {Promise<Object>}
 */
export async function getHealth() {
  return await apiClient.get('/api/health');
}

export const healthService = {
  getHealth,
};

export default healthService;
