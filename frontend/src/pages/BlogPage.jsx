import { useEffect, useRef, useState } from 'react';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import ContactLinks from '../components/ContactLinks.jsx';
import Icon from '../components/Icon.jsx';
import { contact } from '../data/contact.js';
import { blogArticles, blogCategories, featuredArticle, filterArticles } from '../data/blog.js';
import '../styles/blog.css';

const allArticles = [featuredArticle, ...blogArticles];
const pageSize = 4;
const categoryLabel = id => blogCategories.find(category => category.id === id)?.label;
const categoryIcon = { 'dieu-hoa': 'ac_unit', 'may-giat': 'local_laundry_service', 'tu-lanh': 'kitchen', 'dien-nuoc': 'electrical_services', 'app-hrmss': 'phonelink_setup' };
const topics = [['Gas R32 / R410A', 'gas'], ['Bảo dưỡng máy giặt', 'máy giặt'], ['Chống giật ELCB', 'ELCB'], ['Tủ lạnh đóng tuyết', 'đóng tuyết'], ['Thay lõi lọc nước', 'lõi lọc'], ['Tiết kiệm điện', 'điện'], ['Bảo hành HRMSS', 'bảo hành']];

function ArticleMeta({ article }) {
  return <p className="journal-meta"><span>{article.author}</span><span aria-hidden="true">·</span><span><Icon name="schedule" />{article.duration} phút đọc</span></p>;
}

function ArticleVisual({ article, featured = false }) {
  return <div className={`journal-image ${article.image ? '' : `journal-illustration illustration-${article.category}`}`}>
    {article.image ? <img src={article.image} alt={article.alt} width="800" height="520" loading={featured ? 'eager' : 'lazy'} /> : <><div className="illustration-orbit" /><Icon name={categoryIcon[article.category]} /><span className="illustration-caption">{article.category === 'app-hrmss' ? 'Bảo hành điện tử · HRMSS' : 'Cẩm nang kỹ thuật Minh Đức'}</span></>}
    <span className="journal-category">{featured ? 'TIÊU ĐIỂM KỸ THUẬT' : categoryLabel(article.category)}</span>
  </div>;
}

