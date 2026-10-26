import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  PhoneCall, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function MyRequests() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Dữ liệu mẫu mô phỏng danh sách đơn từ Backend
  const [requests, setRequests] = useState([
    {
      id: 1,
      code: 'REQ-2026-081',
      serviceName: 'Bảo dưỡng điều hòa Daikin Inverter 12000BTU',
      address: 'Số 45, Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
      createdAt: '22/10/2026 09:15',
      scheduledTime: 'Hôm nay - 14:30',
      status: 'IN_PROGRESS',
      statusLabel: 'KTV đang kiểm tra',
      statusClass: 'badge-warning',
      technician: { name: 'Trần Văn Tuấn', phone: '0912345678' },
    },
    {
      id: 2,
      code: 'REQ-2026-074',
      serviceName: 'Sửa tủ lạnh Panasonic không đông đá',
      address: 'Số 45, Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
      createdAt: '21/10/2026 14:20',
      scheduledTime: '21/10/2026 16:00',
      status: 'QUOTATION_PENDING',
      statusLabel: 'Chờ bạn duyệt báo giá',
      statusClass: 'badge-primary',
      technician: { name: 'Lê Hoàng Nam', phone: '0988776655' },
      quotation: {
        code: 'BG-2026-0045',
        type: 'INITIAL',
        total: '750.000 đ',
        items: [
          { name: 'Công tháo lắp & kiểm tra block tủ lạnh', price: '200.000 đ', type: 'Dịch vụ' },
          { name: 'Thay sò lạnh / rơ-le xả đá Panasonic', price: '350.000 đ', type: 'Vật tư' },
          { name: 'Nạp gas R600A bổ sung', price: '200.000 đ', type: 'Vật tư' }
        ]
      }
    },
    {
      id: 3,
      code: 'REQ-2026-052',
      serviceName: 'Vệ sinh máy giặt Electrolux cửa ngang',
      address: 'Số 45, Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
      createdAt: '15/10/2026 10:00',
      scheduledTime: '16/10/2026 09:00',
      status: 'COMPLETED',
      statusLabel: 'Đã hoàn thành',
      statusClass: 'badge-success',
      technician: { name: 'Trần Văn Tuấn', phone: '0912345678' },
      warrantyExpiry: '16/01/2027 (Còn 85 ngày)'
    }
  ]);

  const handleApproveQuotation = (reqId) => {
    setRequests(requests.map(r => {
      if (r.id === reqId) {
        return { ...r, status: 'IN_PROGRESS', statusLabel: 'Đã duyệt báo giá - Đang sửa', statusClass: 'badge-warning', quotation: null };
      }
      return r;
    }));
    setSelectedQuotation(null);
    alert('Bạn đã đồng ý duyệt báo giá! Kỹ thuật viên sẽ bắt đầu sửa chữa ngay.');
  };

  const handleRejectQuotation = (reqId) => {
    const reason = prompt('Vui lòng nhập lý do từ chối báo giá:');
    if (reason) {
      setRequests(requests.map(r => {
        if (r.id === reqId) {
          return { ...r, status: 'CANCELLED', statusLabel: 'Khách từ chối báo giá', statusClass: 'badge-danger', quotation: null };
        }
        return r;
      }));
      setSelectedQuotation(null);
      alert('Đã ghi nhận từ chối báo giá.');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return r.status === 'IN_PROGRESS';
    if (activeTab === 'QUOTATION') return r.status === 'QUOTATION_PENDING';
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ maxWidth: '960px', margin: '20px auto', padding: '0 16px' }}>
      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '12px'
      }}>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'QUOTATION', label: 'Chờ duyệt giá' },
          { key: 'ACTIVE', label: 'Đang xử lý' },
          { key: 'COMPLETED', label: 'Hoàn thành' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === tab.key ? 'none' : '1px solid var(--border)',
              background: activeTab === tab.key ? 'var(--primary)' : 'white',
              color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Request Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRequests.map(req => (
          <div key={req.id} className="card" style={{ margin: 0, padding: '14px' }}>
            {/* Header Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-dark)' }}>
                #{req.code}
              </span>
              <span className={`badge ${req.statusClass}`}>
                {req.statusLabel}
              </span>
            </div>

            {/* Service & Details */}
            <div style={{ margin: '10px 0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {req.serviceName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <Clock size={14} />
                <span>Hẹn: {req.scheduledTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{req.address}</span>
              </div>
            </div>

            {/* KTV Phụ trách */}
            {req.technician && (
              <div style={{
                background: '#F8FAFC',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                margin: '8px 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="var(--primary)" />
                  <span>KTV: <strong>{req.technician.name}</strong></span>
                </div>
                <a href={`tel:${req.technician.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                  <PhoneCall size={13} /> Gọi
                </a>
              </div>
            )}

            {/* BẢNG BÁO GIÁ CẦN DUYỆT (Nếu có) */}
            {req.quotation && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: '#FFFBEB',
                border: '1.5px solid #FDE68A'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.88rem', color: '#92400E' }}>
                  <span>Báo giá chi tiết:</span>
                  <span style={{ fontSize: '1rem', color: '#B45309' }}>{req.quotation.total}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#78350F', marginTop: '4px' }}>
                  KTV đã chẩn đoán xong và lập báo giá linh kiện & công sửa chữa.
                </p>
                <button
                  onClick={() => setSelectedQuotation(req)}
                  className="btn-primary"
                  style={{ marginTop: '8px', padding: '8px 14px', fontSize: '0.85rem', background: '#D97706' }}
                >
                  <FileText size={16} /> Xem & Duyệt báo giá
                </button>
              </div>
            )}

            {/* Thông tin bảo hành nếu đã hoàn thành */}
            {req.warrantyExpiry && (
              <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle size={14} /> Bảo hành đến: {req.warrantyExpiry}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* POPUP MODAL DUYỆT BÁO GIÁ (UC-05 / MUC-11) */}
      {selectedQuotation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '100%',
            padding: '20px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '8px' }}>
              Duyệt báo giá #{selectedQuotation.quotation.code}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Đơn hàng: {selectedQuotation.code} - {selectedQuotation.serviceName}
            </p>

            {/* Danh sách hạng mục */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ background: '#F1F5F9', padding: '8px 10px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>HẠNG MỤC / VẬT TƯ</span>
                <span>GIÁ</span>
              </div>
              {selectedQuotation.quotation.items.map((item, idx) => (
                <div key={idx} style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div>
                    <div>{item.name}</div>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{item.type}</span>
                  </div>
                  <strong style={{ alignSelf: 'center' }}>{item.price}</strong>
                </div>
              ))}
              <div style={{ padding: '10px', background: '#F8FAFC', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                <span>TỔNG TIỀN PHẢI TRẢ:</span>
                <span>{selectedQuotation.quotation.total}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleApproveQuotation(selectedQuotation.id)}
                className="btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <CheckCircle size={18} /> Đồng ý sửa
              </button>
              <button
                onClick={() => handleRejectQuotation(selectedQuotation.id)}
                style={{
                  flex: 1, background: '#FEE2E2', color: '#DC2626', border: 'none',
                  borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer'
                }}
              >
                <XCircle size={18} /> Từ chối
              </button>
            </div>

            <button
              onClick={() => setSelectedQuotation(null)}
              style={{
                width: '100%', marginTop: '10px', background: 'none', border: 'none',
                color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: '6px'
              }}
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
