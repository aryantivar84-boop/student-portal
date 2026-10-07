import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  User, Lock, Mail, Phone, School, GraduationCap, Code2,
  AlertTriangle, CheckCircle2, ArrowRight, Building2, ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial tab from query or path (e.g. /register or ?tab=register)
  const isRegisterInitial = location.pathname === '/register' || location.search.includes('tab=register');
  const [isRegister, setIsRegister] = useState(isRegisterInitial);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Registration form state
  const [regData, setRegData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    college_name: '',
    university: '',
    technology: '',
    username: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (field, value) => {
    const v = (value || '').trim();
    switch (field) {
      case 'full_name':
        if (!v) return 'Full Name is required';
        if (!/^[a-zA-Z\s]+$/.test(v)) return 'Letters only (no numbers allowed)';
        if (v.length < 2) return 'Must be at least 2 characters';
        return '';
      case 'mobile_number':
        if (!v) return 'Mobile Number is required';
        if (!/^\d{10}$/.test(v)) return `Mobile Number must be 10 digits (${v.length}/10 digits)`;
        return '';
      case 'email':
        if (!v) return 'Email ID is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email (e.g. student@example.com)';
        return '';
      case 'college_name':
        if (!v) return 'College Name is required';
        if (/\d/.test(v)) return 'Letters only (no numbers allowed)';
        return '';
      case 'university':
        if (!v) return 'University is required';
        if (/\d/.test(v)) return 'Letters only (no numbers allowed)';
        return '';
      case 'technology':
        if (!v) return 'Technology / Domain is required';
        if (/^\d+$/.test(v)) return 'Letters only (e.g. AI/ML, Python)';
        return '';
      case 'username':
        if (!v) return 'Username is required';
        if (v.length < 3) return 'Must be at least 3 characters';
        return '';
      case 'password':
        if (!v) return 'Password is required';
        if (v.length < 6) return 'Must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const updateField = (field, val) => {
    setRegData(prev => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      const err = validateField(field, val);
      setFieldErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    const err = validateField(field, regData[field]);
    if (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.login(loginData);
      if (res.ok) {
        onLoginSuccess(res.data);
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      } else {
        if (res.data.is_pending) {
          setError(res.data.error || 'Your registration is pending Admin verification. Admin must accept before you can login.');
        } else {
          setError(res.data.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      setError('Connection error with server. Make sure Django backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const regFields = ['full_name', 'mobile_number', 'email', 'college_name', 'university', 'technology', 'username', 'password'];
    const errors = {};
    regFields.forEach(f => {
      const err = validateField(f, regData[f]);
      if (err) errors[f] = err;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const res = await api.register(regData);
      if (res && res.profile) {
        setSuccessMsg(
          'Registration submitted successfully! Your account is now pending Admin approval. You will be able to log in once verified.'
        );
        // Reset form
        setRegData({
          full_name: '',
          mobile_number: '',
          email: '',
          college_name: '',
          university: '',
          technology: '',
          username: '',
          password: ''
        });
        setFieldErrors({});
      } else {
        const beFieldErrors = {};
        const generalMsgs = [];
        if (typeof res === 'object') {
          Object.entries(res).forEach(([k, v]) => {
            const msg = Array.isArray(v) ? v.join(', ') : String(v);
            if (regFields.includes(k)) {
              beFieldErrors[k] = msg;
            } else {
              generalMsgs.push(`${k}: ${msg}`);
            }
          });
        }
        if (Object.keys(beFieldErrors).length > 0) {
          setFieldErrors(beFieldErrors);
        }
        if (generalMsgs.length > 0) {
          setError(generalMsgs.join(' | '));
        } else if (Object.keys(beFieldErrors).length === 0) {
          setError('Registration error occurred.');
        }
      }
    } catch (err) {
      setError('Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full transition-all duration-300 overflow-hidden my-6 ${isRegister ? 'max-w-4xl' : 'max-w-lg'}`}>
        
        {/* Top Header */}
        <div className="bg-slate-900 px-7 py-6 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isRegister ? 'Student Registration' : 'Account Sign In'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Complete registration. Account requires Admin verification before login.'
              : 'Enter your credentials to access the Portal'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); navigate('/login'); }}
            className={`flex-1 py-3.5 text-xs sm:text-sm font-bold transition border-b-2 ${
              !isRegister
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Login to Portal
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); navigate('/register'); }}
            className={`flex-1 py-3.5 text-xs sm:text-sm font-bold transition border-b-2 ${
              isRegister
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            New Student Registration
          </button>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Notification Banners */}
          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* LOGIN FORM */}
          {/* ======================================================== */}
          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-500/20 transition text-sm flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  New student? Register an account here →
                </button>
              </div>
            </form>
          ) : (
            /* ======================================================== */
            /* REGISTRATION FORM */
            /* ======================================================== */
            <form noValidate onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="md:col-span-2 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl text-xs">
                <strong>Notice:</strong> As per company policy, new students must be verified and approved by the Admin before being permitted to log in.
              </div>

              {/* Row 1: Full Name & Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.full_name ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={regData.full_name}
                    onChange={(e) => {
                      // Letters and spaces only (strictly blocks digits and symbols)
                      const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      updateField('full_name', val);
                    }}
                    onBlur={() => handleBlur('full_name')}
                    placeholder="e.g. Aryan Patel"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      fieldErrors.full_name
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.full_name && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.full_name}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Mobile Number *</label>
                  <span className="text-[11px] text-slate-400 font-mono">{regData.mobile_number.length}/10 digits</span>
                </div>
                <div className="relative">
                  <Phone className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.mobile_number ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={regData.mobile_number}
                    onChange={(e) => {
                      // Numbers only, strictly 10 digits max (blocks letters and symbols)
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateField('mobile_number', val);
                    }}
                    onBlur={() => handleBlur('mobile_number')}
                    placeholder="9876543210"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-mono tracking-wider transition ${
                      fieldErrors.mobile_number
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.mobile_number && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.mobile_number}</span>
                  </p>
                )}
              </div>

              {/* Row 2: Email ID & Technology / Domain */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email ID *</label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.email ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    value={regData.email}
                    onChange={(e) => updateField('email', e.target.value.trim())}
                    onBlur={() => handleBlur('email')}
                    placeholder="student@example.com"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
                      fieldErrors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technology / Domain *</label>
                <div className="relative">
                  <Code2 className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.technology ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    list="login-tech-domain-options"
                    value={regData.technology}
                    onChange={(e) => {
                      // Letters, tech marks (/+#.-) and spaces only (blocks numbers)
                      const val = e.target.value.replace(/[^a-zA-Z\s/+#.-]/g, '');
                      updateField('technology', val);
                    }}
                    onBlur={() => handleBlur('technology')}
                    placeholder="e.g. AI/ML, Python, Full Stack, React, Flutter"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      fieldErrors.technology
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  <datalist id="login-tech-domain-options">
                    <option value="AI/ML" />
                    <option value="Python Development" />
                    <option value="Full Stack Web Development" />
                    <option value="React / Node.js" />
                    <option value="Flutter / Mobile App" />
                    <option value="Data Science" />
                    <option value="Java / Spring Boot" />
                    <option value="Cloud Computing" />
                    <option value="Cyber Security" />
                  </datalist>
                </div>
                {fieldErrors.technology && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.technology}</span>
                  </p>
                )}
              </div>

              {/* Row 3: College Name & University */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">College Name *</label>
                <div className="relative">
                  <School className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.college_name ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={regData.college_name}
                    onChange={(e) => {
                      // Letters, spaces and punctuation only (blocks numbers)
                      const val = e.target.value.replace(/[^a-zA-Z\s.,&()'-]/g, '');
                      updateField('college_name', val);
                    }}
                    onBlur={() => handleBlur('college_name')}
                    placeholder="e.g. Silver Oak College"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      fieldErrors.college_name
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.college_name && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.college_name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">University *</label>
                <div className="relative">
                  <GraduationCap className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.university ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={regData.university}
                    onChange={(e) => {
                      // Letters, spaces and punctuation only (blocks numbers)
                      const val = e.target.value.replace(/[^a-zA-Z\s.,&()'-]/g, '');
                      updateField('university', val);
                    }}
                    onBlur={() => handleBlur('university')}
                    placeholder="e.g. Gujarat Technological University"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      fieldErrors.university
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.university && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.university}</span>
                  </p>
                )}
              </div>

              {/* Row 4: Choose Username & Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choose Username *</label>
                <input
                  type="text"
                  value={regData.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  placeholder="username"
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
                    fieldErrors.username
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.username}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={regData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Min 6 chars"
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
                    fieldErrors.password
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Submit Button & Switch Link */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting Registration...' : 'Submit Registration for Approval'}
                </button>
              </div>

              <div className="md:col-span-2 text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Already registered? Sign in here →
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
