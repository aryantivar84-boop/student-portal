import React, { useState } from 'react';
import { api } from '../services/api';
import { User, Lock, Mail, Phone, School, GraduationCap, Code2, AlertTriangle, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
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

  if (!isOpen) return null;

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
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {isRegister ? 'Student Registration' : 'Account Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister
                ? 'Fill details to register. Admin will verify your profile.'
                : 'Login to access your internship portal'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
              !isRegister
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Login to Portal
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
              isRegister
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Registration
          </button>
        </div>

        <div className="p-6">
          {/* Notification Banners */}
          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          {/* LOGIN FORM */}
          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition text-sm flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form noValidate onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-xs">
                <strong>Notice:</strong> As per company policy, new students must be verified and accepted by the Admin before being permitted to log in.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
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
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-medium transition ${
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
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
                      placeholder="9876543210 (10 digits)"
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-mono tracking-wider transition ${
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email ID *</label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.email ? 'text-rose-500' : 'text-slate-400'}`} />
                    <input
                      type="email"
                      value={regData.email}
                      onChange={(e) => updateField('email', e.target.value.trim())}
                      onBlur={() => handleBlur('email')}
                      placeholder="student@example.com"
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College Name *</label>
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
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-medium transition ${
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">University *</label>
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
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-medium transition ${
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technology / Domain *</label>
                <div className="relative">
                  <Code2 className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.technology ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    list="auth-tech-domain-options"
                    value={regData.technology}
                    onChange={(e) => {
                      // Letters, tech marks (/+#.-) and spaces only (blocks numbers)
                      const val = e.target.value.replace(/[^a-zA-Z\s/+#.-]/g, '');
                      updateField('technology', val);
                    }}
                    onBlur={() => handleBlur('technology')}
                    placeholder="e.g. AI/ML, Python, Full Stack, React, Flutter"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-medium transition ${
                      fieldErrors.technology
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  <datalist id="auth-tech-domain-options">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Choose Username *</label>
                  <input
                    type="text"
                    value={regData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    placeholder="my_username"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={regData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Minimum 6 characters"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition text-sm flex items-center justify-center gap-2 mt-3"
              >
                {loading ? 'Submitting Registration...' : 'Submit Registration for Approval'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
