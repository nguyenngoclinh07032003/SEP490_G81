import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Home, LogIn, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Khi đang khôi phục phiên (F5 trang / Silent Refresh), giữ nguyên màn hình tải
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        color: '#0284C7'
      }}>
        <Loader2 size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
          Đang xác thực phiên làm việc...
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Nếu không đăng nhập sau khi đã kiểm tra xong, chuyển hướng sang Sign In
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Nếu vai trò không khớp
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="card-modern" style={{ maxWidth: '480px', textAlign: 'center', padding: '40px 24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            403 - Quyền Truy Cập Bị Giới Hạn
          </h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginTop: '8px', lineHeight: 1.6 }}>
            Tài khoản hiện tại của bạn có vai trò <strong>{user.roleName || user.role}</strong>, không đủ thẩm quyền để truy cập trang này.
          </p>
          <div style={{
            background: 'var(--slate-50)',
            border: '1px dashed var(--slate-300)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            margin: '20px 0',
            fontSize: '0.8rem',
            color: 'var(--slate-500)'
          }}>
            Yêu cầu vai trò: <strong>{allowedRoles.join(', ')}</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-secondary btn-sm">
              <Home size={16} />
              <span>Về Trang Chủ</span>
            </Link>
            <Link to="/sign-in" className="btn btn-primary btn-sm">
              <LogIn size={16} />
              <span>Đổi Tài Khoản</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
