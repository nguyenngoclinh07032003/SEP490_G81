import ApiStatus from './components/ApiStatus.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header><a href="/">HRMSS</a><ApiStatus /></header>
      <HomePage />
      <footer>HRMSS · Hệ thống quản lý khách sạn</footer>
    </div>
  );
}
