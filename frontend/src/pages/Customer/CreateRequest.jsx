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
  X 
} from 'lucide-react';

export default function CreateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('1'); // Điều hòa
  const [service, setService] = useState(location.state?.serviceName || 'Bảo dưỡng, vệ sinh điều hòa');
  const [address, setAddress] = useState('Số 45, Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội');
  const [contactName, setContactName] = useState(user?.full_name || 'Nguyễn Xuân Khánh');
  const [contactPhone, setContactPhone] = useState(user?.phone || '0987654321');
  const [preferredDate, setPreferredDate] = useState('2026-10-23');
  const [preferredTime, setPreferredTime] = useState('Sáng (08:00 - 11:30)');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fakeUrl = URL.createObjectURL(file);
      setImages([...images, fakeUrl]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
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
          <CheckCircle size={44} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Gửi yêu cầu thành công!
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
          Mã đơn của bạn: <strong style={{ color: 'var(--primary)' }}>#REQ-2026-095</strong><br />
          Bộ phận điều phối Minh Đức sẽ liên hệ xác nhận và xếp kỹ thuật viên trong ít phút.
        </p>

        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate('/my-requests')}
            className="btn-primary"
          >
            Theo dõi đơn hàng
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Bước 1: Chọn dịch vụ & thiết bị */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700
            }}>1</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Chọn thiết bị & dịch vụ</h3>
          </div>

          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Loại thiết bị
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.9rem',
              marginBottom: '12px',
              background: 'white'
            }}
          >
            <option value="1">Điều hòa / Máy lạnh</option>
            <option value="2">Tủ lạnh & Tủ đông</option>
            <option value="3">Máy giặt & Máy sấy</option>
            <option value="4">Bình nóng lạnh</option>
            <option value="5">Điện gia dụng khác</option>
          </select>

          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Dịch vụ cần thực hiện
          </label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Ví dụ: Vệ sinh máy, Sửa lỗi không lạnh..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.9rem'
            }}
            required
          />
        </div>

        {/* Bước 2: Địa chỉ phục vụ & Người liên hệ */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700
            }}>2</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Địa chỉ sửa chữa tại nhà</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
            <MapPin size={20} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem'
                }}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Địa chỉ mặc định đã lưu của bạn
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Người liên hệ</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Số điện thoại</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                required
              />
            </div>
          </div>
        </div>

        {/* Bước 3: Thời gian mong muốn */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700
            }}>3</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Thời gian thợ đến kiểm tra</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ngày hẹn</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Khung giờ</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', background: 'white' }}
              >
                <option value="Sáng (08:00 - 11:30)">Sáng (08:00 - 11:30)</option>
                <option value="Chiều (13:30 - 17:30)">Chiều (13:30 - 17:30)</option>
                <option value="Tối (18:00 - 20:00)">Tối (18:00 - 20:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bước 4: Mô tả triệu chứng & Chụp ảnh */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700
            }}>4</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Mô tả sự cố & Ảnh (nếu có)</h3>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Mô tả cụ thể hiện tượng: ví dụ máy phát ra tiếng kêu to, quạt gió không quay, rò rỉ nước..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              resize: 'none',
              marginBottom: '10px'
            }}
          />

          {/* Upload ảnh */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Ảnh chụp thiết bị / mã lỗi
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {images.map((imgUrl, idx) => (
                <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                  <img src={imgUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: 'white',
                      border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <label style={{
                width: '60px', height: '60px', borderRadius: '6px', border: '1.5px dashed var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', background: '#F8FAFC', color: 'var(--text-muted)'
              }}>
                <Camera size={20} />
                <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>Thêm</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        {/* Nút gửi yêu cầu */}
        <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '8px' }}>
          Xác nhận đặt lịch sửa chữa
        </button>
      </form>
    </div>
  );
}
