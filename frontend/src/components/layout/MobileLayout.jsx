import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, ClipboardList, Clock, User, Bell, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Xác định xem có phải trang chính (cần hiện logo) hay trang con (cần nút Back)
  const isRootTab = ['/', '/my-requests', '/service-history', '/profile'].includes(location.pathname);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/my-requests': return 'Đơn sửa chữa của tôi';
      case '/service-history': return 'Lịch sử & Bảo hành';
      case '/profile': return 'Tài khoản của tôi';
      case '/create-request': return 'Đặt dịch vụ sửa chữa';
      case '/services': return 'Danh mục dịch vụ';
      default: return '';
    }
  };

  return (
    <div className="app-viewport">
      {/* Top Header */}
      <header className="app-header">
        {isRootTab ? (
          <img
            src="/brand/logo-horizontal-light-200x60.png"
            alt="HRMSS Logo"
            className="header-logo"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => navigate(-1)}
              className="header-action-btn"
              title="Quay lại"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="header-title">{getPageTitle()}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="header-action-btn" title="Thông báo">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-body">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={22} className="nav-icon" />
          <span>Trang chủ</span>
        </NavLink>

        <NavLink to="/create-request" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <PlusCircle size={22} className="nav-icon" style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Đặt lịch</span>
        </NavLink>

        <NavLink to="/my-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ClipboardList size={22} className="nav-icon" />
          <span>Đơn sửa</span>
        </NavLink>

        <NavLink to="/service-history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Clock size={22} className="nav-icon" />
          <span>Lịch sử</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={22} className="nav-icon" />
          <span>Tài khoản</span>
        </NavLink>
      </nav>
    </div>
  );
}
