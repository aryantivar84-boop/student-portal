import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  LayoutDashboard, Clock, Play, Pause, Square, FileText, CheckCircle2,
  BookOpen, Award, FileDown, AlertCircle, Plus, Trash2, Send,
  GraduationCap, Calendar, ShieldCheck, ArrowRight, UserCheck, Coffee,
  Eye, Download, User, RefreshCw, Mail, Phone, School, Sparkles, ExternalLink,
  Bell, Megaphone, Check, XCircle, Building2, Filter, Edit, X, Code2
} from 'lucide-react';

export default function StudentPortal({ student, onRefreshProfile }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'profile', 'attendance', 'reports', 'notes', 'mcq', 'documents'

  // Student Profile State (Synchronized with backend)
  const [profile, setProfile] = useState(student);
  const [refreshingProfile, setRefreshingProfile] = useState(false);

  // Edit Profile Modal State with strict inline validation
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    college_name: '',
    university: '',
    technology: ''
  });
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [reportErrors, setReportErrors] = useState({});

  useEffect(() => {
    setProfile(student);
  }, [student]);

  const loadLatestProfile = async (silent = true) => {
    if (!silent) setRefreshingProfile(true);
    try {
      const data = await api.getStudentProfile(student.id);
      if (data && data.id) {
        setProfile((prev) => ({ ...prev, ...data }));
        if (onRefreshProfile) {
          onRefreshProfile(data);
        }
        if (!silent) {
          setStatusMessage('✓ Profile & document approval status synchronized!');
          setTimeout(() => setStatusMessage(''), 3000);
        }
      }
    } catch (err) {
      console.error('Failed to load latest profile:', err);
    } finally {
      if (!silent) setRefreshingProfile(false);
    }
  };

  const handleOpenEditProfile = () => {
    setEditProfileData({
      full_name: profile.full_name || '',
      mobile_number: profile.mobile_number || '',
      email: profile.email || '',
      college_name: profile.college_name || '',
      university: profile.university || '',
      technology: profile.technology || ''
    });
    setProfileFieldErrors({});
    setShowEditProfileModal(true);
  };

  const validateProfileField = (field, value) => {
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
      default:
        return '';
    }
  };

  const updateProfileField = (field, val) => {
    setEditProfileData(prev => ({ ...prev, [field]: val }));
    if (profileFieldErrors[field]) {
      const err = validateProfileField(field, val);
      setProfileFieldErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleProfileBlur = (field) => {
    const err = validateProfileField(field, editProfileData[field]);
    if (err) {
      setProfileFieldErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const fields = ['full_name', 'mobile_number', 'email', 'college_name', 'university', 'technology'];
    const errors = {};
    fields.forEach(f => {
      const err = validateProfileField(f, editProfileData[f]);
      if (err) errors[f] = err;
    });

    if (Object.keys(errors).length > 0) {
      setProfileFieldErrors(errors);
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.updateStudentProfile(profile.id, editProfileData);
      if (res.ok && res.data.student) {
        setProfile(prev => ({ ...prev, ...res.data.student }));
        setShowEditProfileModal(false);
        setStatusMessage('✓ Profile updated successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        const beErrors = {};
        if (typeof res.data === 'object') {
          Object.entries(res.data).forEach(([k, v]) => {
            beErrors[k] = Array.isArray(v) ? v.join(', ') : String(v);
          });
        }
        setProfileFieldErrors(beErrors);
      }
    } catch (err) {
      alert('Failed to update profile. Make sure backend is running.');
    } finally {
      setSavingProfile(false);
    }
  };

  // News & Announcements / Notifications
  const [studentNews, setStudentNews] = useState([]);
  const [unreadNewsCount, setUnreadNewsCount] = useState(0);
  const [loadingStudentNews, setLoadingStudentNews] = useState(false);
  const [selectedNewsFilter, setSelectedNewsFilter] = useState('all'); // 'all', 'unread', 'urgent'
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const loadStudentNews = async () => {
    try {
      const res = await api.getNews({ student_id: student.id });
      if (res && res.news) {
        setStudentNews(res.news);
        setUnreadNewsCount(res.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to load news for student:', err);
    }
  };

  const handleMarkNoticeRead = async (noticeId) => {
    try {
      const res = await api.markNoticeRead(noticeId, student.id);
      setUnreadNewsCount(res.unread_count || 0);
      setStudentNews((prev) =>
        prev.map((n) => (n.id === noticeId ? { ...n, is_read: true, read_count: (n.read_count || 0) + 1 } : n))
      );
    } catch (err) {
      console.error('Failed to mark notice read:', err);
    }
  };

  const handleMarkAllNoticesRead = async () => {
    try {
      await api.markAllNoticesRead(student.id);
      setUnreadNewsCount(0);
      setStudentNews((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setStatusMessage('✓ All notifications marked as read!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Poll profile & news every 5 seconds so Admin approvals and news reflect immediately!
  useEffect(() => {
    loadLatestProfile(true);
    loadStudentNews();
    const interval = setInterval(() => {
      loadLatestProfile(true);
      loadStudentNews();
    }, 5000);
    return () => clearInterval(interval);
  }, [student.id]);

  // Attendance & Timer State
  const [attendance, setAttendance] = useState(null);
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState('Lunch Break');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Monthly Attendance Register State (Came to Office vs Did NOT Come)
  const [studentDailyAttendance, setStudentDailyAttendance] = useState({ summary: {}, daily_records: [] });
  const [studentAttMonth, setStudentAttMonth] = useState('2026-10');
  const [loadingStudentAtt, setLoadingStudentAtt] = useState(false);
  const [studentAttFilterStatus, setStudentAttFilterStatus] = useState('all');

  // Daily Work Report State
  const [timeSlots, setTimeSlots] = useState([
    { slot: '10:00 AM - 11:00 AM', task: 'Team stand-up & project briefing' },
    { slot: '11:00 AM - 01:00 PM', task: 'Component development & API integration' },
    { slot: '02:00 PM - 03:00 PM', task: 'Code review & debugging' },
    { slot: '03:00 PM - 04:00 PM', task: 'Documentation and testing' },
  ]);
  const [reportSummary, setReportSummary] = useState('');
  const [reportSubmittedToday, setReportSubmittedToday] = useState(false);
  const [pastReports, setPastReports] = useState([]);

  // Study Notes State
  const [notes, setNotes] = useState([]);
  const [allocatedSubjects, setAllocatedSubjects] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // MCQ State
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [examResult, setExamResult] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Timer Ref
  const timerRef = useRef(null);

  const loadStudentDailyAttendance = async (monthVal) => {
    setLoadingStudentAtt(true);
    try {
      const data = await api.getAttendanceDailyReport({
        student_id: student.id,
        month: monthVal || studentAttMonth,
      });
      setStudentDailyAttendance(data || { summary: {}, daily_records: [] });
    } catch (err) {
      console.error('Failed to load student daily attendance:', err);
    } finally {
      setLoadingStudentAtt(false);
    }
  };

  // Initialize and load today's attendance
  useEffect(() => {
    loadAttendanceData();
    loadPastReports();
    loadAllocatedSubjects();
    loadNotes();
    loadMCQCategories();
    loadStudentDailyAttendance();
  }, [student.id]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadStudentDailyAttendance(studentAttMonth);
    }
  }, [activeTab, studentAttMonth]);


  const loadAttendanceData = async () => {
    try {
      const data = await api.getTodayAttendance(student.id);
      if (data.has_clocked_in && data.attendance) {
        setAttendance(data.attendance);
        setSecondsWorked(data.attendance.total_seconds_worked || 0);
        setIsPaused(data.attendance.is_paused);
        setTimerRunning(data.attendance.is_clocked_in && !data.attendance.is_paused);
      } else {
        setAttendance(null);
        setTimerRunning(false);
        setIsPaused(false);
        setSecondsWorked(0);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    }
  };

  // Timer tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsWorked((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // Clock In Action
  const handleClockIn = async () => {
    try {
      const res = await api.clockIn(student.id);
      setAttendance(res.attendance);
      setTimerRunning(true);
      setIsPaused(false);
      loadStudentDailyAttendance();
      setStatusMessage('🟢 Clocked in successfully! Work timer is active.');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Error during Clock-In');
    }
  };

  // Pause Action (Lunch / Break)
  const handleConfirmPause = async () => {
    try {
      const res = await api.pauseWork(student.id, pauseReason, secondsWorked);
      setAttendance(res.attendance);
      setTimerRunning(false);
      setIsPaused(true);
      setShowPauseModal(false);
      setStatusMessage(`⏸️ Work paused for: ${pauseReason}`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Error during pause');
    }
  };

  // Resume Action
  const handleResume = async () => {
    try {
      const res = await api.resumeWork(student.id);
      setAttendance(res.attendance);
      setTimerRunning(true);
      setIsPaused(false);
      setStatusMessage('▶️ Work resumed.');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Error resuming work');
    }
  };

  // Clock Out Action
  const handleClockOut = async () => {
    if (!window.confirm('Are you sure you want to Clock Out for the day? Make sure to submit your daily work report.')) {
      return;
    }
    try {
      const res = await api.clockOut(student.id, secondsWorked);
      setAttendance(res.attendance);
      setTimerRunning(false);
      setIsPaused(false);
      loadStudentDailyAttendance();
      setStatusMessage('🏁 Clocked out for today. Please finalize and submit your Daily Report.');
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (err) {
      alert('Error clocking out');
    }
  };

  // Format Seconds to HH:MM:SS
  const formatTimer = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Daily Work Report Handlers
  const handleAddSlot = () => {
    setTimeSlots([...timeSlots, { slot: '', task: '' }]);
  };

  const handleRemoveSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);
    const key = `${field}_${index}`;
    if (reportErrors[key]) {
      setReportErrors(prev => {
        const u = { ...prev };
        delete u[key];
        return u;
      });
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const errors = {};
    timeSlots.forEach((item, idx) => {
      if (!item.slot || !item.slot.trim()) {
        errors[`slot_${idx}`] = 'Please specify time slot (e.g. 10:00 AM - 11:00 AM)';
      }
      if (!item.task || !item.task.trim()) {
        errors[`task_${idx}`] = 'Please describe work completed in this slot';
      }
    });

    if (Object.keys(errors).length > 0) {
      setReportErrors(errors);
      return;
    }

    setReportErrors({});
    try {
      const res = await api.submitDailyReport(student.id, timeSlots, reportSummary);
      setReportSubmittedToday(true);
      setStatusMessage('✅ Daily Work Report saved and submitted successfully!');
      setTimeout(() => setStatusMessage(''), 4000);
      loadPastReports();
    } catch (err) {
      alert('Failed to submit report');
    }
  };

  const loadPastReports = async () => {
    try {
      const data = await api.getDailyReports({ student_id: student.id });
      setPastReports(data);
      const todayStr = new Date().toISOString().split('T')[0];
      const todayReport = data.find((r) => r.date === todayStr);
      if (todayReport) {
        setReportSubmittedToday(true);
        if (todayReport.tasks && todayReport.tasks.length > 0) {
          setTimeSlots(todayReport.tasks);
        }
        setReportSummary(todayReport.summary || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Notes (Only for allocated subjects)
  const loadAllocatedSubjects = async () => {
    try {
      const subjs = await api.getStudentAllocatedSubjects(student.id);
      setAllocatedSubjects(subjs);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await api.getNotes(student.id);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Load MCQ Categories & Start Quiz
  const loadMCQCategories = async () => {
    try {
      const data = await api.getMCQCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartExam = async (category) => {
    setSelectedCategory(category);
    setLoadingQuiz(true);
    setExamResult(null);
    setSelectedAnswers({});
    try {
      const qs = await api.getMCQQuestions(category.id, false);
      setQuestions(qs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSubmitExam = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }
    try {
      const res = await api.submitMCQExam(student.id, selectedCategory.id, selectedAnswers);
      setExamResult(res);
    } catch (err) {
      alert('Error submitting exam.');
    }
  };

  const navItems = [
    { id: 'overview', label: 'My Dashboard', icon: LayoutDashboard },
    {
      id: 'news',
      label: 'News & Notices',
      icon: Bell,
      badge: unreadNewsCount > 0 ? `${unreadNewsCount} New` : null,
      badgeColor: 'bg-rose-500 animate-pulse'
    },
    {
      id: 'profile',
      label: 'My Profile & Documents',
      icon: UserCheck,
      badge: (profile.offer_letter_approved || profile.certificate_approved) ? '✓ Granted' : null,
      badgeColor: 'bg-emerald-600'
    },
    { id: 'attendance', label: 'Clock-In & Time Tracker', icon: Clock },
    { id: 'reports', label: 'Daily Work Reports', icon: FileText, badge: reportSubmittedToday ? '✓ Done' : 'Pending', badgeColor: reportSubmittedToday ? 'bg-emerald-600' : 'bg-amber-500' },
    { id: 'notes', label: 'Allocated Study Notes', icon: BookOpen, badge: allocatedSubjects.length > 0 ? allocatedSubjects.length : null, badgeColor: 'bg-blue-600' },
    { id: 'mcq', label: 'MCQ Exam Module', icon: Award },
    {
      id: 'documents',
      label: 'Offer Letter & Certificate',
      icon: FileDown,
      badge: (profile.offer_letter_approved && profile.certificate_approved) ? '2 Ready' : (profile.offer_letter_approved || profile.certificate_approved) ? '1 Ready' : null,
      badgeColor: 'bg-emerald-600'
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-100">
      
      {/* ======================================================== */}
      {/* MODERN LEFT SIDEBAR FOR STUDENT */}
      {/* ======================================================== */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col justify-between">
        <div className="p-4 space-y-6">
          
          {/* Student Profile Summary in Sidebar */}
          <div
            onClick={() => setActiveTab('profile')}
            title="Click to view My Profile & Documents"
            className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 cursor-pointer hover:border-blue-500/70 hover:bg-slate-800 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow group-hover:scale-105 transition-transform">
                {profile.full_name?.charAt(0) || 'S'}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                  <span>{profile.full_name}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="text-[11px] text-blue-400 font-medium truncate">{profile.technology}</div>
              </div>
            </div>

            {/* Attendance Status Indicator */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  timerRunning
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isPaused
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : attendance?.clock_out
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {timerRunning ? '● Working' : isPaused ? '⏸️ On Break' : attendance?.clock_out ? '✓ Clocked Out' : '○ Not In'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Student Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`${item.badgeColor || 'bg-blue-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Footer Details */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Internship Info</div>
          <div className="flex justify-between">
            <span>Student ID:</span>
            <span className="font-mono font-bold text-white">ATI-STU-{String(profile.id).padStart(4, '0')}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-semibold text-slate-200">{profile.internship_duration_months} Months</span>
          </div>
          <div className="flex justify-between">
            <span>Started:</span>
            <span className="font-semibold text-slate-200">{profile.internship_start_date}</span>
          </div>
        </div>
      </aside>


      {/* ======================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ======================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Control Bar with Notification Bell & Sync Status */}
        <div className="flex justify-between items-center bg-white p-3 sm:p-3.5 px-4 sm:px-5 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700">Student Profile Portal</span>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-blue-600 font-semibold">{profile.technology} Track</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className={`relative p-2 rounded-xl border transition flex items-center gap-1.5 ${
                  unreadNewsCount > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Admin Notices & Announcements"
              >
                <Bell className={`w-4 h-4 ${unreadNewsCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
                {unreadNewsCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full leading-none">
                    {unreadNewsCount}
                  </span>
                )}
                <span className="text-xs font-semibold hidden sm:inline">
                  {unreadNewsCount > 0 ? `${unreadNewsCount} Notices` : 'Notices'}
                </span>
              </button>

              {/* Quick Notification Dropdown Popup */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
                  <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold">Admin Announcements</span>
                    </div>
                    {unreadNewsCount > 0 && (
                      <button
                        onClick={handleMarkAllNoticesRead}
                        className="text-[11px] text-indigo-300 hover:text-white underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {studentNews.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No announcements posted yet.
                      </div>
                    ) : (
                      studentNews.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) handleMarkNoticeRead(n.id);
                            setActiveTab('news');
                            setShowNotificationDropdown(false);
                          }}
                          className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !n.is_read ? 'bg-indigo-50/60 font-semibold' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                              {n.priority}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-slate-900 font-bold mt-1 truncate">{n.title}</div>
                          <div className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{n.content}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('news');
                        setShowNotificationDropdown(false);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center justify-center gap-1 w-full"
                    >
                      <span>View All Announcements & Notices</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={() => {
                loadLatestProfile(false);
                loadStudentNews();
              }}
              disabled={refreshingProfile}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition"
              title="Synchronize profile & notices"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingProfile ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>

        {/* Top Status Notification Banner */}
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. STUDENT OVERVIEW DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Urgent Admin Announcement Alert Banner */}
            {unreadNewsCount > 0 && studentNews.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 p-4 sm:p-5 rounded-2xl text-white shadow-md border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-rose-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full">
                        Admin Broadcast Notice
                      </span>
                      <span className="text-xs font-semibold text-indigo-200">
                        {unreadNewsCount} unread announcement{unreadNewsCount === 1 ? '' : 's'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {studentNews.find(n => !n.is_read)?.title || studentNews[0].title}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('news')}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Read Notice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {/* Hero Welcome Card */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Verified Intern
                  </span>
                  <span className="text-xs text-blue-200">
                    ID: ATI-STU-{String(profile.id).padStart(4, '0')}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                  Welcome back, {profile.full_name}!
                </h2>
                <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
                  {profile.technology} Trainee | {profile.college_name} ({profile.university})
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl text-xs flex items-center gap-4">
                <div>
                  <div className="text-blue-200 text-[11px] uppercase tracking-wider">Internship Tenure</div>
                  <div className="text-base font-extrabold text-white mt-0.5">{profile.internship_duration_months} Months</div>
                </div>
                <div className="border-l border-white/20 pl-4">
                  <div className="text-blue-200 text-[11px] uppercase tracking-wider">Start Date</div>
                  <div className="text-base font-extrabold text-white mt-0.5">{profile.internship_start_date}</div>
                </div>
              </div>
            </div>

            {/* Document Released Notification Banner if Approved */}
            {(profile.offer_letter_approved || profile.certificate_approved) && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Official Documents Released by Admin!</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Granted</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Admin has granted approval for your official PDF documents. You can view or download them right now.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {profile.offer_letter_approved && (
                    <a
                      href={api.getOfferLetterUrl(profile.id, false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Offer Letter</span>
                    </a>
                  )}
                  {profile.certificate_approved && (
                    <a
                      href={api.getCertificateUrl(profile.id, false)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Certificate</span>
                    </a>
                  )}
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-200 transition"
                  >
                    View in Profile →
                  </button>
                </div>
              </div>
            )}

            {/* Quick KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Working Hours Card */}
              <div
                onClick={() => setActiveTab('attendance')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Work</div>
                    <div className="text-2xl font-extrabold font-mono text-blue-600 mt-1">
                      {formatTimer(secondsWorked)}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-600 font-semibold flex items-center gap-1">
                  <span>{timerRunning ? 'Timer active' : isPaused ? 'Paused on break' : 'View attendance'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Daily Report Card */}
              <div
                onClick={() => setActiveTab('reports')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Report</div>
                    <div className="text-lg font-extrabold text-slate-900 mt-1">
                      {reportSubmittedToday ? 'Submitted' : 'Pending'}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reportSubmittedToday ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className={`mt-3 text-xs font-semibold flex items-center gap-1 ${reportSubmittedToday ? 'text-emerald-700' : 'text-amber-700'}`}>
                  <span>{reportSubmittedToday ? '✓ Ready for today' : 'Submit hourly report'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Study Notes Card */}
              <div
                onClick={() => setActiveTab('notes')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Allocated Subjects</div>
                    <div className="text-2xl font-extrabold text-indigo-600 mt-1">
                      {allocatedSubjects.length}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-indigo-600 font-semibold flex items-center gap-1">
                  <span>{notes.length} notes available</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Official Documents Card */}
              <div
                onClick={() => setActiveTab('profile')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PDF Documents</div>
                    <div className="text-lg font-extrabold text-slate-900 mt-1">
                      {profile.certificate_approved && profile.offer_letter_approved
                        ? '2 Granted'
                        : profile.offer_letter_approved
                        ? 'Offer Ready'
                        : profile.certificate_approved
                        ? 'Cert Ready'
                        : 'Pending Approval'}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-purple-600 font-semibold flex items-center gap-1">
                  <span>{profile.offer_letter_approved || profile.certificate_approved ? 'View & Download' : 'Check status'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>


            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Quick Clock-In Widget Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Quick Attendance Action</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="text-center py-4 bg-slate-950 text-white rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                    Current Work Timer
                  </div>
                  <div className="text-4xl font-mono font-bold text-blue-400 mt-1">
                    {formatTimer(secondsWorked)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {timerRunning ? '● Timer Active' : isPaused ? '⏸️ On Break' : attendance?.clock_out ? '✓ Day Ended' : 'Not Clocked In'}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!attendance || !attendance.clock_in ? (
                    <button
                      onClick={handleClockIn}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Clock In for Today</span>
                    </button>
                  ) : attendance.clock_out ? (
                    <div className="w-full bg-slate-50 border border-slate-200 text-center py-2.5 rounded-xl text-xs text-slate-600 font-medium">
                      You have clocked out for today.
                    </div>
                  ) : (
                    <>
                      {isPaused ? (
                        <button
                          onClick={handleResume}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowPauseModal(true)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause (Break)</span>
                        </button>
                      )}
                      <button
                        onClick={handleClockOut}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Clock Out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Today's Work Report Summary Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span>Today's Daily Report</span>
                    </h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${reportSubmittedToday ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {reportSubmittedToday ? '✓ Submitted' : 'Pending Entry'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Voice Note 1 requirement: Before leaving for the day, submit your hourly task breakdown detailing what was done during each hour slot (e.g. 2:00–3:00, 3:00–4:00).
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                    <div className="font-semibold text-slate-700">Current Task Slots: {timeSlots.length}</div>
                    <div className="text-slate-500 text-[11px] truncate">
                      Latest: {timeSlots[timeSlots.length - 1]?.slot} - {timeSlots[timeSlots.length - 1]?.task}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{reportSubmittedToday ? 'View / Update Daily Report' : 'Fill Daily Work Report'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* NEWS & BROADCAST NOTICES FOR STUDENT */}
        {/* ======================================================== */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Official Admin Notice Board</span>
                  </span>
                  <span className="text-xs bg-white/10 text-white/80 px-2.5 py-0.5 rounded-full">
                    {studentNews.length} Total Notices
                  </span>
                </div>
                <h2 className="text-2xl font-black mt-2 tracking-tight">
                  News & Announcements
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
                  Official notices, schedule changes, project deadlines, exam alerts, and circulars broadcasted by Admin to your domain ({profile.technology}).
                </p>
              </div>

              {unreadNewsCount > 0 && (
                <button
                  onClick={handleMarkAllNoticesRead}
                  className="bg-white hover:bg-indigo-50 text-indigo-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
                >
                  <Check className="w-4 h-4 text-indigo-700" />
                  <span>Mark All as Read ({unreadNewsCount})</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedNewsFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedNewsFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Notices ({studentNews.length})
              </button>

              <button
                onClick={() => setSelectedNewsFilter('unread')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedNewsFilter === 'unread'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>Unread Notices</span>
                {unreadNewsCount > 0 && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    selectedNewsFilter === 'unread' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {unreadNewsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSelectedNewsFilter('urgent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedNewsFilter === 'urgent'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Important & Urgent Only
              </button>
            </div>

            {/* Announcements List */}
            {(() => {
              const filtered = studentNews.filter((n) => {
                if (selectedNewsFilter === 'unread') return !n.is_read;
                if (selectedNewsFilter === 'urgent') return n.priority === 'urgent' || n.priority === 'important';
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
                    <h4 className="text-sm font-bold text-slate-800">You're all caught up!</h4>
                    <p className="text-xs text-slate-400">
                      No notices match your current filter. New announcements from Admin will appear here automatically.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((n) => {
                    const isUrgent = n.priority === 'urgent';
                    const isImportant = n.priority === 'important';

                    return (
                      <div
                        key={n.id}
                        className={`bg-white rounded-2xl p-6 border shadow-xs transition hover:shadow-md ${
                          !n.is_read
                            ? isUrgent
                              ? 'border-rose-300 ring-2 ring-rose-100'
                              : isImportant
                              ? 'border-amber-300 ring-2 ring-amber-100'
                              : 'border-indigo-300 ring-2 ring-indigo-50'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isUrgent
                                    ? 'bg-rose-600 text-white'
                                    : isImportant
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                {n.priority}
                              </span>

                              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-2 py-0.5 rounded-full">
                                {n.category}
                              </span>

                              <span className="text-[11px] text-slate-400 font-medium">
                                Posted on {new Date(n.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>

                              {!n.is_read && (
                                <span className="text-[10px] bg-rose-100 text-rose-700 font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                  ● NEW
                                </span>
                              )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                              {n.title}
                            </h3>

                            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed pt-1">
                              {n.content}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                              <span>Official Broadcast from <strong>{n.posted_by}</strong></span>
                              <span>Target: <strong>{n.target_technology || 'ALL'}</strong></span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                            {!n.is_read ? (
                              <button
                                onClick={() => handleMarkNoticeRead(n.id)}
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark as Read</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Read</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT PROFILE & OFFICIAL DOCUMENTS (DIRECT GRANT) */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
                  {profile.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900">{profile.full_name}</h2>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {profile.is_approved ? 'Verified Intern' : 'Pending Verification'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-blue-700">{profile.technology} Intern</span>
                    <span>•</span>
                    <span>ID: <strong className="font-mono text-slate-800">ATI-STU-{String(profile.id).padStart(4, '0')}</strong></span>
                    <span>•</span>
                    <span>Username: <strong className="text-slate-800">@{profile.username}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={handleOpenEditProfile}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => loadLatestProfile(false)}
                  disabled={refreshingProfile}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingProfile ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{refreshingProfile ? 'Syncing...' : 'Sync Profile & Status'}</span>
                </button>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Address</span>
                <div className="text-xs font-semibold text-slate-900 break-all">{profile.email}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Mobile Number</span>
                <div className="text-xs font-semibold text-slate-900">{profile.mobile_number}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">College / Institute</span>
                <div className="text-xs font-semibold text-slate-900 truncate" title={profile.college_name}>{profile.college_name}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Affiliated University</span>
                <div className="text-xs font-semibold text-slate-900">{profile.university}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Domain / Technology</span>
                <div className="text-xs font-bold text-blue-700">{profile.technology}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Tenure Duration</span>
                <div className="text-xs font-semibold text-slate-900">{profile.internship_duration_months} Months</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Commencement Date</span>
                <div className="text-xs font-semibold text-slate-900">{profile.internship_start_date}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Portal Role</span>
                <div className="text-xs font-bold text-emerald-700">Trainee / Intern</div>
              </div>
            </div>

            {/* Official Documents Granted by Admin (Direct Grant inside Profile) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <FileDown className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">Official Internship Documents</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Voice Note 2: Documents are released upon Admin approval. You can view or download them directly from your profile below.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Status:</span>
                  {profile.offer_letter_approved && profile.certificate_approved ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      ✓ Both Documents Released
                    </span>
                  ) : profile.offer_letter_approved || profile.certificate_approved ? (
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      ✓ 1 Document Released
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      ⏳ Awaiting Admin Approval
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Offer Letter Card */}
                <div className="p-6 border border-slate-200 rounded-2xl bg-gradient-to-b from-white to-blue-50/30 flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        Appointment Credential
                      </span>
                      {profile.offer_letter_approved ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ✓ Granted & Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          ⏳ Pending Admin Approval
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Internship Offer Letter</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Official verified offer letter confirming your placement as an intern in <strong>{profile.technology}</strong> for {profile.internship_duration_months} months with reference ID <strong>ATI/INT/{String(profile.id).padStart(4, '0')}</strong>.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    {profile.offer_letter_approved ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={api.getOfferLetterUrl(profile.id, false)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Offer Letter (PDF)</span>
                        </a>
                        <a
                          href={api.getOfferLetterUrl(profile.id, true)}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View PDF</span>
                        </a>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center text-xs text-amber-800">
                        Admin has not approved your offer letter yet. Once approved, your download button will appear here automatically.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Completion Certificate Card */}
                <div className="p-6 border border-slate-200 rounded-2xl bg-gradient-to-b from-white to-emerald-50/30 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                        Graduation Credential
                      </span>
                      {profile.certificate_approved ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ✓ Granted & Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          ⏳ Pending Admin Approval
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Internship Completion Certificate</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Official certificate with organization seal and authorized signatures verifying successful completion of your internship tenure in <strong>{profile.technology}</strong>.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    {profile.certificate_approved ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={api.getCertificateUrl(profile.id, false)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Certificate (PDF)</span>
                        </a>
                        <a
                          href={api.getCertificateUrl(profile.id, true)}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View PDF</span>
                        </a>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center text-xs text-amber-800">
                        Completion certificate is unlocked by Admin once you finish your {profile.internship_duration_months}-month tenure.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 2. CLOCK-IN & TIME TRACKER (VOICE NOTE 1) */}
        {/* ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-8">
            
            {/* Top Row: Today's Clock-In Timer & Today's Break Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left: Clock-In Timer Box */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Daily Attendance Tracker
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        timerRunning
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isPaused
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : attendance?.clock_out
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {timerRunning
                        ? '● Active Working'
                        : isPaused
                        ? '⏸️ On Break'
                        : attendance?.clock_out
                        ? '✓ Day Ended'
                        : '○ Not Clocked In'}
                    </span>
                  </div>

                  {/* Digital Timer */}
                  <div className="my-6 text-center bg-slate-950 text-white rounded-2xl p-6 shadow-inner border border-slate-800">
                    <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                      Today's Working Hours
                    </div>
                    <div className="text-5xl font-mono font-bold tracking-tight text-blue-400">
                      {formatTimer(secondsWorked)}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!attendance || !attendance.clock_in ? (
                      <button
                        onClick={handleClockIn}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-base"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>Clock In for Today</span>
                      </button>
                    ) : attendance.clock_out ? (
                      <div className="bg-slate-50 border border-slate-200 text-center p-3 rounded-xl text-xs text-slate-600">
                        You have clocked out for today. Total worked: <strong>{formatTimer(secondsWorked)}</strong>.
                      </div>
                    ) : (
                      <>
                        {isPaused ? (
                          <button
                            onClick={handleResume}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Resume Work</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowPauseModal(true)}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
                          >
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause Work (Lunch / Water Break)</span>
                          </button>
                        )}

                        <button
                          onClick={handleClockOut}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          <span>Clock Out (End Day)</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Attendance Details Footer */}
                {attendance && (
                  <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Clocked In At:</span>
                      <span className="font-semibold text-slate-800">
                        {attendance.clock_in ? new Date(attendance.clock_in).toLocaleTimeString() : '--'}
                      </span>
                    </div>
                    {attendance.clock_out && (
                      <div className="flex justify-between">
                        <span>Clocked Out At:</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(attendance.clock_out).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Break Log & Attendance Summary */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-600" />
                  <span>Today's Break & Pause Logs</span>
                </h3>
                <p className="text-xs text-slate-500">
                  When you go for lunch or water, clocking out/pausing halts the timer and logs the break.
                </p>

                {attendance?.breaks && attendance.breaks.length > 0 ? (
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-slate-100 text-xs">
                      <thead>
                        <tr className="text-left text-slate-500 uppercase font-semibold">
                          <th className="py-2.5">Break Reason</th>
                          <th className="py-2.5">Paused At</th>
                          <th className="py-2.5">Resumed At</th>
                          <th className="py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {attendance.breaks.map((b, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 font-semibold text-slate-900">{b.reason}</td>
                            <td className="py-3 font-mono">{new Date(b.pause_time).toLocaleTimeString()}</td>
                            <td className="py-3 font-mono">{b.resume_time ? new Date(b.resume_time).toLocaleTimeString() : 'In Progress'}</td>
                            <td className="py-3 text-right">
                              {b.resume_time ? (
                                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Completed</span>
                              ) : (
                                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">Active Break</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No breaks logged today. Use "Pause Work" whenever stepping away for lunch or water.
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Section: My Monthly Attendance Register (Days Came vs Did NOT Come) */}
            <div className="space-y-6">
              
              {/* Header Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>My Monthly Office Attendance Register</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Check which days you <strong>came to the office</strong> (Present) and which days you were <strong>absent</strong>, along with your in-out timings and monthly attendance score.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <label className="text-xs font-bold text-slate-700">Month:</label>
                    <input
                      type="month"
                      value={studentAttMonth}
                      onChange={(e) => setStudentAttMonth(e.target.value)}
                      className="px-2 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={() => loadStudentDailyAttendance(studentAttMonth)}
                    disabled={loadingStudentAtt}
                    className="p-2 text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                    title="Refresh Register"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingStudentAtt ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Monthly KPI Overview Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                
                {/* 1. Working Days */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Working Days</span>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {studentDailyAttendance.summary?.total_working_days ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Office open days
                  </div>
                </div>

                {/* 2. Came to Office (Present) */}
                <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-600 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Came to Office</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    {studentDailyAttendance.summary?.days_present ?? 0}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-600 mt-0.5 truncate">
                    🟢 Days Present
                  </div>
                </div>

                {/* 3. Did NOT Come (Absent) */}
                <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/20 shadow-xs">
                  <div className="flex items-center justify-between text-rose-600 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">Did NOT Come</span>
                    <XCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-rose-700">
                    {studentDailyAttendance.summary?.days_absent ?? 0}
                  </div>
                  <div className="text-[11px] font-medium text-rose-600 mt-0.5 truncate">
                    🔴 Days Absent
                  </div>
                </div>

                {/* 4. Festivals & Holidays (Day Off) */}
                <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-300 transition">
                  <div className="flex items-center justify-between text-amber-600 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Festivals / Day Off</span>
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-700">
                    {studentDailyAttendance.summary?.holiday_days ?? 0}
                  </div>
                  <div className="text-[11px] font-medium text-amber-600 mt-0.5 truncate">
                    🪔 Office Festival Off
                  </div>
                </div>

                {/* 5. Weekend Days */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Weekends</span>
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-700">
                    {studentDailyAttendance.summary?.weekend_days ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    ⚪ Office Closed
                  </div>
                </div>

                {/* 6. Attendance Percentage */}
                <div className="bg-white rounded-2xl p-4 border border-indigo-200 bg-indigo-50/20 shadow-xs">
                  <div className="flex items-center justify-between text-indigo-600 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">My Attendance</span>
                    <Award className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-indigo-700">
                    {studentDailyAttendance.summary?.attendance_rate ?? 0}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, studentDailyAttendance.summary?.attendance_rate || 0)}%` }}
                    />
                  </div>
                </div>

                {/* 7. Total Logged Hours */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Hours Worked</span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-blue-700">
                    {studentDailyAttendance.summary?.total_hours_worked ?? 0} <span className="text-xs font-bold text-slate-400">hrs</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Total month hours
                  </div>
                </div>

              </div>

              {/* Status Filter Buttons */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Filter:</span>
                
                <button
                  onClick={() => setStudentAttFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    studentAttFilterStatus === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Days ({studentDailyAttendance.daily_records?.length || 0})
                </button>

                <button
                  onClick={() => setStudentAttFilterStatus('present')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    studentAttFilterStatus === 'present'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Came to Office ({studentDailyAttendance.summary?.days_present || 0})</span>
                </button>

                <button
                  onClick={() => setStudentAttFilterStatus('absent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    studentAttFilterStatus === 'absent'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Did NOT Come ({studentDailyAttendance.summary?.days_absent || 0})</span>
                </button>

                <button
                  onClick={() => setStudentAttFilterStatus('holiday')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    studentAttFilterStatus === 'holiday'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>🪔 Festivals & Holidays ({studentDailyAttendance.summary?.holiday_days || 0})</span>
                </button>

                <button
                  onClick={() => setStudentAttFilterStatus('weekend')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    studentAttFilterStatus === 'weekend'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  ⚪ Weekends ({studentDailyAttendance.summary?.weekend_days || 0})
                </button>
              </div>

              {/* Visual Calendar Grid Heatmap for Student */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>📅 Attendance Calendar Heatmap:</span>
                    <span className="text-blue-700">{studentDailyAttendance.month_name || studentAttMonth}</span>
                  </h4>

                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Came
                    </span>
                    <span className="flex items-center gap-1 text-rose-700 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Absent
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> 🪔 Festival / Day Off
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Weekend
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-7 lg:grid-cols-10 gap-2">
                  {(studentDailyAttendance.daily_records || []).map((d) => {
                    const isPresent = d.status === 'PRESENT';
                    const isAbsent = d.status === 'ABSENT';
                    const isHoliday = d.is_holiday || d.status === 'HOLIDAY';
                    const isWeekend = d.status === 'WEEKEND';
                    const isToday = d.date === new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={d.date}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col justify-between min-h-[74px] ${
                          isPresent
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                            : isHoliday
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs ring-1 ring-amber-200'
                            : isAbsent
                            ? 'bg-rose-50/80 border-rose-300 text-rose-950 shadow-xs'
                            : isWeekend
                            ? 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-400'
                        } ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                        title={d.is_holiday ? `${d.holiday_name} (Festival Day Off)` : undefined}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span>{d.day_name.slice(0, 3)}</span>
                          <span className="font-extrabold text-xs">{d.day_of_month}</span>
                        </div>

                        <div className="my-1">
                          {isPresent ? (
                            <div>
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded block truncate">
                                🟢 {d.duration}
                              </span>
                              {d.is_holiday && (
                                <span className="text-[8px] font-black text-amber-700 bg-amber-100 rounded px-1 mt-0.5 block truncate">
                                  🪔 {d.holiday_name}
                                </span>
                              )}
                            </div>
                          ) : isHoliday ? (
                            <div>
                              <span className="text-[9px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-1 py-0.5 rounded block truncate" title={d.holiday_name}>
                                🪔 {d.holiday_name || 'Festival'}
                              </span>
                              <span className="text-[9px] font-black text-amber-700 uppercase tracking-tight block mt-0.5">
                                Day Off
                              </span>
                            </div>
                          ) : isAbsent ? (
                            <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded block truncate">
                              🔴 Absent
                            </span>
                          ) : isWeekend ? (
                            <span className="text-[9px] font-semibold text-slate-400 block truncate">
                              Off
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-300 block truncate">
                              --
                            </span>
                          )}
                        </div>

                        {isToday ? (
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                            Today
                          </span>
                        ) : isHoliday ? (
                          <span className="text-[8px] font-bold text-amber-600 uppercase tracking-tighter">
                            Office Off
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day-by-Day Table */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Day-by-Day Office Attendance Records
                </h4>

                {loadingStudentAtt ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Loading attendance register...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 text-left">Date & Day</th>
                          <th className="px-4 py-3.5 text-left">Office Status</th>
                          <th className="px-4 py-3.5 text-left">Clock In (In-Time)</th>
                          <th className="px-4 py-3.5 text-left">Clock Out (Out-Time)</th>
                          <th className="px-4 py-3.5 text-left">Time Worked</th>
                          <th className="px-4 py-3.5 text-left">Daily Work Report</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(() => {
                          const records = (studentDailyAttendance.daily_records || []).filter((r) => {
                            if (studentAttFilterStatus === 'present' && r.status !== 'PRESENT') return false;
                            if (studentAttFilterStatus === 'absent' && r.status !== 'ABSENT') return false;
                            if (studentAttFilterStatus === 'holiday' && !r.is_holiday && r.status !== 'HOLIDAY') return false;
                            if (studentAttFilterStatus === 'weekend' && r.status !== 'WEEKEND') return false;
                            return true;
                          });

                          if (records.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-400">
                                  No records found for the selected filter.
                                </td>
                              </tr>
                            );
                          }

                          return records.map((row, idx) => {
                            const isPresent = row.status === 'PRESENT';
                            const isAbsent = row.status === 'ABSENT';
                            const isHoliday = row.is_holiday || row.status === 'HOLIDAY';
                            const isWeekend = row.status === 'WEEKEND';
                            const isToday = row.date === new Date().toISOString().split('T')[0];

                            return (
                              <tr
                                key={`${row.date}-${idx}`}
                                className={`hover:bg-slate-50 transition ${
                                  isToday ? 'bg-blue-50/30' : isHoliday ? 'bg-amber-50/20' : isPresent ? 'bg-emerald-50/10' : ''
                                }`}
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{row.date}</span>
                                    {isToday && (
                                      <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                                        Today
                                      </span>
                                    )}
                                    {isHoliday && (
                                      <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                                        Festival
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400">{row.day_name}</div>
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap">
                                  {isPresent ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-xl text-xs">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Came to Office (Present)</span>
                                      </span>
                                      {row.is_holiday && (
                                        <div className="text-[11px] text-amber-700 font-bold ml-1">
                                          🪔 {row.holiday_name} (Festival Attended)
                                        </div>
                                      )}
                                    </div>
                                  ) : isHoliday ? (
                                    <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-3 py-1 rounded-xl text-xs shadow-xs">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                      <span>🪔 Festival Day Off: {row.holiday_name}</span>
                                    </span>
                                  ) : isAbsent ? (
                                    <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-3 py-1 rounded-xl text-xs">
                                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Did NOT Come (Absent)</span>
                                    </span>
                                  ) : isWeekend ? (
                                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 font-semibold px-3 py-1 rounded-xl text-xs">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Weekend (Office Closed)</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-3 py-1 rounded-xl text-xs">
                                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                                      <span>Upcoming Date</span>
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-emerald-700">
                                  {row.clock_in ? (
                                    <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      {row.clock_in}
                                    </span>
                                  ) : isHoliday ? (
                                    <span className="text-amber-700 font-semibold text-xs italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      Office Closed
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">--</span>
                                  )}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-rose-700">
                                  {row.clock_out ? (
                                    row.clock_out === 'In Session' ? (
                                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded animate-pulse">
                                        ● In Session
                                      </span>
                                    ) : (
                                      <span className="bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                        {row.clock_out}
                                      </span>
                                    )
                                  ) : isHoliday ? (
                                    <span className="text-amber-700 font-semibold text-xs italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      Day Off
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">--</span>
                                  )}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap">
                                  {isPresent ? (
                                    <span className="font-extrabold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">
                                      {row.duration}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">0h 0m</span>
                                  )}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap">
                                  {row.has_report ? (
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-lg font-bold text-[11px]">
                                      <FileText className="w-3 h-3 text-blue-600" />
                                      <span>Submitted ({row.report_tasks_count} tasks)</span>
                                    </span>
                                  ) : isPresent ? (
                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                                      ⚠️ Missing Report
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">--</span>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 3. DAILY WORK REPORTS (VOICE NOTE 1) */}
        {/* ======================================================== */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Daily Work Report Submission</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record your hourly work breakdown before leaving (e.g. 2:00–3:00, 3:00–4:00).
                </p>
              </div>
              {reportSubmittedToday && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                </span>
              )}
            </div>

            <form noValidate onSubmit={handleSubmitReport} className="space-y-4">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hourly Task Slots
                </label>

                {timeSlots.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 02:00 PM - 03:00 PM"
                        value={item.slot}
                        onChange={(e) => handleSlotChange(idx, 'slot', e.target.value)}
                        className={`w-1/3 px-3 py-2 text-xs font-semibold bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition text-slate-800 ${
                          reportErrors[`slot_${idx}`]
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                            : 'border-slate-300 focus:ring-blue-500'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Describe what work was done in this time..."
                        value={item.task}
                        onChange={(e) => handleSlotChange(idx, 'task', e.target.value)}
                        className={`flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 transition text-slate-800 ${
                          reportErrors[`task_${idx}`]
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                            : 'border-slate-300 focus:ring-blue-500'
                        }`}
                      />
                      {timeSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 transition"
                          title="Remove slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {(reportErrors[`slot_${idx}`] || reportErrors[`task_${idx}`]) && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{reportErrors[`slot_${idx}`] || reportErrors[`task_${idx}`]}</span>
                      </p>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Time Slot</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Overall Summary / Notes
                </label>
                <textarea
                  rows={3}
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  placeholder="Summary of today's achievements, roadblocks, or notes for the team..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{reportSubmittedToday ? 'Update Daily Report' : 'Submit Daily Report'}</span>
                </button>
              </div>
            </form>

            {/* Previous Reports History */}
            {pastReports.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Report History ({pastReports.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {pastReports.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="flex justify-between font-semibold text-slate-800 mb-1">
                        <span>Date: {r.date}</span>
                        <span className="text-slate-500 text-[11px] font-normal">
                          {r.tasks ? `${r.tasks.length} slots logged` : ''}
                        </span>
                      </div>
                      {r.summary && <p className="text-slate-600 italic">"{r.summary}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ALLOCATED STUDY NOTES (VOICE NOTE 3) */}
        {/* ======================================================== */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>My Allocated Study Notes</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Voice Note 3: You can only view notes for subjects that have been allocated to you by the Admin.
                </p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {allocatedSubjects.map((s) => (
                  <span key={s.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
                    ✓ {s.name}
                  </span>
                ))}
              </div>
            </div>

            {loadingNotes ? (
              <div className="text-center py-12 text-sm text-slate-500">Loading your allocated notes...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12 px-4 max-w-md mx-auto">
                <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">No Allocated Notes Found</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  You do not have any notes yet, or the admin hasn't allocated any subject to your account yet. Contact your coordinator to allocate subjects.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-5 border border-slate-200 rounded-2xl hover:border-blue-300 transition bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-2 py-0.5 rounded-full">
                        {note.subject_name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {note.uploaded_at ? new Date(note.uploaded_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                    {note.content && (
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-slate-100">
                        {note.content}
                      </p>
                    )}

                    {(note.document_url || note.document) && (
                      <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-xl border border-blue-100 gap-2 mt-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </span>
                          <span className="font-semibold text-slate-800 text-xs truncate max-w-xs">
                            {note.file_name || 'Attached Study PDF / Material'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={api.getNoteDocumentUrl(note.document_url || note.document)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                            title="Open / Preview PDF in new tab"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View PDF</span>
                          </a>
                          <a
                            href={api.getNoteDocumentUrl(note.document_url || note.document)}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. MCQ EXAM MODULE (VOICE NOTE 2) */}
        {/* ======================================================== */}
        {activeTab === 'mcq' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>MCQ Examination & Evaluation Module</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Voice Note 2: Take category-wise technical tests. Your score is automatically evaluated and submitted to the Admin.
              </p>
            </div>

            {!selectedCategory ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Test Category
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-5 border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow transition bg-gradient-to-b from-white to-slate-50 cursor-pointer flex flex-col justify-between"
                      onClick={() => handleStartExam(cat)}
                    >
                      <div>
                        <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          Category
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-2">{cat.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{cat.description || 'Test your knowledge'}</p>
                      </div>
                      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-lg transition">
                        Start Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <span className="text-xs font-bold uppercase text-blue-600">Active Test</span>
                    <h4 className="text-base font-bold text-slate-900">{selectedCategory.name}</h4>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                  >
                    Change Category
                  </button>
                </div>

                {loadingQuiz ? (
                  <div className="text-center py-10 text-sm text-slate-500">Loading questions...</div>
                ) : examResult ? (
                  /* SCORECARD */
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                    <div className="text-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Exam Results</span>
                      <h3 className="text-3xl font-extrabold text-blue-600 mt-1">
                        {examResult.score} / {examResult.total}
                      </h3>
                      <div className="text-sm font-semibold text-slate-700 mt-1">
                        Score: {examResult.percentage}%
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Answer Review</h4>
                      {examResult.breakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border text-xs ${
                            item.is_correct
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="font-bold mb-1">
                            Q{idx + 1}: {item.question}
                          </div>
                          <div className="flex gap-4 text-[11px]">
                            <span>Your Answer: <strong>{item.chosen || 'Not Answered'}</strong></span>
                            <span>Correct Answer: <strong>{item.correct}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => { setSelectedCategory(null); setExamResult(null); }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition"
                    >
                      Back to Test Categories
                    </button>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No questions currently available in this category.
                  </div>
                ) : (
                  /* QUESTIONS FORM */
                  <div className="space-y-6">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                        <div className="text-xs font-bold text-slate-700">
                          Question {idx + 1} of {questions.length}
                        </div>
                        <p className="text-sm font-medium text-slate-900">{q.question_text}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {['A', 'B', 'C', 'D'].map((opt) => {
                            const optKey = `option_${opt.toLowerCase()}`;
                            const isSelected = selectedAnswers[q.id] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt })}
                                className={`p-3 rounded-lg border text-left text-xs transition flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
                                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                  isSelected ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {opt}
                                </span>
                                <span>{q[optKey]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleSubmitExam}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition"
                      >
                        Submit Exam
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. DOCUMENTS & CERTIFICATES (VOICE NOTE 2) */}
        {/* ======================================================== */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-blue-600" />
                  <span>Official Internship Documents (PDF)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Voice Note 2: Auto-generated official documents. Enabled once verified and granted by Admin.
                </p>
              </div>

              <button
                onClick={() => loadLatestProfile(false)}
                disabled={refreshingProfile}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingProfile ? 'animate-spin text-blue-600' : ''}`} />
                <span>{refreshingProfile ? 'Checking...' : 'Refresh Status'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Offer Letter Card */}
              <div className="p-6 border border-slate-200 rounded-2xl bg-gradient-to-b from-white to-blue-50/20 flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Appointment Document
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        profile.offer_letter_approved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {profile.offer_letter_approved ? '✓ Granted & Ready' : '⏳ Pending Admin Approval'}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">Internship Offer Letter</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Official offer letter confirming your placement as an intern in <strong>{profile.technology}</strong> for {profile.internship_duration_months} months at Ati Technologies.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  {profile.offer_letter_approved ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={api.getOfferLetterUrl(profile.id, false)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </a>
                      <a
                        href={api.getOfferLetterUrl(profile.id, true)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview</span>
                      </a>
                    </div>
                  ) : (
                    <div className="bg-slate-100 text-slate-500 text-center py-3 rounded-xl text-xs font-medium">
                      Admin has not approved your offer letter yet. Once approved, the download button activates immediately.
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Card */}
              <div className="p-6 border border-slate-200 rounded-2xl bg-gradient-to-b from-white to-emerald-50/20 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      Completion Document
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        profile.certificate_approved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {profile.certificate_approved ? '✓ Granted & Ready' : '⏳ Pending Admin Approval'}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">Internship Completion Certificate</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Official verified certificate with organization seal and signatures confirming completion of your internship tenure in <strong>{profile.technology}</strong>.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  {profile.certificate_approved ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={api.getCertificateUrl(profile.id, false)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </a>
                      <a
                        href={api.getCertificateUrl(profile.id, true)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview</span>
                      </a>
                    </div>
                  ) : (
                    <div className="bg-slate-100 text-slate-500 text-center py-3 rounded-xl text-xs font-medium">
                      Admin has not released your certificate yet. Released upon completing the {profile.internship_duration_months}-month tenure.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Break / Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-1">Pause Work Session</h3>
            <p className="text-xs text-slate-500 mb-4">Select reason for pausing the clock-in timer:</p>

            <div className="space-y-2 mb-4">
              {['Lunch Break', 'Water / Tea Break', 'Meeting / Discussion', 'Personal Break'].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setPauseReason(reason)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    pauseReason === reason
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPauseModal(false)}
                className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPause}
                className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL (EXACT SAME VALIDATIONS AS REGISTRATION) */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Edit Profile Details</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your contact and academic information
                </p>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form noValidate onSubmit={handleSaveProfile} className="p-6 space-y-3.5 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className={`w-4 h-4 absolute left-3 top-2.5 ${profileFieldErrors.full_name ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={editProfileData.full_name}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      updateProfileField('full_name', val);
                    }}
                    onBlur={() => handleProfileBlur('full_name')}
                    placeholder="e.g. Aryan Patel"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      profileFieldErrors.full_name
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {profileFieldErrors.full_name && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{profileFieldErrors.full_name}</span>
                  </p>
                )}
              </div>

              {/* Mobile Number & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className={`w-4 h-4 absolute left-3 top-2.5 ${profileFieldErrors.mobile_number ? 'text-rose-500' : 'text-slate-400'}`} />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={editProfileData.mobile_number}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        updateProfileField('mobile_number', val);
                      }}
                      onBlur={() => handleProfileBlur('mobile_number')}
                      placeholder="9876543210"
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-mono tracking-wider transition ${
                        profileFieldErrors.mobile_number
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {profileFieldErrors.mobile_number && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{profileFieldErrors.mobile_number}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email ID *</label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3 top-2.5 ${profileFieldErrors.email ? 'text-rose-500' : 'text-slate-400'}`} />
                    <input
                      type="email"
                      value={editProfileData.email}
                      onChange={(e) => updateProfileField('email', e.target.value.trim())}
                      onBlur={() => handleProfileBlur('email')}
                      placeholder="student@example.com"
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
                        profileFieldErrors.email
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {profileFieldErrors.email && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{profileFieldErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* College & University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College Name *</label>
                  <div className="relative">
                    <School className={`w-4 h-4 absolute left-3 top-2.5 ${profileFieldErrors.college_name ? 'text-rose-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={editProfileData.college_name}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.,&()'-]/g, '');
                        updateProfileField('college_name', val);
                      }}
                      onBlur={() => handleProfileBlur('college_name')}
                      placeholder="e.g. Silver Oak College"
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                        profileFieldErrors.college_name
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {profileFieldErrors.college_name && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{profileFieldErrors.college_name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">University *</label>
                  <div className="relative">
                    <GraduationCap className={`w-4 h-4 absolute left-3 top-2.5 ${profileFieldErrors.university ? 'text-rose-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={editProfileData.university}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.,&()'-]/g, '');
                        updateProfileField('university', val);
                      }}
                      onBlur={() => handleProfileBlur('university')}
                      placeholder="e.g. Gujarat Technological University"
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                        profileFieldErrors.university
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {profileFieldErrors.university && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{profileFieldErrors.university}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Technology / Domain */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technology / Domain *</label>
                <div className="relative">
                  <Code2 className={`w-4 h-4 absolute left-3 top-2.5 ${profileFieldErrors.technology ? 'text-rose-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={editProfileData.technology}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\s/+#.-]/g, '');
                      updateProfileField('technology', val);
                    }}
                    onBlur={() => handleProfileBlur('technology')}
                    placeholder="e.g. AI/ML, Python, Full Stack"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-medium transition ${
                      profileFieldErrors.technology
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-slate-800'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {profileFieldErrors.technology && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{profileFieldErrors.technology}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
