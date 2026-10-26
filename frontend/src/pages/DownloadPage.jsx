import { useState } from 'react';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import ContactLinks from '../components/ContactLinks.jsx';
import AppScreenPreview from '../components/AppScreenPreview.jsx';
import Icon from '../components/Icon.jsx';
import { contact } from '../data/contact.js';
import { appDistribution, appBenefits, downloadFaqs, installationSteps } from '../data/download.js';
import '../styles/download.css';

const previews = [
  { id: 'booking', title: 'Đặt lịch & Chọn dịch vụ', description: 'Chọn thiết bị và chuẩn bị yêu cầu sửa chữa.' },
  { id: 'tracking', title: 'Theo dõi tiến độ', description: 'Nắm bắt trạng thái và thông tin kỹ thuật viên.' },
  { id: 'warranty', title: 'Hồ sơ & Bảo hành số', description: 'Tra cứu lịch sử và thông tin bảo hành.' },
];

function DistributionAction({ href, icon, title, subtitle, onPending, className = '' }) {
  const content = <><Icon name={icon} /><span><small>{subtitle}</small><strong>{title}</strong></span><Icon name={href ? 'arrow_outward' : 'schedule'} /></>;
  return href ? <a className={`distribution-action ${className}`} href={href} target="_blank" rel="noopener noreferrer">{content}</a> : <button className={`distribution-action ${className}`} type="button" onClick={onPending}>{content}</button>;
}

