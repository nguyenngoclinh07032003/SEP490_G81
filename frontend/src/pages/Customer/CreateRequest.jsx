import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Calendar,
  Clock,
  Camera,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  ShieldCheck,
  Zap,
  PhoneCall,
  User,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export default function CreateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [deviceType, setDeviceType] = useState('AC'); // AC | FRIDGE | WASH | HEATER | ELEC
  const [selectedIssue, setSelectedIssue] = useState(location.state?.serviceName || '');
  const [address, setAddress] = useState('Số 45 Hoàng Quốc Việt, Nghĩa Đô, Cầu Giấy, Hà Nội');
  const [contactName, setContactName] = useState(user?.fullName || 'Nguyễn Xuân Khánh');
  const [contactPhone, setContactPhone] = useState(user?.phone || '0987654321');
  const [preferredDate, setPreferredDate] = useState('Hôm nay');
  const [preferredTime, setPreferredTime] = useState('Sớm nhất (Trong 60 phút)');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Danh mục lỗi thường gặp theo từng thiết bị (Không dùng icon emoji)
  const commonIssues = {
    AC: [
      'Vệ sinh, bảo dưỡng định kỳ',
      'Điều hòa bật có gió nhưng không mát',
      'Chảy nước ở dàn lạnh trong nhà',
      'Nạp bổ sung gas R32/R410A',
      'Cục nóng phát ra tiếng kêu tạch tạch',
      'Không nhận điều khiển / Nháy đèn báo lỗi'
    ],
    FRIDGE: [
      'Ngăn đá đóng tuyết dày',
      'Ngăn mát không có hơi lạnh',
      'Tủ lạnh kêu to rung lắc',
      'Chảy nước ra sàn nhà',
      'Thay gioăng cao su cánh cửa',
      'Thay Block máy nén Inverter'
    ],
    WASH: [
      'Vệ sinh tháo lồng giặt diệt khuẩn',
      'Vắt rung lắc mạnh, nhảy chồm',
      'Nước không xả hết được (Báo lỗi E20)',
      'Không cấp nước vào lồng giặt',
      'Bật máy không lên nguồn'
    ],
    HEATER: [
      'Bảo dưỡng xúc cặn & thay thanh Magie',
      'Đèn sáng nhưng nước không nóng',
      'Nhảy Aptomat chống giật ELCB',
      'Rò rỉ nước ở đường ống cấp'
    ],
    ELEC: [
      'Xử lý chập điện ngầm, nhảy Aptomat',
      'Sửa công tắc, ổ cắm bị cháy khét',
      'Lắp đặt quạt trần, đèn chiếu sáng',
      'Sửa đường ống nước bị bục vỡ'
    ]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 16px' }}>
        <div className="card-modern" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle size={40} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dmx-blue-dark)' }}>
            Đặt Lịch Thành Công!
          </h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginTop: '6px' }}>
            Mã yêu cầu: <strong style={{ color: 'var(--dmx-blue)' }}>#REQ-2026-088</strong>
          </p>

          <div style={{
            background: 'var(--dmx-blue-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'left',
            margin: '20px 0',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--slate-500)' }}>Dịch vụ:</span>
              <strong style={{ color: 'var(--slate-900)' }}>{selectedIssue || 'Kiểm tra & sửa chữa thiết bị'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--slate-500)' }}>Thời gian hẹn:</span>
              <strong style={{ color: 'var(--warning-dark)' }}>{preferredDate} • {preferredTime}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--slate-500)' }}>Người nhận thợ:</span>
              <strong style={{ color: 'var(--slate-900)' }}>{contactName} ({contactPhone})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Địa chỉ:</span>
              <strong style={{ color: 'var(--slate-900)' }}>{address}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/my-requests')}
              className="btn btn-dmx-yellow"
              style={{ flex: 1 }}
            >
              <span>Xem Tiến Độ Đơn</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              <span>Về Trang Chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 16px' }}>
      {/* Tiêu đề trang */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '8px', paddingLeft: 0 }}
        >
          <ChevronLeft size={16} />
          <span>Quay lại</span>
        </button>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--dmx-blue-dark)' }}>
          Đặt Lịch Sửa Chữa & Bảo Trì Tại Nhà
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '2px' }}>
          Có mặt sau 60 phút • Giá niêm yết rõ ràng • Bảo hành 60 ngày tận nhà
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Bước 1: Chọn thiết bị và hiện tượng lỗi */}
        <div className="card-modern">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--dmx-blue)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
              1
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Chọn Thiết Bị & Hiện Tượng Hư Hỏng
            </h3>
          </div>

          {/* Chọn loại thiết bị (không dùng icon emoji) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { id: 'AC', name: 'Điều hòa' },
              { id: 'FRIDGE', name: 'Tủ lạnh' },
              { id: 'WASH', name: 'Máy giặt' },
              { id: 'HEATER', name: 'Bình nóng lạnh' },
              { id: 'ELEC', name: 'Điện nước' }
            ].map(dev => (
              <button
                key={dev.id}
                type="button"
                onClick={() => { setDeviceType(dev.id); setSelectedIssue(''); }}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: deviceType === dev.id ? '2px solid var(--dmx-blue)' : '1px solid var(--slate-200)',
                  background: deviceType === dev.id ? 'var(--dmx-blue-light)' : '#FFFFFF',
                  color: deviceType === dev.id ? 'var(--dmx-blue-dark)' : 'var(--slate-700)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {dev.name}
              </button>
            ))}
          </div>

          {/* Danh sách lỗi phổ biến (Pills) */}
          <label className="form-label">Chọn hiện tượng lỗi hoặc dịch vụ bạn cần:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            {commonIssues[deviceType]?.map((issue, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIssue(issue)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedIssue === issue ? '1.5px solid var(--dmx-blue)' : '1px solid var(--slate-200)',
                  background: selectedIssue === issue ? 'var(--dmx-blue)' : '#FFFFFF',
                  color: selectedIssue === issue ? '#FFFFFF' : 'var(--slate-700)',
                  fontSize: '0.82rem',
                  fontWeight: selectedIssue === issue ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {issue}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Mô tả thêm chi tiết sự cố (nếu có):</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ví dụ: Máy lạnh bật 1 tiếng nhưng phòng vẫn nóng, có tiếng kêu ở dàn lạnh..."
              className="form-control"
            />
          </div>
        </div>

        {/* Bước 2: Thời gian thợ đến phục vụ */}
        <div className="card-modern">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--dmx-blue)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
              2
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Thời Gian Hẹn Kỹ Thuật Viên Đến Nhà
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { time: 'Sớm nhất (Trong 60 phút)', desc: 'Kỹ thuật viên gần nhất xuất phát ngay' },
              { time: 'Sáng (08:30 - 11:30)', desc: 'Thích hợp bảo dưỡng định kỳ' },
              { time: 'Chiều (14:00 - 17:00)', desc: 'Sau giờ nghỉ trưa' },
              { time: 'Tối (17:30 - 20:00)', desc: 'Sau giờ tan sở đi làm về' },
            ].map((slot, idx) => (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: preferredTime === slot.time ? '2px solid var(--dmx-blue)' : '1px solid var(--slate-200)',
                  background: preferredTime === slot.time ? 'var(--dmx-blue-light)' : '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="preferredTime"
                  value={slot.time}
                  checked={preferredTime === slot.time}
                  onChange={() => setPreferredTime(slot.time)}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>{slot.time}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>{slot.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bước 3: Địa chỉ & Số điện thoại nhận thợ */}
        <div className="card-modern">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--dmx-blue)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
              3
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Thông Tin Địa Chỉ & Người Nhận Thợ
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Họ và tên khách hàng *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại liên hệ *</label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Địa chỉ phục vụ (Số nhà, ngõ ngách, tên tòa chung cư) *</label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        {/* Tóm tắt cam kết & Nút đặt thợ */}
        <div style={{
          background: 'var(--dmx-blue-dark)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#FED700', fontWeight: 700 }}>
              <ShieldCheck size={16} />
              <span>CAM KẾT MINH BẠCH GIÁ • BẢO HÀNH 60 NGÀY</span>
            </div>
            <div style={{ fontSize: '0.82rem', opacity: 0.85, marginTop: '4px' }}>
              Khách hàng nghiệm thu ưng ý mới thanh toán. Không phát sinh chi phí ẩn.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-dmx-yellow btn-lg"
            style={{ padding: '14px 28px' }}
          >
            <span>XÁC NHẬN ĐẶT LỊCH NGAY</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
