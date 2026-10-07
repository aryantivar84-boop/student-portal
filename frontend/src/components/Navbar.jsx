import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, LogOut, UserCheck, ShieldCheck, User } from 'lucide-react';

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              ATI TECHNOLOGIES
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                Portal
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">Student & Internship Management Platform</p>
          </div>
        </Link>

        {/* User state / Controls */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
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
                className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 transition shadow-xs cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 transition transform hover:-translate-y-0.5 cursor-pointer"
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
