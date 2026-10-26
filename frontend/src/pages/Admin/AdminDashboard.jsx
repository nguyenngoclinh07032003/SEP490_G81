import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Activity,
  Server,
  Database,
  Zap,
  TrendingUp,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { getHealth } from '../../services/api';

export default function AdminDashboard() {
  const [healthStatus, setHealthStatus] = useState({ status: 'checking', message: 'Đang kiểm tra...' });

  useEffect(() => {
    getHealth()
      .then(res => setHealthStatus({ status: 'connected', data: res }))
      .catch(() => setHealthStatus({ status: 'disconnected', message: 'Backend chưa khởi động hoặc port 5000 chưa sẵn sàng' }));
  }, []);

  const stats = [
    { title: 'Tổng Người Dùng', value: '1,280', trend: '+14% tháng này', icon: Users, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Kỹ Thuật Viên (Thợ)', value: '36', trend: '32 đang sẵn sàng', icon: Zap, color: '#10B981', bg: '#ECFDF5' },
    { title: 'Yêu Cầu Sửa Chữa', value: '452', trend: '+28 hôm nay', icon: Activity, color: '#F59E0B', bg: '#FEF3C7' },
    { title: 'Tài Khoản Quản Trị', value: '5', trend: 'Admin & Trưởng phòng', icon: Shield, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  const recentLogs = [
    { id: 1, user: 'admin', action: 'Cấp quyền kỹ thuật viên cho tech_nam', time: '10 phút trước', ip: '192.168.1.15', status: 'SUCCESS' },
    { id: 2, user: 'manager_duc', action: 'Cập nhật bảng giá dịch vụ Điều hòa Inverter', time: '45 phút trước', ip: '192.168.1.20', status: 'SUCCESS' },
    { id: 3, user: 'staff_lan', action: 'Phân công đơn #REQ-1049 cho thợ Trần Văn Nam', time: '1 giờ trước', ip: '192.168.1.33', status: 'SUCCESS' },
    { id: 4, user: 'system', action: 'Redis tự động xóa Token hết hạn (Blacklist purge)', time: '2 giờ trước', ip: '127.0.0.1', status: 'SUCCESS' },
    { id: 5, user: 'unknown', action: 'Nhập sai mật khẩu quá 5 lần (Lockout 15 phút)', time: '3 giờ trước', ip: '118.70.12.9', status: 'WARNING' },
  ];

  return (
    <div>
      {/* Tiêu đề trang */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Trị Hệ Thống (System Administration)</h1>
          <p className="page-subtitle">Giám sát tổng quan người dùng, phân quyền vai trò và an toàn hạ tầng Dịch Vụ Minh Đức</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="badge badge-role-admin" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            <Shield size={14} />
            <span>Phân Quyền Tối Cao (SUPER_ADMIN)</span>
          </div>
        </div>
      </div>

      {/* Grid thẻ số liệu KPI */}
      <div className="stat-grid">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: s.bg, color: s.color }}>
                <Icon size={22} />
              </div>
              <span className="stat-title">{s.title}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-trend" style={{ color: s.color }}>
                <TrendingUp size={14} />
                <span>{s.trend}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Trạng thái hạ tầng Docker / PostgreSQL / Redis */}
      <div className="card-modern" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} color="var(--primary)" />
          <span>Trạng Thái Hạ Tầng & Cơ Sở Dữ Liệu</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <Database size={18} color="#0284C7" />
                <span>PostgreSQL Database</span>
              </div>
              <span className="badge badge-status-active">
                <CheckCircle2 size={12} />
                <span>Port 5432: Ready</span>
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              29 bảng quan hệ, Pool: 10 connections. Ràng buộc ACID & Trigger hoạt động chuẩn.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <Zap size={18} color="#DC2626" />
                <span>Redis In-Memory Cache</span>
              </div>
              <span className="badge badge-status-active">
                <CheckCircle2 size={12} />
                <span>Port 6379: Ready</span>
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              JWT Token Blacklist, chống dò mật khẩu brute-force (Rate Limit Lockout: 15 phút).
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <Server size={18} color="#10B981" />
                <span>Express Backend Server</span>
              </div>
              <span className={`badge ${healthStatus.status === 'connected' ? 'badge-status-active' : 'badge-status-pending'}`}>
                {healthStatus.status === 'connected' ? 'Port 5000: Online' : 'Local Standby'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Node.js v20+, RESTful API routes, JWT Authentication & RBAC Middleware.
            </p>
          </div>
        </div>
      </div>

      {/* Nhật ký bảo mật & hoạt động hệ thống gần nhất */}
      <div className="card-modern">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--primary)" />
            <span>Nhật Ký Bảo Mật & Hoạt Động (Security Audit Log)</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Tự động ghi nhận theo thời gian thực</span>
        </div>

        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Mã Nhật Ký</th>
                <th>Người Thực Hiện</th>
                <th>Hành Động / Nghiệp Vụ</th>
                <th>Địa Chỉ IP</th>
                <th>Thời Gian</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600, color: 'var(--slate-500)' }}>#LOG-{log.id}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{log.user}</span>
                  </td>
                  <td>{log.action}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{log.ip}</td>
                  <td style={{ color: 'var(--slate-500)', fontSize: '0.82rem' }}>{log.time}</td>
                  <td>
                    <span className={`badge ${log.status === 'SUCCESS' ? 'badge-status-active' : 'badge-status-pending'}`}>
                      {log.status === 'SUCCESS' ? 'Thành công' : 'Cảnh báo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
