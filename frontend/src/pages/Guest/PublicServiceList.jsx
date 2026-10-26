import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Filter,
  X
} from 'lucide-react';

export default function PublicServiceList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    { key: 'ALL', label: 'Tất Cả Dịch Vụ' },
    { key: 'AIR_CONDITIONER', label: 'Điều Hòa / Máy Lạnh' },
    { key: 'FRIDGE', label: 'Tủ Lạnh & Tủ Đông' },
    { key: 'WASHING_MACHINE', label: 'Máy Giặt & Sấy' },
    { key: 'HEATER', label: 'Bình Nóng Lạnh' },
    { key: 'ELECTRICAL', label: 'Hệ Thống Điện Nước' },
  ];

  const services = [
    {
      id: 1,
      code: 'SVC-AC-01',
      name: 'Bảo dưỡng, vệ sinh điều hòa treo tường (Dưới 2.5 HP)',
      category: 'AIR_CONDITIONER',
      categoryName: 'Điều hòa',
      oldPrice: '200.000 đ',
      price: '150.000 đ',
      duration: '45 phút',
      warranty: '60 ngày',
      tag: 'Bán chạy nhất',
      rating: '4.95/5.0',
      desc: 'Bao gồm: Vệ sinh dàn lạnh, dàn nóng, xịt rửa màng lọc bụi, thông tắc ống thoát nước, kiểm tra dòng điện & áp suất gas.'
    },
    {
      id: 2,
      code: 'SVC-AC-02',
      name: 'Nạp bổ sung gas R32 / R410A điều hòa Inverter',
      category: 'AIR_CONDITIONER',
      categoryName: 'Điều hòa',
      oldPrice: '420.000 đ',
      price: '350.000 đ',
      duration: '60 phút',
      warranty: '6 tháng',
      tag: 'Chính hãng',
      rating: '4.92/5.0',
      desc: 'Gas R32/R410A nhập khẩu chính hãng. Kiểm tra rò rỉ rắc-co, siết chặt ốc kết nối, bảo hành xì gas 6 tháng.'
    },
    {
      id: 3,
      code: 'SVC-AC-03',
      name: 'Kiểm tra & sửa điều hòa không mát, chảy nước trong nhà',
      category: 'AIR_CONDITIONER',
      categoryName: 'Điều hòa',
      oldPrice: '250.000 đ',
      price: '200.000 đ',
      duration: '60 phút',
      warranty: '60 ngày',
      tag: 'Bao giá tốt',
      rating: '4.90/5.0',
      desc: 'Kiểm tra bo mạch điều khiển, rơ-le cảm biến nhiệt, tụ khởi động quạt lồng sóc, vệ sinh máng nước thải ngầm.'
    },
    {
      id: 4,
      code: 'SVC-FR-01',
      name: 'Sửa tủ lạnh không đông đá, kém lạnh, đóng tuyết dày',
      category: 'FRIDGE',
      categoryName: 'Tủ lạnh',
      oldPrice: '260.000 đ',
      price: '200.000 đ',
      duration: '60 phút',
      warranty: '60 ngày',
      tag: 'Chuyên sâu',
      rating: '4.91/5.0',
      desc: 'Xử lý lỗi cảm biến xả đá (sò lạnh), cầu chì nhiệt, timer định giờ, quạt thổi gió ngăn đông, rơ-le bảo vệ block.'
    },
    {
      id: 5,
      code: 'SVC-FR-02',
      name: 'Thay Block máy nén tủ lạnh Inverter Side By Side',
      category: 'FRIDGE',
      categoryName: 'Tủ lạnh',
      oldPrice: '2.500.000 đ',
      price: '2.200.000 đ',
      duration: '120 phút',
      warranty: '12 tháng',
      tag: 'Linh kiện hãng',
      rating: '4.96/5.0',
      desc: 'Block zin chính hãng. Hút chân không, thay phin lọc ẩm và nạp gas đúng định mức kỹ thuật.'
    },
    {
      id: 6,
      code: 'SVC-WM-01',
      name: 'Vệ sinh tháo lồng giặt diệt khuẩn (Cửa trên)',
      category: 'WASHING_MACHINE',
      categoryName: 'Máy giặt',
      oldPrice: '300.000 đ',
      price: '250.000 đ',
      duration: '75 phút',
      warranty: '30 ngày',
      tag: 'Diệt khuẩn',
      rating: '4.97/5.0',
      desc: 'Dùng máy xịt áp lực tẩy sạch mảng bám cặn bột giặt, nấm mốc đen lâu năm bám ngoài lồng inox, xịt dung dịch khử khuẩn.'
    },
    {
      id: 7,
      code: 'SVC-WM-02',
      name: 'Vệ sinh tháo lồng giặt cửa ngang (Inverter)',
      category: 'WASHING_MACHINE',
      categoryName: 'Máy giặt',
      oldPrice: '450.000 đ',
      price: '380.000 đ',
      duration: '100 phút',
      warranty: '30 ngày',
      tag: 'Tiêu biểu',
      rating: '4.99/5.0',
      desc: 'Tháo toàn bộ vỏ mặt trước, gáo lồng, vệ sinh thụt giảm xóc, lau sạch gioăng cao su miệng cửa và thông bơm xả.'
    },
    {
      id: 8,
      code: 'SVC-HT-01',
      name: 'Bảo dưỡng bình nóng lạnh, thay thanh Magie khử cặn',
      category: 'HEATER',
      categoryName: 'Bình nóng lạnh',
      oldPrice: '220.000 đ',
      price: '180.000 đ',
      duration: '45 phút',
      warranty: '6 tháng',
      tag: 'An toàn điện',
      rating: '4.93/5.0',
      desc: 'Xúc xả cặn vôi ruột bình, thay thanh magie chống ăn mòn lủng bình, kiểm tra rơ-le chống giật ELCB.'
    },
    {
      id: 9,
      code: 'SVC-EL-01',
      name: 'Xử lý chập điện âm tường, nhảy Aptomat tổng',
      category: 'ELECTRICAL',
      categoryName: 'Hệ thống điện',
      oldPrice: '350.000 đ',
      price: '300.000 đ',
      duration: '90 phút',
      warranty: '12 tháng',
      tag: 'Cấp tốc 24/7',
      rating: '4.94/5.0',
      desc: 'Sử dụng máy đo dò tìm điểm chập ngầm không cần đục phá rộng. Thay thế ổ cắm, công tắc, attomat chất lượng cao.'
    },
  ];

  const filtered = services.filter(s => {
    const matchCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Banner đầu trang */}
      <div style={{
        background: 'linear-gradient(135deg, #0071AF, #004D7A)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 24px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-dmx-yellow">BẢNG GIÁ NIÊM YẾT MINH BẠCH</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Áp dụng toàn hệ thống Minh Đức</span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
          Bảng Giá Dịch Vụ Sửa Chữa & Bảo Trì Tại Nhà
        </h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '8px', maxWidth: '720px', lineHeight: 1.6 }}>
          100% dịch vụ có giá niêm yết rõ ràng trước khi kỹ thuật viên tiến hành thi công. Khách hàng nghiệm thu ưng ý mới thanh toán. Cam kết không phát sinh bất kỳ khoản phí nào ngoài thỏa thuận.
        </p>

        {/* Thanh tìm kiếm */}
        <div style={{ position: 'relative', maxWidth: '600px', marginTop: '20px' }}>
          <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm tên dịch vụ, lỗi thiết bị (Ví dụ: vệ sinh điều hòa, nạp gas, tắc xả máy giặt...)"
            style={{
              width: '100%',
              padding: '12px 18px 12px 46px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.92rem',
              boxShadow: 'var(--shadow-md)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Tabs ngành hàng */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: selectedCategory === cat.key ? '2px solid var(--dmx-blue)' : '1px solid var(--slate-300)',
              background: selectedCategory === cat.key ? 'var(--dmx-blue)' : '#FFFFFF',
              color: selectedCategory === cat.key ? '#FFFFFF' : 'var(--slate-700)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedCategory === cat.key ? 'var(--shadow-dmx)' : 'var(--shadow-xs)',
              transition: 'all 0.2s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid danh sách dịch vụ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filtered.map(svc => (
          <div key={svc.id} className="dmx-service-card">
            <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-dmx-sale">{svc.tag}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                Đánh giá: <strong>{svc.rating}</strong>
              </span>
            </div>

            <div className="dmx-service-body">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dmx-blue)', textTransform: 'uppercase' }}>
                {svc.categoryName} • <span style={{ fontFamily: 'monospace' }}>{svc.code}</span>
              </div>
              <h3 className="dmx-service-name" style={{ fontSize: '1.05rem', minHeight: '44px' }}>
                {svc.name}
              </h3>

              <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '14px', flex: 1 }}>
                {svc.desc}
              </p>

              <div className="dmx-service-meta" style={{ background: 'var(--slate-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <span>Thời gian: <strong>{svc.duration}</strong></span>
                <span>•</span>
                <span style={{ color: 'var(--success-dark)' }}>Bảo hành: <strong>{svc.warranty}</strong></span>
              </div>

              <div className="dmx-service-price-row">
                <div>
                  <span className="dmx-price-val">{svc.price}</span>
                  <span className="dmx-old-price">{svc.oldPrice}</span>
                </div>

                <button
                  onClick={() => navigate('/create-request', { state: { serviceName: svc.name } })}
                  className="btn btn-dmx-yellow btn-sm"
                >
                  <span>ĐẶT LỊCH NGAY</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
