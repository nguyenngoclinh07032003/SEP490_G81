import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Wrench, 
  Wind, 
  Refrigerator, 
  Flame, 
  Zap, 
  ArrowRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck 
} from 'lucide-react';

export default function CustomerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Điều hòa / Máy lạnh', icon: Wind, color: '#087DEB', bg: '#EBF4FE' },
    { id: 2, name: 'Tủ lạnh & Tủ đông', icon: Refrigerator, color: '#059669', bg: '#ECFDF5' },
    { id: 3, name: 'Máy giặt & Sấy', icon: Wrench, color: '#D97706', bg: '#FEF3C7' },
    { id: 4, name: 'Bình nóng lạnh', icon: Flame, color: '#DC2626', bg: '#FEE2E2' },
    { id: 5, name: 'Hệ thống Điện gia dụng', icon: Zap, color: '#7C3AED', bg: '#F3E8FF' },
  ];

  const popularServices = [
    { id: 1, name: 'Bảo dưỡng, vệ sinh điều hòa treo tường', price: '150.000 đ', category: 'Điều hòa' },
    { id: 2, name: 'Nạp gas R32/R410A điều hòa Inverter', price: '350.000 đ', category: 'Điều hòa' },
    { id: 3, name: 'Kiểm tra & sửa tủ lạnh không mát', price: '200.000 đ', category: 'Tủ lạnh' },
    { id: 4, name: 'Vệ sinh lồng giặt cửa trên', price: '250.000 đ', category: 'Máy giặt' },
  ];

  return (
    <div style={{ paddingBottom: '20px' }}>
      {/* Banner chào mừng */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white',
        padding: '20px 16px 24px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Xin chào bạn,</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>
          {user?.full_name || 'Khách hàng Minh Đức'}
        </div>
        <p style={{ fontSize: '0.82rem', marginTop: '6px', opacity: 0.85 }}>
          Bạn cần hỗ trợ sửa chữa hoặc bảo trì thiết bị gì hôm nay?
        </p>

        {/* Nút đặt lịch to nổi bật */}
        <button
          onClick={() => navigate('/create-request')}
          style={{
            marginTop: '16px',
            background: 'var(--accent)',
            color: '#1E293B',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 159, 28, 0.4)'
          }}
        >
          <span>Đặt lịch sửa chữa ngay</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Đơn hàng đang diễn ra (Active Request Card) */}
      <div className="card" style={{ marginTop: '-14px', border: '1.5px solid #BAE6FD', background: '#F0F9FF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1' }}>ĐƠN ĐANG XỬ LÝ</span>
          <span className="badge badge-warning">KTV ĐANG ĐẾN</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '6px' }}>
          Mã đơn: #REQ-2026-081
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Bảo dưỡng điều hòa Daikin Inverter 12000BTU
        </div>

        {/* Kỹ thuật viên snapshot */}
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: 'white',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            T
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>KTV. Trần Văn Tuấn</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lịch hẹn: 14:30 - Hôm nay</div>
          </div>
          <a
            href="tel:0912345678"
            style={{
              background: '#DCFCE7',
              color: '#15803D',
              border: 'none',
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <PhoneCall size={14} /> Gọi thợ
          </a>
        </div>

        <button
          onClick={() => navigate('/my-requests')}
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0
          }}
        >
          Xem chi tiết tiến độ đơn hàng →
        </button>
      </div>

      {/* Danh mục dịch vụ */}
      <div style={{ padding: '0 16px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Danh mục dịch vụ</h2>
          <button
            onClick={() => navigate('/services')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Tất cả
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => navigate('/create-request', { state: { categoryId: cat.id } })}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: cat.bg,
                  color: cat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dịch vụ phổ biến */}
      <div style={{ padding: '0 16px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Dịch vụ nổi bật</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {popularServices.map((srv) => (
            <div
              key={srv.id}
              style={{
                background: 'white',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
                  {srv.category}
                </span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {srv.name}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
                  Giá từ: {srv.price}
                </div>
              </div>
              <button
                onClick={() => navigate('/create-request', { state: { serviceName: srv.name } })}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', flexShrink: 0 }}
              >
                Đặt lịch
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cam kết chất lượng Minh Đức */}
      <div className="card" style={{ background: '#F8FAFC', border: '1px dashed var(--border)', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-dark)', fontWeight: 700 }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <span>Cam kết từ Cơ Điện Lạnh Minh Đức</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
          ✓ Báo giá minh bạch trước khi sửa chữa.<br />
          ✓ 100% linh kiện chính hãng kèm tem bảo hành.<br />
          ✓ Kỹ thuật viên có chuyên môn, trang phục quy chuẩn.
        </p>
      </div>
    </div>
  );
}
