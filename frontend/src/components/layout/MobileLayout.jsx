import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, ClipboardList, Clock, User, Bell, ChevronLeft, Smartphone, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import QuickRoleSwitcher from './QuickRoleSwitcher';

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Xác định xem có phải trang chính (cần hiện logo) hay trang con (cần nút Back)
  const isRootTab = ['/', '/customer', '/my-requests', '/service-history', '/profile'].includes(location.pathname);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/my-requests': return 'Đơn sửa chữa của tôi';
      case '/service-history': return 'Lịch sử & Bảo hành';
      case '/profile': return 'Tài khoản của tôi';
      case '/create-request': return 'Đặt dịch vụ sửa chữa';
      case '/services': return 'Danh mục dịch vụ';
      default: return 'HRMSS Khách Hàng';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--slate-100)' }}>
      {/* Quick Role Switcher Banner */}
      <QuickRoleSwitcher />

      {/* Bar điều khiển chế độ hiển thị trên Desktop */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--slate-200)',
        padding: '6px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: 'var(--slate-600)'
      }}>
        <span>Cổng dịch vụ Khách Hàng (Customer Portal)</span>
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          style={{
            background: 'var(--slate-100)',
            border: '1px solid var(--slate-300)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {isPhoneFrame ? <Monitor size={14} /> : <Smartphone size={14} />}
          <span>{isPhoneFrame ? 'Chế độ Màn hình Rộng' : 'Mô phỏng Khung Điện thoại'}</span>
        </button>
      </div>

      {/* Khung hiển thị */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: isPhoneFrame ? 'center' : 'stretch',
        padding: isPhoneFrame ? '20px' : '0'
      }}>
        <div className={isPhoneFrame ? 'app-viewport' : ''} style={{
          width: isPhoneFrame ? '100%' : '100%',
          maxWidth: isPhoneFrame ? '440px' : '900px',
          height: isPhoneFrame ? '90vh' : 'auto',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRadius: isPhoneFrame ? '32px' : '0',
          border: isPhoneFrame ? '8px solid #1E293B' : 'none',
          boxShadow: isPhoneFrame ? 'var(--shadow-xl)' : 'none',
          margin: isPhoneFrame ? '0 auto' : '0 auto',
          minHeight: isPhoneFrame ? 'auto' : '85vh'
        }}>
          {/* Top Header */}
          <header className="app-header" style={{
            height: '60px',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: '#FFFFFF',
            position: 'sticky',
            top: 0,
            zIndex: 20
          }}>
            {isRootTab ? (
              <img
                src="/brand/logo-horizontal-light-200x60.png"
                alt="HRMSS Logo"
                className="header-logo"
                style={{ height: '36px', objectFit: 'contain' }}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="header-action-btn" title="Thông báo">
                <Bell size={20} />
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="app-body" style={{ flex: 1, paddingBottom: '70px', overflowY: 'auto' }}>
            <Outlet />
          </main>

          {/* Bottom Navigation Bar */}
          <nav className="bottom-nav" style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: '#FFFFFF',
            borderTop: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 30
          }}>
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
      </div>
    </div>
  );
}
