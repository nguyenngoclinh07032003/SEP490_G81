import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  Wind,
  Refrigerator,
  Flame,
  Zap,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Check,
  Send,
  X,
  UserCheck
} from 'lucide-react';

export default function CustomerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State cho Quick Booking Modal
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingPhone, setBookingPhone] = useState(user?.phone || '0987654321');
  const [bookingAddress, setBookingAddress] = useState('Số 45 Hoàng Quốc Việt, Cầu Giấy, Hà Nội');
  const [bookingTime, setBookingTime] = useState('Sớm nhất (Trong 60 phút)');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // 6 Ngành hàng thiết bị điện máy chính (Không dùng emoji icon)
  const categories = [
    { id: 'AC', name: 'Điều hòa / Máy lạnh', priceFrom: 'Từ 150.000 đ', color: '#0071AF', bg: '#EBF5FA', badge: 'Bán chạy' },
    { id: 'FRIDGE', name: 'Tủ lạnh & Tủ đông', priceFrom: 'Từ 180.000 đ', color: '#059669', bg: '#ECFDF5', badge: 'Chuyên sâu' },
    { id: 'WASH', name: 'Máy giặt & Sấy', priceFrom: 'Từ 250.000 đ', color: '#D97706', bg: '#FEF3C7', badge: 'Tháo lồng' },
    { id: 'HEATER', name: 'Bình nóng lạnh', priceFrom: 'Từ 180.000 đ', color: '#DC2626', bg: '#FEE2E2', badge: 'An toàn' },
    { id: 'ELEC', name: 'Hệ thống điện nước', priceFrom: 'Từ 150.000 đ', color: '#7C3AED', bg: '#F3E8FF', badge: '24/7' },
    { id: 'FAN', name: 'Quạt & Máy lọc khí', priceFrom: 'Từ 120.000 đ', color: '#0284C7', bg: '#E0F2FE', badge: 'Tiết kiệm' },
  ];

  // Bảng giá dịch vụ nổi bật
  const popularServices = [
    {
      id: 1,
      name: 'Bảo dưỡng, vệ sinh điều hòa treo tường (Dưới 2.5 HP)',
      category: 'Điều hòa',
      oldPrice: '200.000 đ',
      price: '150.000 đ',
      duration: '45 phút',
      warranty: '60 ngày',
      tag: 'Giảm 25%',
      completedCount: '14.8k đã phục vụ',
      rating: '4.95'
    },
    {
      id: 2,
      name: 'Nạp gas R32 / R410A điều hòa Inverter chính hãng',
      category: 'Điều hòa',
      oldPrice: '420.000 đ',
      price: '350.000 đ',
      duration: '60 phút',
      warranty: '6 tháng',
      tag: 'Khuyên dùng',
      completedCount: '9.2k đã phục vụ',
      rating: '4.92'
    },
    {
      id: 3,
      name: 'Vệ sinh tháo lồng giặt diệt khuẩn (Cửa trên / Cửa ngang)',
      category: 'Máy giặt',
      oldPrice: '320.000 đ',
      price: '250.000 đ',
      duration: '90 phút',
      warranty: '30 ngày',
      tag: 'Bán chạy',
      completedCount: '11.5k đã phục vụ',
      rating: '4.98'
    },
    {
      id: 4,
      name: 'Kiểm tra & sửa tủ lạnh không mát, xì gas, kêu to',
      category: 'Tủ lạnh',
      oldPrice: '250.000 đ',
      price: '200.000 đ',
      duration: '60 phút',
      warranty: '60 ngày',
      tag: 'Bao giá tốt',
      completedCount: '6.4k đã phục vụ',
      rating: '4.90'
    },
  ];

  const handleOpenBook = (svc) => {
    setSelectedService(svc);
    setShowQuickBook(true);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setShowQuickBook(false);
      navigate('/my-requests');
    }, 1800);
  };

  return (
    <div>
      {/* =========================================================================
          1. HERO BANNER
         ========================================================================= */}
      <section className="dmx-hero-banner">
        <div className="dmx-hero-container">
          {/* Cột trái */}
          <div>
            <div className="dmx-hero-badge">
              Phục vụ tận nhà • Có mặt sau 60 phút
            </div>
            <h1 className="dmx-hero-title">
              Dịch Vụ Sửa Chữa & Bảo Trì Thiết Bị Tại Nhà
            </h1>
            <p className="dmx-hero-subtitle">
              Đội ngũ kỹ thuật viên tay nghề cao được đào tạo bài bản, trang thiết bị hiện đại. Báo giá niêm yết minh bạch, linh kiện chính hãng, bảo hành chu đáo 60 ngày.
            </p>

            <div className="dmx-hero-buttons" style={{ display: 'flex', gap: '14px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/create-request')}
                className="btn btn-dmx-yellow btn-lg"
              >
                <span>ĐẶT LỊCH NGAY TRONG 30S</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={() => navigate('/services')}
                className="btn btn-secondary btn-lg"
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}
              >
                <span>Xem Bảng Giá Niêm Yết</span>
              </button>
            </div>
          </div>

          {/* Cột phải: Form Đặt Lịch Nhanh 30s */}
          <div className="dmx-quick-book-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E11B1E', animation: 'pulse 1.5s infinite' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dmx-blue-dark)' }}>
                ĐẶT LỊCH SỬA CHỮA NHANH
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '16px' }}>
              Điền thông tin để kỹ thuật viên gần nhất liên hệ phục vụ bạn sau 5 phút:
            </p>

            <form onSubmit={(e) => { e.preventDefault(); navigate('/create-request'); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">Chọn thiết bị cần hỗ trợ:</label>
                <select className="form-control" defaultValue="AC">
                  <option value="AC">Điều hòa / Máy lạnh (Vệ sinh, sửa không mát)</option>
                  <option value="FRIDGE">Tủ lạnh (Không đông đá, xì gas)</option>
                  <option value="WASH">Máy giặt (Vệ sinh lồng, vắt rung lắc)</option>
                  <option value="HEATER">Bình nóng lạnh (Không nóng, rò điện)</option>
                  <option value="ELEC">Điện nước gia dụng (Chập điện, nhảy aptomat)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Số điện thoại nhận thợ:</label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0987654321"
                  defaultValue={user?.phone || '0987654321'}
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label className="form-label">Khu vực / Địa chỉ của bạn:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cầu Giấy, Hà Nội"
                  defaultValue="Quận Cầu Giấy, Hà Nội"
                  className="form-control"
                  required
                />
              </div>

              <button type="submit" className="btn btn-dmx-yellow" style={{ width: '100%', padding: '14px', marginTop: '6px' }}>
                <strong>YÊU CẦU LIÊN HỆ LẠI NGAY</strong>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. 4 CAM KẾT VÀNG
         ========================================================================= */}
      <div className="dmx-commitments-grid">
        <div className="dmx-commitment-card">
          <div className="dmx-commitment-icon">
            <Clock size={24} />
          </div>
          <div>
            <div className="dmx-commitment-title">Đúng hẹn 60 phút</div>
            <div className="dmx-commitment-desc">Kỹ thuật viên có mặt ngay trong 1 giờ hoặc theo lịch hẹn chính xác.</div>
          </div>
        </div>

        <div className="dmx-commitment-card">
          <div className="dmx-commitment-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="dmx-commitment-title">Minh bạch chi phí</div>
            <div className="dmx-commitment-desc">Báo giá niêm yết trước khi làm. Cam kết không phát sinh chi phí ẩn.</div>
          </div>
        </div>

        <div className="dmx-commitment-card">
          <div className="dmx-commitment-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="dmx-commitment-title">Bảo hành 60 ngày</div>
            <div className="dmx-commitment-desc">Bảo hành linh kiện & dịch vụ chu đáo. Lỗi cũ làm lại miễn phí 100%.</div>
          </div>
        </div>

        <div className="dmx-commitment-card">
          <div className="dmx-commitment-icon" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="dmx-commitment-title">Thợ chuẩn tay nghề</div>
            <div className="dmx-commitment-desc">Kỹ thuật viên có đồng phục, đeo thẻ, lịch sự và dọn dẹp sạch sẽ.</div>
          </div>
        </div>
      </div>

      <div className="dmx-section-container">
        {/* =========================================================================
            3. THẺ THEO DÕI ĐƠN HÀNG THỜI GIAN THỰC (LIVE TRACKER)
           ========================================================================= */}
        <div className="dmx-live-tracker">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-dmx-yellow">ĐANG XỬ LÝ</span>
              <strong style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>Mã đơn: #REQ-1003</strong>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>• Hôm nay: 09:30</span>
            </div>
            <button
              onClick={() => navigate('/my-requests')}
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none' }}
            >
              <span>Xem chi tiết hành trình</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: '8px', color: '#BAE6FD' }}>
            Sửa máy giặt Electrolux cửa ngang 9kg (Rung lắc mạnh, kêu to)
          </div>

          {/* Timeline 4 bước */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Đã tiếp nhận</div>
            </div>

            <div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Đã phân công</div>
            </div>

            <div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FED700', color: '#0F172A', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                3
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FED700' }}>KTV đang đến nơi</div>
            </div>

            <div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                4
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Nghiệm thu</div>
            </div>
          </div>

          {/* Thông tin thợ phụ trách */}
          <div style={{
            marginTop: '14px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0071AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                TN
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Trần Văn Nam (Kỹ thuật viên chính Minh Đức)</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Xe máy: 29E1-889.92 • Đánh giá: 4.95/5.0</div>
              </div>
            </div>

            <a
              href="tel:0934567890"
              className="btn btn-dmx-yellow btn-sm"
              style={{ textDecoration: 'none' }}
            >
              <PhoneCall size={14} />
              <span>Gọi Kỹ Thuật Viên</span>
            </a>
          </div>
        </div>

        {/* =========================================================================
            4. DANH MỤC THIẾT BỊ SỬA CHỮA (CATEGORIES GRID - SẠCH SẼ, KHÔNG DÙNG ICON EMOJI)
           ========================================================================= */}
        <div className="dmx-section-header">
          <div>
            <h2 className="dmx-section-title">
              <Wrench size={22} color="var(--dmx-blue)" />
              <span>Danh Mục Thiết Bị Cần Sửa Chữa & Bảo Trì</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Chọn thiết bị của bạn để xem bảng giá dịch vụ và đặt lịch phục vụ tận nhà
            </p>
          </div>

          <button onClick={() => navigate('/services')} className="btn btn-secondary btn-sm">
            <span>Xem tất cả dịch vụ</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="dmx-categories-grid">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="dmx-category-card"
              onClick={() => navigate('/services')}
              style={{ padding: '24px 16px' }}
            >
              <div style={{
                width: '42px',
                height: '4px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: cat.color,
                marginBottom: '14px'
              }} />
              <div className="dmx-category-name" style={{ fontSize: '1rem' }}>{cat.name}</div>
              <div className="dmx-category-price" style={{ marginTop: '6px' }}>{cat.priceFrom}</div>
              <span className="badge" style={{ backgroundColor: cat.bg, color: cat.color, marginTop: '12px', fontSize: '0.72rem' }}>
                {cat.badge}
              </span>
            </div>
          ))}
        </div>

        {/* =========================================================================
            5. BẢNG GIÁ DỊCH VỤ NỔI BẬT
           ========================================================================= */}
        <div className="dmx-section-header" style={{ marginTop: '40px' }}>
          <div>
            <h2 className="dmx-section-title">
              <Sparkles size={22} color="#D97706" />
              <span>Dịch Vụ Được Đặt Nhiều Nhất Tuần Này</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Giá niêm yết rõ ràng, phục vụ đúng hẹn, bảo hành chu đáo lên đến 60 ngày
            </p>
          </div>
        </div>

        <div className="dmx-services-grid">
          {popularServices.map(svc => (
            <div key={svc.id} className="dmx-service-card">
              <div style={{ padding: '12px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-dmx-sale">{svc.tag}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Đánh giá: <strong>{svc.rating}/5.0</strong> ({svc.completedCount})
                </span>
              </div>

              <div className="dmx-service-body">
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--dmx-blue)' }}>
                  {svc.category}
                </div>
                <h3 className="dmx-service-name">
                  {svc.name}
                </h3>

                <div className="dmx-service-meta">
                  <span>Thời gian: {svc.duration}</span>
                  <span>•</span>
                  <span>Bảo hành: {svc.warranty}</span>
                </div>

                <div className="dmx-service-price-row">
                  <div>
                    <span className="dmx-price-val">{svc.price}</span>
                    <span className="dmx-old-price">{svc.oldPrice}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBook(svc)}
                    className="btn btn-dmx-yellow btn-sm"
                  >
                    <span>ĐẶT LỊCH</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================================
            6. QUY TRÌNH PHỤC VỤ 4 BƯỚC
           ========================================================================= */}
        <div style={{
          marginTop: '48px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 24px',
          border: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dmx-blue-dark)' }}>
              Quy Trình Phục Vụ 4 Bước Tiêu Chuẩn HRMSS
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              Nhanh chóng, chuyên nghiệp và an tâm tuyệt đối cho mọi gia đình
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--dmx-blue-light)', color: 'var(--dmx-blue)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                1
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Đặt Lịch Trực Tuyến</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                Chỉ mất 30 giây chọn thiết bị và thời gian bạn muốn thợ có mặt.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                2
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Xác Nhận & Đến Nhà</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                Kỹ thuật viên gần nhất nhận đơn, gọi xác nhận và đến nhà đúng giờ hẹn.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                3
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Kiểm Tra & Sửa Chữa</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                Báo đúng lỗi, đúng giá niêm yết. Tiến hành thi công cẩn thận, sạch sẽ.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--dmx-blue)', color: '#FED700', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                4
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Nghiệm Thu & Bảo Hành</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                Khách kiểm tra ưng ý mới thanh toán. Kích hoạt bảo hành điện tử 60 ngày.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            7. ĐÁNH GIÁ THỰC TẾ TỪ KHÁCH HÀNG
           ========================================================================= */}
        <div style={{ marginTop: '40px' }}>
          <div className="dmx-section-header">
            <div>
              <h2 className="dmx-section-title">
                <span>Ý Kiến Đánh Giá Của Khách Hàng</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                Hơn 98.6% khách hàng hài lòng và đánh giá cao chất lượng phục vụ
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="card-modern" style={{ padding: '18px' }}>
              <div style={{ fontWeight: 700, color: '#D97706', marginBottom: '8px', fontSize: '0.85rem' }}>
                Đánh giá: 5/5 sao
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: 1.5, fontStyle: 'italic' }}>
                "Kỹ thuật viên đến rất đúng giờ, mặc đồng phục lịch sự. Vệ sinh điều hòa xong có bọc bạt cẩn thận không để văng giọt nước nào ra sàn. Sẽ tiếp tục ủng hộ!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0071AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                  H
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Anh Hoàng Minh</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Chung cư Season Avenue, Hà Đông</div>
                </div>
              </div>
            </div>

            <div className="card-modern" style={{ padding: '18px' }}>
              <div style={{ fontWeight: 700, color: '#D97706', marginBottom: '8px', fontSize: '0.85rem' }}>
                Đánh giá: 5/5 sao
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: 1.5, fontStyle: 'italic' }}>
                "Máy giặt nhà mình bị kêu to. Bạn Nam kỹ thuật viên đến tháo ra kiểm tra rất kỹ, thay thụt giảm xóc xong chạy êm ru. Báo giá niêm yết rõ ràng."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#D97706', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                  L
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Chị Phương Lan</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Phố Trần Thái Tông, Cầu Giấy</div>
                </div>
              </div>
            </div>

            <div className="card-modern" style={{ padding: '18px' }}>
              <div style={{ fontWeight: 700, color: '#D97706', marginBottom: '8px', fontSize: '0.85rem' }}>
                Đánh giá: 5/5 sao
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: 1.5, fontStyle: 'italic' }}>
                "Đặt lịch trên web cực kỳ nhanh, có tin nhắn xác nhận mã đơn ngay. Bảo hành điện tử tra cứu tiện lợi, không lo mất phiếu giấy như trước."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                  T
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Bác Tuấn Anh</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Nguyễn Chí Thanh, Đống Đa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          8. QUICK BOOKING MODAL
         ========================================================================= */}
      {showQuickBook && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dmx-blue-dark)' }}>
                Đặt Lịch: {selectedService?.category}
              </h3>
              <button onClick={() => setShowQuickBook(false)} className="btn-ghost" style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Đặt Lịch Thành Công!
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                  Mã đơn <strong>#REQ-2026-{(Math.floor(100 + Math.random() * 900))}</strong> đã được gửi tới kỹ thuật viên gần nhất. Đang chuyển bạn tới trang theo dõi đơn hàng...
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking}>
                <div style={{ background: 'var(--dmx-blue-light)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dmx-blue-dark)' }}>
                    {selectedService?.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>Đơn giá niêm yết:</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--dmx-red)' }}>{selectedService?.price}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Thời gian bạn muốn thợ đến *</label>
                  <select
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="form-control"
                  >
                    <option value="Sớm nhất (Trong 60 phút)">Càng sớm càng tốt (Trong 60 phút)</option>
                    <option value="Hôm nay: 14:00 - 16:00">Hôm nay: Chiều (14:00 - 16:00)</option>
                    <option value="Hôm nay: 16:30 - 18:30">Hôm nay: Cuối ngày (16:30 - 18:30)</option>
                    <option value="Sáng mai: 08:30 - 10:30">Sáng mai: (08:30 - 10:30)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    required
                    value={bookingPhone}
                    onChange={e => setBookingPhone(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ phục vụ tại nhà *</label>
                  <input
                    type="text"
                    required
                    value={bookingAddress}
                    onChange={e => setBookingAddress(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowQuickBook(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-dmx-yellow" style={{ flex: 2, padding: '12px' }}>
                    <strong>XÁC NHẬN ĐẶT LỊCH</strong>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
