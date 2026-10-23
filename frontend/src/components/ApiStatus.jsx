import { useEffect, useState } from 'react';
import { getHealth } from '../services/api.js';

export default function ApiStatus() {
  const [status, setStatus] = useState('Đang kiểm tra API...');

  useEffect(() => {
    const controller = new AbortController();
    getHealth(controller.signal)
      .then(() => setStatus('API đang hoạt động'))
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('Chưa kết nối được API');
      });
    return () => controller.abort();
  }, []);

  return <p role="status">{status}</p>;
}
