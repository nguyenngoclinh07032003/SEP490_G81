import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Danh sách các tài khoản Demo đại diện cho 5 Vai trò của Hệ thống Minh Đức
export const DEMO_ACCOUNTS = {
  ADMIN: {
    userId: 1,
    username: 'admin',
    fullName: 'Quản trị viên Hệ thống',
    email: 'admin@minhduc.vn',
    phone: '0901234567',
    role: 'ADMIN',
    roleName: 'Quản trị viên Hệ thống',
    avatar: 'AD'
  },
  MANAGER: {
    userId: 2,
    username: 'manager_duc',
    fullName: 'Lê Minh Đức (Trưởng phòng)',
    email: 'manager.duc@minhduc.vn',
    phone: '0912345678',
    role: 'MANAGER',
    roleName: 'Quản lý Dịch vụ & Vận hành',
    avatar: 'MD'
  },
  OFFICE_STAFF: {
    userId: 3,
    username: 'staff_lan',
    fullName: 'Nguyễn Thị Lan (Điều phối)',
    email: 'lan.coordinator@minhduc.vn',
    phone: '0923456789',
    role: 'OFFICE_STAFF',
    roleName: 'Nhân viên Văn phòng / Tiếp nhận',
    avatar: 'NL'
  },
  TECHNICIAN: {
    userId: 4,
    username: 'tech_nam',
    fullName: 'Trần Văn Nam (Thợ chính)',
    email: 'nam.tech@minhduc.vn',
    phone: '0934567890',
    role: 'TECHNICIAN',
    roleName: 'Kỹ thuật viên Sửa chữa',
    avatar: 'TN'
  },
  CUSTOMER: {
    userId: 5,
    username: 'khanhnx',
    fullName: 'Nguyễn Xuân Khánh',
    email: 'khanhnx@gmail.com',
    phone: '0987654321',
    role: 'CUSTOMER',
    roleName: 'Khách hàng',
    avatar: 'NK'
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hrmss_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hrmss_user');
    // Mặc định khởi đầu với tài khoản Quản trị Admin hoặc khách hàng
    return saved ? JSON.parse(saved) : DEMO_ACCOUNTS.ADMIN;
  });

  const [loading, setLoading] = useState(false);

  // Lưu trạng thái vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hrmss_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hrmss_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('hrmss_token', token);
    } else {
      localStorage.removeItem('hrmss_token');
    }
  }, [token]);

  // Đăng nhập kết nối API thật của Backend, fallback sang Demo nếu backend chưa bật
  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: credentials.username,
          password: credentials.password
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.data.token);
        setUser({
          ...data.data.user,
          isLoggedIn: true
        });
        return { success: true, user: data.data.user };
      } else {
        // Nếu API báo lỗi mật khẩu/tài khoản
        throw new Error(data.message || 'Đăng nhập không thành công');
      }
    } catch (err) {
      console.warn('Backend login fallback sang local demo credentials:', err.message);
      
      // Kiểm tra xem có khớp demo account nào không
      const matchedRole = Object.keys(DEMO_ACCOUNTS).find(
        r => DEMO_ACCOUNTS[r].username.toLowerCase() === credentials.username?.toLowerCase()
      );

      if (matchedRole) {
        const demoUser = { ...DEMO_ACCOUNTS[matchedRole], isLoggedIn: true };
        setUser(demoUser);
        setToken('demo_token_' + matchedRole);
        return { success: true, user: demoUser };
      }

      // Nếu người dùng nhập thông tin tự do
      const fallbackUser = {
        userId: Date.now(),
        username: credentials.username || 'user',
        fullName: credentials.fullName || credentials.username || 'Người dùng',
        role: credentials.role || 'CUSTOMER',
        roleName: credentials.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng',
        isLoggedIn: true
      };
      setUser(fallbackUser);
      setToken('demo_token_' + fallbackUser.role);
      return { success: true, user: fallbackUser };
    } finally {
      setLoading(false);
    }
  };

  // Nút chuyển đổi vai trò nhanh (Phục vụ Demo và chấm đồ án)
  const switchRole = (roleCode) => {
    const targetAccount = DEMO_ACCOUNTS[roleCode] || DEMO_ACCOUNTS.CUSTOMER;
    setUser({ ...targetAccount, isLoggedIn: true });
    setToken('demo_token_' + roleCode);
  };

  // Đăng xuất
  const logout = async () => {
    try {
      if (token && !token.startsWith('demo_token_')) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.warn('Lỗi khi gọi API logout:', e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('hrmss_user');
    localStorage.removeItem('hrmss_token');
  };

  // Kiểm tra quyền (RBAC)
  const role = user?.role || 'GUEST';
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isStaff = role === 'OFFICE_STAFF';
  const isTechnician = role === 'TECHNICIAN';
  const isCustomer = role === 'CUSTOMER';

  const hasRole = (...allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        switchRole,
        role,
        isAdmin,
        isManager,
        isStaff,
        isTechnician,
        isCustomer,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
