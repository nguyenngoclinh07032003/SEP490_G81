import React, { useState } from 'react';
import {
  Wrench,
  Navigation,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Camera,
  Plus,
  DollarSign,
  ChevronRight
} from 'lucide-react';

export default function TechDashboard() {
  const [activeTab, setActiveTab] = useState('TODAY'); // TODAY | HISTORY

  // Đơn việc đang tiến hành
  const [currentJob, setCurrentJob] = useState({
    id: 'REQ-1003',
    customerName: 'Chị Đỗ Thu Trang',
    phone: '0912888999',
    address: 'Biệt thự BT3, Khu đô thị Ciputra, Tây Hồ, Hà Nội',
    device: 'Máy giặt Electrolux cửa ngang 9kg (EWF1074)',
    issue: 'Vắt rung lắc dữ dội, nước không xả hết được, báo lỗi E20',
    preferredTime: 'Hôm nay: 09:30',
    status: 'ARRIVED', // ASSIGNED -> MOVING -> ARRIVED -> REPAIRING -> COMPLETED
    diagnosisNote: 'Kiểm tra thấy tắc bơm xả do dị vật (tiền xu) và hỏng thụt giảm xóc bên trái',
    materialsUsed: [
      { name: 'Bộ thụt giảm xóc máy giặt Electrolux 100N', price: 280000, qty: 1 },
      { name: 'Vệ sinh & thông tắc bơm xả cặn', price: 120000, qty: 1 }
    ]
  });

  const [upcomingJobs, setUpcomingJobs] = useState([
    {
      id: 'REQ-1004',
      customerName: 'Anh Phạm Hoàng Anh',
      phone: '0933445566',
      address: 'Số 50 Nam Đồng, Đống Đa, Hà Nội',
      device: 'Bình nóng lạnh Ariston 30L',
      issue: 'Đèn sáng nhưng nước không nóng, nghi hỏng sợi đốt',
      time: '14:30 chiều nay',
      distance: '4.2 km'
    },
    {
      id: 'REQ-1007',
      customerName: 'Bác Nguyễn Hữu Thắng',
      phone: '0988776655',
      address: 'Số 8 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      device: 'Điều hòa Panasonic Inverter 9000 BTU',
      issue: 'Bảo dưỡng định kỳ và nạp bổ sung gas',
      time: '16:45 chiều nay',
      distance: '7.8 km'
    }
  ]);

  const [completedJobs, setCompletedJobs] = useState([
    { id: 'REQ-0994', customer: 'Nguyễn Văn Hải', device: 'Tủ lạnh Hitachi', total: '450.000 đ', date: 'Hôm qua' },
    { id: 'REQ-0988', customer: 'Lê Thị Nga', device: 'Điều hòa LG Inverter', total: '350.000 đ', date: 'Hôm qua' },
    { id: 'REQ-0982', customer: 'Vũ Quốc Trung', device: 'Máy giặt Panasonic', total: '250.000 đ', date: '2 ngày trước' },
  ]);

  const advanceJobStatus = () => {
    if (currentJob.status === 'ASSIGNED') {
      setCurrentJob({ ...currentJob, status: 'MOVING' });
    } else if (currentJob.status === 'MOVING') {
      setCurrentJob({ ...currentJob, status: 'ARRIVED' });
    } else if (currentJob.status === 'ARRIVED') {
      setCurrentJob({ ...currentJob, status: 'REPAIRING' });
    } else if (currentJob.status === 'REPAIRING') {
      setCurrentJob({ ...currentJob, status: 'COMPLETED' });
      alert('Đã hoàn thành công việc và lập biên bản nghiệm thu thành công!');
    }
  };

  const getStatusButtonText = () => {
    switch (currentJob.status) {
      case 'ASSIGNED': return '1. Bắt Đầu Xuất Phát Di Chuyển';
      case 'MOVING': return '2. Đã Đến Nhà Khách Hàng';
      case 'ARRIVED': return '3. Bắt Đầu Thi Công & Sửa Chữa';
      case 'REPAIRING': return '4. Hoàn Thành & Lập Nghiệm Thu';
      case 'COMPLETED': return 'Đã Nghiệm Thu Thành Công';
      default: return 'Cập nhật tiến độ';
    }
  };

  const calculateTotal = () => {
    return currentJob.materialsUsed.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  return (
    <div>
      {/* Header tổng kết nhanh của thợ */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy-900), #1E3A8A)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Xin chào Kỹ thuật viên,</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '2px' }}>Trần Văn Nam</h2>
            <div style={{ fontSize: '0.82rem', opacity: 0.85, marginTop: '4px' }}>
              Chuyên môn: Điện Lạnh • Đánh giá: <strong>⭐ 4.95 / 5.0</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Thu nhập ước tính hôm nay</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399' }}>850.000 đ</div>
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            onClick={() => setActiveTab('TODAY')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'TODAY' ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'TODAY' ? 'var(--navy-900)' : '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Việc Cần Làm Hôm Nay (3)
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'HISTORY' ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'HISTORY' ? 'var(--navy-900)' : '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Lịch Sử Đã Hoàn Thành
          </button>
        </div>
      </div>

      {activeTab === 'TODAY' ? (
        <div>
          {/* Đơn hàng đang làm hiện tại */}
          <div className="card-modern" style={{ border: '2px solid var(--primary)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-role-tech">ĐƠN ĐANG THỰC HIỆN</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{currentJob.id}</span>
              </div>
              <span className="badge badge-warning">
                Trạng thái: {currentJob.status}
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              {currentJob.customerName}
            </h3>

            {/* Quick Actions cho Thợ */}
            <div style={{ display: 'flex', gap: '8px', margin: '10px 0 16px' }}>
              <a
                href={`tel:${currentJob.phone}`}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <PhoneCall size={14} color="var(--success)" />
                <span>Gọi Khách ({currentJob.phone})</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(currentJob.address)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <Navigation size={14} color="var(--primary)" />
                <span>Mở Bản Đồ Chỉ Đường</span>
              </a>
            </div>

            <div style={{ background: 'var(--slate-50)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <MapPin size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{currentJob.address}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <Wrench size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <strong>{currentJob.device}</strong>
              </div>
              <div style={{ color: 'var(--slate-600)', fontStyle: 'italic', paddingLeft: '24px' }}>
                "{currentJob.issue}"
              </div>
            </div>

            {/* Chẩn đoán & Linh kiện vật tư thay thế */}
            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '14px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px', color: 'var(--slate-800)' }}>
                Phiếu Chẩn Đoán & Vật Tư Thay Thế:
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', background: '#FEF3C7', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '10px' }}>
                <strong>Kết luận thợ:</strong> {currentJob.diagnosisNote}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {currentJob.materialsUsed.map((mat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '6px 0', borderBottom: '1px dashed var(--slate-200)' }}>
                    <span>{mat.name} (x{mat.qty})</span>
                    <strong>{(mat.price * mat.qty).toLocaleString('vi-VN')} đ</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 800, marginTop: '6px', color: 'var(--danger-dark)' }}>
                  <span>TỔNG TIỀN NGHIỆM THU:</span>
                  <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Nút bấm tiến trình quy trình nghiệp vụ */}
            <button
              onClick={advanceJobStatus}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
              disabled={currentJob.status === 'COMPLETED'}
            >
              <CheckCircle size={18} />
              <span>{getStatusButtonText()}</span>
            </button>
          </div>

          {/* Danh sách các đơn tiếp theo trong ngày */}
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '12px' }}>
            Lịch Hẹn Tiếp Theo Hôm Nay:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingJobs.map(job => (
              <div key={job.id} className="card-modern" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{job.id}</span>
                  <span className="badge badge-status-pending">Cách {job.distance}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                  {job.customerName} - <span style={{ color: 'var(--slate-500)', fontSize: '0.82rem' }}>{job.phone}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                  {job.device} • Hẹn lúc: <strong style={{ color: 'var(--warning-dark)' }}>{job.time}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                  📍 {job.address}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Lịch sử công việc hoàn thành */
        <div className="card-modern">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            Lịch Sử Công Việc & Doanh Số Đã Xong
          </h3>
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Thiết Bị</th>
                  <th>Thời Gian</th>
                  <th>Thành Tiền</th>
                  <th>Đánh Giá</th>
                </tr>
              </thead>
              <tbody>
                {completedJobs.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.customer}</td>
                    <td>{c.device}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>{c.date}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success-dark)' }}>{c.total}</td>
                    <td>
                      <span className="badge badge-status-active">⭐ 5.0 Tuyệt vời</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
