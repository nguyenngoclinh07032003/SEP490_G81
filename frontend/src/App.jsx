import { useEffect, useState } from 'react';
import { getHealth } from './services/api.js';

export default function App() {
  const [apiStatus, setApiStatus] = useState('Đang kiểm tra API...');

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus('API đang hoạt động'))
      .catch(() => setApiStatus('Chưa kết nối được API'));
  }, []);

  return (
    <main>
      <h1>HRMSS</h1>
      <p>Hệ thống quản lý khách sạn</p>
      <p role="status">{apiStatus}</p>
    </main>
  );
}
