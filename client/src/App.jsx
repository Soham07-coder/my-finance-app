// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Sidebar from './pages/Sidebar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TransactionsPage from "./pages/TransactionsPage";
import AddTransactionsPage from "./pages/AddTransactionPage";
import AccountPage from './pages/AccountPage';
import FamilyPage from './pages/FamilyPage';
import AnalyticsPage from './pages/AnalyticsPage';
// Only import index.css for the main layout
import './index.css';

// This is a simple wrapper for authenticated routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If there's no token, redirect to the login page
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    // Only allow toggling on smaller screens
    if (window.innerWidth <= 768) {
      setSidebarOpen(!isSidebarOpen);
    }
  };

  // This effect ensures the sidebar state is correct on window resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // This effect applies the correct class to the #root element for the CSS to work
  useEffect(() => {
    const root = document.getElementById('root');
    // On mobile, the grid structure changes, so we don't need the class
    if (window.innerWidth > 768) {
      if (isSidebarOpen) {
        root.classList.add('sidebar-open');
      } else {
        root.classList.remove('sidebar-open');
      }
    } else {
      root.classList.remove('sidebar-open');
    }
  }, [isSidebarOpen]);


  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        {/* These routes do not have the main layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Routes --- */}
        {/* This single route element handles all pages that need the main layout */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              {/* The Navbar and Sidebar are part of the layout */}
              <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              <Sidebar isOpen={isSidebarOpen} />

              {/* This overlay is for closing the sidebar on mobile */}
              <div
                className={`sidebar-overlay ${isSidebarOpen && window.innerWidth <= 768 ? 'open' : ''}`}
                onClick={toggleSidebar}
              />

              {/* The 'main' element is where the page content will go */}
              <main>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="addtransactions" element={<AddTransactionsPage />} />
                  <Route path="account" element={<AccountPage />} />
                  <Route path="family" element={<FamilyPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  {/* Any other protected route will redirect to the dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
