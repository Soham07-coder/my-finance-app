// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Sidebar from './pages/Sidebar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './index.css'; // Main CSS for the layout grid

// Component to handle the main layout with Navbar and Sidebar
const MainLayout = ({ children, isSidebarOpen, toggleSidebar }) => (
  <>
    <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    {/* Overlay for mobile */}
    <div
      className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
      onClick={toggleSidebar}
    />
    <main>{children}</main>
  </>
);

// Component for protected routes
const PrivateRoute = ({ children, isSidebarOpen, toggleSidebar }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return (
    <MainLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
      {children}
    </MainLayout>
  );
};

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!isSidebarOpen);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Route for Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;