import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  FileText 
} from 'lucide-react';

export default function ServiceHistory() {
  const [selectedWarrantyItem, setSelectedWarrantyItem] = useState(null);
  const [warrantyReason, setWarrantyReason] = useState('');
  const [submittedWarranty, setSubmittedWarranty] = useState(false);

  const historyItems = [
    {
      id: 1,
      code: 'REQ-2026-052',
      serviceName: 'Vệ sinh máy giặt Electrolux cửa ngang & thay gioăng cao su',
      completedDate: '16/10/2026',
      totalPaid: '450.000 đ',
      warrantyStart: '16/10/2026',
      warrantyEnd: '16/01/2027',
      isUnderWarranty: true,
      remainingDays: 85,
    },
    {
      id: 2,
      code: 'REQ-2026-018',
      serviceName: 'Nạp gas điều hòa Panasonic Inverter phòng khách',
      completedDate: '20/07/2026',
      totalPaid: '350.000 đ',
      warrantyStart: '20/07/2026',
      warrantyEnd: '20/10/2026',
      isUnderWarranty: false,
      remainingDays: 0,
    }
  ];

  const handleWarrantySubmit = (e) => {
    e.preventDefault();
    setSubmittedWarranty(true);
    setTimeout(() => {
      alert(`Đã gửi yêu cầu bảo hành cho đơn #${selectedWarrantyItem.code}! KTV Minh Đức sẽ liên hệ kiểm tra miễn phí.`);
      setSelectedWarrantyItem(null);
      setSubmittedWarranty(false);
      setWarrantyReason('');
    }, 500);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '20px auto', padding: '0 16px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #065F46, #047857)',
        color: 'white',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <ShieldCheck size={32} style={{ flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Chính sách bảo hành Minh Đức</h2>
          <p style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '2px', lineHeight: 1.3 }}>
            Linh kiện thay thế và dịch vụ sửa chữa đều được lưu thời hạn bảo hành minh bạch.
          </p>
        </div>
      </div>

      <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px' }}>
        Lịch sử dịch vụ & Bảo hành
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {historyItems.map(item => (
          <div key={item.id} className="card" style={{ margin: 0, padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-dark)' }}>
                #{item.code}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Hoàn tất: {item.completedDate}
              </span>
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '6px' }}>
              {item.serviceName}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Số tiền đã thanh toán: <strong style={{ color: 'var(--primary)' }}>{item.totalPaid}</strong>
            </div>

            {/* Trạng thái bảo hành */}
            <div style={{
              marginTop: '10px',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: item.isUnderWarranty ? '#ECFDF5' : '#F1F5F9',
              border: `1px solid ${item.isUnderWarranty ? '#A7F3D0' : '#E2E8F0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: item.isUnderWarranty ? '#065F46' : '#64748B' }}>
                  {item.isUnderWarranty ? `✓ Còn bảo hành (${item.remainingDays} ngày)` : '✕ Đã hết hạn bảo hành'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Hạn: {item.warrantyEnd}
                </div>
              </div>

              {item.isUnderWarranty && (
                <button
                  onClick={() => setSelectedWarrantyItem(item)}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Yêu cầu BH
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* POPUP YÊU CẦU BẢO HÀNH (UC-11 / MUC-25) */}
      {selectedWarrantyItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', maxWidth: '380px', width: '100%', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '4px' }}>
              Gửi yêu cầu bảo hành
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Đơn gốc: #{selectedWarrantyItem.code} - {selectedWarrantyItem.serviceName}
            </p>

            <form onSubmit={handleWarrantySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Mô tả lỗi phát sinh lại *
                </label>
                <textarea
                  value={warrantyReason}
                  onChange={e => setWarrantyReason(e.target.value)}
                  rows={3}
                  placeholder="Mô tả hiện tượng sự cố tái phát (ví dụ: máy giặt lại báo lỗi E10...)"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Xác nhận gửi BH
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWarrantyItem(null)}
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
