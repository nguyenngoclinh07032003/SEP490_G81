import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  Tag,
  Clock,
  Shield,
  X
} from 'lucide-react';

export default function ServiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [services, setServices] = useState([
    { id: 1, code: 'SVC-AC-01', name: 'Bảo dưỡng, vệ sinh điều hòa treo tường', category: 'AIR_CONDITIONER', categoryName: 'Điều hòa', price: 150000, duration: '45 phút', warranty: '3 tháng', status: 'ACTIVE' },
    { id: 2, code: 'SVC-AC-02', name: 'Nạp gas R32/R410A điều hòa Inverter', category: 'AIR_CONDITIONER', categoryName: 'Điều hòa', price: 350000, duration: '60 phút', warranty: '6 tháng', status: 'ACTIVE' },
    { id: 3, code: 'SVC-AC-03', name: 'Sửa lỗi điều hòa không mát / chảy nước', category: 'AIR_CONDITIONER', categoryName: 'Điều hòa', price: 200000, duration: '60 phút', warranty: '6 tháng', status: 'ACTIVE' },
    { id: 4, code: 'SVC-FR-01', name: 'Kiểm tra & sửa tủ lạnh không lạnh / kêu to', category: 'FRIDGE', categoryName: 'Tủ lạnh', price: 200000, duration: '60 phút', warranty: '6 tháng', status: 'ACTIVE' },
    { id: 5, code: 'SVC-WM-01', name: 'Vệ sinh tháo lồng giặt cửa ngang / cửa trên', category: 'WASHING_MACHINE', categoryName: 'Máy giặt', price: 250000, duration: '90 phút', warranty: '1 tháng', status: 'ACTIVE' },
    { id: 6, code: 'SVC-HT-01', name: 'Sửa bình nóng lạnh không nóng / rò điện', category: 'HEATER', categoryName: 'Bình nóng lạnh', price: 180000, duration: '45 phút', warranty: '6 tháng', status: 'ACTIVE' },
    { id: 7, code: 'SVC-EL-01', name: 'Xử lý chập điện ngầm, nhảy Aptomat', category: 'ELECTRICAL', categoryName: 'Hệ thống điện', price: 300000, duration: '90 phút', warranty: '12 tháng', status: 'ACTIVE' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    category: 'AIR_CONDITIONER',
    price: '',
    duration: '60 phút',
    warranty: '6 tháng'
  });

  const handleAddService = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    const catNameMap = {
      'AIR_CONDITIONER': 'Điều hòa',
      'FRIDGE': 'Tủ lạnh',
      'WASHING_MACHINE': 'Máy giặt',
      'HEATER': 'Bình nóng lạnh',
      'ELECTRICAL': 'Hệ thống điện'
    };
    const newSvc = {
      id: Date.now(),
      code: `SVC-${formData.category.substring(0, 2)}-${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name,
      category: formData.category,
      categoryName: catNameMap[formData.category] || 'Khác',
      price: parseInt(formData.price, 10),
      duration: formData.duration,
      warranty: formData.warranty,
      status: 'ACTIVE'
    };
    setServices([newSvc, ...services]);
    setShowAddModal(false);
    setFormData({ name: '', category: 'AIR_CONDITIONER', price: '', duration: '60 phút', warranty: '6 tháng' });
  };

  const filtered = services.filter(s => {
    const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Lý Danh Mục Dịch Vụ & Bảng Giá</h1>
          <p className="page-subtitle">Niêm yết đơn giá, thời gian thi công tiêu chuẩn và thời hạn bảo hành cho khách hàng</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Thêm Dịch Vụ Mới</span>
        </button>
      </div>

      <div className="card-modern" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Tìm theo mã dịch vụ hoặc tên dịch vụ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', margin: 0 }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', margin: 0 }}
          >
            <option value="ALL">Tất cả ngành hàng</option>
            <option value="AIR_CONDITIONER">Điều hòa / Máy lạnh</option>
            <option value="FRIDGE">Tủ lạnh & Tủ đông</option>
            <option value="WASHING_MACHINE">Máy giặt & Sấy</option>
            <option value="HEATER">Bình nóng lạnh</option>
            <option value="ELECTRICAL">Hệ thống điện gia dụng</option>
          </select>
        </div>
      </div>

      <div className="card-modern" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Mã Dịch Vụ</th>
                <th>Tên Dịch Vụ</th>
                <th>Phân Loại</th>
                <th>Đơn Giá Niêm Yết</th>
                <th>Thời Gian Chuẩn</th>
                <th>Bảo Hành</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{s.code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{s.name}</td>
                  <td>
                    <span className="badge badge-role-customer">{s.categoryName}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--danger-dark)' }}>
                    {s.price.toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>{s.duration}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--success-dark)', fontWeight: 600 }}>{s.warranty}</td>
                  <td>
                    <span className="badge badge-status-active">Niêm yết</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Thêm Dịch Vụ Sửa Chữa Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddService}>
              <div className="form-group">
                <label className="form-label">Tên dịch vụ sửa chữa / bảo dưỡng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thay gioăng cao su cánh tủ lạnh Side by Side"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Phân loại thiết bị *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="form-control"
                  >
                    <option value="AIR_CONDITIONER">Điều hòa / Máy lạnh</option>
                    <option value="FRIDGE">Tủ lạnh & Tủ đông</option>
                    <option value="WASHING_MACHINE">Máy giặt & Sấy</option>
                    <option value="HEATER">Bình nóng lạnh</option>
                    <option value="ELECTRICAL">Hệ thống điện gia dụng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Đơn giá niêm yết (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 350000"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Thời gian thi công ước tính</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thời hạn bảo hành dịch vụ</label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu & Niêm Yết Dịch Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
