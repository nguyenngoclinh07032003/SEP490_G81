import Icon from './Icon.jsx';
import { services } from '../data/homepage.js';

const navigation = [
  ["Trang chủ", "/"],
  ["Dịch vụ", "/dich-vu"],
  ["Blog", "/blog"],
  ["Về chúng tôi", "/ve-chung-toi"],
];

function Brand({ dark = false }) {
  return (
    <a className="brand" href="/" aria-label="HRMSS — về trang chủ">
      <img
        className="brand-logo"
        src={dark ? "/logoHRMSS_dark.png" : "/LogoHRMSS.png"}
        alt="HRMSS — Cơ Điện Lạnh Minh Đức"
      />
    </a>
  );
}

export default function SiteFooter() {
  return (
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Brand dark />
              <p>
                Công Ty TNHH Cơ Điện Lạnh Minh Đức — Dịch vụ sửa chữa, bảo trì
                và lắp đặt thiết bị điện lạnh gia dụng và thương mại.
              </p>
              <p className="footer-location">
                <Icon name="location_on" />
                Hà Nội, Việt Nam
              </p>
            </div>
            <div>
              <h3>Danh mục dịch vụ</h3>
              {services.map((service) => (
                <a key={service.title} href="/dich-vu">
                  {service.title}
                </a>
              ))}
            </div>
            <div>
              <h3>Điều hướng</h3>
              {navigation.map(([label, href]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
              <a href="/#quy-trinh">Quy trình dịch vụ</a>
            </div>
            <div>
              <h3>Hỗ trợ & Ứng dụng</h3>
              <p>
                Quản lý lịch hẹn và theo dõi tiến độ sửa chữa trực tiếp dành cho
                khách hàng.
              </p>
              <a className="footer-app-link" href="/tai-ung-dung">
                <Icon name="android" />
                Google Play Store
                <Icon name="arrow_outward" />
              </a>
              <a className="footer-app-link" href="/tai-ung-dung">
                <Icon name="file_download" />
                Apple App Store
                <Icon name="arrow_outward" />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} HRMSS — Công Ty TNHH Cơ Điện Lạnh
              Minh Đức.
            </p>
            <p>Hệ thống Quản lý Dịch vụ Sửa chữa và Bảo trì tại Nhà</p>
          </div>
        </div>
      </footer>
  );
}
