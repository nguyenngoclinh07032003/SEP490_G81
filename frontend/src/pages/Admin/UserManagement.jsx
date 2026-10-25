import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Key,
  X
} from 'lucide-react';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Danh sách tài khoản người dùng mẫu trong database
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', fullName: 'Quản Trị Viên Hệ Thống', email: 'admin@hrmss.vn', phone: '0901234567', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: 2, username: 'manager_duc', fullName: 'Lê Minh Đức', email: 'manager.duc@hrmss.vn', phone: '0912345678', role: 'MANAGER', status: 'ACTIVE', createdAt: '2026-01-12' },
    { id: 3, username: 'staff_lan', fullName: 'Nguyễn Thị Lan', email: 'lan.coordinator@hrmss.vn', phone: '0923456789', role: 'OFFICE_STAFF', status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: 4, username: 'tech_nam', fullName: 'Trần Văn Nam', email: 'nam.tech@hrmss.vn', phone: '0934567890', role: 'TECHNICIAN', status: 'ACTIVE', createdAt: '2026-01-20' },
    { id: 5, username: 'tech_hoang', fullName: 'Phạm Huy Hoàng', email: 'hoang.tech@hrmss.vn', phone: '0934567891', role: 'TECHNICIAN', status: 'ACTIVE', createdAt: '2026-02-01' },
    { id: 6, username: 'khanhnx', fullName: 'Nguyễn Xuân Khánh', email: 'khanhnx@gmail.com', phone: '0987654321', role: 'CUSTOMER', status: 'ACTIVE', createdAt: '2026-02-14' },
    { id: 7, username: 'customer_minh', fullName: 'Trần Quang Minh', email: 'minh.tq@gmail.com', phone: '0976543210', role: 'CUSTOMER', status: 'ACTIVE', createdAt: '2026-02-18' },
    { id: 8, username: 'user_suspicious', fullName: 'Tài Khoản Tạm Khóa', email: 'baduser@domain.com', phone: '0999999999', role: 'CUSTOMER', status: 'SUSPENDED', createdAt: '2026-02-20' },
  ]);

  // Form tạo user mới
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'TECHNICIAN',
    password: ''
  });

  const handleToggleStatus = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName) {
      alert('Vui lòng điền đầy đủ tên đăng nhập và họ tên');
      return;
    }
    const newUser = {
      id: Date.now(),
      username: formData.username.trim().toLowerCase(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers([newUser, ...users]);
    setShowAddModal(false);
    setFormData({ username: '', fullName: '', email: '', phone: '', role: 'TECHNICIAN', password: '' });
  };

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  const getRoleBadge = (roleCode) => {
    switch (roleCode) {
      case 'ADMIN': return <span className="badge badge-role-admin">Admin</span>;
      case 'MANAGER': return <span className="badge badge-role-manager">Quản lý</span>;
      case 'OFFICE_STAFF': return <span className="badge badge-role-staff">Điều phối</span>;
      case 'TECHNICIAN': return <span className="badge badge-role-tech">Kỹ thuật viên</span>;
      default: return <span className="badge badge-role-customer">Khách hàng</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Lý Người Dùng & Phân Quyền</h1>
          <p className="page-subtitle">Xem danh sách tài khoản, quản lý vai trò (Roles) và trạng thái hoạt động</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} />
          <span>Thêm Người Dùng Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-modern" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Tìm kiếm theo username, họ tên hoặc email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px', margin: 0 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', margin: 0 }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
              <option value="MANAGER">Quản lý vận hành (MANAGER)</option>
              <option value="OFFICE_STAFF">Điều phối viên (OFFICE_STAFF)</option>
              <option value="TECHNICIAN">Kỹ thuật viên (TECHNICIAN)</option>
              <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', margin: 0 }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
              <option value="SUSPENDED">Tạm khóa (SUSPENDED)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-modern" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Họ và Tên</th>
                <th>Tên Đăng Nhập</th>
                <th>Liên Hệ</th>
                <th>Vai Trò (Role)</th>
                <th>Trạng Thái</th>
                <th>Ngày Tạo</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-500)' }}>
                    Không tìm thấy tài khoản người dùng phù hợp với tiêu chí lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {u.fullName.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{u.fullName}</div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.username}</td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{u.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{u.phone}</div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-status-active' : 'badge-status-cancelled'}`}>
                        {u.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>{u.createdAt}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        {u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm người dùng mới */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Tạo Tài Khoản & Cấp Quyền Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">Tên đăng nhập (Username) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: tech_kien"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lê Trung Kiên"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    placeholder="kien.tech@hrmss.vn"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="0918273645"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phân quyền vai trò (Role Assignment) *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="form-control"
                >
                  <option value="TECHNICIAN">Kỹ thuật viên sửa chữa (TECHNICIAN)</option>
                  <option value="OFFICE_STAFF">Nhân viên văn phòng / Điều phối (OFFICE_STAFF)</option>
                  <option value="MANAGER">Trưởng phòng / Quản lý vận hành (MANAGER)</option>
                  <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                  <option value="ADMIN">Quản trị viên hệ thống (ADMIN)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Xác Nhận Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
