import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  ClipboardList,
  Clock,
  User,
  Bell,
  ChevronLeft,
  Smartphone,
  Monitor,
  Search,
  PhoneCall,
  ShieldCheck,
  Zap,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import QuickRoleSwitcher from './QuickRoleSwitcher';

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isRootTab = ['/', '/customer', '/my-requests', '/service-history', '/profile'].includes(location.pathname);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/my-requests': return 'Đơn sửa chữa của tôi';
      case '/service-history': return 'Lịch sử & Bảo hành điện tử';
      case '/profile': return 'Tài khoản khách hàng';
      case '/create-request': return 'Đặt lịch sửa chữa tại nhà';
      case '/services': return 'Bảng giá dịch vụ niêm yết';
      default: return 'HRMSS • Dịch Vụ Bảo Trì Minh Đức';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F6F9' }}>
      {/* 1. Quick Role Switcher Banner cho Đồ án */}
      <QuickRoleSwitcher />

      {/* 2. Thanh tiện ích chuyển đổi Desktop Portal vs Mobile App Frame (Sáng sủa, hiện đại) */}
      <div style={{
        backgroundColor: '#F8FAFC',
        color: '#334155',
        padding: '6px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.76rem',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-dmx-yellow" style={{ fontSize: '0.68rem', padding: '2px 7px', fontWeight: 800 }}>
            MINH ĐỨC
          </span>
          <span style={{ color: '#475569', fontWeight: 600 }}>Dịch Vụ Sửa Chữa & Bảo Trì Thiết Bị Minh Đức</span>
        </div>

        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease'
          }}
        >
          {isPhoneFrame ? <Monitor size={13} color="#0284C7" /> : <Smartphone size={13} color="#0284C7" />}
          <span>{isPhoneFrame ? 'Chuyển Màn Hình Rộng (Web Portal)' : 'Mô Phỏng Khung Điện Thoại (App Frame)'}</span>
        </button>
      </div>

      {/* 3. DESKTOP WIDE HEADER (Chỉ hiện khi ở chế độ màn hình rộng) */}
      {!isPhoneFrame && (
        <>
          {/* Topbar cam kết chất lượng */}
          <div className="dmx-topbar">
            <div className="dmx-topbar-commitments">
              <span className="dmx-topbar-item">
                <Zap size={14} color="#FED700" />
                <strong>Có mặt đúng hẹn sau 60 phút</strong>
              </span>
              <span className="dmx-topbar-item">
                <ShieldCheck size={14} color="#FED700" />
                <strong>Bảo hành dịch vụ chu đáo 60 ngày</strong>
              </span>
              <span className="dmx-topbar-item">
                <CheckCircle size={14} color="#FED700" />
                <strong>Báo giá minh bạch, không phát sinh chi phí</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PhoneCall size={14} color="#FED700" />
                <span>Hotline hỗ trợ: <strong style={{ color: '#FED700' }}>1900 6868</strong> (8:00 - 21:00)</span>
              </span>
            </div>
          </div>

          {/* Main Header */}
          <header className="dmx-header">
            <Link to="/" className="dmx-brand">
              <img
                src="/brand/logo-symbol-128.png"
                alt="Logo Minh Đức"
                style={{ height: '38px', width: '38px', objectFit: 'contain' }}
              />
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.25)', paddingLeft: '10px' }}>
                <div className="dmx-brand-title">DỊCH VỤ MINH ĐỨC</div>
                <div className="dmx-brand-subtitle">CHUYÊN NGHIỆP • UY TÍN • TẬN TÂM</div>
              </div>
            </Link>

            {/* Thanh tìm kiếm */}
            <form onSubmit={handleSearch} className="dmx-search-box">
              <input
                type="text"
                placeholder="Tìm dịch vụ: bảo dưỡng điều hòa, sửa tủ lạnh, máy giặt..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="dmx-search-input"
              />
              <button type="submit" className="dmx-search-btn" title="Tìm dịch vụ">
                <Search size={16} />
              </button>
            </form>

            {/* Các nút thao tác nhanh Header */}
            <div className="dmx-header-actions">
              <Link to="/my-requests" className="dmx-header-btn">
                <ClipboardList size={16} color="#FED700" />
                <span>Tra Cứu Đơn</span>
              </Link>

              <Link to="/create-request" className="btn btn-dmx-yellow" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <PlusCircle size={16} />
                <span>ĐẶT LỊCH NGAY</span>
              </Link>

              <Link to="/profile" className="dmx-header-btn" style={{ background: 'transparent', border: 'none' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#FED700',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user?.fullName?.charAt(0) || 'K'}
                </div>
                <span style={{ fontSize: '0.82rem' }}>{user?.fullName || 'Khách hàng'}</span>
              </Link>
            </div>
          </header>

          {/* Subnav các ngành hàng dịch vụ */}
          <nav className="dmx-subnav">
            <NavLink to="/" end className={({ isActive }) => `dmx-subnav-item ${isActive ? 'active' : ''}`}>
              <span>Trang chủ</span>
            </NavLink>
            <NavLink to="/services" className={({ isActive }) => `dmx-subnav-item ${isActive ? 'active' : ''}`}>
              <span>Bảng giá niêm yết</span>
            </NavLink>
            <NavLink to="/create-request" className={({ isActive }) => `dmx-subnav-item ${isActive ? 'active' : ''}`}>
              <span>Đặt lịch sửa chữa</span>
            </NavLink>
            <NavLink to="/my-requests" className={({ isActive }) => `dmx-subnav-item ${isActive ? 'active' : ''}`}>
              <span>Theo dõi tiến độ đơn</span>
            </NavLink>
            <NavLink to="/service-history" className={({ isActive }) => `dmx-subnav-item ${isActive ? 'active' : ''}`}>
              <span>Lịch sử & Bảo hành</span>
            </NavLink>
          </nav>
        </>
      )}

      {/* 4. VÙNG HIỂN THỊ NỘI DUNG (Content Container) */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: isPhoneFrame ? 'center' : 'stretch',
        padding: isPhoneFrame ? '24px 16px' : '0'
      }}>
        {isPhoneFrame ? (
          /* Khung mô phỏng điện thoại di động */
          <div className="app-viewport" style={{
            width: '100%',
            maxWidth: '440px',
            height: '92vh',
            maxHeight: '880px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: '36px',
            border: '8px solid #1E293B',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}>
            {/* Header rút gọn của app mobile */}
            <header style={{
              height: '56px',
              backgroundColor: 'var(--dmx-blue)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              zIndex: 20
            }}>
              {isRootTab ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/brand/logo-symbol-128.png" alt="Logo" style={{ height: '28px' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>DỊCH VỤ MINH ĐỨC</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                  </button>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{getPageTitle()}</span>
                </div>
              )}
              <button style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <Bell size={20} />
              </button>
            </header>

            {/* Thân cuộn app mobile */}
            <main className="app-body" style={{ flex: 1, paddingBottom: '70px', backgroundColor: '#F8FAFC' }}>
              <Outlet />
            </main>

            {/* Bottom Navigation chuẩn Mobile */}
            <nav className="bottom-nav">
              <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                <Home size={22} className="nav-icon" />
                <span>Trang chủ</span>
              </NavLink>

              <NavLink to="/create-request" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <PlusCircle size={22} className="nav-icon" style={{ color: 'var(--dmx-blue)' }} />
                <span style={{ color: 'var(--dmx-blue)', fontWeight: 700 }}>Đặt lịch</span>
              </NavLink>

              <NavLink to="/my-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ClipboardList size={22} className="nav-icon" />
                <span>Đơn sửa</span>
              </NavLink>

              <NavLink to="/service-history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Clock size={22} className="nav-icon" />
                <span>Bảo hành</span>
              </NavLink>

              <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <User size={22} className="nav-icon" />
                <span>Tài khoản</span>
              </NavLink>
            </nav>
          </div>
        ) : (
          /* Chế độ Màn hình Rộng (Web Portal) */
          <div style={{ flex: 1, width: '100%', minHeight: '80vh' }}>
            <Outlet />
          </div>
        )}
      </div>

      {/* 5. DESKTOP FOOTER */}
      {!isPhoneFrame && (
        <footer className="dmx-footer">
          <div className="dmx-footer-container">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <img src="/brand/logo-symbol-128.png" alt="Logo" style={{ height: '32px' }} />
                <strong style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>DỊCH VỤ MINH ĐỨC</strong>
              </div>
              <p style={{ color: 'var(--slate-400)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '14px' }}>
                Hệ thống dịch vụ bảo trì, sửa chữa và lắp đặt thiết bị điện tử, điện lạnh gia dụng tận nhà. Phục vụ chuyên nghiệp 24/7, báo giá minh bạch, linh kiện chính hãng.
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--dmx-yellow)', fontWeight: 700 }}>
                Hotline hỗ trợ: 1900 6868 (8:00 - 21:00)
              </div>
            </div>

            <div>
              <h4 className="dmx-footer-title">Dịch Vụ Trọng Tâm</h4>
              <ul className="dmx-footer-links">
                <li><Link to="/services">Vệ sinh & Nạp gas điều hòa</Link></li>
                <li><Link to="/services">Sửa tủ lạnh không mát / chảy nước</Link></li>
                <li><Link to="/services">Vệ sinh tháo lồng máy giặt</Link></li>
                <li><Link to="/services">Bảo dưỡng bình nóng lạnh</Link></li>
                <li><Link to="/services">Sửa chập điện nước dân dụng</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="dmx-footer-title">Cam Kết Chất Lượng</h4>
              <ul className="dmx-footer-links">
                <li><span style={{ color: 'var(--slate-400)' }}>Có mặt trong vòng 60 phút</span></li>
                <li><span style={{ color: 'var(--slate-400)' }}>Báo giá minh bạch, không phí ẩn</span></li>
                <li><span style={{ color: 'var(--slate-400)' }}>Bảo hành dịch vụ 60 ngày</span></li>
                <li><span style={{ color: 'var(--slate-400)' }}>100% Kỹ thuật viên có chứng chỉ</span></li>
                <li><span style={{ color: 'var(--slate-400)' }}>Khách nghiệm thu ưng ý mới thanh toán</span></li>
              </ul>
            </div>

            <div>
              <h4 className="dmx-footer-title">Khu Vực Phục Vụ</h4>
              <p style={{ color: 'var(--slate-400)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                <strong>Hà Nội:</strong> Cầu Giấy, Hà Đông, Đống Đa, Thanh Xuân, Tây Hồ, Ba Đình, Nam Từ Liêm, Bắc Từ Liêm, Hai Bà Trưng, Hoàng Mai.
              </p>
              <div style={{ marginTop: '14px', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#CBD5E1' }}>
                Hotline 24/7: 1900 6868 • Minh Đức Service
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
            © 2026 Dịch Vụ Minh Đức - Trung tâm bảo trì, sửa chữa thiết bị điện lạnh & gia dụng.
          </div>
        </footer>
      )}
    </div>
  );
}
