import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import các file CSS của Design System & Layouts
import './styles/design-system.css';
import './styles/dashboard.css';
import './styles/mobile.css';

// Components Phân quyền & Layout
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import TechnicianLayout from './components/layout/TechnicianLayout';
import MobileLayout from './components/layout/MobileLayout';

// Pages Quản trị Admin
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import SystemSettings from './pages/Admin/SystemSettings';

// Pages Quản lý Manager
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ServiceManagement from './pages/Manager/ServiceManagement';

// Pages Nhân viên văn phòng Office Staff
import StaffDashboard from './pages/OfficeStaff/StaffDashboard';

// Pages Kỹ thuật viên Technician
import TechDashboard from './pages/Technician/TechDashboard';

// Pages Khách hàng Customer
import CustomerHome from './pages/Customer/CustomerHome';
import CreateRequest from './pages/Customer/CreateRequest';
import MyRequests from './pages/Customer/MyRequests';
import ServiceHistory from './pages/Customer/ServiceHistory';
import CustomerProfile from './pages/Customer/CustomerProfile';

// Pages Guest / Auth
import PublicServiceList from './pages/Guest/PublicServiceList';
import SignIn from './pages/Guest/SignIn';
import Register from './pages/Guest/Register';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ===============================================================
              1. KHU VỰC KHÁCH HÀNG & GUEST (Cổng dịch vụ & Ứng dụng đặt thợ)
             =============================================================== */}
          <Route path="/" element={<MobileLayout />}>
            <Route index element={<CustomerHome />} />
            <Route path="customer" element={<CustomerHome />} />
            <Route path="services" element={<PublicServiceList />} />
            <Route path="create-request" element={<CreateRequest />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="service-history" element={<ServiceHistory />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* ===============================================================
              2. KHU VỰC QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN RBAC)
             =============================================================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<UserManagement />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* ===============================================================
              3. KHU VỰC QUẢN LÝ VẬN HÀNH & BẢNG GIÁ (MANAGER RBAC)
             =============================================================== */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="services" element={<ServiceManagement />} />
            <Route path="reports" element={<ManagerDashboard />} />
            <Route path="approvals" element={<ManagerDashboard />} />
          </Route>

          {/* ===============================================================
              4. KHU VỰC NHÂN VIÊN ĐIỀU PHỐI (OFFICE_STAFF RBAC)
             =============================================================== */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['OFFICE_STAFF', 'MANAGER', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="requests" element={<StaffDashboard />} />
            <Route path="schedule" element={<StaffDashboard />} />
          </Route>

          {/* ===============================================================
              5. KHU VỰC KỸ THUẬT VIÊN SỬA CHỮA (TECHNICIAN RBAC)
             =============================================================== */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TechDashboard />} />
          </Route>

          {/* ===============================================================
              6. TRANG XÁC THỰC (ĐĂNG NHẬP / ĐĂNG KÝ)
             =============================================================== */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/register" element={<Register />} />

          {/* Điều hướng mặc định */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
