import React from 'react';
import {
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  Star,
  Users,
  Award,
  ArrowUpRight,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const kpis = [
    { title: 'Doanh Thu Tháng Này', value: '148.600.000 đ', trend: '+18.5% so với tháng trước', icon: DollarSign, color: '#10B981', bg: '#ECFDF5' },
    { title: 'Tỷ Lệ Xong Đúng Hạn', value: '96.4%', trend: 'Mục tiêu: > 95%', icon: CheckCircle, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Đơn Chờ Phê Duyệt', value: '7 đơn', trend: '3 báo giá > 5tr', icon: Clock, color: '#F59E0B', bg: '#FEF3C7' },
    { title: 'Đánh Giá Khách Hàng', value: '4.88 / 5.0', trend: 'Từ 340 lượt đánh giá', icon: Star, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  const topTechnicians = [
    { name: 'Trần Văn Nam', specialty: 'Điều hòa, Tủ lạnh inverter', completed: 52, rating: 4.95, revenue: '34.200.000 đ' },
    { name: 'Phạm Huy Hoàng', specialty: 'Máy giặt, Bình nóng lạnh', completed: 46, rating: 4.90, revenue: '28.900.000 đ' },
    { name: 'Lê Trung Kiên', specialty: 'Hệ thống điện gia dụng', completed: 39, rating: 4.82, revenue: '22.500.000 đ' },
    { name: 'Vũ Đức Mạnh', specialty: 'Bảo trì tổng thể', completed: 34, rating: 4.80, revenue: '19.800.000 đ' },
  ];

  const pendingApprovals = [
    { id: 'REQ-1082', customer: 'Bác Hoàng Minh (Cầu Giấy)', service: 'Thay Block máy nén tủ lạnh Hitachi 4 cánh', amount: '4.800.000 đ', tech: 'Trần Văn Nam', status: 'Báo giá vượt khung' },
    { id: 'REQ-1089', customer: 'Chị Mai Lan (Hà Đông)', service: 'Xử lý chập điện ngầm toàn bộ tầng 2', amount: '3.200.000 đ', tech: 'Lê Trung Kiên', status: 'Khảo sát phức tạp' },
    { id: 'REQ-1094', customer: 'Anh Tuấn Anh (Tây Hồ)', service: 'Thay dàn đồng điều hòa multi Daikin', amount: '6.500.000 đ', tech: 'Trần Văn Nam', status: 'Báo giá vượt khung' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Quản Lý Điều Hành & Chất Lượng</h1>
          <p className="page-subtitle">Giám sát doanh thu dịch vụ, KPI hiệu suất đội ngũ thợ và xét duyệt báo giá đặc biệt</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/manager/services')}>
          <span>Quản Lý Bảng Giá & Dịch Vụ</span>
          <ArrowUpRight size={16} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: k.bg, color: k.color }}>
                <Icon size={22} />
              </div>
              <span className="stat-title">{k.title}</span>
              <span className="stat-value">{k.value}</span>
              <span className="stat-trend" style={{ color: k.color }}>
                <TrendingUp size={14} />
                <span>{k.trend}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Bảng duyệt báo giá đặc biệt */}
        <div className="card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="var(--primary)" />
              <span>Yêu Cầu Cần Phê Duyệt (Approvals)</span>
            </h3>
            <span className="badge badge-warning">3 cần xử lý</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingApprovals.map(p => (
              <div key={p.id} style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-200)',
                background: 'var(--slate-50)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.85rem' }}>{p.id}</span>
                    <span style={{ marginLeft: '8px', fontSize: '0.85rem', fontWeight: 600 }}>{p.customer}</span>
                  </div>
                  <strong style={{ color: 'var(--danger-dark)', fontSize: '0.9rem' }}>{p.amount}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '4px' }}>{p.service}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Thợ đề xuất: <strong>{p.tech}</strong></span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>Từ chối</button>
                    <button className="btn btn-primary btn-sm" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>Phê duyệt</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bảng xếp hạng thợ xuất sắc nhất */}
        <div className="card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#D97706" />
              <span>Bảng Xếp Hạng Hiệu Suất Kỹ Thuật Viên</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Tháng này</span>
          </div>

          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Thợ Sửa Chữa</th>
                  <th>Số Đơn Xong</th>
                  <th>Đánh Giá</th>
                  <th>Doanh Thu Đem Về</th>
                </tr>
              </thead>
              <tbody>
                {topTechnicians.map((t, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{t.specialty}</div>
                    </td>
                    <td>
                      <span className="badge badge-status-active">{t.completed} đơn</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, color: '#D97706', fontSize: '0.85rem' }}>
                        <Star size={14} fill="#D97706" />
                        <span>{t.rating}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{t.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
