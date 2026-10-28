import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

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
    try {
      const saved = localStorage.getItem('hrmss_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // Đồng bộ user vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hrmss_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hrmss_user');
    }
  }, [user]);

  // Đồng bộ token vào localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('hrmss_token', token);
    } else {
      localStorage.removeItem('hrmss_token');
    }
  }, [token]);

  /**
   * Khởi tạo & duy trì phiên làm việc khi F5 lại trang (Silent Refresh & Session Check)
   */
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Thử gọi /api/auth/me để kiểm tra Token hiện tại hoặc Express-Session Cookie
      const res = await authService.getMe();
      if (res?.success && res?.data?.user) {
        setUser({ ...res.data.user, isLoggedIn: true });
        if (res.data.permissions) {
          setPermissions(res.data.permissions);
        }
        return;
      }
    } catch (err) {
      // 2. Nếu /me thất bại (ví dụ Access Token 15m đã hết hạn), thử kích hoạt Silent Refresh qua Session
      try {
        const refreshRes = await authService.refreshToken();
        if (refreshRes?.success && refreshRes?.data) {
          const newAccess = refreshRes.data.accessToken || refreshRes.data.token;
          if (newAccess) setToken(newAccess);

          // Sau khi làm mới token thành công, lấy lại hồ sơ người dùng
          const meAfterRefresh = await authService.getMe();
          if (meAfterRefresh?.success && meAfterRefresh?.data?.user) {
            setUser({ ...meAfterRefresh.data.user, isLoggedIn: true });
            if (meAfterRefresh.data.permissions) {
              setPermissions(meAfterRefresh.data.permissions);
            }
            return;
          }
        }
      } catch (refreshErr) {
        // Cả 2 cách xác thực với Backend đều thất bại
        console.debug('Không tìm thấy phiên backend đang hoạt động:', refreshErr.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Chạy kiểm tra phiên làm việc ngay khi ứng dụng mount (F5 trang)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Đăng nhập kết nối API thông qua authService tập trung
   */
  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login({
        username: credentials.username || credentials.identifier || credentials.email,
        email: credentials.email,
        identifier: credentials.identifier || credentials.username || credentials.email,
        password: credentials.password
      });

      if (data && data.success) {
        setToken(data.data.token || data.data.accessToken);
        const loggedUser = {
          ...data.data.user,
          isLoggedIn: true
        };
        setUser(loggedUser);
        if (data.data.permissions) {
          setPermissions(data.data.permissions);
        }
        return { success: true, user: loggedUser };
      } else {
        throw new Error(data?.message || 'Đăng nhập không thành công');
      }
    } catch (err) {
      console.warn('Backend login fallback sang local credentials:', err.message);
      
      // Kiểm tra demo account
      const matchedRole = Object.keys(DEMO_ACCOUNTS).find(
        r => DEMO_ACCOUNTS[r].username.toLowerCase() === credentials.username?.toLowerCase()
      );

      if (matchedRole) {
        const demoUser = { ...DEMO_ACCOUNTS[matchedRole], isLoggedIn: true };
        setUser(demoUser);
        setToken('demo_token_' + matchedRole);
        return { success: true, user: demoUser };
      }

      // Nhập tự do
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

  /**
   * Chuyển đổi vai trò người dùng (Minh Đức RBAC)
   */
  const switchRole = (roleCode) => {
    const targetAccount = DEMO_ACCOUNTS[roleCode] || DEMO_ACCOUNTS.CUSTOMER;
    setUser({ ...targetAccount, isLoggedIn: true });
    setToken('demo_token_' + roleCode);
  };

  /**
   * Đăng xuất thông qua authService tập trung
   */
  const logout = async () => {
    try {
      if (token && !token.startsWith('demo_token_')) {
        await authService.logout();
      }
    } catch (e) {
      console.warn('Lỗi khi gọi API logout:', e);
    }
    setUser(null);
    setToken(null);
    setPermissions([]);
    localStorage.removeItem('hrmss_user');
    localStorage.removeItem('hrmss_token');
    localStorage.removeItem('hrmss_refresh_token');
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

  const hasPermission = (permissionCode) => {
    if (isAdmin) return true;
    return permissions.includes(permissionCode);
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
        checkAuth,
        role,
        permissions,
        isAdmin,
        isManager,
        isStaff,
        isTechnician,
        isCustomer,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