export default function BlogPage() {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('default');
  const [selectedArticle, setSelectedArticle] = useState(() => allArticles.find(article => article.id === new URLSearchParams(window.location.search).get('article')) || null);
  const [device, setDevice] = useState('Điều hòa');
  const [symptom, setSymptom] = useState('');
  const [requestPreview, setRequestPreview] = useState(null);
  const dialog = useRef(null);
  const articleTrigger = useRef(null);
  const resultsHeading = useRef(null);

  useEffect(() => {
    if (selectedArticle && !dialog.current.open) dialog.current.showModal();
  }, [selectedArticle]);

  const hasFilters = Boolean(query.trim()) || category !== 'all';
  const matches = filterArticles(hasFilters ? allArticles : blogArticles, category, query);
  const sorted = sort === 'short' ? [...matches].sort((a, b) => a.duration - b.duration) : matches;
  const pageCount = Math.ceil(sorted.length / pageSize);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const visibleArticles = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateQuery(value) { setQuery(value); setPage(1); }
  function resetFilters() { setQuery(''); setCategory('all'); setPage(1); }
  function changePage(value) { setPage(value); resultsHeading.current?.focus({ preventScroll: true }); resultsHeading.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }
  function openArticle(article, event) { articleTrigger.current = event.currentTarget; setSelectedArticle(article); }

  return <>
    <a className="skip-link" href="#noi-dung">Đến nội dung chính</a>
    <SiteHeader activePath="/blog" />
    <main id="noi-dung" className="journal-page">
      <section className="journal-masthead"><div className="container">
        <nav className="journal-breadcrumbs" aria-label="Đường dẫn"><a href="/"><Icon name="home" />Trang chủ</a><span aria-hidden="true">/</span><span aria-current="page">Blog & Cẩm nang kỹ thuật</span></nav>
        <div className="journal-intro"><div><p className="journal-kicker"><Icon name="verified" />KIẾN THỨC TỪ ĐỘI NGŨ KỸ THUẬT MINH ĐỨC</p><h1>Cẩm nang Kỹ thuật & Kinh nghiệm Vận hành Thiết bị Điện Cơ – Điện Lạnh</h1><p>Tổng hợp kiến thức chuyên môn, kinh nghiệm bảo trì và hướng dẫn sử dụng HRMSS. Cùng Minh Đức chăm sóc thiết bị gia đình bền bỉ, thuận tiện và an toàn hơn.</p></div><div className="journal-trust"><span className="icon-box"><Icon name="engineering" /></span><div><small>GÓC CHUYÊN GIA</small><strong>Minh Đức Engineering</strong><span>Chia sẻ kinh nghiệm thực tế</span></div></div></div>
        <div className="journal-search-row"><div className="journal-search"><Icon name="search" /><label className="journal-sr-only" htmlFor="article-search">Tìm kiếm bài viết</label><input id="article-search" type="search" value={query} onChange={event => updateQuery(event.target.value)} placeholder="Tìm mã lỗi, mẹo bảo trì, kinh nghiệm..." /></div><span className="journal-count"><span />{allArticles.length} bài viết trong cẩm nang</span></div>
        <div className="journal-tabs" role="group" aria-label="Lọc bài viết theo chủ đề">{blogCategories.map(item => <button key={item.id} type="button" className={category === item.id ? 'selected' : ''} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setPage(1); }}>{item.label}</button>)}</div>
      </div></section>

      {!hasFilters && <section className="container journal-spotlight" aria-label="Bài viết tiêu điểm"><article className="journal-featured"><ArticleVisual article={featuredArticle} featured /><div className="journal-featured-copy"><div><ArticleMeta article={featuredArticle} /><h2>{featuredArticle.title}</h2><p>{featuredArticle.description}</p><div className="journal-expert-note"><Icon name="build_circle" /><div><strong>Góc nhìn từ đội ngũ kỹ thuật</strong><p>Nhận biết dấu hiệu bất thường và liên hệ kỹ thuật viên để kiểm tra bằng thiết bị chuyên dụng.</p></div></div></div><div className="journal-featured-bottom"><div className="journal-author"><span>MD</span><div><strong>Kỹ sư Nguyễn Minh Đức</strong><small>Đội ngũ kỹ thuật HRMSS</small></div></div><button type="button" className="button button-primary" onClick={event => openArticle(featuredArticle, event)}>Đọc bài viết<Icon name="arrow_forward" /></button></div></div></article></section>}

      <section className="container journal-main-grid"><div className="journal-feed"><div className="journal-feed-heading"><h2 ref={resultsHeading} tabIndex={-1}>{hasFilters ? 'Kết quả tìm kiếm' : 'Bài viết kỹ thuật'}</h2><div><label htmlFor="article-sort">Sắp xếp:</label><select id="article-sort" value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}><option value="default">Đề xuất</option><option value="short">Đọc nhanh nhất</option></select></div></div>
        <div className="journal-result-summary"><p role="status" aria-live="polite">{sorted.length} bài viết{query.trim() && <> cho “{query.trim()}”</>}</p>{hasFilters && <button className="text-link" type="button" onClick={resetFilters}>Xóa bộ lọc<Icon name="close" /></button>}</div>
        {visibleArticles.length > 0 ? <div className="journal-article-grid">{visibleArticles.map(article => <article className="journal-card" key={article.id}><ArticleVisual article={article} /><div className="journal-card-copy"><ArticleMeta article={article} /><h3>{article.title}</h3><p>{article.description}</p><button className="text-link" type="button" aria-label={`Đọc bài viết: ${article.title}`} onClick={event => openArticle(article, event)}>Đọc bài viết<Icon name="arrow_forward" /></button></div></article>)}</div> : <div className="journal-empty"><Icon name="search_off" /><h3>Chưa có bài viết phù hợp</h3><p>Thử từ khóa khác hoặc xem tất cả chủ đề.</p><button className="button button-primary" type="button" onClick={resetFilters}>Xem tất cả bài viết</button></div>}
        {pageCount > 1 && <nav className="journal-pagination" aria-label="Phân trang bài viết"><button type="button" disabled={currentPage === 1} aria-label="Trang trước" onClick={() => changePage(currentPage - 1)}><Icon name="chevron_left" /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(value => <button type="button" key={value} aria-label={`Trang ${value}`} aria-current={currentPage === value ? 'page' : undefined} onClick={() => changePage(value)}>{value}</button>)}<button type="button" disabled={currentPage === pageCount} aria-label="Trang sau" onClick={() => changePage(currentPage + 1)}><Icon name="chevron_right" /></button></nav>}
      </div>

      <aside className="journal-sidebar" aria-label="Hỗ trợ và chủ đề kỹ thuật"><div className="journal-hotline"><p className="eyebrow">HỖ TRỢ KỸ THUẬT MINH ĐỨC</p><h2>Cần thợ kiểm tra thiết bị?</h2><p>Trao đổi tình trạng thiết bị với đội ngũ Minh Đức để được tư vấn thời gian và dịch vụ phù hợp.</p><a href={`tel:${contact.phone}`}><span className="journal-hotline-icon"><Icon name="call" /></span><span><small>HOTLINE KỸ THUẬT</small><strong>{contact.phone}</strong></span><Icon name="phone_in_talk" /></a></div>
        <div className="journal-widget"><h2><Icon name="app_registration" />Tư vấn dịch vụ phù hợp</h2><p>Chọn thiết bị và mô tả triệu chứng để chuẩn bị nội dung trao đổi với kỹ thuật viên.</p><form onSubmit={event => { event.preventDefault(); setRequestPreview({ device, symptom: symptom.trim() }); }}><label htmlFor="support-device">Thiết bị gặp sự cố</label><select id="support-device" value={device} onChange={event => { setDevice(event.target.value); setRequestPreview(null); }}>{['Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bình nóng lạnh', 'Máy lọc nước', 'Máy sấy'].map(label => <option key={label}>{label}</option>)}</select><label htmlFor="support-symptom">Hiện tượng gặp phải</label><input id="support-symptom" value={symptom} onChange={event => { setSymptom(event.target.value); setRequestPreview(null); }} placeholder="VD: không mát, rỉ nước, kêu to..." maxLength={300} pattern=".*\S.*" required /><button className="button button-primary" type="submit"><Icon name="support_agent" />Chuẩn bị tư vấn</button></form>{requestPreview && <div className="journal-request-summary" role="status"><strong>{requestPreview.device}</strong><p>{requestPreview.symptom}</p><small>Nội dung chưa được gửi. Vui lòng gọi hotline để xác nhận yêu cầu.</small><a href={`tel:${contact.phone}`}>Gọi {contact.phone}<Icon name="call" /></a></div>}<a className="text-link journal-service-link" href="/dich-vu">Khám phá dịch vụ<Icon name="arrow_forward" /></a></div>
        <div className="journal-widget"><h2><Icon name="trending_up" />Chủ đề được quan tâm</h2><div className="journal-topics">{topics.map(([label, keyword]) => <button key={label} type="button" onClick={() => { setCategory('all'); updateQuery(keyword); resultsHeading.current?.focus({ preventScroll: true }); }}>#{label}</button>)}</div></div>
        <div className="journal-promises"><p className="eyebrow">ĐỒNG HÀNH CÙNG MINH ĐỨC</p>{[['task_alt', 'Kiểm tra trước khi sửa chữa'], ['receipt_long', 'Báo giá rõ ràng từng hạng mục'], ['verified_user', 'Bảo hành theo dịch vụ thực hiện']].map(([icon, label]) => <p key={label}><Icon name={icon} />{label}</p>)}</div>
      </aside></section>

      <section className="journal-bottom-section"><div className="container"><div className="journal-bottom-cta"><div><p className="eyebrow">CHĂM SÓC THIẾT BỊ CHỦ ĐỘNG</p><h2>Kiến thức hữu ích, dịch vụ tận tâm.</h2><p>Khám phá dịch vụ bảo trì và sửa chữa phù hợp với thiết bị gia đình bạn.</p><div className="button-row"><a className="button button-primary" href="/dich-vu"><Icon name="handyman" />Xem dịch vụ</a><a className="button journal-support-button" href={`tel:${contact.phone}`}><Icon name="call" />Gọi {contact.phone}</a></div></div><div className="journal-mini-features">{[['verified_user', 'Bảo hành điện tử', 'Thông tin được lưu trữ trên HRMSS'], ['notifications_active', 'Theo dõi bảo dưỡng', 'Chủ động chăm sóc thiết bị định kỳ'], ['engineering', 'Đội ngũ kỹ thuật', 'Đồng hành cùng gia đình bạn']].map(([icon, title, description]) => <div key={title}><Icon name={icon} /><span><strong>{title}</strong><small>{description}</small></span></div>)}</div></div></div></section>
    </main>
    <SiteFooter /><ContactLinks />
    <dialog className="article-dialog journal-dialog" ref={dialog} aria-labelledby="blog-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }} onClose={() => { setSelectedArticle(null); articleTrigger.current?.focus(); }}><div className="dialog-inner"><button className="dialog-close" type="button" aria-label="Đóng bài viết" onClick={() => dialog.current.close()}><Icon name="close" /></button><p className="eyebrow">{categoryLabel(selectedArticle?.category)}</p><h2 id="blog-dialog-title">{selectedArticle?.title}</h2>{selectedArticle && <ArticleMeta article={selectedArticle} />}<p className="journal-dialog-description">{selectedArticle?.description}</p><p className="article-pending">Đây là bản xem trước từ thiết kế. Nội dung bài viết đầy đủ đang được biên soạn.</p><div className="button-row"><a className="button button-primary" href="/dich-vu">Xem dịch vụ liên quan</a><button className="button button-secondary" type="button" onClick={() => dialog.current.close()}>Đóng</button></div></div></dialog>
  </>;
}
