import HomePage from './pages/HomePage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import DownloadPage from './pages/DownloadPage.jsx';
import { useEffect } from 'react';

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isServices = pathname === '/dich-vu';
  const isBlog = pathname === '/blog';
  const isAbout = pathname === '/ve-chung-toi';
  const isDownload = pathname === '/tai-ung-dung';
  useEffect(() => {
    document.title = isDownload ? 'Tải Ứng dụng Di động — HRMSS Minh Đức' : isAbout ? 'Về chúng tôi — HRMSS Minh Đức' : isBlog ? 'Blog & Cẩm nang Kỹ thuật — HRMSS Minh Đức' : isServices ? 'Danh mục Dịch vụ — HRMSS Minh Đức' : 'HRMSS — Cơ Điện Lạnh Minh Đức';
  }, [isServices, isBlog, isAbout, isDownload]);
  return isDownload ? <DownloadPage /> : isAbout ? <AboutPage /> : isBlog ? <BlogPage /> : isServices ? <ServicesPage /> : <HomePage />;
}
