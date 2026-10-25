import React from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { Shield, Briefcase, Headphones, Wrench, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickRoleSwitcher() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { code: 'ADMIN', name: 'Quản trị viên', icon: Shield, path: '/admin', color: '#A78BFA' },
    { code: 'MANAGER', name: 'Quản lý vận hành', icon: Briefcase, path: '/manager', color: '#FBBF24' },
    { code: 'OFFICE_STAFF', name: 'Điều phối viên', icon: Headphones, path: '/staff', color: '#38BDF8' },
    { code: 'TECHNICIAN', name: 'Kỹ thuật viên', icon: Wrench, path: '/technician', color: '#34D399' },
    { code: 'CUSTOMER', name: 'Khách hàng', icon: User, path: '/customer', color: '#60A5FA' },
  ];

  const handleSwitch = (roleCode, path) => {
    switchRole(roleCode);
    navigate(path);
  };

  return (
    <div className="role-switcher-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} color="#FBBF24" />
        <span style={{ fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.2px' }}>
          SEP490 RBAC DEMO:
        </span>
        <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>
          Đang xem với vai trò: <strong style={{ color: '#93C5FD' }}>{user?.roleName || user?.role}</strong>
        </span>
      </div>

      <div className="role-switcher-pills">
        {roles.map(r => {
          const Icon = r.icon;
          const isActive = user?.role === r.code;
          return (
            <button
              key={r.code}
              className={`role-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSwitch(r.code, r.path)}
              title={`Chuyển sang vai trò ${r.name}`}
            >
              <Icon size={12} color={isActive ? '#0F172A' : r.color} />
              <span>{r.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
