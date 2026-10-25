import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Lock, 
  Phone, 
  Mail, 
  LogOut, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([
    { id: 1, text: 'Số 45, Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', isDefault: true, contactName: 'Nguyễn Xuân Khánh', contactPhone: '0987654321' },
    { id: 2, text: 'Tòa Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội', isDefault: false, contactName: 'Nguyễn Xuân Khánh', contactPhone: '0987654321' },
  ]);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const setDefaultAddress = (id) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    alert('Đổi mật khẩu thành công!');
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Profile Header Card */}
      <div className="card" style={{
        margin: 0,
        marginBottom: '16px',
        background: 'linear-gradient(135deg, white, var(--primary-light))',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'white',
          fontSize: '1.4rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(8, 125, 235, 0.3)'
        }}>
          {user?.full_name ? user.full_name.charAt(0) : 'K'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {user?.full_name || 'Khách hàng'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Phone size={13} /> {user?.phone || '0987654321'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Mail size={13} /> {user?.email || 'chua_co_email@domain.com'}
          </div>
        </div>
      </div>

      {/* Danh sách địa chỉ đã lưu (MUC-02 / UC 10, 11) */}
      <div className="card" style={{ margin: 0, marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={18} color="var(--primary)" />
            <span>Địa chỉ sửa chữa của bạn</span>
          </h3>
          <button
            onClick={() => {
              const newAddr = prompt('Nhập địa chỉ mới:');
              if (newAddr) {
                setAddresses([...addresses, { id: Date.now(), text: newAddr, isDefault: false, contactName: user?.full_name, contactPhone: user?.phone }]);
              }
            }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            <Plus size={14} /> Thêm mới
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {addresses.map(addr => (
            <div
              key={addr.id}
              style={{
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: addr.isDefault ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: addr.isDefault ? 'var(--primary-light)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ flex: 1, paddingRight: '8px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {addr.text}
                </div>
                {addr.isDefault && (
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                    Mặc định
                  </span>
                )}
              </div>

              {!addr.isDefault && (
                <button
                  onClick={() => setDefaultAddress(addr.id)}
                  style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  Chọn mặc định
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tiện ích tài khoản */}
      <div className="card" style={{ margin: 0, padding: '6px 0', marginBottom: '16px' }}>
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', fontWeight: 500 }}>
            <Lock size={18} color="var(--primary)" />
            <span>Đổi mật khẩu tài khoản</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </button>

        <button
          onClick={() => navigate('/service-history')}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', fontWeight: 500 }}>
            <ShieldCheck size={18} color="var(--success)" />
            <span>Chính sách & Tra cứu bảo hành</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </button>
      </div>

      {/* Đăng xuất */}
      <button
        onClick={() => {
          logout();
          navigate('/sign-in');
        }}
        style={{
          width: '100%',
          padding: '12px',
          background: '#FEE2E2',
          color: '#DC2626',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <LogOut size={18} /> Đăng xuất tài khoản
      </button>

      {/* MODAL ĐỔI MẬT KHẨU */}
      {isPasswordModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', maxWidth: '380px', width: '100%', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Đổi mật khẩu</h3>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
