import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  User, Lock, Mail, Phone, School, GraduationCap, Code2,
  AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck,
  AlertCircle, MapPin, Camera, Upload, X, Eye, EyeOff
} from 'lucide-react';
import loginBg from '../assets/login_bg.jpg';

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
  const [showPassword, setShowPassword] = useState(false);

  // Registration form state
  const [regData, setRegData] = useState({
    first_name: '',
    surname: '',
    mobile_number: '',
    email: '',
    gender: '',
    degree: '',
    semester: '',
    technology: '',
    college_name: '',
    university: '',
    address: '',
    username: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors(prev => ({ ...prev, profile_photo: 'Photo file size must be under 5MB.' }));
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy.profile_photo;
        return copy;
      });
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const validateField = (field, value) => {
    const v = (value || '').trim();
    switch (field) {
      case 'first_name':
        if (!v) return 'First Name is required';
        if (!/^[a-zA-Z\s]+$/.test(v)) return 'Letters only (no numbers allowed)';
        if (v.length < 2) return 'Must be at least 2 characters';
        return '';
      case 'surname':
        if (!v) return 'Surname is required';
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
      case 'gender':
        if (!v) return 'Please select your Gender';
        return '';
      case 'degree':
        if (!v) return 'Degree is required';
        return '';
      case 'semester':
        if (!v) return 'Please select Semester (1-10)';
        return '';
      case 'technology':
        if (!v) return 'Technology / Domain is required';
        if (/^\d+$/.test(v)) return 'Letters only (e.g. AI/ML, Python)';
        return '';
      case 'college_name':
        if (!v) return 'College Name is required';
        if (/\d/.test(v)) return 'Letters only (no numbers allowed)';
        return '';
      case 'university':
        if (!v) return 'University is required';
        if (/\d/.test(v)) return 'Letters only (no numbers allowed)';
        return '';
      case 'address':
        if (!v) return 'Address is required';
        if (v.length < 5) return 'Must be at least 5 characters';
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
        let userObj;
        if (res.data.role === 'admin') {
          userObj = {
            role: 'admin',
            username: res.data.user.username,
            name: 'System Administrator',
            id: res.data.user.id
          };
        } else {
          userObj = {
            role: 'student',
            ...res.data.profile,
            username: res.data.profile.username,
            name: res.data.profile.full_name
          };
        }
        try {
          localStorage.setItem('portal_user', JSON.stringify(userObj));
          sessionStorage.setItem('portal_user', JSON.stringify(userObj));
        } catch (storageErr) {
          console.error('Storage write error:', storageErr);
        }
        onLoginSuccess(res.data);
        if (res.data.role === 'admin') {
          navigate('/admin');
          setTimeout(() => {
            if (window.location.pathname !== '/admin') {
              window.location.href = '/admin';
            }
          }, 150);
        } else {
          navigate('/student');
          setTimeout(() => {
            if (window.location.pathname !== '/student') {
              window.location.href = '/student';
            }
          }, 150);
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

    const regFields = [
      'first_name', 'surname', 'mobile_number', 'email',
      'gender', 'degree', 'semester', 'technology',
      'college_name', 'university', 'address'
    ];
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
      let payload;
      if (photoFile) {
        payload = new FormData();
        Object.entries(regData).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            payload.append(k, v);
          }
        });
        payload.append('full_name', `${regData.first_name.trim()} ${regData.surname.trim()}`);
        payload.append('profile_photo', photoFile);
      } else {
        payload = {
          ...regData,
          full_name: `${regData.first_name.trim()} ${regData.surname.trim()}`
        };
      }
      const res = await api.register(payload);
      if (res && res.profile) {
        setSuccessMsg(
          'Registration submitted successfully! Your account is now pending Admin approval. Once verified, you can log in using your registered Email.'
        );
        // Reset form
        setRegData({
          first_name: '',
          surname: '',
          mobile_number: '',
          email: '',
          gender: '',
          degree: '',
          semester: '',
          technology: '',
          college_name: '',
          university: '',
          address: '',
          username: '',
          password: ''
        });
        setPhotoFile(null);
        setPhotoPreview(null);
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
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Dark modern backdrop overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"></div>

      <div className={`relative z-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 w-full transition-all duration-300 overflow-hidden my-6 ${isRegister ? 'max-w-4xl' : 'max-w-lg'}`}>
        
        {/* Brand Logo Header */}
        <div className="pt-7 pb-5 px-6 text-center bg-white border-b border-slate-100">
          <img src="/logo.png" alt="Akash Technolabs" className="h-9 sm:h-10 w-auto mx-auto object-contain" />
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Enter your registered email"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-blue-600 font-medium">(Default: your mobile number)</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password (e.g. mobile number)"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-md transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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

              {/* Row 1: First Name & Surname (Name and Surname bane alag alag) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                <div className="relative">
                  <User className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.first_name ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={regData.first_name}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      updateField('first_name', val);
                    }}
                    onBlur={() => handleBlur('first_name')}
                    placeholder="e.g. Aryan"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      fieldErrors.first_name
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.first_name && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.first_name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Surname *</label>
                <div className="relative">
                  <User className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.surname ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={regData.surname}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      updateField('surname', val);
                    }}
                    onBlur={() => handleBlur('surname')}
                    placeholder="e.g. Patel"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      fieldErrors.surname
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.surname && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.surname}</span>
                  </p>
                )}
              </div>

              {/* Row 2: Mobile Number & Email ID */}
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

              {/* Row 3: Gender & Degree */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                <div className="relative">
                  <select
                    value={regData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    onBlur={() => handleBlur('gender')}
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium bg-white transition ${
                      fieldErrors.gender
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500 text-slate-700'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {fieldErrors.gender && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.gender}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Degree *</label>
                <div className="relative">
                  <select
                    value={regData.degree}
                    onChange={(e) => updateField('degree', e.target.value)}
                    onBlur={() => handleBlur('degree')}
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium bg-white transition ${
                      fieldErrors.degree
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500 text-slate-700'
                    }`}
                  >
                    <option value="">Select Degree</option>
                    <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc. (IT / CS)">B.Sc. (IT / CS)</option>
                    <option value="M.Sc. (IT / CS)">M.Sc. (IT / CS)</option>
                    <option value="Diploma Engineering">Diploma Engineering</option>
                    <option value="B.Com / BBA">B.Com / BBA</option>
                    <option value="Other Degree">Other Degree</option>
                  </select>
                </div>
                {fieldErrors.degree && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.degree}</span>
                  </p>
                )}
              </div>

              {/* Row 4: Semester (Dropdown 1-10) & Technology / Domain */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester (1 - 10) *</label>
                <div className="relative">
                  <select
                    value={regData.semester}
                    onChange={(e) => updateField('semester', e.target.value)}
                    onBlur={() => handleBlur('semester')}
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium bg-white transition ${
                      fieldErrors.semester
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500 text-slate-700'
                    }`}
                  >
                    <option value="">Select Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                    <option value="9">Semester 9</option>
                    <option value="10">Semester 10</option>
                  </select>
                </div>
                {fieldErrors.semester && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.semester}</span>
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

              {/* Row 5: College Name & University */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">College Name *</label>
                <div className="relative">
                  <School className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.college_name ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={regData.college_name}
                    onChange={(e) => {
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

              {/* Row 6: Address & Student Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address *</label>
                <div className="relative">
                  <MapPin className={`w-4 h-4 absolute left-3 top-2.5 ${fieldErrors.address ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={regData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    onBlur={() => handleBlur('address')}
                    placeholder="e.g. 101 Shivalik Heights, SG Highway, Ahmedabad"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      fieldErrors.address
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.address && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.address}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Student Photo <span className="text-slate-400 font-normal">(Optional)</span></label>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {photoPreview ? (
                    <div className="relative w-9 h-9 flex-shrink-0 rounded-lg overflow-hidden border-2 border-blue-500 shadow-xs">
                      <img src={photoPreview} alt="Student Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50/70 hover:bg-blue-100/80 border border-dashed border-blue-300 rounded-xl transition">
                    <Upload className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{photoPreview ? 'Change Photo' : 'Upload Student Photo'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {fieldErrors.profile_photo && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fieldErrors.profile_photo}</span>
                  </p>
                )}
              </div>

              {/* Submit Button & Switch Link */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-500/20 transition text-xs sm:text-sm flex items-center justify-center gap-2"
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
