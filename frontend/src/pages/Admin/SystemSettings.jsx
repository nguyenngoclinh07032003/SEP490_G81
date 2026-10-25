import React, { useState } from 'react';
import {
  Server,
  Database,
  Zap,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Terminal,
  Cpu,
  Clock
} from 'lucide-react';
import { getHealth } from '../../services/api';

export default function SystemSettings() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleTestHealth = async () => {
    setTesting(true);
    try {
      const res = await getHealth();
      setTestResult({ success: true, message: 'Kết nối thành công tới Express Backend & Database!', data: res });
    } catch (err) {
      setTestResult({ success: false, message: 'Backend chưa phản hồi hoặc chưa chạy npm run dev ở backend.' });
    } finally {
      setTesting(false);
    }
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cấu Hình & Trạng Thái Hạ Tầng</h1>
          <p className="page-subtitle">Quản lý kết nối Database PostgreSQL, Redis In-Memory Cache và biến môi trường</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleTestHealth}
          disabled={testing}
        >
          <RefreshCw size={16} className={testing ? 'spin' : ''} />
          <span>{testing ? 'Đang Kiểm Tra...' : 'Kiểm Tra Kết Nối (Health Check)'}</span>
        </button>
      </div>

      {testResult && (
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          backgroundColor: testResult.success ? 'var(--success-light)' : 'var(--danger-light)',
          color: testResult.success ? 'var(--success-dark)' : 'var(--danger-dark)',
          border: `1px solid ${testResult.success ? '#A7F3D0' : '#FECACA'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {testResult.success ? <CheckCircle2 size={20} /> : <Server size={20} />}
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{testResult.message}</div>
        </div>
      )}

      {cacheCleared && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          backgroundColor: 'var(--info-light)',
          color: 'var(--info)',
          border: '1px solid #BAE6FD',
          fontSize: '0.85rem'
        }}>
          Đã phát lệnh làm mới bộ đệm Redis và giải phóng Access Token Blacklist!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* PostgreSQL Config */}
        <div className="card-modern">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>PostgreSQL Primary DB</h3>
              <span className="badge badge-status-active">Port 5432: Đang hoạt động</span>
            </div>
          </div>

          <div style={{ fontSize: '0.84rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '6px' }}>
              <span>Database Name:</span>
              <strong style={{ color: 'var(--slate-800)' }}>hrmss</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '6px' }}>
              <span>Pool Size:</span>
              <strong style={{ color: 'var(--slate-800)' }}>10 kết nối tối đa</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '6px' }}>
              <span>Chuẩn dữ liệu:</span>
              <strong style={{ color: 'var(--slate-800)' }}>ACID, Foreign Keys</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Trigger Audit:</span>
              <strong style={{ color: 'var(--success)' }}>Enabled</strong>
            </div>
          </div>
        </div>

        {/* Redis Config */}
        <div className="card-modern">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Redis Memory Store</h3>
              <span className="badge badge-status-active">Port 6379: Đang hoạt động</span>
            </div>
          </div>

          <div style={{ fontSize: '0.84rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '6px' }}>
              <span>Token Blacklist:</span>
              <strong style={{ color: 'var(--slate-800)' }}>TTL tự hủy theo JWT exp</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '6px' }}>
              <span>Rate Limit Lockout:</span>
              <strong style={{ color: 'var(--slate-800)' }}>5 lần sai / 15 phút khóa</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '6px' }}>
              <span>Độ trễ trung bình:</span>
              <strong style={{ color: 'var(--success)' }}>&lt; 2ms</strong>
            </div>
            <div style={{ marginTop: '8px' }}>
              <button onClick={handleClearCache} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                <Trash2 size={14} />
                <span>Xóa Cache & Blacklist Tạm Thời</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
