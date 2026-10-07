import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';

function AppContent() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('portal_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('portal_user');
    }
  }, [currentUser]);

  const handleLoginSuccess = (data) => {
    let userObj;
    if (data.role === 'admin') {
      userObj = {
        role: 'admin',
        username: data.user.username,
        name: 'System Administrator',
        id: data.user.id
      };
    } else {
      userObj = {
        role: 'student',
        ...data.profile,
        username: data.profile.username,
        name: data.profile.full_name
      };
    }
    setCurrentUser(userObj);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('portal_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        <Routes>
          {/* Landing Home Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Dedicated Login & Registration Routes */}
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/register"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />

          {/* Protected Admin Portal */}
          <Route
            path="/admin"
            element={
              currentUser?.role === 'admin' ? (
                <AdminPortal />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/offer-letter/:studentId"
            element={
              currentUser?.role === 'admin' ? (
                <AdminPortal />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Protected Student Portal */}
          <Route
            path="/student"
            element={
              currentUser?.role === 'student' ? (
                <StudentPortal
                  student={currentUser}
                  onRefreshProfile={(updated) => setCurrentUser({ ...currentUser, ...updated })}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © 2026 Ati Technologies - Student Internship Portal. Built with Django REST Framework & React.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
