import Icon from './Icon.jsx';

const steps = [
  ['Tiếp nhận yêu cầu', '08:15 · Đã xác nhận hệ thống'],
  ['Đã phân công kỹ thuật viên', '08:30 · Trần Văn Nam (Bậc 4/5)'],
  ['Đang xử lý tại nhà', 'Nạp gas & Vệ sinh xịt rửa R32'],
  ['Hoàn tất & Kích hoạt bảo hành', 'Bảo hành 6 tháng sau nghiệm thu'],
];

export default function PhoneMockup() {
  return (
    <div className="phone" aria-label="Minh họa ứng dụng theo dõi dịch vụ HRMSS">
      <div className="phone-speaker" />
      <div className="phone-screen">
        <div className="phone-top"><strong><Icon name="electric_bolt" /> HRMSS Live Tracking</strong><span className="live-label">TRỰC TIẾP</span></div>
        <div className="phone-card">
          <div className="phone-meta"><span>MÃ YÊU CẦU: #MD-8842</span><b>Hẹn: 09:30 Hôm nay</b></div>
          <p className="phone-title">Bảo dưỡng điều hòa Daikin Inverter</p>
          <p className="phone-address"><Icon name="pin_drop" /> Số 45 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy</p>
        </div>
        <div className="phone-card">
          <strong className="phone-caption">TIẾN TRÌNH DỊCH VỤ</strong>
          <ol className="tracking-steps">
            {steps.map(([title, detail], index) => (
              <li key={title} className={index === 2 ? 'current' : index === 3 ? 'upcoming' : ''}>
                <span className="step-dot">{index < 2 ? <Icon name="check" /> : index === 2 ? <Icon name="sync" /> : '4'}</span>
                <div><strong>{title}</strong><small>{detail}</small></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="phone-card technician"><span className="technician-avatar"><Icon name="engineering" /></span><div><strong>KTV Trần Văn Nam</strong><small><Icon name="star" /> <b>5.0</b> (184 đánh giá)</small></div><span className="phone-call"><Icon name="call" /></span></div>
        <div className="phone-card phone-estimate"><span>Thời gian ước tính:</span><strong>Còn ~25 phút</strong></div>
      </div>
    </div>
  );
}