export default function DownloadPage() {
  const [notice, setNotice] = useState('');
  const [selectedPreview, setSelectedPreview] = useState('tracking');
  const customerReady = Boolean(appDistribution.iosUrl || appDistribution.androidUrl);
  function pending(channel) { setNotice(`${channel} chưa có đường dẫn phát hành chính thức. Thông tin sẽ được cập nhật tại trang này khi sẵn sàng.`); }

  return <>
    <a className="skip-link" href="#noi-dung">Đến nội dung chính</a><SiteHeader activePath="/tai-ung-dung" />
    <main id="noi-dung" className="download-page">
      <section className="download-hero"><div className="container"><nav className="download-breadcrumbs" aria-label="Đường dẫn"><a href="/"><Icon name="home" />Trang chủ</a><span aria-hidden="true">/</span><span aria-current="page">Tải ứng dụng HRMSS</span></nav><div className="download-heading"><p className="download-eyebrow"><span />ỨNG DỤNG DI ĐỘNG · CƠ ĐIỆN LẠNH MINH ĐỨC</p><h1>Tải HRMSS App: Quản lý sửa chữa & Bảo trì thiết bị trong lòng bàn tay</h1><p>Đặt lịch thuận tiện, theo dõi tiến độ, xem báo giá và lưu hồ sơ bảo hành. HRMSS kết nối thông tin dịch vụ để bạn chủ động chăm sóc ngôi nhà.</p></div>
        <div className="distribution-grid" id="phien-ban-ung-dung"><article className="distribution-card customer-card"><div className="distribution-header"><span className="distribution-app-icon"><Icon name="home_repair_service" /></span><div><p>DÀNH CHO KHÁCH HÀNG</p><h2>HRMSS Customer</h2></div><span className="release-tag">{customerReady ? 'Link tải chính thức' : 'Đang phát triển'}</span></div><p className="distribution-description">Ứng dụng dành cho hộ gia đình và văn phòng: chọn dịch vụ sửa chữa, sắp xếp lịch hẹn, xem thông tin báo giá và quản lý bảo hành thiết bị.</p><div className="customer-download-area"><div className="download-qr-area">{appDistribution.customerQrImage ? <img src={appDistribution.customerQrImage} alt="Mã QR tải HRMSS Customer từ nguồn chính thức" width="144" height="144" /> : <div className="download-qr-pending"><Icon name="qr_code_scanner" /><span>Mã QR tải ứng dụng</span><strong>Sẽ cập nhật khi phát hành</strong></div>}</div><div className="distribution-actions"><DistributionAction href={appDistribution.iosUrl} icon="file_download" title="Apple App Store" subtitle={appDistribution.iosUrl ? 'DÀNH CHO iOS' : 'SẮP CÓ TRÊN iOS'} onPending={() => pending('HRMSS Customer trên App Store')} /><DistributionAction href={appDistribution.androidUrl} icon="android" title="Google Play Store" subtitle={appDistribution.androidUrl ? 'DÀNH CHO ANDROID' : 'SẮP CÓ TRÊN ANDROID'} onPending={() => pending('HRMSS Customer trên Google Play')} /></div></div><div className="distribution-footnote"><Icon name="info" /><span>Thông tin phiên bản, dung lượng và yêu cầu hệ điều hành sẽ được công bố cùng bản phát hành.</span></div></article>
        <article className="distribution-card technician-card"><div className="distribution-header"><span className="distribution-app-icon"><Icon name="handyman" /></span><div><p>DÀNH CHO ĐỘI NGŨ MINH ĐỨC</p><h2>HRMSS Technician</h2></div></div><p className="distribution-description">Công cụ nghiệp vụ cho kỹ thuật viên: tiếp nhận lịch công việc, cập nhật kết quả kiểm tra và phối hợp với bộ phận điều phối.</p><ul className="technician-features">{['Tiếp nhận yêu cầu theo phân công', 'Cập nhật hạng mục & Kết quả nghiệm thu', 'Tra cứu thông tin thiết bị và vật tư'].map(text => <li key={text}><Icon name="check_circle" />{text}</li>)}</ul><div className="distribution-actions"><DistributionAction className="technician-primary" href={appDistribution.technicianApkUrl} icon="download_for_offline" title="Bản cài cho kỹ thuật viên" subtitle={appDistribution.technicianApkUrl ? 'BẢN PHÁT HÀNH NỘI BỘ' : 'FILE APK ĐANG ĐƯỢC CHUẨN BỊ'} onPending={() => pending('Bản cài HRMSS Technician')} /><DistributionAction className="technician-secondary" href={appDistribution.internalPortalUrl} icon="vpn_key" title="Hướng dẫn tài khoản nội bộ" subtitle="DÀNH CHO NHÂN SỰ ĐƯỢC CẤP QUYỀN" onPending={() => setNotice('Vui lòng liên hệ bộ phận phụ trách Minh Đức để được hướng dẫn tài khoản kỹ thuật viên. Cổng truy cập nội bộ sẽ được cập nhật khi sẵn sàng.')} /></div></article></div>
        <div className={`distribution-notice ${notice ? 'has-message' : ''}`} role="status" aria-live="polite"><Icon name="info" /><span>{notice || 'Ứng dụng đang được phát triển. Các giao diện bên dưới là bản minh họa trải nghiệm HRMSS.'}</span>{notice && <button type="button" aria-label="Đóng thông báo tải ứng dụng" onClick={() => setNotice('')}><Icon name="close" /></button>}</div>
      </div></section>

      <section className="section"><div className="container"><div className="download-section-heading"><div><p className="eyebrow">GIẢI PHÁP ĐỒNG HÀNH TOÀN DIỆN</p><h2>Tiện ích trong cùng một ứng dụng</h2></div><p>Kết nối các bước từ yêu cầu đầu tiên đến hồ sơ bảo hành sau sửa chữa.</p></div><div className="download-benefit-grid">{appBenefits.map(([icon, title, description, note]) => <article key={title}><span className="icon-box"><Icon name={icon} /></span><h3>{title}</h3><p>{description}</p><span className="download-benefit-note">{note}<Icon name="check" /></span></article>)}</div></div></section>

      <section className="download-showcase section" id="giao-dien"><div className="container"><div className="section-heading centered"><p className="eyebrow">GIAO DIỆN TRỰC QUAN & TINH GỌN</p><h2>Khám phá trải nghiệm HRMSS</h2><p className="section-description">Ba góc nhìn cho hành trình dịch vụ tại nhà. Bạn có thể thử chọn thiết bị trong màn hình đặt lịch minh họa.</p></div><div className="preview-selectors" role="group" aria-label="Chọn màn hình xem trước">{previews.map(preview => <button key={preview.id} type="button" aria-pressed={selectedPreview === preview.id} onClick={() => setSelectedPreview(preview.id)}>{preview.title}</button>)}</div><div className="download-preview-grid">{previews.map((preview, index) => <figure key={preview.id} className={selectedPreview === preview.id ? 'selected' : ''}><AppScreenPreview type={preview.id} /><figcaption><span>MÀN HÌNH 0{index + 1}</span><h3>{preview.title}</h3><p>{preview.description}</p></figcaption></figure>)}</div></div></section>

      <section className="section" id="huong-dan"><div className="container"><div className="section-heading centered"><p className="eyebrow">HƯỚNG DẪN CÀI ĐẶT</p><h2>3 bước bắt đầu cùng HRMSS</h2><p className="section-description">Hướng dẫn dự kiến khi ứng dụng được phát hành chính thức.</p></div><div className="installation-grid">{installationSteps.map(([icon, title, description], index) => <article key={title}><div><span>0{index + 1}</span><Icon name={icon} /></div><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

      <section className="section download-faq-section" id="cau-hoi"><div className="container"><div className="section-heading centered"><p className="eyebrow">GIẢI ĐÁP THẮC MẮC</p><h2>Câu hỏi thường gặp khi tải ứng dụng</h2></div><div className="download-faq-list">{downloadFaqs.map(item => <details key={item.question} name="download-faq"><summary>{item.question}<Icon name="expand_more" /></summary><p>{item.answer}</p></details>)}</div></div></section>

      <section className="download-support-section"><div className="container"><div className="download-support-panel"><div><p className="eyebrow"><Icon name="support_agent" />ĐỘI NGŨ CHĂM SÓC KHÁCH HÀNG MINH ĐỨC</p><h2>Cần hỗ trợ tải app hoặc tư vấn dịch vụ?</h2><p>Bạn có thể liên hệ hotline để trao đổi tình trạng thiết bị và lịch phục vụ trong thời gian ứng dụng được hoàn thiện.</p></div><div className="download-support-actions"><a className="button" href={`tel:${contact.phone}`}><Icon name="call" />Hotline {contact.phone}</a><a href="/dich-vu">Khám phá dịch vụ<Icon name="arrow_forward" /></a></div></div></div></section>
    </main><SiteFooter /><ContactLinks />
  </>;
}
