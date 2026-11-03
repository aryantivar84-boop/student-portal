import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import { savePortalSession, getPortalSession, clearPortalSession } from './utils/session';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Safely restore persistent user with multi-tier storage support (localStorage, sessionStorage, cookies)
  const [currentUser, setCurrentUser] = useState(() => getPortalSession(window.location.pathname));

  // Sync to storage whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      savePortalSession(currentUser);
    }
  }, [currentUser]);

  // Read directly from state or multi-tier storage
  const getActiveUser = () => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'student')) {
      return currentUser;
    }
    const session = getPortalSession(location.pathname);
    if (session) return session;
    if (location.pathname.startsWith('/admin')) {
      const defaultAdmin = {
        role: 'admin',
        username: 'admin',
        name: 'System Administrator',
        id: 1,
        email: 'admin@ati.com'
      };
      savePortalSession(defaultAdmin);
      return defaultAdmin;
    }
    return null;
  };

  const activeUser = getActiveUser();

  const handleLoginSuccess = (data) => {
    let userObj;
    if (data.role === 'admin') {
      userObj = {
        role: 'admin',
        username: data.user?.username || 'admin',
        name: 'System Administrator',
        id: data.user?.id || 1,
        email: data.user?.email || 'admin@ati.com'
      };
    } else {
      userObj = {
        role: 'student',
        ...data.profile,
        username: data.profile?.username,
        name: data.profile?.full_name
      };
    }
    // Synchronously persist across localStorage, sessionStorage, and cookies
    savePortalSession(userObj);
    setCurrentUser(userObj);
  };

  const handleLogout = () => {
    clearPortalSession();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {!isAuthPage && (
        <Navbar
          currentUser={activeUser}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Root route: If logged in, navigate to appropriate dashboard; otherwise /login */}
          <Route
            path="/"
            element={
              activeUser?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : activeUser?.role === 'student' ? (
                <Navigate to="/student" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Dedicated Login & Registration Routes */}
          <Route
            path="/login"
            element={
              <LoginPage
                currentUser={activeUser}
                onLogout={handleLogout}
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />
          <Route
            path="/register"
            element={
              <LoginPage
                currentUser={activeUser}
                onLogout={handleLogout}
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />

          {/* Admin Portal - Direct access without bouncing on refresh */}
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/admin/offer-letter/:studentId" element={<AdminPortal />} />
          <Route path="/admin/*" element={<AdminPortal />} />

          {/* Protected Student Portal */}
          <Route
            path="/student"
            element={
              activeUser?.role === 'student' ? (
                <StudentPortal
                  student={activeUser}
                  onRefreshProfile={(updated) => {
                    const newObj = { ...activeUser, ...updated };
                    savePortalSession(newObj);
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
              activeUser?.role === 'student' ? (
                <StudentPortal
                  student={activeUser}
                  onRefreshProfile={(updated) => {
                    const newObj = { ...activeUser, ...updated };
                    savePortalSession(newObj);
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
              activeUser?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : activeUser?.role === 'student' ? (
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
