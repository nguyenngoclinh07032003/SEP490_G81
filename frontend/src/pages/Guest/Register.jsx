import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    // Đăng ký thành công và tự động đăng nhập vai trò CUSTOMER
    login({
      user_id: Date.now(),
      username,
      full_name: fullName,
      phone,
      email,
      role_code: 'CUSTOMER'
    });

    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 45%, #F8FAFC 100%)',
      padding: '32px 16px'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 50px -10px rgba(2, 132, 199, 0.15), 0 4px 12px rgba(0, 0, 0, 0.03)',
        border: '1.5px solid #BAE6FD',
        padding: '36px 32px',
        boxSizing: 'border-box'
      }}>
        {/* Header Đăng ký */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <img
              src="/brand/logo-symbol-128.png"
              alt="Logo Minh Đức"
              style={{ height: '36px', width: '36px' }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284C7', letterSpacing: '-0.3px' }}>
              DỊCH VỤ MINH ĐỨC
            </span>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Đăng Ký Tài Khoản Khách Hàng
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
            Tạo tài khoản để theo dõi lịch sửa chữa, thợ đến nhà và bảo hành điện tử
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FCA5A5',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            marginBottom: '18px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Họ và tên *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Nam"
                className="form-control"
                style={{ paddingLeft: '38px', margin: 0 }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Số điện thoại liên hệ *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="form-control"
                  style={{ paddingLeft: '38px', margin: 0 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tên đăng nhập (Username) *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ngvanA, phThanhDo..."
                  className="form-control"
                  style={{ paddingLeft: '38px', margin: 0 }}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Email (không bắt buộc)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="khachhang@example.com"
                className="form-control"
                style={{ paddingLeft: '38px', margin: 0 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Mật khẩu *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="form-control"
                  style={{ paddingLeft: '38px', margin: 0 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Nhập lại mật khẩu *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="form-control"
                  style={{ paddingLeft: '38px', margin: 0 }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.78rem',
            color: '#0369A1',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '4px'
          }}>
            <ShieldCheck size={18} color="#0284C7" style={{ flexShrink: 0 }} />
            <span>Thông tin được bảo mật mã hóa và chỉ dùng cho bảo hành dịch vụ</span>
          </div>

          <button
            type="submit"
            className="btn btn-dmx-yellow"
            style={{ width: '100%', padding: '13px', marginTop: '6px', fontSize: '0.95rem' }}
          >
            <span>TẠO TÀI KHOẢN KHÁCH HÀNG</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.84rem', color: '#64748B' }}>
          Đã có tài khoản?{' '}
          <Link to="/sign-in" style={{ color: '#0284C7', fontWeight: 700, textDecoration: 'none' }}>
            Đăng nhập ngay
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '14px' }}>
          <Link to="/" style={{ fontSize: '0.8rem', color: '#64748B' }}>
            ← Quay lại trang chủ Dịch Vụ Minh Đức
          </Link>
        </div>
      </div>
    </div>
  );
}
