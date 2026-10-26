import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { useState } from "react";
import Icon from "../components/Icon.jsx";
import ContactLinks from "../components/ContactLinks.jsx";
import {
  articles,
  benefits,
  features,
  process,
  services,
} from "../data/homepage.js";

function SectionHeading({ eyebrow, title, children, centered = false }) {
  return (
    <div className={`section-heading ${centered ? "centered" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children && <p className="section-description">{children}</p>}
    </div>
  );
}

export default function HomePage() {
  const [cardsMoving, setCardsMoving] = useState(true);

  return (
    <>
      <a className="skip-link" href="#noi-dung">
        Đến nội dung chính
      </a>
      <SiteHeader />

      <main id="noi-dung">
        <section className="hero section" id="trang-chu">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="tagline">
                <span /> HỆ THỐNG DỊCH VỤ ĐIỆN LẠNH DÂN DỤNG & CÔNG NGHIỆP
              </p>
              <h1>
                Sửa chữa tại nhà, an tâm từng bước cùng{" "}
                <em>Cơ Điện Lạnh Minh Đức</em>.
              </h1>
              <p className="hero-description">
                Giải pháp bảo trì và sửa chữa thiết bị cơ điện lạnh dân dụng
                chuẩn quy trình. Gửi yêu cầu nhanh, theo dõi tiến độ thời gian
                thực và quản lý bảo hành dễ dàng trên ứng dụng HRMSS.
              </p>
              <div className="button-row">
                <a className="button button-primary" href="/tai-ung-dung">
                  <Icon name="download" />
                  Tải ứng dụng HRMSS
                </a>
                <a className="button button-secondary" href="/dich-vu">
                  Khám phá dịch vụ
                  <Icon name="arrow_downward" />
                </a>
              </div>
              <div className="trust-badges">
                {[
                  ["verified", "100% KTV Minh Đức"],
                  ["shield_with_heart", "Bảo hành điện tử"],
                  ["receipt_long", "Báo giá minh bạch"],
                ].map(([icon, label]) => (
                  <div key={label}>
                    <Icon name={icon} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual">
              <div className="mascot-scene" data-card-motion={cardsMoving ? 'on' : 'off'}>
              <img
                className="hero-mascot"
                src="/LinhVat.png"
                alt="Linh vật HRMSS — ngôi nhà thân thiện cầm cờ lê sửa chữa"
                width="1280"
                height="1280"
                fetchPriority="high"
              />
              <div className="mascot-card mascot-card-technician">
                <span className="mascot-card-icon"><Icon name="bolt" /></span>
                <div><strong>Nhanh chóng</strong></div>
              </div>
              <div className="mascot-card mascot-card-pricing">
                <span className="mascot-card-icon"><Icon name="touch_app" /></span>
                <div><strong>Thuận tiện</strong></div>
              </div>
              <div className="mascot-card mascot-card-warranty">
                <span className="mascot-card-icon"><Icon name="verified_user" /></span>
                <div><strong>An toàn</strong></div>
              </div>
              <button className="mascot-motion-toggle" type="button" aria-label={cardsMoving ? 'Tạm dừng chuyển động các thẻ' : 'Bật chuyển động các thẻ'} aria-pressed={cardsMoving} onClick={() => setCardsMoving(!cardsMoving)}>
                <Icon name={cardsMoving ? 'pause' : 'play_arrow'} />
              </button>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-tinted" id="dich-vu">
          <div className="container">
            <SectionHeading
              eyebrow="CHUYÊN MÔN CỦA MINH ĐỨC"
              title="Dịch vụ sửa chữa & bảo dưỡng thiết bị tại nhà"
              centered
            >
              Chăm sóc thiết bị toàn diện với đội ngũ kỹ thuật viên chuyên
              nghiệp và quy trình rõ ràng.
            </SectionHeading>
            <div className="four-grid service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <div className="icon-box">
                    <Icon name={service.icon} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="service-tags">
                    {service.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <a
                    className="text-link"
                    href="/dich-vu"
                    aria-label={`Tìm hiểu dịch vụ: ${service.title}`}
                  >
                    Tìm hiểu dịch vụ <Icon name="arrow_forward" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="ve-chung-toi">
          <div className="container">
            <SectionHeading
              eyebrow="AN TÂM TRONG TỪNG TRẢI NGHIỆM"
              title="Trải nghiệm dịch vụ khác biệt với công nghệ quản lý HRMSS"
              centered
            >
              Từ yêu cầu đầu tiên đến bảo hành sau sửa chữa, mọi thông tin đều
              được kết nối và lưu trữ rõ ràng.
            </SectionHeading>
            <div className="four-grid">
              {benefits.map(([icon, title, description]) => (
                <article className="benefit-card" key={title}>
                  <div className="icon-box">
                    <Icon name={icon} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-tinted" id="quy-trinh">
          <div className="container">
            <SectionHeading
              eyebrow="QUY TRÌNH DỊCH VỤ"
              title="Gọi kỹ thuật viên chỉ 4 bước đơn giản"
              centered
            >
              Thao tác đơn gian trên app, chủ động sắp xếp thời gian.
            </SectionHeading>
            <ol className="four-grid process-grid">
              {process.map(([icon, title, description], index) => (
                <li key={title}>
                  <div className="process-icon">
                    <Icon name={icon} />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section app-section">
          <div className="container app-grid">
            <div
              className="app-preview"
              aria-label="Minh họa báo giá và bảo hành trên ứng dụng"
            >
              <div className="quote-card">
                <div className="quote-header">
                  <span className="icon-box">
                    <Icon name="receipt_long" />
                  </span>
                  <div>
                    <p className="eyebrow">BÁO GIÁ ĐIỆN TỬ</p>
                    <h3>Rõ ràng trước khi sửa chữa</h3>
                  </div>
                  <Icon name="verified" />
                </div>
                <div className="quote-row">
                  <span>Vệ sinh điều hòa</span>
                  <strong>150.000đ</strong>
                </div>
                <div className="quote-row">
                  <span>Kiểm tra & bảo dưỡng</span>
                  <strong>100.000đ</strong>
                </div>
                <div className="quote-row quote-total">
                  <span>Tổng thanh toán</span>
                  <strong>250.000đ</strong>
                </div>
                <div className="approved">
                  <Icon name="check_circle" />
                  Khách hàng đã duyệt báo giá
                </div>
                <div className="warranty">
                  <Icon name="verified_user" />
                  <span>
                    Gói bảo hành vàng Minh Đức: <strong>06 tháng</strong>
                  </span>
                </div>
                <p className="preview-note">
                  Nội dung minh họa giao diện ứng dụng
                </p>
              </div>
            </div>
            <div>
              <SectionHeading
                eyebrow="ỨNG DỤNG KHÁCH HÀNG HRMSS"
                title="Kiểm soát toàn bộ tiến trình sửa chữa ngay trong lòng bàn tay"
              >
                Theo dõi dịch vụ thuận tiện, nắm rõ chi phí và giữ thông tin bảo
                hành ngay trên điện thoại.
              </SectionHeading>
              <div className="feature-list">
                {features.map(([icon, title, description]) => (
                  <div className="feature" key={title}>
                    <div className="icon-box">
                      <Icon name={icon} />
                    </div>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="button-row store-links">
                <a className="store-badge" href="/tai-ung-dung">
                  <Icon name="file_download" />
                  <span>
                    <small>TẢI VỀ TRÊN</small>
                    <strong>App Store</strong>
                  </span>
                </a>
                <a className="store-badge" href="/tai-ung-dung">
                  <Icon name="android" />
                  <span>
                    <small>CÓ SẴN TRÊN</small>
                    <strong>Google Play</strong>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-tinted" id="blog">
          <div className="container">
            <SectionHeading
              eyebrow="GÓC MẸO HAY & KINH NGHIỆM"
              title="Cẩm nang kỹ thuật & Hướng dẫn sử dụng thiết bị bền bỉ"
            >
              Kinh nghiệm thực tiễn giúp bạn phát hiện sớm trục trặc và chăm sóc
              thiết bị trong gia đình.
            </SectionHeading>
            <a className="text-link homepage-blog-all" href="/blog">Xem tất cả bài viết <Icon name="arrow_forward" /></a>
            <div className="blog-grid">
              {articles.map((article) => (
                <article className="blog-card" key={article.title}>
                  <div className="article-image">
                    <img
                      src={article.image}
                      alt={article.alt}
                      loading="lazy"
                      width="600"
                      height="384"
                    />
                    <span>{article.category}</span>
                  </div>
                  <div className="article-content">
                    <p className="article-meta">
                      <Icon name="schedule" />
                      {article.duration}
                      <span>·</span>
                      {article.author}
                    </p>
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                    <a className="text-link" href={`/blog?article=${article.category === 'Máy lạnh' ? 'may-lanh-thieu-gas' : article.category === 'Máy giặt' ? 'bao-duong-may-giat' : 'an-toan-dien'}`} aria-label={`Đọc bài viết: ${article.title}`}>Đọc tiếp <Icon name="arrow_forward" /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <ContactLinks />

    </>
  );
}
