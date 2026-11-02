import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, UserCheck, ShieldCheck, User } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  // On login/register page, hide logged-in user credentials
  const showUser = currentUser && !isAuthPage;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link
          to={currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'student' ? '/student' : '/login'}
          className="flex items-center space-x-3 group py-1"
        >
          <img
            src={logo}
            alt="Akash Technolabs"
            className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* User state / Controls */}
        <div className="flex items-center space-x-4">
          {showUser ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-right">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                    {currentUser.role === 'admin' ? (
                      <span className="flex items-center text-amber-700 gap-1 text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Admin
                      </span>
                    ) : (
                      <span className="flex items-center text-emerald-700 gap-1 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Student
                      </span>
                    )}
                    <span>{currentUser.name || currentUser.username}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {currentUser.role === 'admin' ? 'Administrator' : currentUser.technology || 'Intern'}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-xs font-bold bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 px-3.5 py-2 rounded-xl transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer group active:scale-[0.98]"
                title="Logout from portal"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-600 transition-colors" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Login / Register</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
