import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Safely restore persistent user from localStorage or sessionStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('portal_user') || sessionStorage.getItem('portal_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'student')) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading portal_user from storage:', e);
    }
    return null;
  });

  // Sync to storage whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('portal_user', JSON.stringify(currentUser));
        sessionStorage.setItem('portal_user', JSON.stringify(currentUser));
      } catch (e) {
        console.error('Error writing portal_user to storage:', e);
      }
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
    // Synchronously persist immediately to prevent race conditions on instant refresh
    try {
      localStorage.setItem('portal_user', JSON.stringify(userObj));
      sessionStorage.setItem('portal_user', JSON.stringify(userObj));
    } catch (e) {
      console.error('Error saving user on login:', e);
    }
    setCurrentUser(userObj);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('portal_user');
      sessionStorage.removeItem('portal_user');
    } catch (e) {}
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {!isAuthPage && (
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Root route: If logged in, navigate to appropriate dashboard; otherwise /login */}
          <Route
            path="/"
            element={
              currentUser?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : currentUser?.role === 'student' ? (
                <Navigate to="/student" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

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
          <Route
            path="/admin/*"
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
                  onRefreshProfile={(updated) => {
                    const newObj = { ...currentUser, ...updated };
                    try {
                      localStorage.setItem('portal_user', JSON.stringify(newObj));
                      sessionStorage.setItem('portal_user', JSON.stringify(newObj));
                    } catch (e) {}
                    setCurrentUser(newObj);
                  }}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/student/*"
            element={
              currentUser?.role === 'student' ? (
                <StudentPortal
                  student={currentUser}
                  onRefreshProfile={(updated) => {
                    const newObj = { ...currentUser, ...updated };
                    try {
                      localStorage.setItem('portal_user', JSON.stringify(newObj));
                      sessionStorage.setItem('portal_user', JSON.stringify(newObj));
                    } catch (e) {}
                    setCurrentUser(newObj);
                  }}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback route: Return to user dashboard if logged in, otherwise /login */}
          <Route
            path="*"
            element={
              currentUser?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : currentUser?.role === 'student' ? (
                <Navigate to="/student" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>

      {!isAuthPage && (
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          © 2026 Akash Technolabs. All Rights Reserved. | Student Internship Portal
        </footer>
      )}
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
