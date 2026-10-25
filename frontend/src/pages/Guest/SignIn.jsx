import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  Shield,
  Briefcase,
  Headphones,
  Wrench,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('FORM'); // 'FORM' | 'DEMO'

  const demoRoles = [
    { code: 'ADMIN', name: 'Quản trị viên Hệ thống (Admin)', desc: 'Toàn quyền cấu hình, quản lý user, audit log', icon: Shield, path: '/admin', color: '#7C3AED', bg: '#F5F3FF' },
    { code: 'MANAGER', name: 'Trưởng phòng / Quản lý (Manager)', desc: 'Giám sát doanh thu, bảng giá dịch vụ, KPI thợ', icon: Briefcase, path: '/manager', color: '#D97706', bg: '#FFFBEB' },
    { code: 'OFFICE_STAFF', name: 'Nhân viên Tiếp nhận / Điều phối', desc: 'Tiếp nhận đơn đặt lịch, phân công thợ tới nhà', icon: Headphones, path: '/staff', color: '#0284C7', bg: '#F0F9FF' },
    { code: 'TECHNICIAN', name: 'Kỹ thuật viên Sửa chữa (Thợ)', desc: 'Nhận việc, cập nhật tiến độ, vật tư, nghiệm thu', icon: Wrench, path: '/technician', color: '#059669', bg: '#ECFDF5' },
    { code: 'CUSTOMER', name: 'Khách hàng (Customer)', desc: 'Đặt lịch sửa chữa, theo dõi thợ, đánh giá', icon: User, path: '/customer', color: '#2563EB', bg: '#EFF6FF' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const result = await login({ username, password });
      if (result.success) {
        // Tự động điều hướng theo Role
        const role = result.user?.role;
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'MANAGER') navigate('/manager');
        else if (role === 'OFFICE_STAFF') navigate('/staff');
        else if (role === 'TECHNICIAN') navigate('/technician');
        else navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (roleCode, path) => {
    switchRole(roleCode);
    navigate(path);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1E293B, #0B132B)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '920px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        overflow: 'hidden'
      }}>
        {/* Cột trái: Giới thiệu hệ thống HRMSS */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <img
              src="/brand/logo-horizontal-light-600x180.png"
              alt="HRMSS Logo"
              style={{ height: '48px', objectFit: 'contain', marginBottom: '24px' }}
            />
            <div className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', marginBottom: '16px' }}>
              Đồ Án Tốt Nghiệp SEP490 • G81
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.3 }}>
              Hệ Thống Quản Lý Dịch Vụ Sửa Chữa & Bảo Trì Tại Nhà
            </h2>
            <p style={{ fontSize: '0.88rem', opacity: 0.85, marginTop: '12px', lineHeight: 1.6 }}>
              Giải pháp số hóa toàn diện kết nối Khách Hàng, Đội ngũ Kỹ Thuật Viên, Điều Phối Viên và Ban Quản Lý trên cùng một nền tảng thời gian thực.
            </p>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', opacity: 0.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#34D399" />
              <span>Phân quyền 5 vai trò (RBAC) chuẩn doanh nghiệp</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#34D399" />
              <span>Bảo mật JWT + Redis Blacklist & Brute-force Lockout</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#34D399" />
              <span>Cơ sở dữ liệu quan hệ PostgreSQL 29 bảng chuẩn ACID</span>
            </div>
          </div>
        </div>

        {/* Cột phải: Form Đăng nhập & Tab Demo Roles */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Tab chọn cách đăng nhập */}
          <div style={{
            display: 'flex',
            background: 'var(--slate-100)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setActiveTab('FORM')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'FORM' ? '#FFFFFF' : 'transparent',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: activeTab === 'FORM' ? 'var(--primary-dark)' : 'var(--slate-600)',
                boxShadow: activeTab === 'FORM' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer'
              }}
            >
              Đăng Nhập Tài Khoản
            </button>
            <button
              onClick={() => setActiveTab('DEMO')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'DEMO' ? '#FFFFFF' : 'transparent',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: activeTab === 'DEMO' ? 'var(--primary-dark)' : 'var(--slate-600)',
                boxShadow: activeTab === 'DEMO' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={14} color="#F59E0B" />
              <span>Thử Nhanh 5 Vai Trò</span>
            </button>
          </div>

          {activeTab === 'FORM' ? (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Đăng nhập hệ thống
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '2px', marginBottom: '18px' }}>
                Nhập thông tin tài khoản để truy cập khu vực làm việc của bạn
              </p>

              {error && (
                <div style={{
                  background: 'var(--danger-light)',
                  color: 'var(--danger-dark)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tên đăng nhập hoặc Email</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="admin, manager_duc, staff_lan, khanhnx..."
                      className="form-control"
                      style={{ paddingLeft: '38px', margin: 0 }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mật khẩu</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="form-control"
                      style={{ paddingLeft: '38px', paddingRight: '40px', margin: 0 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '6px' }}
                  disabled={loading}
                >
                  <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Chưa có tài khoản khách hàng?{' '}
                <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Trải nghiệm nhanh theo Vai trò (Demo RBAC)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  Bấm trực tiếp vào vai trò để vào ngay giao diện và quyền hạn tương ứng
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {demoRoles.map(role => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.code}
                      onClick={() => handleQuickDemoLogin(role.code, role.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--slate-200)',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = role.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--slate-200)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: role.bg,
                          color: role.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-900)' }}>{role.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{role.desc}</div>
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--slate-400)" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              ← Xem dịch vụ trước khi đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
