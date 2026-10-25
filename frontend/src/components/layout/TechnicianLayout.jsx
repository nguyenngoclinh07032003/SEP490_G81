import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import QuickRoleSwitcher from './QuickRoleSwitcher';
import {
  Wrench,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  LogOut,
  Bell,
  PhoneCall,
  Navigation
} from 'lucide-react';

export default function TechnicianLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--slate-100)' }}>
      <QuickRoleSwitcher />

      {/* Top Header cho Thợ */}
      <header style={{
        background: 'var(--navy-900)',
        color: '#FFFFFF',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/brand/logo-horizontal-light-200x60.png"
            alt="HRMSS Logo"
            style={{ height: '32px', objectFit: 'contain' }}
          />
          <span className="badge badge-role-tech" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Wrench size={12} />
            <span>Kỹ thuật viên</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Nút bật/tắt nhận việc */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: isOnline ? 'var(--success)' : 'var(--slate-600)',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              animation: isOnline ? 'pulse 1.5s infinite' : 'none'
            }} />
            {isOnline ? 'Sẵn sàng nhận việc' : 'Tạm nghỉ'}
          </button>

          <button
            onClick={handleLogout}
            className="icon-btn"
            title="Đăng xuất"
            style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'transparent', color: '#FFFFFF' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '16px' }}>
        <Outlet />
      </main>
    </div>
  );
}
