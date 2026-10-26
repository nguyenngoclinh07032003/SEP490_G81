import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import ContactLinks from "../components/ContactLinks.jsx";
import Icon from "../components/Icon.jsx";
import { contact } from "../data/contact.js";
import {
  aboutHighlights,
  capabilities,
  commitments,
  coreValues,
} from "../data/about.js";
import "../styles/about.css";

export default function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#noi-dung">
        Đến nội dung chính
      </a>
      <SiteHeader activePath="/ve-chung-toi" />
      <main id="noi-dung" className="about-page">
        <div className="about-breadcrumb-bar">
          <div className="container about-breadcrumb-inner">
            <nav aria-label="Đường dẫn">
              <a href="/">
                <Icon name="home" />
                Trang chủ
              </a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Về chúng tôi</span>
            </nav>
            <span className="about-system-label">
              <Icon name="hub" />
              Kết nối dịch vụ qua HRMSS
            </span>
          </div>
        </div>

        <section className="about-hero section">
          <div className="container">
            <div className="about-hero-grid">
              <div className="about-hero-copy">
                <p className="about-pill">
                  <Icon name="verified" />
                  CƠ ĐIỆN LẠNH MINH ĐỨC
                </p>
                <h1>
                  Chuẩn hóa dịch vụ cơ điện lạnh dân dụng bằng{" "}
                  <em>công nghệ số HRMSS</em>
                </h1>
                <p className="about-lead">
                  Công Ty TNHH Cơ Điện Lạnh Minh Đức hướng đến sự an tâm cho mỗi
                  gia đình thông qua đội ngũ kỹ thuật, quy trình làm việc rõ
                  ràng và thông tin dịch vụ minh bạch từng bước.
                </p>
                <div className="button-row">
                  <a className="button about-button-navy" href="#cau-chuyen">
                    Tìm hiểu hành trình
                    <Icon name="arrow_downward" />
                  </a>
                  <a className="button button-secondary" href="#nang-luc">
                    <Icon name="engineering" />
                    Năng lực kỹ thuật
                  </a>
                </div>
                <ul className="about-hero-checks">
                  {[
                    "Kiểm tra trước khi sửa",
                    "Báo giá rõ ràng",
                    "Theo dõi bảo hành",
                  ].map((text) => (
                    <li key={text}>
                      <Icon name="check_circle" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="about-hero-visual">
                <div className="about-photo-frame">
                  <img
                    src="/LinhVat.png"
                    alt="Linh vật HRMSS — ngôi nhà thân thiện cầm cờ lê"
                    width="1280"
                    height="1280"
                    fetchPriority="high"
                  />
                  <div className="about-photo-caption">
                    <span className="icon-box">
                      <Icon name="verified_user" />
                    </span>
                    <div>
                      <strong>Đặt sự an tâm lên hàng đầu</strong>
                      <span>Minh bạch · Tận tâm · Trách nhiệm</span>
                    </div>
                    <span className="about-caption-tag">HRMSS</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-highlights">
              {aboutHighlights.map((item) => (
                <article key={item.title}>
                  <div className="about-highlight-top">
                    <strong>{item.value}</strong>
                    <span className="icon-box">
                      <Icon name={item.icon} />
                    </span>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-tinted" id="cau-chuyen">
          <div className="container">
            <div className="about-section-heading">
              <p className="eyebrow">HÀNH TRÌNH KHẲNG ĐỊNH GIÁ TRỊ</p>
              <h2>
                Thấu hiểu nỗi lo khách hàng,
                <br />
                nâng chuẩn dịch vụ tại nhà.
              </h2>
            </div>
            <div className="about-story-grid">
              <article className="about-story-card">
                <span className="icon-box">
                  <Icon name="history_edu" />
                </span>
                <h3>
                  Bắt đầu từ mong muốn mang lại sự an tâm cho từng gia đình
                </h3>
                <p>
                  Khi điều hòa, tủ lạnh hay máy giặt gặp trục trặc, điều khách
                  hàng cần không chỉ là một lần sửa chữa. Đó còn là lời giải
                  thích rõ ràng, chi phí có thể kiểm soát và một đơn vị đồng
                  hành khi cần hỗ trợ.
                </p>
                <p>
                  Minh Đức lựa chọn xây dựng dịch vụ trên sự minh bạch và trách
                  nhiệm: kiểm tra tình trạng thiết bị, trao đổi phương án, thống
                  nhất hạng mục và cùng khách hàng nghiệm thu kết quả.
                </p>
                <div className="about-story-note">
                  <Icon name="handshake" />
                  <div>
                    <strong>Minh bạch trong từng bước</strong>
                    <p>
                      Trao đổi báo giá trước khi khách hàng đồng ý thực hiện
                      dịch vụ.
                    </p>
                  </div>
                </div>
              </article>
              <article className="about-story-card about-story-dark">
                <span className="icon-box">
                  <Icon name="hub" />
                </span>
                <h3>
                  Hệ sinh thái HRMSS — Kết nối thông tin, nâng cao trải nghiệm
                </h3>
                <p>
                  HRMSS là Hệ thống Quản lý Dịch vụ Sửa chữa và Bảo trì tại Nhà,
                  được xây dựng để kết nối khách hàng, kỹ thuật viên và hoạt
                  động điều phối trong một quy trình thống nhất.
                </p>
                <p>
                  Từ tiếp nhận yêu cầu, sắp xếp lịch phục vụ và theo dõi tiến độ
                  đến lưu hồ sơ thiết bị, báo giá và bảo hành, HRMSS hướng đến
                  việc giúp thông tin dịch vụ dễ theo dõi và thuận tiện tra cứu
                  hơn.
                </p>
                <a className="about-story-note" href="/dich-vu">
                  <Icon name="devices" />
                  <div>
                    <strong>Công nghệ phục vụ trải nghiệm</strong>
                    <p>Khám phá dịch vụ sửa chữa và bảo dưỡng Minh Đức.</p>
                  </div>
                  <Icon name="arrow_forward" />
                </a>
              </article>
            </div>
            <div className="about-values">
              <div className="about-values-heading">
                <p className="eyebrow">GIÁ TRỊ CỐT LÕI</p>
                <h2>Điều chúng tôi đặt vào mỗi dịch vụ</h2>
              </div>
              <div className="about-value-grid">
                {coreValues.map((item) => (
                  <article key={item.title}>
                    <span className="icon-box">
                      <Icon name={item.icon} />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section about-capabilities-section" id="nang-luc">
          <div className="container">
            <div className="about-section-heading">
              <p className="eyebrow">CƠ SỞ VẬT CHẤT & NĂNG LỰC</p>
              <h2>Nền tảng kỹ thuật cho dịch vụ tận tâm</h2>
              <p>
                Con người, dụng cụ và hệ thống quản lý cùng phối hợp để công
                việc được kiểm tra, thực hiện và theo dõi rõ ràng.
              </p>
            </div>
            <div className="about-capability-grid">
              {capabilities.map((item) => (
                <article key={item.title}>
                  <span className="icon-box">
                    <Icon name={item.icon} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="about-capability-note">
                      <Icon name="check" />
                      {item.note}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section about-company-section"
          id="ho-so-doanh-nghiep"
        >
          <div className="container">
            <div className="about-company-panel">
              <div className="about-company-info">
                <p className="eyebrow">
                  <Icon name="gavel" />
                  THÔNG TIN & TRÁCH NHIỆM DOANH NGHIỆP
                </p>
                <h2>
                  Thông tin rõ ràng,
                  <br />
                  kết nối thuận tiện.
                </h2>
                <p>
                  Minh Đức đồng hành cùng khách hàng từ tư vấn ban đầu đến chăm
                  sóc sau sửa chữa. Liên hệ trực tiếp để được trao đổi thông tin
                  dịch vụ và lịch phục vụ phù hợp.
                </p>
                <dl className="about-company-details">
                  <div>
                    <dt>Tên doanh nghiệp</dt>
                    <dd>CÔNG TY TNHH CƠ ĐIỆN LẠNH MINH ĐỨC</dd>
                  </div>
                  <div>
                    <dt>Hotline kỹ thuật</dt>
                    <dd>
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Khu vực giới thiệu</dt>
                    <dd>Hà Nội, Việt Nam</dd>
                  </div>
                  <div>
                    <dt>Mã số thuế / Giấy phép kinh doanh</dt>
                    <dd className="about-detail-pending">Đang cập nhật</dd>
                  </div>
                </dl>
              </div>
              <div className="about-commitments">
                <p className="about-commitments-title">
                  <Icon name="verified" />
                  CAM KẾT “3 KHÔNG”
                </p>
                <ol>
                  {commitments.map((item, index) => (
                    <li key={item.title}>
                      <span>{index + 1}</span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="about-commitment-motto">
                  Chữ tín làm trọng — phục vụ vì sự an tâm của mọi gia đình.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section about-final-cta">
          <div className="container">
            <p className="about-pill">
              <Icon name="verified" />
              DỊCH VỤ TẠI NHÀ · KẾT NỐI CÙNG HRMSS
            </p>
            <h2>
              Sẵn sàng trải nghiệm dịch vụ
              <br />
              Cơ Điện Lạnh Minh Đức?
            </h2>
            <p>
              Khám phá dịch vụ phù hợp hoặc liên hệ với chúng tôi để trao đổi
              tình trạng thiết bị và lịch phục vụ.
            </p>
            <div className="button-row">
              <a className="button button-primary" href="/dich-vu">
                <Icon name="handyman" />
                Khám phá dịch vụ
              </a>
              <a
                className="button about-call-button"
                href={`tel:${contact.phone}`}
              >
                <Icon name="call" />
                Hotline: {contact.phone}
              </a>
            </div>
            <a className="about-blog-link" href="/blog">
              Ghé thăm Blog & Cẩm nang kỹ thuật
              <Icon name="arrow_forward" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ContactLinks />
    </>
  );
}
