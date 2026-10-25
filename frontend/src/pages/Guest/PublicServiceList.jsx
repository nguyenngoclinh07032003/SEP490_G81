import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wrench, Shield, ArrowRight } from 'lucide-react';

export default function PublicServiceList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const services = [
    { id: 1, name: 'Bảo dưỡng, vệ sinh điều hòa treo tường', category: 'AIR_CONDITIONER', categoryName: 'Điều hòa', price: '150.000 đ', desc: 'Vệ sinh dàn nóng, dàn lạnh, xịt rửa màng lọc và kiểm tra áp suất gas' },
    { id: 2, name: 'Nạp gas R32/R410A điều hòa Inverter', category: 'AIR_CONDITIONER', categoryName: 'Điều hòa', price: '350.000 đ', desc: 'Nạp gas chính hãng bảo hành rò rỉ gas 6 tháng' },
    { id: 3, name: 'Sửa lỗi điều hòa không mát / chảy nước', category: 'AIR_CONDITIONER', categoryName: 'Điều hòa', price: '200.000 đ', desc: 'Kiểm tra mạch điện tử, quạt lồng sóc, thông tắc đường ống nước' },
    { id: 4, name: 'Kiểm tra & sửa tủ lạnh không lạnh / kém lạnh', category: 'FRIDGE', categoryName: 'Tủ lạnh', price: '200.000 đ', desc: 'Xử lý đóng tuyết, thay rơ-le nhiệt, quạt dàn lạnh' },
    { id: 5, name: 'Vệ sinh lồng giặt cửa ngang / cửa trên', category: 'WASHING_MACHINE', categoryName: 'Máy giặt', price: '250.000 đ', desc: 'Tháo lồng tẩy rửa cặn bẩn, nấm mốc, diệt khuẩn lồng giặt' },
    { id: 6, name: 'Sửa bình nóng lạnh không nóng / rò điện', category: 'HEATER', categoryName: 'Bình nóng lạnh', price: '180.000 đ', desc: 'Thay thanh magie chống ăn mòn, xúc rửa cặn vôi ruột bình' },
  ];

  const filtered = services.filter(s => {
    const matchCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ padding: '16px' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm tên dịch vụ, thiết bị..."
          style={{
            width: '100%',
            padding: '10px 12px 10px 38px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontSize: '0.88rem',
            background: 'white'
          }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'AIR_CONDITIONER', label: 'Điều hòa' },
          { key: 'FRIDGE', label: 'Tủ lạnh' },
          { key: 'WASHING_MACHINE', label: 'Máy giặt' },
          { key: 'HEATER', label: 'Bình nóng lạnh' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: selectedCategory === cat.key ? 'none' : '1px solid var(--border)',
              background: selectedCategory === cat.key ? 'var(--primary)' : 'white',
              color: selectedCategory === cat.key ? 'white' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(srv => (
          <div key={srv.id} className="card" style={{ margin: 0, padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
                  {srv.categoryName}
                </span>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  {srv.name}
                </h3>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Giá từ</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {srv.price}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '8px 0', lineHeight: 1.4 }}>
              {srv.desc}
            </p>

            <button
              onClick={() => navigate('/create-request', { state: { serviceName: srv.name } })}
              className="btn-primary"
              style={{ padding: '8px 12px', fontSize: '0.82rem', marginTop: '4px' }}
            >
              <span>Đặt lịch dịch vụ này</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
