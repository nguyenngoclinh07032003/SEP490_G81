import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './styles/mobile.css';

import MobileLayout from './components/layout/MobileLayout';
import CustomerHome from './pages/Customer/CustomerHome';
import CreateRequest from './pages/Customer/CreateRequest';
import MyRequests from './pages/Customer/MyRequests';
import ServiceHistory from './pages/Customer/ServiceHistory';
import CustomerProfile from './pages/Customer/CustomerProfile';

import PublicServiceList from './pages/Guest/PublicServiceList';
import SignIn from './pages/Guest/SignIn';
import Register from './pages/Guest/Register';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Layout chính của Mobile App */}
          <Route path="/" element={<MobileLayout />}>
            <Route index element={<CustomerHome />} />
            <Route path="services" element={<PublicServiceList />} />
            <Route path="create-request" element={<CreateRequest />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="service-history" element={<ServiceHistory />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Các trang đăng nhập / đăng ký riêng biệt */}
          <Route path="/sign-in" element={<div className="app-viewport"><SignIn /></div>} />
          <Route path="/register" element={<div className="app-viewport"><Register /></div>} />

          {/* Điều hướng mặc định nếu gõ sai đường dẫn */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
