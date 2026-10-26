import { useState } from 'react';
import Icon from './Icon.jsx';

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

export default function SiteHeader({ activePath = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} aria-current={href === activePath ? "page" : undefined} className={href === activePath ? "active" : ""}>
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a
              className="button button-primary header-download"
              href="/tai-ung-dung"
              aria-label="Tải ứng dụng HRMSS"
              aria-current={activePath === '/tai-ung-dung' ? 'page' : undefined}
            >
              <Icon name="download" />
              <span>Tải ứng dụng</span>
            </a>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-nav"
            className="mobile-nav container"
            aria-label="Điều hướng trên điện thoại"
          >
            {navigation.map(([label, href]) => (
              <a key={href} href={href} aria-current={href === activePath ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>
  );
}
