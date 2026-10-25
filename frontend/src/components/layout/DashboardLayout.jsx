import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import QuickRoleSwitcher from './QuickRoleSwitcher';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Briefcase,
  Layers,
  BarChart3,
  CheckSquare,
  Headphones,
  Calendar,
  FileText,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cấu hình menu theo từng vai trò (RBAC Menu Navigation)
  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { section: 'TỔNG QUAN', items: [
            { path: '/admin', label: 'Dashboard Hệ Thống', icon: LayoutDashboard }
          ]},
          { section: 'QUẢN TRỊ TRUY CẬP', items: [
            { path: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
            { path: '/admin/roles', label: 'Vai Trò & Phân Quyền', icon: Shield },
          ]},
          { section: 'HẠ TẦNG & LOGS', items: [
            { path: '/admin/settings', label: 'Cấu Hình & Trạng Thái', icon: Settings },
          ]}
        ];
      case 'MANAGER':
        return [
          { section: 'ĐIỀU HÀNH', items: [
            { path: '/manager', label: 'Dashboard Quản Lý', icon: LayoutDashboard },
            { path: '/manager/services', label: 'Dịch Vụ & Bảng Giá', icon: Layers },
          ]},
          { section: 'BÁO CÁO & PHÊ DUYỆT', items: [
            { path: '/manager/reports', label: 'Báo Cáo Doanh Thu & KPI', icon: BarChart3 },
            { path: '/manager/approvals', label: 'Duyệt Nghiệm Thu & Đơn', icon: CheckSquare },
          ]}
        ];
      case 'OFFICE_STAFF':
        return [
          { section: 'ĐIỀU PHỐI VĂN PHÒNG', items: [
            { path: '/staff', label: 'Trung Tâm Điều Phối', icon: Headphones },
            { path: '/staff/requests', label: 'Yêu Cầu Sửa Chữa', icon: FileText },
            { path: '/staff/schedule', label: 'Lịch Trực & Phân Công', icon: Calendar },
          ]}
        ];
      default:
        return [
          { section: 'BẢNG ĐIỀU KHIỂN', items: [
            { path: '/', label: 'Trang Chủ', icon: LayoutDashboard }
          ]}
        ];
    }
  };

  const navSections = getNavLinks();

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'ADMIN': return 'badge-role-admin';
      case 'MANAGER': return 'badge-role-manager';
      case 'OFFICE_STAFF': return 'badge-role-staff';
      case 'TECHNICIAN': return 'badge-role-tech';
      default: return 'badge-role-customer';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Thanh Demo Phân Quyền Nhanh */}
      <QuickRoleSwitcher />

      <div className="dashboard-root">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <img
              src="/brand/logo-horizontal-light-600x180.png"
              alt="HRMSS Logo"
              className="sidebar-logo"
            />
          </div>

          <div className="sidebar-nav">
            {navSections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div className="nav-section-title">{sec.section}</div>
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={18} className="icon" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="user-mini-profile">
              <div className="avatar-circle">
                {user?.avatar || user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="user-mini-info">
                <div className="user-mini-name">{user?.fullName || user?.username}</div>
                <div className="user-mini-role">
                  <span className={`badge ${getRoleBadgeClass()}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="icon-btn"
                title="Đăng xuất"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop cho mobile */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 95
            }}
          />
        )}

        {/* Dashboard Main Content */}
        <div className="dashboard-main">
          {/* Top Navbar */}
          <header className="dashboard-navbar">
            <div className="navbar-left">
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <div className="navbar-search">
                <Search size={16} className="icon" />
                <input type="text" placeholder="Tìm kiếm nhanh đơn, thợ, dịch vụ..." />
              </div>
            </div>

            <div className="navbar-right">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
                <span className={`badge ${getRoleBadgeClass()}`}>
                  <UserCheck size={12} />
                  <span>{user?.roleName || user?.role}</span>
                </span>
              </div>

              <button className="icon-btn" title="Thông báo hệ thống">
                <Bell size={18} />
                <span className="notification-dot" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px' }}>
                <div className="avatar-circle" style={{ width: '34px', height: '34px', fontSize: '0.8rem' }}>
                  {user?.avatar || 'U'}
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
