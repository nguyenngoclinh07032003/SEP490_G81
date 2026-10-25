import React, { useState } from 'react';
import {
  Headphones,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Send,
  Wrench,
  Search,
  Filter,
  X
} from 'lucide-react';

export default function StaffDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTech, setSelectedTech] = useState('');

  // Danh sách yêu cầu dịch vụ từ khách hàng
  const [requests, setRequests] = useState([
    {
      id: 'REQ-1001',
      customerName: 'Nguyễn Xuân Khánh',
      phone: '0987654321',
      address: 'P402, Tòa Mulberry Lane, Mộ Lao, Hà Đông, Hà Nội',
      device: 'Điều hòa Daikin Inverter 12000 BTU',
      issue: 'Bật máy có gió nhưng không mát, cục nóng phát ra tiếng kêu tạch tạch',
      preferredTime: 'Hôm nay: 14:00 - 16:00',
      status: 'PENDING_ASSIGNMENT',
      assignedTech: null,
      createdAt: '10 phút trước'
    },
    {
      id: 'REQ-1002',
      customerName: 'Trần Quang Minh',
      phone: '0976543210',
      address: 'Số 18, Ngõ 45 Cầu Giấy, Hà Nội',
      device: 'Tủ lạnh Panasonic 300L',
      issue: 'Ngăn đá đóng tuyết dày, ngăn mát không có hơi lạnh',
      preferredTime: 'Hôm nay: 16:30 - 18:00',
      status: 'PENDING_ASSIGNMENT',
      assignedTech: null,
      createdAt: '25 phút trước'
    },
    {
      id: 'REQ-1003',
      customerName: 'Chị Đỗ Thu Trang',
      phone: '0912888999',
      address: 'Biệt thự BT3, Khu đô thị Ciputra, Tây Hồ, Hà Nội',
      device: 'Máy giặt Electrolux cửa ngang 9kg',
      issue: 'Vắt rung lắc dữ dội, nước không xả hết được',
      preferredTime: 'Sáng mai: 08:30',
      status: 'ASSIGNED',
      assignedTech: 'Trần Văn Nam (Thợ chính)',
      createdAt: '1 giờ trước'
    },
    {
      id: 'REQ-1004',
      customerName: 'Anh Phạm Hoàng Anh',
      phone: '0933445566',
      address: 'Số 50 Nam Đồng, Đống Đa, Hà Nội',
      device: 'Bình nóng lạnh Ariston 30L',
      issue: 'Đèn sáng nhưng nước không nóng, nghi hỏng sợi đốt',
      preferredTime: 'Hôm nay: 15:00',
      status: 'IN_PROGRESS',
      assignedTech: 'Phạm Huy Hoàng',
      createdAt: '2 giờ trước'
    },
  ]);

  // Danh sách thợ có sẵn để phân công
  const availableTechs = [
    { id: 1, name: 'Trần Văn Nam', specialty: 'Điều hòa, Tủ lạnh', activeJobs: 1, area: 'Hà Đông, Thanh Xuân' },
    { id: 2, name: 'Phạm Huy Hoàng', specialty: 'Máy giặt, Bình nóng lạnh', activeJobs: 1, area: 'Đống Đa, Cầu Giấy' },
    { id: 3, name: 'Lê Trung Kiên', specialty: 'Hệ thống điện gia dụng', activeJobs: 0, area: 'Tây Hồ, Ba Đình' },
    { id: 4, name: 'Vũ Đức Mạnh', specialty: 'Điện lạnh đa năng', activeJobs: 0, area: 'Toàn thành phố' },
  ];

  const handleAssignTech = (e) => {
    e.preventDefault();
    if (!selectedTech || !selectedRequest) return;

    setRequests(requests.map(r => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          status: 'ASSIGNED',
          assignedTech: selectedTech
        };
      }
      return r;
    }));

    alert(`Đã phân công đơn ${selectedRequest.id} thành công cho thợ: ${selectedTech}`);
    setSelectedRequest(null);
    setSelectedTech('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_ASSIGNMENT':
        return <span className="badge badge-warning">Chờ phân công thợ</span>;
      case 'ASSIGNED':
        return <span className="badge badge-status-assigned">Đã phân công</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-status-processing">Đang sửa chữa</span>;
      case 'COMPLETED':
        return <span className="badge badge-status-completed">Hoàn thành</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.device.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trung Tâm Điều Phối Yêu Cầu & Phân Công Thợ</h1>
          <p className="page-subtitle">Tiếp nhận yêu cầu từ ứng dụng khách hàng, ghép nối kỹ thuật viên phù hợp theo vị trí và chuyên môn</p>
        </div>
      </div>

      {/* Grid thống kê điều phối */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <AlertCircle size={22} />
          </div>
          <span className="stat-title">Đơn Chờ Phân Công</span>
          <span className="stat-value">{requests.filter(r => r.status === 'PENDING_ASSIGNMENT').length}</span>
          <span className="stat-trend" style={{ color: '#D97706' }}>Cần ghép thợ ngay</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <UserCheck size={22} />
          </div>
          <span className="stat-title">Đã Phân Công Thợ</span>
          <span className="stat-value">{requests.filter(r => r.status === 'ASSIGNED').length}</span>
          <span className="stat-trend" style={{ color: '#0284C7' }}>Thợ đang di chuyển</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
            <Wrench size={22} />
          </div>
          <span className="stat-title">Đang Sửa Tại Nhà Khách</span>
          <span className="stat-value">{requests.filter(r => r.status === 'IN_PROGRESS').length}</span>
          <span className="stat-trend" style={{ color: '#7C3AED' }}>Đang thi công</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <span className="stat-title">Hoàn Thành Hôm Nay</span>
          <span className="stat-value">18 đơn</span>
          <span className="stat-trend" style={{ color: '#059669' }}>Nghiệm thu thành công</span>
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="card-modern" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách hàng hoặc tên thiết bị..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', margin: 0 }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', margin: 0 }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING_ASSIGNMENT">Chờ phân công thợ</option>
            <option value="ASSIGNED">Đã phân công</option>
            <option value="IN_PROGRESS">Đang sửa chữa</option>
          </select>
        </div>
      </div>

      {/* Danh sách yêu cầu sửa chữa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRequests.map(req => (
          <div key={req.id} className="card-modern" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>{req.id}</span>
                  {getStatusBadge(req.status)}
                  <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>• {req.createdAt}</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px' }}>
                  {req.customerName} - <span style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{req.phone}</span>
                </div>
              </div>

              {req.status === 'PENDING_ASSIGNMENT' ? (
                <button
                  onClick={() => setSelectedRequest(req)}
                  className="btn btn-primary btn-sm"
                >
                  <Send size={14} />
                  <span>Điều Phối Phân Công Thợ</span>
                </button>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', background: 'var(--slate-100)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
                  Thợ phụ trách: <strong style={{ color: 'var(--slate-900)' }}>{req.assignedTech}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--slate-100)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  <MapPin size={15} color="var(--danger)" />
                  <span>Địa chỉ phục vụ:</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
                  {req.address}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  <Wrench size={15} color="var(--primary)" />
                  <span>Thiết bị & Hiện tượng lỗi:</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
                  {req.device}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontStyle: 'italic', marginTop: '2px' }}>
                  "{req.issue}"
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  <Clock size={15} color="var(--warning-dark)" />
                  <span>Thời gian hẹn khách yêu cầu:</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--warning-dark)', marginTop: '2px' }}>
                  {req.preferredTime}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Phân công thợ */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Phân Công Kỹ Thuật Viên: {selectedRequest.id}
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.84rem' }}>
              <div><strong>Khách hàng:</strong> {selectedRequest.customerName} ({selectedRequest.phone})</div>
              <div><strong>Địa chỉ:</strong> {selectedRequest.address}</div>
              <div><strong>Sự cố:</strong> {selectedRequest.device} - {selectedRequest.issue}</div>
            </div>

            <form onSubmit={handleAssignTech}>
              <div className="form-group">
                <label className="form-label">Chọn kỹ thuật viên phù hợp chuyên môn *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableTechs.map(tech => (
                    <label
                      key={tech.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        border: selectedTech === tech.name ? '2px solid var(--primary)' : '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        background: selectedTech === tech.name ? 'var(--primary-light)' : '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="radio"
                          name="tech"
                          value={tech.name}
                          checked={selectedTech === tech.name}
                          onChange={() => setSelectedTech(tech.name)}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tech.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            Chuyên môn: {tech.specialty} • Khu vực: {tech.area}
                          </div>
                        </div>
                      </div>

                      <span className={`badge ${tech.activeJobs === 0 ? 'badge-status-active' : 'badge-status-processing'}`}>
                        {tech.activeJobs === 0 ? 'Đang rảnh' : `${tech.activeJobs} đơn đang làm`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setSelectedRequest(null)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" disabled={!selectedTech} className="btn btn-primary">
                  Xác Nhận Phân Công & Gửi Thông Báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
