import { useRef, useState } from 'react';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import ContactLinks from '../components/ContactLinks.jsx';
import Icon from '../components/Icon.jsx';
import { contact } from '../data/contact.js';
import { airConditioner, airConditionerImage, applianceServices, matchesService, pricingRows, serviceCategories } from '../data/services.js';
import '../styles/services.css';

const protocols = [
  ['biotech', 'Kiểm tra, đo đạc thông số', 'Đánh giá hiện trạng bằng dụng cụ chuyên dụng và xác định nguyên nhân trước khi sửa chữa.'],
  ['request_quote', 'Báo giá rõ ràng', 'Thông báo hạng mục, vật tư và chi phí để khách hàng xem xét trước khi thực hiện.'],
  ['verified_user', 'Nghiệm thu & Bảo hành số', 'Vận hành thử, kiểm tra kết quả cùng khách hàng và lưu thông tin bảo hành.'],
];

export default function ServicesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const showAir = matchesService(airConditioner, category, query);
  const filtered = applianceServices.filter(service => matchesService(service, category, query));
  const resultCount = filtered.length + Number(showAir);

  function resetFilters() {
    setQuery('');
    setCategory('all');
  }

  function openService(service, event) {
    trigger.current = event.currentTarget;
    setSelectedService(service);
    dialog.current.showModal();
  }

  return (
    <>
      <a className="skip-link" href="#noi-dung">Đến nội dung chính</a>
      <SiteHeader activePath="/dich-vu" />
      <main id="noi-dung" className="services-page">
        <section className="catalog-hero">
          <div className="container">
            <nav className="breadcrumbs" aria-label="Đường dẫn"><a href="/"><Icon name="home" />Trang chủ</a><Icon name="chevron_right" /><span aria-current="page">Dịch vụ</span></nav>
            <div className="catalog-intro">
              <div><p className="catalog-badge"><Icon name="verified" />TIÊU CHUẨN KỸ THUẬT MINH ĐỨC HRMSS</p><h1>Danh mục Dịch vụ Sửa chữa & Bảo dưỡng Thiết bị</h1><p className="catalog-description">Công Ty TNHH Cơ Điện Lạnh Minh Đức cung cấp dịch vụ kỹ thuật chuẩn quy trình cho thiết bị điện lạnh và điện gia dụng tại nhà. Đặt lịch nhanh chóng, kiểm tra báo giá minh bạch và theo dõi tiến độ trên ứng dụng HRMSS.</p></div>
              <form className="catalog-search" role="search" onSubmit={event => event.preventDefault()}><Icon name="search" /><label className="visually-hidden" htmlFor="service-search">Tìm kiếm dịch vụ</label><input id="service-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Điều hòa, máy giặt, rò gas..." /><button className="button button-primary" type="submit">Tìm</button></form>
            </div>
            <div className="catalog-filters" role="group" aria-label="Lọc theo nhóm thiết bị">{serviceCategories.map(item => <button type="button" key={item.id} className={`filter-pill ${category === item.id ? 'selected' : ''}`} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}><Icon name={item.icon} />{item.label}{item.id === 'all' && ' (7)'}</button>)}</div>
          </div>
        </section>

        <section className="catalog-results" aria-label="Kết quả dịch vụ">
          <div className="container">
            <div className="catalog-results-bar"><p role="status" aria-live="polite">Hiển thị <strong>{resultCount}</strong> dịch vụ{query.trim() && <> cho “{query.trim()}”</>}</p>{(query || category !== 'all') && <button className="text-link" type="button" onClick={resetFilters}><Icon name="filter_alt_off" />Xóa bộ lọc</button>}</div>
            {showAir && <article className="featured-service">
              <div className="featured-visual"><img src={airConditionerImage} alt="Kỹ thuật viên kiểm tra hệ thống điều hòa bằng đồng hồ đo chuyên dụng" width="800" height="1000" fetchPriority="high" /><div className="featured-overlay"><div><span className="featured-badge"><Icon name="star" />DỊCH VỤ TRỌNG TÂM</span><h2>Điều hòa dân dụng & Multi / Inverter</h2><p>Chuyên xử lý sự cố máy lạnh, vệ sinh dàn trao đổi nhiệt và bảo dưỡng hệ thống điều hòa tại nhà.</p></div><div className="featured-assurance"><Icon name="engineering" /><div><strong>Kỹ thuật viên chuyên môn điện lạnh</strong><span>Kiểm tra kỹ lưỡng · Quy trình rõ ràng</span></div></div></div></div>
              <div className="featured-content"><div><p className="eyebrow">HẠNG MỤC PHỤC VỤ CHUYÊN SÂU</p><p>{airConditioner.description}</p></div><div><h3 className="checklist-heading"><Icon name="warning" />Các lỗi thường gặp</h3><ul className="fault-grid">{airConditioner.checks.map(check => <li key={check}><Icon name="check_circle" />{check}</li>)}</ul></div><div className="measurement-panel"><h3><Icon name="handyman" />Quy chuẩn đo lường minh bạch</h3><div className="measurement-grid">{[['Áp suất gas', 'Đồng hồ áp kế', 'Đối chiếu chỉ số khi kiểm tra'], ['Dòng điện tải', 'Ampe kìm', 'Kiểm tra hoạt động máy nén'], ['Bảo hành HRMSS', '06 – 12 tháng', 'Theo hạng mục thực hiện']].map(([label, value, detail]) => <div key={label}><small>{label}</small><strong>{value}</strong><span>{detail}</span></div>)}</div></div><div className="featured-action"><div><small>Chi phí công bảo dưỡng từ</small><p><strong>180.000₫</strong><span>/ máy treo tường</span></p></div><button className="button button-primary" type="button" onClick={event => openService(airConditioner, event)}><Icon name="calendar_add_on" />Đặt lịch điều hòa</button></div></div>
            </article>}

            {filtered.length > 0 && <div className="appliance-section"><div className="catalog-section-heading"><div><p className="eyebrow">HỆ THỐNG GIA DỤNG MINH ĐỨC</p><h2>Dịch vụ thiết bị điện gia dụng gia đình</h2></div><p>Kiểm tra bằng dụng cụ chuyên dụng, tư vấn rõ ràng từng hạng mục sửa chữa và bảo dưỡng.</p></div><div className="appliance-grid">{filtered.map(service => <article className="appliance-card" key={service.id}><div className="appliance-image"><img src={service.image} alt={service.title} loading="lazy" width="600" height="384" /><span>{service.badge}</span></div><h3>{service.title}</h3><p className="appliance-description">{service.description}</p><div className="appliance-checks"><h4>HẠNG MỤC KIỂM TRA CỐT LÕI</h4><ul>{service.checks.map(check => <li key={check}><Icon name="check_circle" /><span>{check}</span></li>)}</ul></div><div className="appliance-bottom"><div><small>Bảo hành linh kiện</small><strong>{service.warranty}</strong></div><button className="catalog-detail-button" type="button" aria-label={`Chi tiết ${service.title}`} onClick={event => openService(service, event)}>Chi tiết<Icon name="arrow_forward" /></button></div></article>)}</div></div>}
            {resultCount === 0 && <div className="catalog-empty"><Icon name="search_off" /><h2>Chưa tìm thấy dịch vụ phù hợp</h2><p>Thử từ khóa khác hoặc chọn lại nhóm thiết bị.</p><button className="button button-primary" type="button" onClick={resetFilters}>Xem tất cả dịch vụ</button></div>}
          </div>
        </section>

        <section className="section section-tinted" id="bang-gia"><div className="container"><div className="section-heading centered"><p className="eyebrow">NGUYÊN TẮC MINH BẠCH MINH ĐỨC</p><h2>Quy chuẩn kỹ thuật & Bảng giá tham khảo</h2><p className="section-description">Kiểm tra hiện trạng, thống nhất báo giá và nghiệm thu công việc theo từng hạng mục.</p></div><div className="protocol-grid">{protocols.map(([icon, title, description], index) => <article className="protocol-card" key={title}><span className="protocol-number" aria-hidden="true">0{index + 1}</span><div className="icon-box"><Icon name={icon} /></div><h3>{title}</h3><p>{description}</p></article>)}</div><div className="pricing-panel"><h3>Khung đơn giá kỹ thuật cơ bản Minh Đức</h3><p className="pricing-note" id="pricing-note">Giá và thời gian bảo hành tham khảo theo thiết kế. Báo giá thực tế được xác nhận sau khi kiểm tra thiết bị.</p><div className="pricing-scroll" role="region" aria-label="Bảng giá tham khảo, có thể cuộn ngang" tabIndex={0}><table aria-describedby="pricing-note"><caption className="visually-hidden">Bảng giá dịch vụ sửa chữa và bảo dưỡng tham khảo</caption><thead><tr>{['Hạng mục kỹ thuật', 'Quy chuẩn vật tư / Thao tác', 'Thời gian bảo hành', 'Mức giá (VND)'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{pricingRows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div></div></div></section>

        <section className="service-support section"><div className="container service-support-inner"><div><p className="eyebrow">ĐỒNG HÀNH CÙNG MINH ĐỨC</p><h2>Bạn cần tư vấn cho thiết bị tại nhà?</h2><p>Liên hệ để trao đổi tình trạng thiết bị và thời gian phục vụ phù hợp.</p></div><a className="button button-primary" href={`tel:${contact.phone}`}><Icon name="support_agent" />Gọi {contact.phone}</a></div></section>
      </main>
      <SiteFooter />
      <ContactLinks />
      <dialog className="article-dialog service-dialog" ref={dialog} aria-labelledby="service-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }} onClose={() => trigger.current?.focus()}><div className="dialog-inner"><button className="dialog-close" type="button" aria-label="Đóng chi tiết dịch vụ" onClick={() => dialog.current.close()}><Icon name="close" /></button><p className="eyebrow">DỊCH VỤ MINH ĐỨC</p><h2 id="service-dialog-title">{selectedService?.title}</h2><p>{selectedService?.description}</p><ul className="service-dialog-checks">{selectedService?.checks.map(check => <li key={check}><Icon name="check_circle" />{check}</li>)}</ul><p className="service-dialog-warranty"><Icon name="verified_user" />Bảo hành: {selectedService?.warranty} tùy hạng mục.</p><div className="service-dialog-contact"><h3>Tư vấn & Đặt lịch</h3><p>Gọi Minh Đức để xác nhận tình trạng thiết bị, chi phí và lịch hẹn.</p><a className="button button-primary" href={`tel:${contact.phone}`}><Icon name="call" />Gọi {contact.phone}</a></div></div></dialog>
    </>
  );
}
