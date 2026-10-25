import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Giả lập trạng thái người dùng (có thể đổi sang gọi API Backend thật)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hrmss_user');
    return saved ? JSON.parse(saved) : {
      isLoggedIn: true,
      user_id: 1,
      username: 'khanhnx',
      full_name: 'Nguyễn Xuân Khánh',
      phone: '0987654321',
      email: 'khanhnx@gmail.com',
      role_code: 'CUSTOMER'
    };
  });

  const login = (userData) => {
    setUser({ ...userData, isLoggedIn: true, role_code: 'CUSTOMER' });
    localStorage.setItem('hrmss_user', JSON.stringify({ ...userData, isLoggedIn: true, role_code: 'CUSTOMER' }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hrmss_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isCustomer: user?.role_code === 'CUSTOMER' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
