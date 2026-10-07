import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  LayoutDashboard, Users, Clock, FileText, BookOpen, Award,
  CheckCircle2, XCircle, Search, Filter, Download, Plus, Check,
  ChevronRight, AlertCircle, ArrowUpRight, GraduationCap, Building2,
  Calendar, UserCheck, ShieldAlert, Sparkles, RefreshCw, Eye, Edit, X,
  Bell, Send, Megaphone, Trash2, User, Mail, Phone, School, Code2, AlertTriangle,
  UploadCloud, Paperclip, ArrowLeft,
  AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import WordRibbonEditor from './WordRibbonEditor';

export default function AdminPortal() {
  const navigate = useNavigate();
  const { studentId: routeStudentId } = useParams();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'approvals', 'attendance', 'documents', 'notes', 'mcq'
  
  // Students List
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [filterApproval, setFilterApproval] = useState('all'); // 'all', 'pending', 'approved'
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Attendance & Reports Monitor (Filtered by Month & Student)
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [attendanceDailyReport, setAttendanceDailyReport] = useState({ summary: {}, daily_records: [] });
  const [attendanceViewMode, setAttendanceViewMode] = useState('register'); // 'register', 'sessions', 'reports'
  const [filterAttendanceStatus, setFilterAttendanceStatus] = useState('all'); // 'all', 'present', 'absent', 'weekend', 'upcoming'
  const [filterMonth, setFilterMonth] = useState('2026-10');
  const [filterStudentId, setFilterStudentId] = useState('');
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceSortAsc, setAttendanceSortAsc] = useState(false); // false = latest date first
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // Subject Allocation & Notes
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: '', category: 'Web Tech', description: '' });
  const [allocData, setAllocData] = useState({ student_id: '', subject_id: '' });
  const [newNote, setNewNote] = useState({ subject_id: '', title: '', content: '' });
  const [noteFile, setNoteFile] = useState(null);
  const [uploadingNote, setUploadingNote] = useState(false);
  const [allNotes, setAllNotes] = useState([]);

  // MCQ Management
  const [mcqCategories, setMCQCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newQuestion, setNewQuestion] = useState({
    category_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A'
  });
  const [examResults, setExamResults] = useState([]);

  // News & Announcements
  const [newsList, setNewsList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    target_technology: 'ALL',
  });
  const [postingNews, setPostingNews] = useState(false);

  // Holidays & Festivals Management State
  const [holidaysList, setHolidaysList] = useState([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHolidayData, setNewHolidayData] = useState({
    date: '2026-10-02',
    name: '',
    holiday_type: 'FESTIVAL',
    is_day_off: true,
    description: '',
  });
  const [savingHoliday, setSavingHoliday] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadStudents();
    loadSubjects();
    loadMCQCategories();
    loadAllNotes();
    loadExamResults();
    loadAttendanceAndReports();
    loadNews();
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const data = await api.getHolidays();
      setHolidaysList(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newHolidayData.date) {
      errors.date = 'Holiday date is required';
    }
    if (!newHolidayData.name || !newHolidayData.name.trim()) {
      errors.name = 'Festival / Holiday name is required (letters only)';
    }
    if (Object.keys(errors).length > 0) {
      setHolidayErrors(errors);
      return;
    }
    setHolidayErrors({});
    setSavingHoliday(true);
    try {
      await api.createHoliday(newHolidayData);
      showStatus('✓ Holiday / Festival saved successfully!');
      setNewHolidayData({
        date: '',
        name: '',
        holiday_type: 'FESTIVAL',
        is_day_off: true,
        description: '',
      });
      setHolidayErrors({});
      loadHolidays();
      loadAttendanceAndReports();
    } catch (e) {
      alert('Failed to save holiday.');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Delete this festival / holiday?')) return;
    try {
      await api.deleteHoliday(id);
      showStatus('✓ Holiday deleted successfully.');
      loadHolidays();
      loadAttendanceAndReports();
    } catch (e) {
      alert('Failed to delete holiday.');
    }
  };

  useEffect(() => {
    if (activeTab === 'attendance' || activeTab === 'overview') {
      loadAttendanceAndReports();
    } else if (activeTab === 'notes') {
      loadAllNotes();
    } else if (activeTab === 'mcq') {
      loadExamResults();
    } else if (activeTab === 'news') {
      loadNews();
    }
  }, [activeTab, filterMonth, filterStudentId]);

  const showStatus = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleVerifyStudent = async (studentId, action) => {
    try {
      const res = await api.verifyStudent(studentId, action);
      showStatus(`✓ ${res.message}`);
      loadStudents();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleToggleDoc = async (studentId, docType, approved) => {
    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            [docType === 'offer_letter' ? 'offer_letter_approved' : 'certificate_approved']: approved,
          };
        }
        return s;
      })
    );

    try {
      const res = await api.toggleDocumentApproval(studentId, docType, approved);
      showStatus(`✓ ${res.message || 'Document status updated successfully!'}`);
      loadStudents();
    } catch (err) {
      alert('Document toggle failed');
      loadStudents();
    }
  };

  // Edit Offer Letter Modal State

  // Edit Offer Letter Modal State (Full Admin Edit Options - Unified Single Page)
  const [editingOfferStudent, setEditingOfferStudent] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    full_name: '',
    offer_letter_salutation: 'Mr.',
    offer_letter_pronoun: 'he',
    offer_letter_ref_no: '',
    offer_letter_title: 'INTERNSHIP OFFER LETTER',
    technology: '',
    offer_letter_role: '',
    offer_letter_company_name: 'Akash Technolabs',
    offer_letter_location: 'Ahmedabad, Gujarat',
    offer_letter_work_mode: 'On-Site',
    offer_letter_working_hours: '10:00 AM - 06:00 PM',
    offer_letter_stipend: 'Unpaid Internship (Academic Project)',
    offer_letter_issue_date: '',
    offer_letter_start_date: '',
    offer_letter_end_date: '',
    internship_duration_months: 6,
    offer_letter_full_body: '',
    offer_letter_p1: '',
    offer_letter_p2: '',
    offer_letter_p3: '',
    offer_letter_p4: '',
    offer_letter_custom_text: '',
    offer_letter_signoff: 'Sincerely',
    offer_letter_show_stamp: true,
    offer_letter_signatory_name: 'Akash Padhiyar',
    offer_letter_signatory_role: 'CEO',
    offer_letter_stamp_alignment: 'right',
    offer_letter_stamp_spacing: 'standard',
  });
  const [savingOfferLetter, setSavingOfferLetter] = useState(false);

  // Completion Certificate Edit State (same to same as Offer Letter)
  const [editingCertStudent, setEditingCertStudent] = useState(null);
  const [certFormData, setCertFormData] = useState({
    full_name: '',
    college_name: '',
    university: '',
    technology: '',
    internship_duration_months: 6,
    certificate_program_title: '',
    certificate_issue_date: '',
    certificate_start_date: '',
    certificate_end_date: '',
    certificate_custom_text: '',
    certificate_signatory_name: 'Akash Padhiyar',
    certificate_signatory_role: 'CEO, Akash Technolabs',
    certificate_signatory_two_name: 'Director of Technical Training',
    certificate_signatory_two_role: 'Akash Technolabs',
  });
  const [savingCertificate, setSavingCertificate] = useState(false);

  // Admin Edit Student Profile State (same validations as registration)
  const [editingProfileStudent, setEditingProfileStudent] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    college_name: '',
    university: '',
    technology: '',
    is_approved: false
  });
  const [adminProfileErrors, setAdminProfileErrors] = useState({});
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);

  // Admin Add Student Modal State (same validations as registration)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    college_name: '',
    university: '',
    technology: '',
    username: '',
    password: ''
  });
  const [addStudentErrors, setAddStudentErrors] = useState({});
  const [creatingStudent, setCreatingStudent] = useState(false);

  // General Form Errors
  const [holidayErrors, setHolidayErrors] = useState({});
  const [newsErrors, setNewsErrors] = useState({});
  const [subjectErrors, setSubjectErrors] = useState({});
  const [allocErrors, setAllocErrors] = useState({});
  const [noteErrors, setNoteErrors] = useState({});

  const validateStudentForm = (field, value) => {
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
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email (e.g. name@example.com)';
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

  const handleOpenEditStudent = (s) => {
    setEditingProfileStudent(s);
    setProfileFormData({
      full_name: s.full_name || '',
      mobile_number: s.mobile_number || '',
      email: s.email || '',
      college_name: s.college_name || '',
      university: s.university || '',
      technology: s.technology || '',
      is_approved: Boolean(s.is_approved)
    });
    setAdminProfileErrors({});
  };

  const updateAdminProfileField = (field, val) => {
    setProfileFormData(prev => ({ ...prev, [field]: val }));
    if (adminProfileErrors[field]) {
      const err = validateStudentForm(field, val);
      setAdminProfileErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleAdminProfileBlur = (field) => {
    const err = validateStudentForm(field, profileFormData[field]);
    if (err) {
      setAdminProfileErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    const fields = ['full_name', 'mobile_number', 'email', 'college_name', 'university', 'technology'];
    const errors = {};
    fields.forEach(f => {
      const err = validateStudentForm(f, profileFormData[f]);
      if (err) errors[f] = err;
    });

    if (Object.keys(errors).length > 0) {
      setAdminProfileErrors(errors);
      return;
    }

    setSavingAdminProfile(true);
    try {
      const res = await api.updateStudentProfile(editingProfileStudent.id, profileFormData);
      if (res.ok && res.data.student) {
        showStatus('✓ Student profile updated successfully!');
        setEditingProfileStudent(null);
        loadStudents();
      } else {
        const beErrors = {};
        if (typeof res.data === 'object') {
          Object.entries(res.data).forEach(([k, v]) => {
            beErrors[k] = Array.isArray(v) ? v.join(', ') : String(v);
          });
        }
        setAdminProfileErrors(beErrors);
      }
    } catch (err) {
      alert('Failed to update student profile.');
    } finally {
      setSavingAdminProfile(false);
    }
  };

  const handleOpenAddStudent = () => {
    setNewStudentData({
      full_name: '',
      mobile_number: '',
      email: '',
      college_name: '',
      university: '',
      technology: '',
      username: '',
      password: ''
    });
    setAddStudentErrors({});
    setShowAddStudentModal(true);
  };

  const updateAddStudentField = (field, val) => {
    setNewStudentData(prev => ({ ...prev, [field]: val }));
    if (addStudentErrors[field]) {
      const err = validateStudentForm(field, val);
      setAddStudentErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleAddStudentBlur = (field) => {
    const err = validateStudentForm(field, newStudentData[field]);
    if (err) {
      setAddStudentErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleCreateStudentSubmit = async (e) => {
    e.preventDefault();
    const fields = ['full_name', 'mobile_number', 'email', 'college_name', 'university', 'technology', 'username', 'password'];
    const errors = {};
    fields.forEach(f => {
      const err = validateStudentForm(f, newStudentData[f]);
      if (err) errors[f] = err;
    });

    if (Object.keys(errors).length > 0) {
      setAddStudentErrors(errors);
      return;
    }

    setCreatingStudent(true);
    try {
      const res = await api.register(newStudentData);
      if (res && res.profile) {
        await api.verifyStudent(res.profile.id, 'approve');
        showStatus('✓ Student registered and approved successfully!');
        setShowAddStudentModal(false);
        loadStudents();
      } else {
        const beErrors = {};
        if (typeof res === 'object') {
          Object.entries(res).forEach(([k, v]) => {
            beErrors[k] = Array.isArray(v) ? v.join(', ') : String(v);
          });
        }
        setAddStudentErrors(beErrors);
      }
    } catch (err) {
      alert('Failed to create student.');
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleOpenEditOfferLetter = (s) => {
    setEditingOfferStudent(s);

    const startD = s.offer_letter_start_date || s.internship_start_date || new Date().toISOString().split('T')[0];
    const durationM = s.internship_duration_months || 6;
    let endD = s.offer_letter_end_date || '';
    if (!endD && startD) {
      try {
        const d = new Date(startD);
        d.setMonth(d.getMonth() + Number(durationM));
        endD = d.toISOString().split('T')[0];
      } catch (e) {}
    }

    const salut = s.offer_letter_salutation || (s.full_name?.startsWith('Ms.') || s.full_name?.startsWith('Mrs.') ? 'Ms.' : 'Mr.');
    const pronoun = s.offer_letter_pronoun || (salut === 'Ms.' || salut === 'Mrs.' ? 'she' : 'he');
    const refNo = s.offer_letter_ref_no || `ATI/INT/${new Date().getFullYear()}/${String(s.id).padStart(4, '0')}`;
    const tech = s.technology || 'AI/ML';
    const roleTitle = s.offer_letter_role || `${tech} Intern`;
    const comp = s.offer_letter_company_name || 'Akash Technolabs';
    const candTitle = `${salut} ${s.full_name || 'Intern'}`.trim();
    const subjCap = pronoun === 'he' ? 'He' : (pronoun === 'she' ? 'She' : 'They');
    const subjLow = pronoun;
    const possCap = pronoun === 'he' ? 'His' : (pronoun === 'she' ? 'Her' : 'Their');
    const possLow = pronoun === 'he' ? 'his' : (pronoun === 'she' ? 'her' : 'their');
    const obj = pronoun === 'he' ? 'him' : (pronoun === 'she' ? 'her' : 'them');
    const verbBe = (pronoun === 'he' || pronoun === 'she') ? 'is' : 'are';

    const startStr = startD
      ? new Date(startD).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'commencement date';
    const endStr = endD
      ? new Date(endD).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'completion date';

    let initialFullBody = (s.offer_letter_full_body || '').trim();
    if (!initialFullBody) {
      const p1 = (s.offer_letter_p1 || `This is to inform that ${candTitle} has been selected for an internship at ${comp} as a ${roleTitle}. ${possCap} internship will commence on ${startStr} and continue until ${endStr}.`).trim();
      const p2 = (s.offer_letter_p2 || s.offer_letter_custom_text || `During the internship period, ${subjLow} will work on ${tech} technology and will be involved in projects and assignments designed to enhance ${possLow} technical knowledge and practical skills. ${subjCap} ${verbBe} expected to maintain a professional attitude, follow the company's policies and guidelines, and perform ${possLow} assigned responsibilities with sincerity and dedication throughout the internship.`).trim();
      const p3 = (s.offer_letter_p3 || `Upon successful completion of the internship, ${subjLow} will be awarded an Internship Completion Certificate based on ${possLow} performance and adherence to the company's rules and regulations.`).trim();
      const p4 = (s.offer_letter_p4 || `We are pleased to welcome ${obj} to ${comp} and wish ${obj} a successful and enriching internship experience.`).trim();
      initialFullBody = [p1, p2, p3, p4].join('\n\n');
    }

    setOfferFormData({
      full_name: s.full_name || '',
      offer_letter_salutation: salut,
      offer_letter_pronoun: pronoun,
      offer_letter_ref_no: refNo,
      offer_letter_title: s.offer_letter_title || 'INTERNSHIP OFFER LETTER',
      technology: tech,
      offer_letter_role: roleTitle,
      offer_letter_company_name: comp,
      offer_letter_location: s.offer_letter_location || 'Ahmedabad, Gujarat',
      offer_letter_work_mode: s.offer_letter_work_mode || 'On-Site',
      offer_letter_working_hours: s.offer_letter_working_hours || '10:00 AM - 06:00 PM',
      offer_letter_stipend: s.offer_letter_stipend || 'Unpaid Internship (Academic Project)',
      offer_letter_issue_date: s.offer_letter_issue_date || (s.approved_at ? s.approved_at.split('T')[0] : new Date().toISOString().split('T')[0]),
      offer_letter_start_date: startD,
      offer_letter_end_date: endD,
      internship_duration_months: durationM,
      offer_letter_full_body: initialFullBody,
      offer_letter_p1: s.offer_letter_p1 || '',
      offer_letter_p2: s.offer_letter_p2 || s.offer_letter_custom_text || '',
      offer_letter_p3: s.offer_letter_p3 || '',
      offer_letter_p4: s.offer_letter_p4 || '',
      offer_letter_custom_text: s.offer_letter_p2 || s.offer_letter_custom_text || '',
      offer_letter_signoff: s.offer_letter_signoff || 'Sincerely',
      offer_letter_show_stamp: s.offer_letter_show_stamp !== false,
      offer_letter_signatory_name: s.offer_letter_signatory_name || 'Akash Padhiyar',
      offer_letter_signatory_role: s.offer_letter_signatory_role || 'CEO',
      offer_letter_stamp_alignment: s.offer_letter_stamp_alignment || 'right',
      offer_letter_stamp_spacing: s.offer_letter_stamp_spacing || 'standard',
      // Graphic assets & toggles
      offer_letter_show_header: s.offer_letter_show_header !== false,
      offer_letter_header_image_url: s.offer_letter_header_image_url || '',
      offer_letter_header_file: null,
      offer_letter_show_footer: s.offer_letter_show_footer !== false,
      offer_letter_footer_image_url: s.offer_letter_footer_image_url || '',
      offer_letter_footer_text: s.offer_letter_footer_text || '',
      offer_letter_footer_file: null,
      offer_letter_show_watermark: s.offer_letter_show_watermark !== false,
      offer_letter_bg_image_url: s.offer_letter_bg_image_url || '',
      offer_letter_bg_file: null,
      offer_letter_stamp_image_url: s.offer_letter_stamp_image_url || '',
      offer_letter_stamp_file: null,
    });
  };

  useEffect(() => {
    if (routeStudentId && students.length > 0) {
      const target = students.find((s) => String(s.id) === String(routeStudentId));
      if (target) {
        if (!editingOfferStudent || editingOfferStudent.id !== target.id) {
          handleOpenEditOfferLetter(target);
        }
      }
    } else if (!routeStudentId && editingOfferStudent) {
      setEditingOfferStudent(null);
    }
  }, [routeStudentId, students]);

  const handleRecalculateEndDate = (startVal, durationVal) => {
    const sDate = startVal || offerFormData.offer_letter_start_date;
    const dVal = durationVal !== undefined ? durationVal : offerFormData.internship_duration_months;
    if (!sDate) return;
    try {
      const d = new Date(sDate);
      d.setMonth(d.getMonth() + Number(dVal));
      const endFormatted = d.toISOString().split('T')[0];
      setOfferFormData((prev) => ({ ...prev, offer_letter_end_date: endFormatted }));
    } catch (e) {}
  };

  const handleApplyOfferTemplate = (templateType) => {
    const name = offerFormData.full_name || 'Intern';
    const salut = offerFormData.offer_letter_salutation || 'Mr.';
    const candTitle = `${salut} ${name}`.trim();
    const tech = offerFormData.technology || 'AI/ML';
    const comp = offerFormData.offer_letter_company_name || 'Akash Technolabs';
    const pro = offerFormData.offer_letter_pronoun || 'he';
    const subjCap = pro === 'he' ? 'He' : (pro === 'she' ? 'She' : 'They');
    const subjLow = pro;
    const possCap = pro === 'he' ? 'His' : (pro === 'she' ? 'Her' : 'Their');
    const possLow = pro === 'he' ? 'his' : (pro === 'she' ? 'her' : 'their');
    const obj = pro === 'he' ? 'him' : (pro === 'she' ? 'her' : 'them');
    const verbBe = (pro === 'he' || pro === 'she') ? 'is' : 'are';
    const startD = offerFormData.offer_letter_start_date
      ? new Date(offerFormData.offer_letter_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'commencement date';
    const endD = offerFormData.offer_letter_end_date
      ? new Date(offerFormData.offer_letter_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'completion date';

    if (templateType === 'standard') {
      const fullText = `This is to inform that ${candTitle} has been selected for an internship at ${comp} as a ${tech} Intern. ${possCap} internship will commence on ${startD} and continue until ${endD}.

During the internship period, ${subjLow} will work on ${tech} technology and will be involved in projects and assignments designed to enhance ${possLow} technical knowledge and practical skills. ${subjCap} ${verbBe} expected to maintain a professional attitude, follow the company's policies and guidelines, and perform ${possLow} assigned responsibilities with sincerity and dedication throughout the internship.

Upon successful completion of the internship, ${subjLow} will be awarded an Internship Completion Certificate based on ${possLow} performance and adherence to the company's rules and regulations.

We are pleased to welcome ${obj} to ${comp} and wish ${obj} a successful and enriching internship experience.`;

      setOfferFormData((prev) => ({
        ...prev,
        offer_letter_role: `${tech} Intern`,
        offer_letter_full_body: fullText,
        offer_letter_stipend: 'Unpaid Internship (Academic Project)',
      }));
    } else if (templateType === 'aiml') {
      const fullText = `This is to inform that ${candTitle} has been selected for an internship at ${comp} as an AI/ML & Data Science Intern. ${possCap} internship tenure will commence on ${startD} and conclude on ${endD}.

During the internship tenure, ${subjLow} will work closely with the AI/ML engineering team on machine learning pipelines, deep learning models, data preprocessing, and model deployment. ${subjCap} will participate in agile sprints, project reviews, and maintain code quality adhering to Akash Technolabs standards.

Upon successful completion of the project milestone evaluations, ${subjLow} will receive a verified Internship Completion Certificate and letter of recommendation.

We welcome ${obj} to the Akash Technolabs AI team and wish ${obj} extraordinary success in building innovative intelligent applications.`;

      setOfferFormData((prev) => ({
        ...prev,
        technology: 'AI/ML',
        offer_letter_role: 'AI/ML & Data Science Intern',
        offer_letter_full_body: fullText,
      }));
    } else if (templateType === 'fullstack') {
      const fullText = `This is to inform that ${candTitle} has been selected for an internship at ${comp} as a Full Stack Developer Intern. ${possCap} tenure will commence on ${startD} and continue until ${endD}.

During the internship period, ${subjLow} will contribute to modern web applications using frontend (React, Tailwind CSS) and backend (Django REST / Node.js) architectures. ${subjCap} will be mentored on database design, RESTful APIs, and responsive user interfaces while adhering to professional industry coding guidelines.

Upon successful completion of the internship and project deliverables, ${subjLow} will be awarded an Internship Completion Certificate validating practical software engineering experience.

We are excited to welcome ${obj} to our software development division and look forward to ${possLow} contributions.`;

      setOfferFormData((prev) => ({
        ...prev,
        technology: 'Full Stack',
        offer_letter_role: 'Full Stack Developer Intern',
        offer_letter_full_body: fullText,
      }));
    } else if (templateType === 'mobile') {
      const fullText = `This is to inform that ${candTitle} has been selected for an internship at ${comp} as a Mobile Application Developer Intern commencing on ${startD} and concluding on ${endD}.

During the internship period, ${subjLow} will be actively involved in cross-platform mobile application development, UI/UX implementation, API integration, and performance optimization on Android and iOS frameworks under the guidance of senior technical leads.

Upon successful tenure completion and app release demonstration, ${subjLow} will be awarded an official Internship Completion Certificate.

We look forward to ${possLow} active participation and wish ${obj} a productive mobile development tenure with Akash Technolabs.`;

      setOfferFormData((prev) => ({
        ...prev,
        technology: 'Flutter / React Native',
        offer_letter_role: 'Mobile Application Developer Intern',
        offer_letter_full_body: fullText,
      }));
    } else if (templateType === 'paid') {
      setOfferFormData((prev) => {
        let cur = prev.offer_letter_full_body || '';
        const stipendLine = `A monthly stipend of ₹10,000 will be provided upon satisfactory completion of assigned deliverables and monthly attendance criteria.`;
        if (!cur.includes('stipend')) {
          cur = `${cur}\n\n${stipendLine}`;
        }
        return {
          ...prev,
          offer_letter_stipend: 'Stipend: ₹10,000 / Month (Performance Incentives)',
          offer_letter_full_body: cur,
        };
      });
    }
  };

  const handleResetOfferDefaults = () => {
    if (!window.confirm('Reset offer letter to official default Akash Technolabs template?')) return;
    const name = offerFormData.full_name || 'Intern';
    const salut = offerFormData.offer_letter_salutation || 'Mr.';
    const candTitle = `${salut} ${name}`.trim();
    const tech = offerFormData.technology || 'AI/ML';
    const comp = 'Akash Technolabs';
    const pro = offerFormData.offer_letter_pronoun || 'he';
    const subjCap = pro === 'he' ? 'He' : (pro === 'she' ? 'She' : 'They');
    const subjLow = pro;
    const possCap = pro === 'he' ? 'His' : (pro === 'she' ? 'Her' : 'Their');
    const possLow = pro === 'he' ? 'his' : (pro === 'she' ? 'her' : 'their');
    const obj = pro === 'he' ? 'him' : (pro === 'she' ? 'her' : 'them');
    const verbBe = (pro === 'he' || pro === 'she') ? 'is' : 'are';
    const startD = offerFormData.offer_letter_start_date
      ? new Date(offerFormData.offer_letter_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'commencement date';
    const endD = offerFormData.offer_letter_end_date
      ? new Date(offerFormData.offer_letter_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'completion date';

    const defaultBody = `This is to inform that ${candTitle} has been selected for an internship at ${comp} as a ${tech} Intern. ${possCap} internship will commence on ${startD} and continue until ${endD}.

During the internship period, ${subjLow} will work on ${tech} technology and will be involved in projects and assignments designed to enhance ${possLow} technical knowledge and practical skills. ${subjCap} ${verbBe} expected to maintain a professional attitude, follow the company's policies and guidelines, and perform ${possLow} assigned responsibilities with sincerity and dedication throughout the internship.

Upon successful completion of the internship, ${subjLow} will be awarded an Internship Completion Certificate based on ${possLow} performance and adherence to the company's rules and regulations.

We are pleased to welcome ${obj} to ${comp} and wish ${obj} a successful and enriching internship experience.`;

    setOfferFormData((prev) => ({
      ...prev,
      offer_letter_title: 'INTERNSHIP OFFER LETTER',
      offer_letter_company_name: 'Akash Technolabs',
      offer_letter_location: 'Ahmedabad, Gujarat',
      offer_letter_work_mode: 'On-Site',
      offer_letter_working_hours: '10:00 AM - 06:00 PM',
      offer_letter_stipend: 'Unpaid Internship (Academic Project)',
      offer_letter_full_body: defaultBody,
      offer_letter_p1: '',
      offer_letter_p2: '',
      offer_letter_p3: '',
      offer_letter_p4: '',
      offer_letter_custom_text: '',
      offer_letter_signoff: 'Sincerely',
      offer_letter_show_stamp: true,
      offer_letter_signatory_name: 'Akash Padhiyar',
      offer_letter_signatory_role: 'CEO',
      offer_letter_show_header: true,
      offer_letter_header_file: 'reset',
      offer_letter_header_image_url: '',
      offer_letter_show_footer: true,
      offer_letter_footer_file: 'reset',
      offer_letter_footer_image_url: '',
      offer_letter_footer_text: '',
      offer_letter_show_watermark: true,
      offer_letter_bg_file: 'reset',
      offer_letter_bg_image_url: '',
      offer_letter_stamp_file: 'reset',
      offer_letter_stamp_image_url: '',
    }));
  };

  const handleSaveOfferLetter = async (approveAlso = false, stayOnPage = false) => {
    if (!editingOfferStudent) return;
    setSavingOfferLetter(true);
    try {
      const paras = (offerFormData.offer_letter_full_body || '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append('full_name', offerFormData.full_name || '');
      formData.append('offer_letter_salutation', offerFormData.offer_letter_salutation || '');
      formData.append('offer_letter_pronoun', offerFormData.offer_letter_pronoun || 'he');
      formData.append('offer_letter_ref_no', offerFormData.offer_letter_ref_no || '');
      formData.append('offer_letter_title', offerFormData.offer_letter_title || 'INTERNSHIP OFFER LETTER');
      formData.append('technology', offerFormData.technology || '');
      formData.append('offer_letter_role', offerFormData.offer_letter_role || '');
      formData.append('offer_letter_company_name', offerFormData.offer_letter_company_name || 'Akash Technolabs');
      formData.append('offer_letter_location', offerFormData.offer_letter_location || 'Ahmedabad, Gujarat');
      formData.append('offer_letter_work_mode', offerFormData.offer_letter_work_mode || 'On-Site');
      formData.append('offer_letter_working_hours', offerFormData.offer_letter_working_hours || '10:00 AM - 06:00 PM');
      formData.append('offer_letter_stipend', offerFormData.offer_letter_stipend || '');
      formData.append('offer_letter_issue_date', offerFormData.offer_letter_issue_date || '');
      formData.append('offer_letter_start_date', offerFormData.offer_letter_start_date || '');
      formData.append('offer_letter_end_date', offerFormData.offer_letter_end_date || '');
      formData.append('internship_duration_months', offerFormData.internship_duration_months || 6);

      formData.append('offer_letter_full_body', offerFormData.offer_letter_full_body || '');
      formData.append('offer_letter_p1', paras[0] || '');
      formData.append('offer_letter_p2', paras[1] || '');
      formData.append('offer_letter_custom_text', paras[1] || '');
      formData.append('offer_letter_p3', paras[2] || '');
      formData.append('offer_letter_p4', paras[3] || '');

      formData.append('offer_letter_signoff', offerFormData.offer_letter_signoff || 'Sincerely');
      formData.append('offer_letter_signatory_name', offerFormData.offer_letter_signatory_name || 'Akash Padhiyar');
      formData.append('offer_letter_signatory_role', offerFormData.offer_letter_signatory_role || 'CEO');
      formData.append('offer_letter_stamp_alignment', offerFormData.offer_letter_stamp_alignment || 'right');
      formData.append('offer_letter_stamp_spacing', offerFormData.offer_letter_stamp_spacing || 'standard');

      // Graphic toggles & text
      formData.append('offer_letter_show_header', offerFormData.offer_letter_show_header ? 'true' : 'false');
      formData.append('offer_letter_show_footer', offerFormData.offer_letter_show_footer ? 'true' : 'false');
      formData.append('offer_letter_footer_text', offerFormData.offer_letter_footer_text || '');
      formData.append('offer_letter_show_watermark', offerFormData.offer_letter_show_watermark ? 'true' : 'false');
      formData.append('offer_letter_show_stamp', offerFormData.offer_letter_show_stamp ? 'true' : 'false');

      // Graphic image files / resets
      if (offerFormData.offer_letter_header_file instanceof File) {
        formData.append('offer_letter_header_image', offerFormData.offer_letter_header_file);
      } else if (offerFormData.offer_letter_header_file === 'reset') {
        formData.append('offer_letter_header_image', 'reset');
      }

      if (offerFormData.offer_letter_footer_file instanceof File) {
        formData.append('offer_letter_footer_image', offerFormData.offer_letter_footer_file);
      } else if (offerFormData.offer_letter_footer_file === 'reset') {
        formData.append('offer_letter_footer_image', 'reset');
      }

      if (offerFormData.offer_letter_bg_file instanceof File) {
        formData.append('offer_letter_bg_image', offerFormData.offer_letter_bg_file);
      } else if (offerFormData.offer_letter_bg_file === 'reset') {
        formData.append('offer_letter_bg_image', 'reset');
      }

      if (offerFormData.offer_letter_stamp_file instanceof File) {
        formData.append('offer_letter_stamp_image', offerFormData.offer_letter_stamp_file);
      } else if (offerFormData.offer_letter_stamp_file === 'reset') {
        formData.append('offer_letter_stamp_image', 'reset');
      }

      if (approveAlso) {
        formData.append('approve', 'true');
      }

      const res = await api.updateOfferLetter(editingOfferStudent.id, formData);
      showStatus(`✓ ${res.message || 'Offer letter updated successfully!'}`);
      if (!stayOnPage) {
        setEditingOfferStudent(null);
        navigate('/admin');
      }
      loadStudents();
      return res;
    } catch (err) {
      alert('Failed to update offer letter.');
      throw err;
    } finally {
      setSavingOfferLetter(false);
    }
  };

  const handleOpenEditCertificate = (s) => {
    setEditingCertStudent(s);
    setCertFormData({
      full_name: s.full_name || '',
      college_name: s.college_name || '',
      university: s.university || '',
      technology: s.technology || '',
      internship_duration_months: s.internship_duration_months || 6,
      certificate_program_title: s.certificate_program_title || `for successfully completing the ${s.internship_duration_months || 6}-Month Internship program in ${s.technology || 'AI/ML'}`,
      certificate_issue_date: s.certificate_issue_date || new Date().toISOString().split('T')[0],
      certificate_start_date: s.certificate_start_date || s.offer_letter_start_date || s.internship_start_date || new Date().toISOString().split('T')[0],
      certificate_end_date: s.certificate_end_date || s.offer_letter_end_date || '',
      certificate_custom_text: s.certificate_custom_text || 'During this tenure, the intern demonstrated exceptional technical competence, diligence, and dedication.',
      certificate_signatory_name: s.certificate_signatory_name || 'Akash Padhiyar',
      certificate_signatory_role: s.certificate_signatory_role || 'CEO, Akash Technolabs',
      certificate_signatory_two_name: s.certificate_signatory_two_name || 'Director of Technical Training',
      certificate_signatory_two_role: s.certificate_signatory_two_role || 'Akash Technolabs',
    });
  };

  const handleSaveCertificate = async (approveAlso = false) => {
    if (!editingCertStudent) return;
    setSavingCertificate(true);
    try {
      const payload = {
        ...certFormData,
        approve: approveAlso ? true : undefined,
      };
      const res = await api.updateCertificate(editingCertStudent.id, payload);
      showStatus(`✓ ${res.message || 'Completion Certificate updated successfully!'}`);
      setEditingCertStudent(null);
      loadStudents();
    } catch (err) {
      alert('Failed to update completion certificate.');
    } finally {
      setSavingCertificate(false);
    }
  };

  const loadNews = async () => {
    setLoadingNews(true);
    try {
      const data = await api.getNews();
      setNewsList(data.news || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNews(false);
    }
  };

  const handlePostNews = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newNotice.title.trim()) {
      errors.title = 'Announcement title is required';
    }
    if (!newNotice.content.trim()) {
      errors.content = 'Announcement content is required';
    }
    if (Object.keys(errors).length > 0) {
      setNewsErrors(errors);
      return;
    }
    setNewsErrors({});
    setPostingNews(true);
    try {
      const res = await api.postNews(newNotice);
      showStatus(`✓ ${res.message || 'News announcement broadcasted to students!'}`);
      setNewNotice({
        title: '',
        content: '',
        category: 'general',
        priority: 'normal',
        target_technology: 'ALL',
      });
      setNewsErrors({});
      loadNews();
    } catch (err) {
      alert('Failed to post announcement.');
    } finally {
      setPostingNews(false);
    }
  };

  const handleDeleteNews = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.deleteNews(noticeId);
      showStatus('✓ Announcement deleted.');
      loadNews();
    } catch (err) {
      alert('Failed to delete announcement.');
    }
  };



  const loadAttendanceAndReports = async () => {
    setLoadingAttendance(true);
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterStudentId) params.student_id = filterStudentId;

      const [attData, repData, dailyReportData] = await Promise.all([
        api.getAdminAttendance(params),
        api.getDailyReports(params),
        api.getAttendanceDailyReport(params),
      ]);
      setAttendanceRecords(attData || []);
      setDailyReports(repData || []);
      setAttendanceDailyReport(dailyReportData || { summary: {}, daily_records: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllNotes = async () => {
    try {
      const data = await api.getNotes();
      setAllNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) {
      setSubjectErrors({ name: 'Subject name is required' });
      return;
    }
    setSubjectErrors({});
    try {
      await api.createSubject(newSubject);
      setNewSubject({ name: '', category: 'Web Tech', description: '' });
      showStatus('✓ New subject created successfully!');
      loadSubjects();
    } catch (err) {
      alert('Failed to create subject');
    }
  };

  const handleAllocateSubject = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!allocData.student_id) errors.student_id = 'Please select a student';
    if (!allocData.subject_id) errors.subject_id = 'Please select a subject';
    if (Object.keys(errors).length > 0) {
      setAllocErrors(errors);
      return;
    }
    setAllocErrors({});
    try {
      const res = await api.allocateSubject(allocData.student_id, allocData.subject_id, 'allocate');
      showStatus(`✓ ${res.message}`);
    } catch (err) {
      alert('Failed to allocate subject');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newNote.subject_id) errors.subject_id = 'Please select a subject';
    if (!newNote.title.trim()) errors.title = 'Note title is required';
    if (Object.keys(errors).length > 0) {
      setNoteErrors(errors);
      return;
    }
    setNoteErrors({});
    setUploadingNote(true);
    try {
      let payload;
      if (noteFile) {
        payload = new FormData();
        payload.append('subject_id', newNote.subject_id);
        payload.append('title', newNote.title.trim());
        payload.append('content', newNote.content || '');
        payload.append('document', noteFile);
      } else {
        payload = {
          subject_id: newNote.subject_id,
          title: newNote.title.trim(),
          content: newNote.content || ''
        };
      }
      await api.createNote(payload);
      setNewNote({ subject_id: '', title: '', content: '' });
      setNoteFile(null);
      showStatus('✓ Study note and PDF/document published successfully!');
      loadAllNotes();
    } catch (err) {
      alert('Failed to publish note');
    } finally {
      setUploadingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      await api.deleteNote(noteId);
      showStatus('✓ Study note deleted successfully.');
      loadAllNotes();
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  const loadMCQCategories = async () => {
    try {
      const data = await api.getMCQCategories();
      setMCQCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadExamResults = async () => {
    try {
      const data = await api.getExamResults();
      setExamResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) return;
    try {
      await api.createMCQCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      showStatus('✓ MCQ category created!');
      loadMCQCategories();
    } catch (err) {
      alert('Failed to create category');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.category_id || !newQuestion.question_text) return;
    try {
      await api.createMCQQuestion(newQuestion);
      setNewQuestion({
        category_id: newQuestion.category_id,
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A'
      });
      showStatus('✓ MCQ question added to bank!');
    } catch (err) {
      alert('Failed to create question');
    }
  };

  // Metrics
  const pendingCount = students.filter((s) => !s.is_approved).length;
  const approvedCount = students.filter((s) => s.is_approved).length;

  // Filtered Students List
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTech = selectedTech ? s.technology.toLowerCase().includes(selectedTech.toLowerCase()) : true;
    const matchesApproval =
      filterApproval === 'all'
        ? true
        : filterApproval === 'pending'
        ? !s.is_approved
        : s.is_approved;
    return matchesSearch && matchesTech && matchesApproval;
  });

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'approvals', label: 'Student Approvals', icon: Users, badge: pendingCount > 0 ? pendingCount : null, badgeColor: 'bg-amber-500' },
    { id: 'news', label: 'News & Broadcast', icon: Bell, badge: newsList.length > 0 ? newsList.length : null, badgeColor: 'bg-indigo-600' },
    { id: 'attendance', label: 'Attendance & Reports', icon: Clock },
    { id: 'documents', label: 'Document Releases (PDF)', icon: FileText },
    { id: 'notes', label: 'Subjects & Notes', icon: BookOpen },
    { id: 'mcq', label: 'MCQ Exam Engine', icon: Award },
  ];

  // Loading screen if directly accessing /admin/offer-letter/:studentId and students are still loading
  if (routeStudentId && loadingStudents && !editingOfferStudent) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-base font-bold text-slate-800">Loading Offer Letter Editor</h3>
          <p className="text-xs text-slate-500 mt-1">Fetching candidate record...</p>
        </div>
      </div>
    );
  }

  // Not found screen if routeStudentId does not match any student
  if (routeStudentId && !loadingStudents && students.length > 0 && !students.find(s => String(s.id) === String(routeStudentId))) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Student Record Not Found</h3>
          <p className="text-xs text-slate-500">Could not find a student matching ID #{routeStudentId}.</p>
          <button
            onClick={() => { setEditingOfferStudent(null); navigate('/admin'); }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Console</span>
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // DEDICATED FULL-PAGE OFFER LETTER EDITOR (NO POPUP MODAL)
  // ========================================================
  if (editingOfferStudent) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col pb-24">
        
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div className="flex items-start sm:items-center gap-3">
              <button
                type="button"
                onClick={() => { setEditingOfferStudent(null); navigate('/admin'); }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition flex-shrink-0"
                title="Return to Admin Console"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin</span>
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>Akash Technolabs Official Letterhead</span>
                  </span>
                  <span className="text-[11px] bg-white/10 text-white/80 font-mono px-2 py-0.5 rounded-full">
                    {offerFormData.offer_letter_ref_no || `ATI-STU-${String(editingOfferStudent.id).padStart(4, '0')}`}
                  </span>
                  {editingOfferStudent.offer_letter_approved ? (
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold px-2.5 py-0.5 rounded-full">
                      ✓ Approved & Live
                    </span>
                  ) : (
                    <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold px-2.5 py-0.5 rounded-full">
                      Pending Approval
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white flex items-center gap-2">
                  Offer Letter Editor — {editingOfferStudent.full_name}
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Full Page Workspace: Customize candidate role, dates, schedule, continuous letter text, signatory & stamp, header/footer branding, and watermark background.
                </p>
              </div>
            </div>

            {/* Quick Actions in Top Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetOfferDefaults}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl transition font-medium"
                title="Reset letterhead & body to official default format"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <a
                href={api.getOfferLetterUrl(editingOfferStudent.id, true)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 font-bold rounded-xl text-xs transition"
                title="Open live generated PDF in a new browser tab"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live PDF Preview</span>
              </a>

              <button
                type="button"
                disabled={savingOfferLetter}
                onClick={() => handleSaveOfferLetter(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingOfferLetter ? 'Saving Changes...' : 'Save Offer Letter'}
              </button>

              {!editingOfferStudent.offer_letter_approved && (
                <button
                  type="button"
                  disabled={savingOfferLetter}
                  onClick={() => handleSaveOfferLetter(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Approve</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Status notification toast */}
        {statusMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 text-center shadow-sm">
            {statusMsg}
          </div>
        )}

        {/* Page Content: All 7 Sections */}
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 text-xs">

          {/* SECTION 1: LETTERHEAD HEADER BRANDING (Heder) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm flex items-center justify-center">
                  🏢
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Header Branding & Official Banner (Heder)</h2>
                  <p className="text-slate-500 text-xs">Toggle header, upload custom header logo/banner, or customize header company details</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Show Header:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFormData.offer_letter_show_header}
                    onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_show_header: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Header Banner Preview & Upload */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>Header Banner Image:</span>
                  {offerFormData.offer_letter_header_image_url ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Custom Uploaded Banner</span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Default Akash Technolabs Header</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Header Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOfferFormData(prev => ({
                            ...prev,
                            offer_letter_header_file: file,
                            offer_letter_header_image_url: URL.createObjectURL(file),
                          }));
                        }
                      }}
                    />
                  </label>
                  {(offerFormData.offer_letter_header_file || offerFormData.offer_letter_header_image_url) && (
                    <button
                      type="button"
                      onClick={() => setOfferFormData(prev => ({
                        ...prev,
                        offer_letter_header_file: 'reset',
                        offer_letter_header_image_url: '',
                      }))}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition"
                    >
                      Use Default Header
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Preview Box */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-center min-h-[65px] max-h-[95px] overflow-hidden">
                <img
                  src={offerFormData.offer_letter_header_image_url ? api.getMediaUrl(offerFormData.offer_letter_header_image_url) : api.getOfferAssetUrl('header')}
                  alt="Letterhead Header"
                  className="max-h-20 w-auto object-contain mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = api.getOfferAssetUrl('header');
                  }}
                />
              </div>
            </div>

            {/* Header Text details */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Company Name in Header:</label>
                <input
                  type="text"
                  value={offerFormData.offer_letter_company_name}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 bg-white"
                  placeholder="Akash Technolabs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Document Title:</label>
                <input
                  type="text"
                  value={offerFormData.offer_letter_title}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 bg-white"
                  placeholder="INTERNSHIP OFFER LETTER"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Ref Number:</label>
                <input
                  type="text"
                  value={offerFormData.offer_letter_ref_no}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_ref_no: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 bg-white"
                  placeholder="ATI/INT/2026/0001"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Issue Date:</label>
                <input
                  type="date"
                  value={offerFormData.offer_letter_issue_date}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BACKGROUND WATERMARK IMAGE ("benked off image") */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-cyan-50 text-cyan-700 rounded-xl font-bold text-sm flex items-center justify-center">
                  🖼️
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Background Watermark Image ("benked off image")</h2>
                  <p className="text-slate-500 text-xs">Translucent logo / seal drawn in the background behind letter body paragraphs</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Show Watermark:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFormData.offer_letter_show_watermark}
                    onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_show_watermark: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>Background Watermark Preview:</span>
                  {offerFormData.offer_letter_bg_image_url ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Custom Background Image</span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Default Akash Faded Watermark</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs transition shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Custom Background</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOfferFormData(prev => ({
                            ...prev,
                            offer_letter_bg_file: file,
                            offer_letter_bg_image_url: URL.createObjectURL(file),
                          }));
                        }
                      }}
                    />
                  </label>
                  {(offerFormData.offer_letter_bg_file || offerFormData.offer_letter_bg_image_url) && (
                    <button
                      type="button"
                      onClick={() => setOfferFormData(prev => ({
                        ...prev,
                        offer_letter_bg_file: 'reset',
                        offer_letter_bg_image_url: '',
                      }))}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition"
                    >
                      Use Default Watermark
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-center min-h-[100px] max-h-[135px] overflow-hidden">
                <img
                  src={offerFormData.offer_letter_bg_image_url ? api.getMediaUrl(offerFormData.offer_letter_bg_image_url) : api.getOfferAssetUrl('watermark')}
                  alt="Letterhead Background Watermark"
                  className="max-h-28 w-auto object-contain mx-auto opacity-75"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = api.getOfferAssetUrl('watermark');
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CANDIDATE IDENTITY & POSITION */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="p-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm flex items-center justify-center">
                👤
              </span>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Candidate & Position Details</h2>
                <p className="text-slate-500 text-xs">Salutation, candidate full name, pronouns, and role title printed on the letterhead</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Salutation:
                </label>
                <select
                  value={offerFormData.offer_letter_salutation}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_salutation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="">None (Just Name)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Candidate Full Name *:
                </label>
                <input
                  type="text"
                  required
                  value={offerFormData.full_name}
                  onChange={(e) => setOfferFormData({ ...offerFormData, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                  placeholder="e.g. Aryan Tivar"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Letter Pronouns:
                </label>
                <select
                  value={offerFormData.offer_letter_pronoun}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_pronoun: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                >
                  <option value="he">He / Him / His</option>
                  <option value="she">She / Her / Her</option>
                  <option value="they">They / Them / Their</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Technology / Domain:
                </label>
                <input
                  type="text"
                  value={offerFormData.technology}
                  onChange={(e) => setOfferFormData({ ...offerFormData, technology: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 bg-white"
                  placeholder="e.g. AI/ML, Full Stack, Flutter"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Position / Role Title:
                </label>
                <input
                  type="text"
                  value={offerFormData.offer_letter_role}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-700 bg-white"
                  placeholder="e.g. AI/ML Intern"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DATES, TENURE & WORK SCHEDULE */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center">
                📅
              </span>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Schedule, Tenure & Stipend</h2>
                <p className="text-slate-500 text-xs">Start date, duration, end date, work hours, and compensation terms</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={offerFormData.offer_letter_start_date}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOfferFormData({ ...offerFormData, offer_letter_start_date: val });
                    handleRecalculateEndDate(val, offerFormData.internship_duration_months);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Duration (Months):
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={offerFormData.internship_duration_months}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOfferFormData({ ...offerFormData, internship_duration_months: val });
                    handleRecalculateEndDate(offerFormData.offer_letter_start_date, val);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-bold">End Date:</label>
                  <button
                    type="button"
                    onClick={() => handleRecalculateEndDate()}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                  >
                    Auto-Calc ({offerFormData.internship_duration_months}m)
                  </button>
                </div>
                <input
                  type="date"
                  value={offerFormData.offer_letter_end_date}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Work Mode:
                </label>
                <select
                  value={offerFormData.offer_letter_work_mode}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_work_mode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                >
                  <option value="On-Site">On-Site (In-Office)</option>
                  <option value="Remote">Remote (Work From Home)</option>
                  <option value="Hybrid">Hybrid (Flexible)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Working Hours:
                </label>
                <input
                  type="text"
                  value={offerFormData.offer_letter_working_hours}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_working_hours: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  placeholder="10:00 AM - 06:00 PM"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Stipend / Terms:
                </label>
                <input
                  type="text"
                  value={offerFormData.offer_letter_stipend}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_stipend: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-emerald-800 bg-white"
                  placeholder="Unpaid / ₹10,000 per month"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: ONE CONTINUOUS FRAME LETTER EDITOR */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-800 rounded-xl font-bold text-sm flex items-center justify-center">
                  📝
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">
                    Offer Letter Content (Word Ribbon Rich Text Editor)
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Full Microsoft Word formatting: Bold, Italic, Underline, Fonts, Sizes, Colors, Lists, Alignments, and Styles in the ribbon toolbar below.
                  </p>
                </div>
              </div>

              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1 rounded-full">
                Unified Text Frame
              </span>
            </div>

            {/* 1-Click Domain Presets */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                1-Click Domain Preset Templates (Fills Frame Below):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyOfferTemplate('standard')}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-slate-200 rounded-xl font-bold text-xs transition shadow-2xs hover:border-blue-300"
                >
                  🌟 Standard Akash Technolabs
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyOfferTemplate('aiml')}
                  className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 border border-slate-200 rounded-xl font-bold text-xs transition shadow-2xs hover:border-purple-300"
                >
                  🤖 AI/ML & Data Science
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyOfferTemplate('fullstack')}
                  className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-800 border border-slate-200 rounded-xl font-bold text-xs transition shadow-2xs hover:border-indigo-300"
                >
                  💻 Full Stack Web Dev
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyOfferTemplate('mobile')}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-xl font-bold text-xs transition shadow-2xs hover:border-emerald-300"
                >
                  📱 Mobile App (Flutter/RN)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyOfferTemplate('paid')}
                  className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-slate-200 rounded-xl font-bold text-xs transition shadow-2xs hover:border-amber-300"
                >
                  💼 Paid Stipend Internship
                </button>
                <button
                  type="button"
                  onClick={handleResetOfferDefaults}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition shadow-2xs ml-auto"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  Reset to Default
                </button>
              </div>
            </div>

            {/* MICROSOFT WORD RIBBON RICH TEXT EDITOR */}
            <div className="relative mt-2">
              <WordRibbonEditor
                value={offerFormData.offer_letter_full_body}
                onChange={(newHtml) => setOfferFormData((prev) => ({ ...prev, offer_letter_full_body: newHtml }))}
                placeholder="Type or paste the complete offer letter text here. Format with Bold, Italic, Underline, Fonts, Colors, Alignments, and Styles above..."
                minHeight="400px"
              />
            </div>
          </div>

          {/* SECTION 6: SIGNATORY & AUTHORIZATION */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm flex items-center justify-center">
                  ✍️
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Signatory & Authorization</h2>
                  <p className="text-slate-500 text-xs">Authorized signatory name, designation, sign-off closing word, and official seal/stamp image</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Show Stamp & Signature:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFormData.offer_letter_show_stamp}
                    onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_show_stamp: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {/* Stamp & Signature Image Preview & Upload */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>Stamp & Signature Image:</span>
                  {offerFormData.offer_letter_stamp_image_url ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Custom Uploaded Stamp</span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Default Akash CEO Stamp & Signature</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Stamp & Signature</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOfferFormData(prev => ({
                            ...prev,
                            offer_letter_stamp_file: file,
                            offer_letter_stamp_image_url: URL.createObjectURL(file),
                          }));
                        }
                      }}
                    />
                  </label>
                  {(offerFormData.offer_letter_stamp_file || offerFormData.offer_letter_stamp_image_url) && (
                    <button
                      type="button"
                      onClick={() => setOfferFormData(prev => ({
                        ...prev,
                        offer_letter_stamp_file: 'reset',
                        offer_letter_stamp_image_url: '',
                      }))}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition"
                    >
                      Use Default Stamp
                    </button>
                  )}
                </div>
              </div>

              {/* Placement & Alignment Options: Left, Center, Right Side */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Stamp & Signatory Placement:</span>
                  <span className="text-[11px] text-slate-500">(Choose position on the official offer letter)</span>
                </div>
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setOfferFormData({ ...offerFormData, offer_letter_stamp_alignment: 'left' })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      offerFormData.offer_letter_stamp_alignment === 'left'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Left Side</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferFormData({ ...offerFormData, offer_letter_stamp_alignment: 'center' })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      offerFormData.offer_letter_stamp_alignment === 'center'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferFormData({ ...offerFormData, offer_letter_stamp_alignment: 'right' })}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      offerFormData.offer_letter_stamp_alignment === 'right' || !offerFormData.offer_letter_stamp_alignment
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                    <span>Right Side (Recommended)</span>
                  </button>
                </div>
              </div>

              {/* Spacing Between Stamp & Signature */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Space Between Stamp & Signature:</span>
                  <span className="text-[11px] text-slate-500">(Vertical breathing space between closing, stamp & name)</span>
                </div>
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setOfferFormData({ ...offerFormData, offer_letter_stamp_spacing: 'compact' })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      offerFormData.offer_letter_stamp_spacing === 'compact'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>🤏 Compact Space</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferFormData({ ...offerFormData, offer_letter_stamp_spacing: 'standard' })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      offerFormData.offer_letter_stamp_spacing === 'standard' || !offerFormData.offer_letter_stamp_spacing
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>⚖️ Standard Space (Recommended)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferFormData({ ...offerFormData, offer_letter_stamp_spacing: 'spacious' })}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      offerFormData.offer_letter_stamp_spacing === 'spacious'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>↔️ Generous Space</span>
                  </button>
                </div>
              </div>

              {/* Live Positioned Preview Box */}
              <div className={`bg-white p-4 rounded-xl border border-slate-200 flex items-center min-h-[105px] max-h-[155px] overflow-hidden transition-all ${
                offerFormData.offer_letter_stamp_alignment === 'left'
                  ? 'justify-start pl-8'
                  : offerFormData.offer_letter_stamp_alignment === 'center'
                  ? 'justify-center'
                  : 'justify-end pr-8 md:pr-14'
              }`}>
                <div className={`flex flex-col ${
                  offerFormData.offer_letter_stamp_alignment === 'center'
                    ? 'items-center text-center'
                    : 'items-start text-left'
                }`}>
                  <span className="text-[11px] font-semibold text-slate-500 mb-1">
                    {offerFormData.offer_letter_signoff || 'Sincerely'}
                  </span>
                  <img
                    src={offerFormData.offer_letter_stamp_image_url ? api.getMediaUrl(offerFormData.offer_letter_stamp_image_url) : api.getOfferAssetUrl('stamp')}
                    alt="Official Stamp & Signature"
                    className={`max-h-20 w-auto object-contain transition-all ${
                      offerFormData.offer_letter_stamp_spacing === 'compact'
                        ? 'my-1'
                        : offerFormData.offer_letter_stamp_spacing === 'spacious'
                        ? 'my-4'
                        : 'my-2.5'
                    }`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = api.getOfferAssetUrl('stamp');
                    }}
                  />
                  <span className="text-xs font-bold text-slate-900">
                    {offerFormData.offer_letter_signatory_name || 'Akash Padhiyar'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {offerFormData.offer_letter_signatory_role || 'CEO'}
                  </span>
                  <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full mt-1.5 border border-purple-200">
                    Placed on {offerFormData.offer_letter_stamp_alignment === 'left' ? 'Left' : offerFormData.offer_letter_stamp_alignment === 'center' ? 'Center' : 'Right'} Side • {offerFormData.offer_letter_stamp_spacing === 'compact' ? 'Compact Space' : offerFormData.offer_letter_stamp_spacing === 'spacious' ? 'Generous Space' : 'Standard Space'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Sign-off Closing Word:
                </label>
                <select
                  value={offerFormData.offer_letter_signoff}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_signoff: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                >
                  <option value="Sincerely">Sincerely</option>
                  <option value="With Best Wishes">With Best Wishes</option>
                  <option value="Warm Regards">Warm Regards</option>
                  <option value="For Akash Technolabs">For Akash Technolabs</option>
                  <option value="Yours Faithfully">Yours Faithfully</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Signatory Name *:
                </label>
                <input
                  type="text"
                  value={offerFormData.offer_letter_signatory_name}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_signatory_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                  placeholder="Akash Padhiyar"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Signatory Role / Designation:
                </label>
                <input
                  type="text"
                  value={offerFormData.offer_letter_signatory_role}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_signatory_role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  placeholder="CEO"
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: LETTERHEAD FOOTER BRANDING (Foter) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center">
                  📄
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Footer Branding & Contact Bar (Foter)</h2>
                  <p className="text-slate-500 text-xs">Toggle footer bar, upload custom footer banner, or provide custom footer address/contact text</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Show Footer:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFormData.offer_letter_show_footer}
                    onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_show_footer: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-700"></div>
                </label>
              </div>
            </div>

            {/* Footer Banner Preview & Upload */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>Footer Bar Image:</span>
                  {offerFormData.offer_letter_footer_image_url ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Custom Uploaded Footer</span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Default Akash Technolabs Footer</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Footer Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOfferFormData(prev => ({
                            ...prev,
                            offer_letter_footer_file: file,
                            offer_letter_footer_image_url: URL.createObjectURL(file),
                          }));
                        }
                      }}
                    />
                  </label>
                  {(offerFormData.offer_letter_footer_file || offerFormData.offer_letter_footer_image_url) && (
                    <button
                      type="button"
                      onClick={() => setOfferFormData(prev => ({
                        ...prev,
                        offer_letter_footer_file: 'reset',
                        offer_letter_footer_image_url: '',
                      }))}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition"
                    >
                      Use Default Footer
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-center min-h-[55px] max-h-[85px] overflow-hidden">
                <img
                  src={offerFormData.offer_letter_footer_image_url ? api.getMediaUrl(offerFormData.offer_letter_footer_image_url) : api.getOfferAssetUrl('footer')}
                  alt="Letterhead Footer Bar"
                  className="max-h-16 w-auto object-contain mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = api.getOfferAssetUrl('footer');
                  }}
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-slate-700 font-bold mb-1">Optional Custom Footer Text / Office Contact:</label>
              <input
                type="text"
                value={offerFormData.offer_letter_footer_text || ''}
                onChange={(e) => setOfferFormData({ ...offerFormData, offer_letter_footer_text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 bg-white"
                placeholder="e.g. Akash Technolabs | www.akashtechnolabs.com | info@akashtechnolabs.com | +91 98765 43210"
              />
            </div>
          </div>

        </main>

        {/* Sticky Bottom Footer Actions */}
        <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-4 sm:px-8 shadow-xl">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setEditingOfferStudent(null); navigate('/admin'); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Console</span>
              </button>
              <a
                href={api.getOfferLetterUrl(editingOfferStudent.id, true)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                title="Open live generated PDF in a new browser tab"
              >
                <Eye className="w-4 h-4" />
                <span>Live PDF Preview</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={savingOfferLetter}
                onClick={() => handleSaveOfferLetter(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingOfferLetter ? 'Saving Changes...' : 'Save Offer Letter'}
              </button>

              {!editingOfferStudent.offer_letter_approved && (
                <button
                  type="button"
                  disabled={savingOfferLetter}
                  onClick={() => handleSaveOfferLetter(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Approve Document</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-100">
      
      {/* ======================================================== */}
      {/* MODERN LEFT SIDEBAR NAVIGATION */}
      {/* ======================================================== */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col justify-between">
        <div className="p-4 space-y-6">
          
          {/* Admin Tag */}
          <div className="px-3 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow">
              A
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Admin Console</div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                System Online
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Main Menu
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

        {/* Sidebar Footer Stats */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex justify-between">
            <span>Total Students:</span>
            <span className="font-bold text-white">{students.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Approvals:</span>
            <span className="font-bold text-amber-400">{pendingCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Subjects:</span>
            <span className="font-bold text-blue-400">{subjects.length}</span>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ======================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Status Notification Banner */}
        {statusMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. OVERVIEW DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Overview</h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time snapshot of student registrations, daily attendance logs, and exam submissions.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div
                onClick={() => setActiveTab('approvals')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{students.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
                  <span>{approvedCount} approved active</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('approvals')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</div>
                    <div className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-amber-700 font-medium">
                  {pendingCount > 0 ? 'Action required: Review requests' : 'All accounts verified'}
                </div>
              </div>

              <div
                onClick={() => setActiveTab('news')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Broadcast News</div>
                    <div className="text-3xl font-extrabold text-purple-600 mt-1">{newsList.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-purple-700 font-medium flex items-center gap-1">
                  <span>Student broadcast live</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('attendance')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Logs</div>
                    <div className="text-3xl font-extrabold text-emerald-600 mt-1">{attendanceRecords.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-emerald-700 font-medium">
                  {dailyReports.length} daily work reports filed
                </div>
              </div>

              <div
                onClick={() => setActiveTab('mcq')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Submissions</div>
                    <div className="text-3xl font-extrabold text-indigo-600 mt-1">{examResults.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-indigo-700 font-medium">
                  Across {mcqCategories.length} test categories
                </div>
              </div>

            </div>

            {/* Quick Actions & Recent Pending Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Registrations Requiring Verification</h3>
                  <p className="text-xs text-slate-500">Students waiting for your approval to gain login access.</p>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                >
                  <span>View All Students</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {pendingCount === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All student registrations are approved and up to date!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-xs">
                    <thead>
                      <tr className="text-left text-slate-500 font-semibold uppercase">
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Email / Mobile</th>
                        <th className="py-2.5">College & Domain</th>
                        <th className="py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {students.filter((s) => !s.is_approved).map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-900">{s.full_name}</td>
                          <td className="py-3">
                            <div>{s.email}</div>
                            <div className="text-slate-400">{s.mobile_number}</div>
                          </td>
                          <td className="py-3">
                            <div className="font-medium text-slate-800">{s.college_name}</div>
                            <div className="text-blue-600 font-semibold">{s.technology}</div>
                          </td>
                          <td className="py-3 text-right whitespace-nowrap space-x-1.5">
                            <button
                              onClick={() => {
                                handleOpenEditOfferLetter(s);
                                navigate(`/admin/offer-letter/${s.id}`);
                              }}
                              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold px-2 py-1.5 rounded-lg text-xs transition"
                              title="Customize Offer Letter"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Letter</span>
                            </button>
                            <button
                              onClick={() => handleVerifyStudent(s.id, 'approve')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm transition"
                            >
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 2. STUDENT APPROVALS & DIRECTORY (VOICE NOTE 1) */}
        {/* ======================================================== */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Verification Directory</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Voice Note 1: Students register and must be verified by Admin before logging in.
                </p>
              </div>

              {/* Search & Status Filters */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleOpenAddStudent}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Student</span>
                </button>

                <div className="relative flex-1 md:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, college, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterApproval}
                  onChange={(e) => setFilterApproval(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="all">All Statuses ({students.length})</option>
                  <option value="pending">Pending Only ({pendingCount})</option>
                  <option value="approved">Approved Only ({approvedCount})</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Student Info</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">College & University</th>
                    <th className="px-4 py-3 text-left">Technology</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No student records match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{s.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">@{s.username}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{s.email}</div>
                          <div className="text-slate-500">{s.mobile_number}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{s.college_name}</div>
                          <div className="text-slate-500">{s.university}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-700">
                          {s.technology}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.is_approved ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditStudent(s)}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold px-2 py-1.5 rounded-lg text-xs transition shadow-2xs"
                            title="Edit Student Profile Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              handleOpenEditOfferLetter(s);
                              navigate(`/admin/offer-letter/${s.id}`);
                            }}
                            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition shadow-sm"
                            title="Edit / Customize Offer Letter"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Offer Letter</span>
                          </button>
                          {!s.is_approved ? (
                            <button
                              onClick={() => handleVerifyStudent(s.id, 'approve')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm text-xs transition"
                            >
                              Approve Access
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyStudent(s.id, 'reject')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* NEWS & BROADCAST CENTER (ADMIN TO STUDENTS) */}
        {/* ======================================================== */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Real-Time Broadcast Engine</span>
                  </span>
                  <span className="text-xs bg-white/10 text-white/80 px-2.5 py-0.5 rounded-full">
                    {newsList.length} Announcements Posted
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                  News & Student Notification Board
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
                  Broadcast notices, submission deadlines, exam updates, or holiday notices. Every student receives an instant notification badge on their profile and can view the news feed in real-time.
                </p>
              </div>

              <button
                onClick={loadNews}
                disabled={loadingNews}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingNews ? 'animate-spin' : ''}`} />
                <span>Refresh News</span>
              </button>
            </div>

            {/* Grid: Left Column = Post Form, Right Column = Live Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Post News Announcement Form */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600" />
                    <span>Post New Announcement</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Broadcasted immediately to all student dashboards.
                  </p>
                </div>

                <form noValidate onSubmit={handlePostNews} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Announcement Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mid-Term Project Submission & Viva Schedule"
                      value={newNotice.title}
                      onChange={(e) => {
                        setNewNotice({ ...newNotice, title: e.target.value });
                        if (newsErrors.title) setNewsErrors(prev => ({ ...prev, title: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 font-medium transition ${
                        newsErrors.title ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    />
                    {newsErrors.title && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{newsErrors.title}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Category
                      </label>
                      <select
                        value={newNotice.category}
                        onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                      >
                        <option value="general">📢 General Notice</option>
                        <option value="internship">💼 Internship Update</option>
                        <option value="exam">📝 Exam / Evaluation</option>
                        <option value="event">🎉 Holiday / Event</option>
                        <option value="training">💻 Training / Task</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Priority Level
                      </label>
                      <select
                        value={newNotice.priority}
                        onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                      >
                        <option value="normal">🔵 Normal</option>
                        <option value="important">🟠 Important</option>
                        <option value="urgent">🔴 Urgent Alert</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Target Audience / Domain
                    </label>
                    <select
                      value={newNotice.target_technology}
                      onChange={(e) => setNewNotice({ ...newNotice, target_technology: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                    >
                      <option value="ALL">🌐 All Registered Students (Broadcast)</option>
                      <option value="AI/ML">🤖 AI/ML Interns Only</option>
                      <option value="Python">🐍 Python Interns Only</option>
                      <option value="Full Stack">⚡ Full Stack Interns Only</option>
                      <option value="Web Development">💻 Web Development Interns Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Announcement Details / Message Body *
                    </label>
                    <textarea
                      rows="5"
                      placeholder="Write complete notice information, timings, guidelines, links, or instructions..."
                      value={newNotice.content}
                      onChange={(e) => {
                        setNewNotice({ ...newNotice, content: e.target.value });
                        if (newsErrors.content) setNewsErrors(prev => ({ ...prev, content: '' }));
                      }}
                      className={`w-full p-3 border rounded-xl focus:ring-2 font-medium transition ${
                        newsErrors.content ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    ></textarea>
                    {newsErrors.content && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{newsErrors.content}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={postingNews}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>{postingNews ? 'Broadcasting...' : 'Broadcast to Students Now'}</span>
                  </button>
                </form>
              </div>

              {/* 2. Live Broadcasted News Feed */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span>Active Announcements & Notifications ({newsList.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Messages visible on the student notification bell and news tab.
                    </p>
                  </div>
                </div>

                {newsList.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-60" />
                    No announcements posted yet. Use the form on the left to broadcast news to students!
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {newsList.map((n) => {
                      const isUrgent = n.priority === 'urgent';
                      const isImportant = n.priority === 'important';
                      return (
                        <div
                          key={n.id}
                          className={`p-4 rounded-2xl border transition ${
                            isUrgent
                              ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                              : isImportant
                              ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                              : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    isUrgent
                                      ? 'bg-rose-600 text-white'
                                      : isImportant
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-blue-600 text-white'
                                  }`}
                                >
                                  {n.priority}
                                </span>

                                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                                  {n.category}
                                </span>

                                <span className="text-[10px] bg-slate-200/80 text-slate-700 font-mono px-2 py-0.5 rounded-full">
                                  Audience: {n.target_technology || 'ALL'}
                                </span>

                                <span className="text-[11px] text-slate-400 font-medium">
                                  {new Date(n.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                {n.title}
                              </h4>

                              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                                {n.content}
                              </p>

                              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60">
                                <span className="flex items-center gap-1 font-medium text-slate-500">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Read by {n.read_count} student{n.read_count === 1 ? '' : 's'}</span>
                                </span>
                                <span>Sender: {n.posted_by}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteNews(n.id)}
                              title="Delete Announcement"
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 3. ATTENDANCE & WORK REPORTS (MONTH & EMPLOYEE FILTERS) */}
        {/* ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            
            {/* Header & Control Bar */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <span>Student Office Attendance & In-Out Register</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Day-by-day record of which days students <strong>came to the office</strong> (Present) and which days they <strong>did not come</strong> (Absent), along with in/out timestamps, hours, and daily reports.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={loadAttendanceAndReports}
                    disabled={loadingAttendance}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                    title="Refresh attendance records"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAttendance ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Filters & View Mode Selector */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-1">
                {/* Left: Filter Controls */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Filters:</span>
                  </div>

                  {/* Month Picker */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Month:</label>
                    <input
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-800"
                    />
                  </div>

                  {/* Student / Intern Selector */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Student:</label>
                    <select
                      value={filterStudentId}
                      onChange={(e) => setFilterStudentId(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-800"
                    >
                      <option value="">All Students ({students.length})</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.technology})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => { setShowHolidayModal(true); loadHolidays(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition shadow-xs"
                    title="Declare or Manage Official Festivals & Holidays"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>🪔 Festivals & Holidays</span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded-full font-extrabold">
                      {holidaysList.length || 16}
                    </span>
                  </button>

                  {(filterMonth !== '2026-10' || filterStudentId) && (
                    <button
                      onClick={() => { setFilterMonth('2026-10'); setFilterStudentId(''); }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold underline px-2"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* Right: View Mode Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto self-stretch sm:self-auto overflow-x-auto">
                  <button
                    onClick={() => setAttendanceViewMode('register')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      attendanceViewMode === 'register'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>📋 Daily In-Out Register</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      attendanceViewMode === 'register' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {attendanceDailyReport.daily_records?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setAttendanceViewMode('sessions')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      attendanceViewMode === 'sessions'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>⏱️ Clock-In Sessions</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      attendanceViewMode === 'sessions' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {attendanceRecords.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setAttendanceViewMode('reports')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      attendanceViewMode === 'reports'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>📝 Work Reports</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      attendanceViewMode === 'reports' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {dailyReports.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly KPI Overview Stat Cards (Voice Note & Requirement) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
              
              {/* 1. Working Days */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Working Days</span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {attendanceDailyReport.summary?.total_working_days ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Weekdays to date
                </div>
              </div>

              {/* 2. Came to Office (Present) */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs hover:border-emerald-300 transition">
                <div className="flex items-center justify-between text-emerald-600 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Came to Office</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {attendanceDailyReport.summary?.days_present ?? 0}
                </div>
                <div className="text-[11px] font-medium text-emerald-600 mt-0.5 truncate">
                  🟢 Days Present
                </div>
              </div>

              {/* 3. Did NOT Come (Absent) */}
              <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-300 transition">
                <div className="flex items-center justify-between text-rose-600 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">Did NOT Come</span>
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-700">
                  {attendanceDailyReport.summary?.days_absent ?? 0}
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
                  {attendanceDailyReport.summary?.holiday_days ?? 0}
                </div>
                <div className="text-[11px] font-medium text-amber-600 mt-0.5 truncate">
                  🪔 Office Festival Off
                </div>
              </div>

              {/* 5. Weekend Days */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Weekends</span>
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-black text-slate-700">
                  {attendanceDailyReport.summary?.weekend_days ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  ⚪ Office Closed
                </div>
              </div>

              {/* 6. Attendance Percentage */}
              <div className="bg-white rounded-2xl p-4 border border-indigo-200 bg-indigo-50/20 shadow-xs hover:border-indigo-300 transition">
                <div className="flex items-center justify-between text-indigo-600 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Attendance %</span>
                  <Award className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-700">
                  {attendanceDailyReport.summary?.attendance_rate ?? 0}%
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, attendanceDailyReport.summary?.attendance_rate || 0)}%` }}
                  />
                </div>
              </div>

              {/* 7. Total Logged Hours */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Hours</span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-700">
                  {attendanceDailyReport.summary?.total_hours_worked ?? 0} <span className="text-xs font-bold text-slate-400">hrs</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Office duration logged
                </div>
              </div>

            </div>

            {/* ========================================================= */}
            {/* VIEW 1: DAILY IN-OUT REGISTER (CAME VS DID NOT COME)       */}
            {/* ========================================================= */}
            {attendanceViewMode === 'register' && (() => {
              const allDaily = attendanceDailyReport.daily_records || [];
              const filteredDaily = allDaily
                .filter((r) => {
                  if (filterAttendanceStatus === 'present' && r.status !== 'PRESENT') return false;
                  if (filterAttendanceStatus === 'absent' && r.status !== 'ABSENT') return false;
                  if (filterAttendanceStatus === 'holiday' && !r.is_holiday && r.status !== 'HOLIDAY') return false;
                  if (filterAttendanceStatus === 'weekend' && r.status !== 'WEEKEND') return false;
                  if (filterAttendanceStatus === 'upcoming' && r.status !== 'UPCOMING') return false;

                  if (attendanceSearch.trim()) {
                    const q = attendanceSearch.toLowerCase();
                    const matchName = r.student_name?.toLowerCase().includes(q);
                    const matchDate = r.date?.toLowerCase().includes(q);
                    const matchDay = r.day_name?.toLowerCase().includes(q);
                    const matchTech = r.technology?.toLowerCase().includes(q);
                    if (!matchName && !matchDate && !matchDay && !matchTech) return false;
                  }
                  return true;
                })
                .sort((a, b) => {
                  if (attendanceSortAsc) {
                    return a.date.localeCompare(b.date);
                  } else {
                    return b.date.localeCompare(a.date);
                  }
                });

              // Selected student name for header
              const selectedStudentObj = students.find((s) => String(s.id) === String(filterStudentId));

              return (
                <div className="space-y-6">
                  
                  {/* Status Filter Chips & Quick Search Bar */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    {/* Status Filter Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Status:</span>

                      <button
                        onClick={() => setFilterAttendanceStatus('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          filterAttendanceStatus === 'all'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>All Days</span>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
                          {allDaily.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterAttendanceStatus('present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          filterAttendanceStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Came to Office</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          filterAttendanceStatus === 'present' ? 'bg-white/30 text-white' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {allDaily.filter((r) => r.status === 'PRESENT').length}
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterAttendanceStatus('absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          filterAttendanceStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Did NOT Come (Absent)</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          filterAttendanceStatus === 'absent' ? 'bg-white/30 text-white' : 'bg-rose-200 text-rose-900'
                        }`}>
                          {allDaily.filter((r) => r.status === 'ABSENT').length}
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterAttendanceStatus('holiday')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          filterAttendanceStatus === 'holiday'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>🪔 Festivals & Holidays</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          filterAttendanceStatus === 'holiday' ? 'bg-white/30 text-white' : 'bg-amber-200 text-amber-900'
                        }`}>
                          {allDaily.filter((r) => r.is_holiday || r.status === 'HOLIDAY').length}
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterAttendanceStatus('weekend')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          filterAttendanceStatus === 'weekend'
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        <span>⚪ Weekends</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          filterAttendanceStatus === 'weekend' ? 'bg-white/30 text-white' : 'bg-slate-300 text-slate-800'
                        }`}>
                          {allDaily.filter((r) => r.status === 'WEEKEND').length}
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterAttendanceStatus('upcoming')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          filterAttendanceStatus === 'upcoming'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        <span>⏳ Upcoming</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          filterAttendanceStatus === 'upcoming' ? 'bg-white/30 text-white' : 'bg-blue-200 text-blue-900'
                        }`}>
                          {allDaily.filter((r) => r.status === 'UPCOMING').length}
                        </span>
                      </button>
                    </div>

                    {/* Search & Sort Toggle */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-60">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search student or date..."
                          value={attendanceSearch}
                          onChange={(e) => setAttendanceSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        onClick={() => setAttendanceSortAsc(!attendanceSortAsc)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition flex items-center gap-1 flex-shrink-0"
                        title="Toggle Sort Date"
                      >
                        <span>{attendanceSortAsc ? '↑ Oldest First' : '↓ Newest First'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Calendar Heatmap Grid (Shown when a student is selected or for single-student view) */}
                  {filterStudentId && selectedStudentObj && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>📅 Monthly Attendance Calendar Heatmap:</span>
                            <span className="text-blue-700">{selectedStudentObj.full_name}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                              {attendanceDailyReport.month_name || filterMonth}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Visual overview of daily office attendance. Green = Came to office, Red = Absent, Grey = Weekend off.
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs flex-wrap">
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Came
                          </span>
                          <span className="flex items-center gap-1 text-rose-700 font-bold">
                            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Absent
                          </span>
                          <span className="flex items-center gap-1 text-amber-700 font-bold">
                            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 🪔 Festival / Day Off
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 font-bold">
                            <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span> Weekend
                          </span>
                        </div>
                      </div>

                      {/* Day Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-7 lg:grid-cols-10 gap-2">
                        {allDaily
                          .filter((r) => String(r.student_id) === String(filterStudentId))
                          .map((d) => {
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
                                        <span className="text-[8px] font-bold text-amber-700 bg-amber-100 rounded px-1 mt-0.5 block truncate">
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
                  )}

                  {/* Comprehensive Daily In-Out Register Table */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Office Daily Attendance Table</span>
                        <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                          Showing {filteredDaily.length} records
                        </span>
                      </h4>

                      <span className="text-xs text-slate-500 hidden sm:inline">
                        Month: <strong>{attendanceDailyReport.month_name || filterMonth}</strong>
                      </span>
                    </div>

                    {loadingAttendance ? (
                      <div className="text-center py-12 text-xs text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                        <span>Calculating monthly attendance register...</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-xs">
                          <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                            <tr>
                              <th className="px-4 py-3.5 text-left">Date & Day</th>
                              <th className="px-4 py-3.5 text-left">Student / Employee</th>
                              <th className="px-4 py-3.5 text-left">Office Status</th>
                              <th className="px-4 py-3.5 text-left">Clock In (In-Time)</th>
                              <th className="px-4 py-3.5 text-left">Clock Out (Out-Time)</th>
                              <th className="px-4 py-3.5 text-left">Office Duration</th>
                              <th className="px-4 py-3.5 text-left">Daily Work Report</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredDaily.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center py-10 text-slate-400">
                                  No attendance records match your active filter.
                                </td>
                              </tr>
                            ) : (
                              filteredDaily.map((row, idx) => {
                                const isPresent = row.status === 'PRESENT';
                                const isAbsent = row.status === 'ABSENT';
                                const isHoliday = row.is_holiday || row.status === 'HOLIDAY';
                                const isWeekend = row.status === 'WEEKEND';
                                const isUpcoming = row.status === 'UPCOMING';
                                const isToday = row.date === new Date().toISOString().split('T')[0];

                                return (
                                  <tr
                                    key={`${row.student_id}-${row.date}-${idx}`}
                                    className={`hover:bg-slate-50/80 transition ${
                                      isToday ? 'bg-blue-50/30' : isHoliday ? 'bg-amber-50/20' : isPresent ? 'bg-emerald-50/10' : ''
                                    }`}
                                  >
                                    {/* Date & Day */}
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
                                      <div className="text-[11px] text-slate-400 font-medium">
                                        {row.day_name}
                                      </div>
                                    </td>

                                    {/* Student Name & Tech */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="font-extrabold text-slate-900">{row.student_name}</div>
                                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-medium">
                                          {row.technology}
                                        </span>
                                        <span>•</span>
                                        <span className="font-mono text-slate-400">ID #{row.student_id}</span>
                                      </div>
                                    </td>

                                    {/* Office Attendance Status Badge */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {isPresent ? (
                                        <div className="space-y-0.5">
                                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-xl text-xs shadow-2xs">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span>Came to Office (Present)</span>
                                          </span>
                                          {row.is_holiday && (
                                            <div className="text-[11px] text-amber-700 font-bold ml-1">
                                              🪔 {row.holiday_name} (Festival Attended)
                                            </div>
                                          )}
                                        </div>
                                      ) : isHoliday ? (
                                        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-3 py-1 rounded-xl text-xs shadow-2xs">
                                          <Sparkles className="w-4 h-4 text-amber-600" />
                                          <span>🪔 Festival Day Off: {row.holiday_name}</span>
                                        </span>
                                      ) : isAbsent ? (
                                        <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-3 py-1 rounded-xl text-xs shadow-2xs">
                                          <XCircle className="w-4 h-4 text-rose-600" />
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

                                    {/* Clock In */}
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

                                    {/* Clock Out */}
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

                                    {/* Duration */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {isPresent ? (
                                        <span className="font-extrabold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">
                                          {row.duration}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300">0h 0m</span>
                                      )}
                                    </td>

                                    {/* Work Report */}
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
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}

            {/* ========================================================= */}
            {/* VIEW 2: CLOCK-IN / CLOCK-OUT SESSIONS                      */}
            {/* ========================================================= */}
            {attendanceViewMode === 'sessions' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Raw Clock-In / Clock-Out Sessions Log</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Total Sessions: <strong>{attendanceRecords.length}</strong>
                  </span>
                </div>

                {loadingAttendance ? (
                  <div className="text-center py-8 text-xs text-slate-500">Loading attendance data...</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px]">
                        <tr>
                          <th className="px-4 py-3.5 text-left">Student</th>
                          <th className="px-4 py-3.5 text-left">Date</th>
                          <th className="px-4 py-3.5 text-left">Clock In</th>
                          <th className="px-4 py-3.5 text-left">Clock Out</th>
                          <th className="px-4 py-3.5 text-left">Total Worked</th>
                          <th className="px-4 py-3.5 text-left">Breaks Logged</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                        {attendanceRecords.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">
                              No attendance sessions found for selected filter.
                            </td>
                          </tr>
                        ) : (
                          attendanceRecords.map((att) => {
                            const hrs = Math.floor((att.total_seconds_worked || 0) / 3600);
                            const mins = Math.floor(((att.total_seconds_worked || 0) % 3600) / 60);
                            return (
                              <tr key={att.id} className="hover:bg-slate-50 transition">
                                <td className="px-4 py-3 font-bold text-slate-900">{att.student_name}</td>
                                <td className="px-4 py-3">{att.date}</td>
                                <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                                  {att.clock_in ? new Date(att.clock_in).toLocaleTimeString() : '--'}
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-rose-700">
                                  {att.clock_out ? new Date(att.clock_out).toLocaleTimeString() : 'In Session'}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-800">
                                  {hrs}h {mins}m ({att.total_seconds_worked || 0}s)
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                  {att.breaks?.length ? `${att.breaks.length} break(s)` : 'None'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: DAILY HOURLY WORK REPORTS                         */}
            {/* ========================================================= */}
            {attendanceViewMode === 'reports' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Submitted Daily Hourly Work Reports</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Total Reports: <strong>{dailyReports.length}</strong>
                  </span>
                </div>

                {dailyReports.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No daily work reports submitted for this selection.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dailyReports.map((rep) => (
                      <div key={rep.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/70 space-y-3 shadow-2xs hover:border-slate-300 transition">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{rep.student_name}</span>
                            <span className="text-[11px] text-slate-500 ml-2">({rep.technology})</span>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-lg">
                            {rep.date}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Hourly Task Breakdown:
                          </span>
                          {rep.tasks && rep.tasks.length > 0 ? (
                            rep.tasks.map((t, i) => (
                              <div key={i} className="flex gap-2 bg-white p-2 rounded-xl border border-slate-100">
                                <span className="font-mono font-semibold text-blue-700 whitespace-nowrap">
                                  {t.slot || t.time_slot}:
                                </span>
                                <span className="text-slate-700">{t.task}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-400 italic">No slots entered.</div>
                          )}
                        </div>

                        {rep.summary && (
                          <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                            <strong>Summary:</strong> {rep.summary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* 4. DOCUMENT APPROVALS & PDF RELEASES (VOICE NOTE 2) */}
        {/* ======================================================== */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Internship Offer Letter & Certificate Release</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Voice Note 2: When Admin approves, system auto-generates official Offer Letters and Completion Certificates as PDFs.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">College & Domain</th>
                    <th className="px-4 py-3 text-center">Offer Letter</th>
                    <th className="px-4 py-3 text-center">Completion Certificate</th>
                    <th className="px-4 py-3 text-right">PDF Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{s.full_name}</td>
                      <td className="px-4 py-3">
                        <div>{s.college_name}</div>
                        <div className="text-blue-600 font-semibold">{s.technology}</div>
                      </td>

                      {/* Offer Letter Toggle & Edit */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {s.offer_letter_approved ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Approved
                              </span>
                              <button
                                onClick={() => handleToggleDoc(s.id, 'offer_letter', false)}
                                title="Revoke offer letter approval"
                                className="text-[11px] text-slate-400 hover:text-rose-600 underline font-medium transition"
                              >
                                Revoke
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleDoc(s.id, 'offer_letter', true)}
                              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition"
                            >
                              <Plus className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}

                          <button
                            onClick={() => {
                              handleOpenEditOfferLetter(s);
                              navigate(`/admin/offer-letter/${s.id}`);
                            }}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold transition"
                            title="Edit Offer Letter on dedicated page"
                          >
                            <Edit className="w-3 h-3 text-blue-600" />
                            <span>Edit Letter</span>
                          </button>
                        </div>
                      </td>

                      {/* Certificate Toggle & Edit */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {s.certificate_approved ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Approved
                              </span>
                              <button
                                onClick={() => handleToggleDoc(s.id, 'certificate', false)}
                                title="Revoke certificate approval"
                                className="text-[11px] text-slate-400 hover:text-rose-600 underline font-medium transition"
                              >
                                Revoke
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleDoc(s.id, 'certificate', true)}
                              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition"
                            >
                              <Plus className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditCertificate(s)}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold transition"
                            title="Edit Certificate details, tenure dates, signatories, or custom remarks"
                          >
                            <Edit className="w-3 h-3 text-emerald-600" />
                            <span>Edit Certificate</span>
                          </button>
                        </div>
                      </td>

                      {/* Direct PDF Preview & Download Actions */}
                      <td className="px-4 py-3 text-right">
                        {!s.offer_letter_approved && !s.certificate_approved ? (
                          <span className="text-slate-400 italic text-[11px]">Awaiting Approval</span>
                        ) : (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {s.offer_letter_approved && (
                              <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg p-0.5 text-xs">
                                <a
                                  href={api.getOfferLetterUrl(s.id, true)}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View Offer Letter PDF"
                                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 px-2 py-0.5 font-semibold"
                                >
                                  <Eye className="w-3 h-3" /> Letter
                                </a>
                                <a
                                  href={api.getOfferLetterUrl(s.id, false)}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Download Offer Letter PDF"
                                  className="text-blue-600 hover:text-blue-800 p-1 border-l border-blue-200"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            {s.certificate_approved && (
                              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-lg p-0.5 text-xs">
                                <a
                                  href={api.getCertificateUrl(s.id, true)}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View Certificate PDF"
                                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 px-2 py-0.5 font-semibold"
                                >
                                  <Eye className="w-3 h-3" /> Cert
                                </a>
                                <a
                                  href={api.getCertificateUrl(s.id, false)}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Download Certificate PDF"
                                  className="text-emerald-600 hover:text-emerald-800 p-1 border-l border-emerald-200"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. SUBJECTS & ALLOCATED NOTES (VOICE NOTE 3) */}
        {/* ======================================================== */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Create Subject & Allocate */}
            <div className="space-y-6">
              
              {/* Create Subject */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Create New Subject</span>
                </h3>
                <form noValidate onSubmit={handleCreateSubject} className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-semibold text-slate-700">Subject Name *</label>
                      <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Django REST API Design"
                      value={newSubject.name}
                      onChange={(e) => {
                        setNewSubject({ ...newSubject, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') });
                        if (subjectErrors.name) setSubjectErrors(prev => ({ ...prev, name: '' }));
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 font-medium transition ${
                        subjectErrors.name ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {subjectErrors.name && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{subjectErrors.name}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="Backend / Frontend / AI"
                      value={newSubject.category}
                      onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Add Subject
                  </button>
                </form>
              </div>

              {/* Allocate Subject to Student */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Allocate Subject to Student</span>
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Voice Note 3: Students can ONLY view notes for subjects allocated to them.
                </p>
                <form noValidate onSubmit={handleAllocateSubject} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                    <select
                      value={allocData.student_id}
                      onChange={(e) => {
                        setAllocData({ ...allocData, student_id: e.target.value });
                        if (allocErrors.student_id) setAllocErrors(prev => ({ ...prev, student_id: '' }));
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 font-medium transition ${
                        allocErrors.student_id ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    >
                      <option value="">-- Choose Student --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.technology})</option>
                      ))}
                    </select>
                    {allocErrors.student_id && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{allocErrors.student_id}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Subject *</label>
                    <select
                      value={allocData.subject_id}
                      onChange={(e) => {
                        setAllocData({ ...allocData, subject_id: e.target.value });
                        if (allocErrors.subject_id) setAllocErrors(prev => ({ ...prev, subject_id: '' }));
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 font-medium transition ${
                        allocErrors.subject_id ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.category})</option>
                      ))}
                    </select>
                    {allocErrors.subject_id && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{allocErrors.subject_id}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Allocate Subject
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Upload Notes & View Notes */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Upload Note Form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Upload / Publish Study Notes</span>
                </h3>
                <form noValidate onSubmit={handleCreateNote} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                      <select
                        value={newNote.subject_id}
                        onChange={(e) => {
                          setNewNote({ ...newNote, subject_id: e.target.value });
                          if (noteErrors.subject_id) setNoteErrors(prev => ({ ...prev, subject_id: '' }));
                        }}
                        className={`w-full p-2 border rounded-lg focus:ring-2 font-medium transition ${
                          noteErrors.subject_id ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">-- Select Subject --</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                      {noteErrors.subject_id && (
                        <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{noteErrors.subject_id}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Note Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Introduction to React Hooks"
                        value={newNote.title}
                        onChange={(e) => {
                          setNewNote({ ...newNote, title: e.target.value });
                          if (noteErrors.title) setNoteErrors(prev => ({ ...prev, title: '' }));
                        }}
                        className={`w-full p-2 border rounded-lg focus:ring-2 font-medium transition ${
                          noteErrors.title ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                        }`}
                      />
                      {noteErrors.title && (
                        <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{noteErrors.title}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Content / Learning Material *</label>
                    <textarea
                      rows={4}
                      placeholder="Write detailed notes, documentation, guides, or code examples here..."
                      value={newNote.content}
                      onChange={(e) => {
                        setNewNote({ ...newNote, content: e.target.value });
                        if (noteErrors.content) setNoteErrors(prev => ({ ...prev, content: '' }));
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 font-medium transition ${
                        noteErrors.content ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    ></textarea>
                    {noteErrors.content && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{noteErrors.content}</span>
                      </p>
                    )}
                  </div>

                  {/* PDF / File Attachment Input */}
                  <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                          <span>Attach PDF / Study Document File (Optional)</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Supports PDF, DOC, PPT, ZIP</span>
                      </div>

                      {!noteFile ? (
                        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition group">
                          <div className="flex items-center gap-2 text-slate-600 group-hover:text-blue-600 font-semibold text-xs">
                            <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                            <span>Click to browse and upload PDF or Study Document</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Students will be able to view and download this file directly from their portal
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setNoteFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-2 bg-rose-600 text-white rounded-lg flex-shrink-0 shadow-xs">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-slate-900 truncate">{noteFile.name}</p>
                              <p className="text-[10px] text-blue-700 font-medium">
                                {(noteFile.size / 1024).toFixed(1)} KB • Attached for upload
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNoteFile(null)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={uploadingNote}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{uploadingNote ? 'Uploading & Publishing...' : 'Publish Note'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* List Published Notes */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    All Published Notes ({allNotes.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Filtered per subject allocation for students</span>
                </div>

                {allNotes.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No study notes published yet. Use the form above to add notes or attach a PDF!
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 text-xs">
                    {allNotes.map((n) => (
                      <div key={n.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2 hover:border-blue-200 transition">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                              {n.subject_name}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {n.uploaded_at ? new Date(n.uploaded_at).toLocaleDateString() : ''}
                            </span>
                            <button
                              onClick={() => handleDeleteNote(n.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {n.content && (
                          <p className="text-slate-600 line-clamp-3 text-xs leading-relaxed bg-white p-3 rounded-xl border border-slate-150">
                            {n.content}
                          </p>
                        )}

                        {(n.document_url || n.document) && (
                          <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-xl border border-blue-100 gap-2 mt-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </span>
                              <span className="font-semibold text-slate-800 text-xs truncate max-w-xs">
                                {n.file_name || 'Attached Study PDF / Material'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <a
                                href={api.getNoteDocumentUrl(n.document_url || n.document)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                                title="Open / Preview PDF in new tab"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View PDF</span>
                              </a>
                              <a
                                href={api.getNoteDocumentUrl(n.document_url || n.document)}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                                title="Download Document"
                              >
                                <Download className="w-3 h-3" />
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

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 6. MCQ EXAM ENGINE (VOICE NOTE 2) */}
        {/* ======================================================== */}
        {activeTab === 'mcq' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Add Category & Question */}
            <div className="space-y-6">
              
              {/* New Category */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Create MCQ Category</span>
                </h3>
                <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Python Core, React UI"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Add Category
                  </button>
                </form>
              </div>

              {/* Add Question */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Add MCQ Question</span>
                </h3>
                <form onSubmit={handleCreateQuestion} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      required
                      value={newQuestion.category_id}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choose Category --</option>
                      {mcqCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Question Text</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Enter question..."
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt}>
                      <label className="block font-semibold text-slate-600 mb-0.5">Option {opt}</label>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${opt} text`}
                        value={newQuestion[`option_${opt.toLowerCase()}`]}
                        onChange={(e) =>
                          setNewQuestion({ ...newQuestion, [`option_${opt.toLowerCase()}`]: e.target.value })
                        }
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Correct Answer</label>
                    <select
                      value={newQuestion.correct_option}
                      onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-blue-700"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Save Question
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Student Exam Results */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>Student Exam Attempts & Scores</span>
              </h3>

              {examResults.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No exam attempts submitted yet by students.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3 text-left">Student</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-center">Score</th>
                        <th className="px-4 py-3 text-center">Percentage</th>
                        <th className="px-4 py-3 text-right">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {examResults.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">{r.student_name}</td>
                          <td className="px-4 py-3">{r.category_name}</td>
                          <td className="px-4 py-3 text-center font-bold">
                            {r.score} / {r.total_questions}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">
                            {r.percentage}%
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500">
                            {new Date(r.submitted_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>



      {/* Edit Completion Certificate Modal (same to same as Offer Letter) */}
      {editingCertStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                    Akash Technolabs Verified Certificate
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Ref: AT-CERT-{String(editingCertStudent.id).padStart(4, '0')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Edit Completion Certificate — {editingCertStudent.full_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Modify recipient name, college, tenure dates, signatories, or custom evaluation remarks before generating the official PDF.
                </p>
              </div>
              <button
                onClick={() => setEditingCertStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              
              {/* Candidate Name & Program Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Candidate Full Name:
                  </label>
                  <input
                    type="text"
                    value={certFormData.full_name}
                    onChange={(e) => setCertFormData({ ...certFormData, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="e.g. Aryan Tivar"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Program Award Title:
                  </label>
                  <input
                    type="text"
                    value={certFormData.certificate_program_title}
                    onChange={(e) => setCertFormData({ ...certFormData, certificate_program_title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder={`for successfully completing the ${certFormData.internship_duration_months}-Month Internship program in ${certFormData.technology || 'AI/ML'}`}
                  />
                </div>
              </div>

              {/* College & University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    College / Institute Name:
                  </label>
                  <input
                    type="text"
                    value={certFormData.college_name}
                    onChange={(e) => setCertFormData({ ...certFormData, college_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="e.g. Silver Oak University"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    University / Board:
                  </label>
                  <input
                    type="text"
                    value={certFormData.university}
                    onChange={(e) => setCertFormData({ ...certFormData, university: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="e.g. Ahmedabad, Gujarat"
                  />
                </div>
              </div>

              {/* Technology & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Technology / Domain:
                  </label>
                  <input
                    type="text"
                    value={certFormData.technology}
                    onChange={(e) => setCertFormData({ ...certFormData, technology: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="e.g. AI/ML"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Internship Duration (Months):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={certFormData.internship_duration_months}
                    onChange={(e) => setCertFormData({ ...certFormData, internship_duration_months: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Certificate Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Date of Issue:
                  </label>
                  <input
                    type="date"
                    value={certFormData.certificate_issue_date}
                    onChange={(e) => setCertFormData({ ...certFormData, certificate_issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tenure Start Date:
                  </label>
                  <input
                    type="date"
                    value={certFormData.certificate_start_date}
                    onChange={(e) => setCertFormData({ ...certFormData, certificate_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tenure End Date:
                  </label>
                  <input
                    type="date"
                    value={certFormData.certificate_end_date}
                    onChange={(e) => setCertFormData({ ...certFormData, certificate_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                    placeholder="Auto-calculated if blank"
                  />
                </div>
              </div>

              {/* Signatory 1 (Left / CEO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Primary Signatory Name (Left):
                  </label>
                  <input
                    type="text"
                    value={certFormData.certificate_signatory_name}
                    onChange={(e) => setCertFormData({ ...certFormData, certificate_signatory_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Akash Padhiyar"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Primary Designation (Left):
                  </label>
                  <input
                    type="text"
                    value={certFormData.certificate_signatory_role}
                    onChange={(e) => setCertFormData({ ...certFormData, certificate_signatory_role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="CEO, Akash Technolabs"
                  />
                </div>
              </div>

              {/* Signatory 2 (Right / Director) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Secondary Signatory Name (Right):
                  </label>
                  <input
                    type="text"
                    value={certFormData.certificate_signatory_two_name}
                    onChange={(e) => setCertFormData({ ...certFormData, certificate_signatory_two_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Director of Technical Training"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Secondary Designation (Right):
                  </label>
                  <input
                    type="text"
                    value={certFormData.certificate_signatory_two_role}
                    onChange={(e) => setCertFormData({ ...certFormData, certificate_signatory_two_role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Akash Technolabs"
                  />
                </div>
              </div>

              {/* Optional Custom Evaluation / Appreciation Paragraph */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-semibold mb-1">
                  Performance & Dedication Remarks (Optional):
                </label>
                <textarea
                  rows="2"
                  value={certFormData.certificate_custom_text}
                  onChange={(e) => setCertFormData({ ...certFormData, certificate_custom_text: e.target.value })}
                  placeholder="During this tenure, the intern demonstrated exceptional technical competence, diligence, and dedication."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank or keep default to display official standard appreciation remarks.
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCertStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <a
                  href={api.getCertificateUrl(editingCertStudent.id, true)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Current PDF</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingCertificate}
                  onClick={() => handleSaveCertificate(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingCertificate ? 'Saving...' : 'Save Changes'}
                </button>

                {!editingCertStudent.certificate_approved && (
                  <button
                    type="button"
                    disabled={savingCertificate}
                    onClick={() => handleSaveCertificate(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save & Approve Document</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Student Profile Modal */}
      {editingProfileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col my-4 max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-start gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold px-2.5 py-0.5 rounded-full">
                    Student Record Management
                  </span>
                  <span className="text-[11px] bg-white/10 text-slate-300 font-mono px-2 py-0.5 rounded-full">
                    ID #{editingProfileStudent.id}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold mt-2">
                  Edit Student Profile — {editingProfileStudent.full_name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Update candidate credentials, contact details, college, or enrollment status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfileStudent(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form noValidate onSubmit={handleSaveAdminProfile} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Full Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Candidate Full Name *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Aryan Tivar"
                    value={profileFormData.full_name}
                    onChange={(e) => updateAdminProfileField('full_name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    onBlur={() => handleAdminProfileBlur('full_name')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      adminProfileErrors.full_name ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {adminProfileErrors.full_name && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{adminProfileErrors.full_name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Mobile Number *</label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {profileFormData.mobile_number.length}/10 digits
                    </span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={profileFormData.mobile_number}
                    onChange={(e) => updateAdminProfileField('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={() => handleAdminProfileBlur('mobile_number')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      adminProfileErrors.mobile_number ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {adminProfileErrors.mobile_number && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{adminProfileErrors.mobile_number}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. aryan@example.com"
                  value={profileFormData.email}
                  onChange={(e) => updateAdminProfileField('email', e.target.value)}
                  onBlur={() => handleAdminProfileBlur('email')}
                  className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                    adminProfileErrors.email ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {adminProfileErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{adminProfileErrors.email}</span>
                  </p>
                )}
              </div>

              {/* College & University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">College / Institute Name *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. SAL Engineering College"
                    value={profileFormData.college_name}
                    onChange={(e) => updateAdminProfileField('college_name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    onBlur={() => handleAdminProfileBlur('college_name')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      adminProfileErrors.college_name ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {adminProfileErrors.college_name && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{adminProfileErrors.college_name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">University *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Gujarat Technological University"
                    value={profileFormData.university}
                    onChange={(e) => updateAdminProfileField('university', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    onBlur={() => handleAdminProfileBlur('university')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      adminProfileErrors.university ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {adminProfileErrors.university && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{adminProfileErrors.university}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Technology */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 font-bold">Technology / Domain *</label>
                  <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Python Full Stack"
                  value={profileFormData.technology}
                  onChange={(e) => updateAdminProfileField('technology', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  onBlur={() => handleAdminProfileBlur('technology')}
                  className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                    adminProfileErrors.technology ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {adminProfileErrors.technology && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{adminProfileErrors.technology}</span>
                  </p>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProfileStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdminProfile}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingAdminProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col my-4 max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-start gap-4 flex-shrink-0">
              <div>
                <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold px-2.5 py-0.5 rounded-full">
                  Admin Registration
                </span>
                <h3 className="text-xl font-extrabold mt-2">
                  Add New Student Account
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Directly create and activate an approved student account with login credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form noValidate onSubmit={handleCreateStudentSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Full Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Candidate Full Name *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Aryan Tivar"
                    value={newStudentData.full_name}
                    onChange={(e) => updateAddStudentField('full_name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    onBlur={() => handleAddStudentBlur('full_name')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      addStudentErrors.full_name ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {addStudentErrors.full_name && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{addStudentErrors.full_name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Mobile Number *</label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {newStudentData.mobile_number.length}/10 digits
                    </span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={newStudentData.mobile_number}
                    onChange={(e) => updateAddStudentField('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={() => handleAddStudentBlur('mobile_number')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      addStudentErrors.mobile_number ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {addStudentErrors.mobile_number && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{addStudentErrors.mobile_number}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Technology */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. aryan@example.com"
                    value={newStudentData.email}
                    onChange={(e) => updateAddStudentField('email', e.target.value)}
                    onBlur={() => handleAddStudentBlur('email')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      addStudentErrors.email ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {addStudentErrors.email && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{addStudentErrors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Technology / Domain *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Python Full Stack"
                    value={newStudentData.technology}
                    onChange={(e) => updateAddStudentField('technology', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    onBlur={() => handleAddStudentBlur('technology')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      addStudentErrors.technology ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {addStudentErrors.technology && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{addStudentErrors.technology}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* College & University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">College / Institute Name *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. SAL Engineering College"
                    value={newStudentData.college_name}
                    onChange={(e) => updateAddStudentField('college_name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    onBlur={() => handleAddStudentBlur('college_name')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      addStudentErrors.college_name ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {addStudentErrors.college_name && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{addStudentErrors.college_name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">University *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Letters only</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Gujarat Technological University"
                    value={newStudentData.university}
                    onChange={(e) => updateAddStudentField('university', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    onBlur={() => handleAddStudentBlur('university')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      addStudentErrors.university ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {addStudentErrors.university && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{addStudentErrors.university}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Login Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Login Username *</label>
                  <input
                    type="text"
                    placeholder="e.g. aryan_tivar"
                    value={newStudentData.username}
                    onChange={(e) => updateAddStudentField('username', e.target.value)}
                    onBlur={() => handleAddStudentBlur('username')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      addStudentErrors.username ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {addStudentErrors.username && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{addStudentErrors.username}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Password *</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newStudentData.password}
                    onChange={(e) => updateAddStudentField('password', e.target.value)}
                    onBlur={() => handleAddStudentBlur('password')}
                    className={`w-full px-3 py-2 border rounded-xl font-semibold text-xs transition ${
                      addStudentErrors.password ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {addStudentErrors.password && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{addStudentErrors.password}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStudent}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creatingStudent ? 'Creating...' : 'Register & Approve Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday & Festival Management Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col my-4 max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 text-white flex justify-between items-start gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Official Calendar & Attendance Control</span>
                  </span>
                  <span className="text-[11px] bg-white/10 text-white/80 font-semibold px-2 py-0.5 rounded-full">
                    {holidaysList.length} Festivals & Holidays
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                  🪔 Festivals & Holidays Management
                </h3>
                <p className="text-xs text-amber-100/80 mt-1 max-w-xl">
                  Declare official festivals and holidays. On festival days, students are marked as <strong>Day Off</strong> instead of Absent, and the festival name appears on the attendance calendar.
                </p>
              </div>

              <button
                onClick={() => setShowHolidayModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Form to declare new festival/holiday */}
              <form noValidate onSubmit={handleCreateHoliday} className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-700" />
                    <span>Declare New Festival / Day Off</span>
                  </h4>
                  <span className="text-[11px] text-amber-800 font-medium">Updates all students instantly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={newHolidayData.date}
                      onChange={(e) => {
                        setNewHolidayData({ ...newHolidayData, date: e.target.value });
                        if (holidayErrors.date) setHolidayErrors(prev => ({ ...prev, date: '' }));
                      }}
                      className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 font-semibold text-xs transition ${
                        holidayErrors.date ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-amber-500'
                      }`}
                    />
                    {holidayErrors.date && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{holidayErrors.date}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-slate-700">Festival / Holiday Name *</label>
                      <span className="text-[10px] text-amber-700 font-medium">Letters only</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Diwali, Dussehra, Navratri, Maha Shivratri"
                      value={newHolidayData.name}
                      onChange={(e) => {
                        setNewHolidayData({ ...newHolidayData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') });
                        if (holidayErrors.name) setHolidayErrors(prev => ({ ...prev, name: '' }));
                      }}
                      className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 font-semibold text-xs transition ${
                        holidayErrors.name ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-slate-300 focus:ring-amber-500'
                      }`}
                    />
                    {holidayErrors.name && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{holidayErrors.name}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Holiday Type</label>
                    <select
                      value={newHolidayData.holiday_type}
                      onChange={(e) => setNewHolidayData({ ...newHolidayData, holiday_type: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold text-xs"
                    >
                      <option value="FESTIVAL">🪔 Festival (Diwali, Holi, Dussehra, etc.)</option>
                      <option value="NATIONAL">🇮🇳 National Holiday (Gandhi Jayanti, Independence Day)</option>
                      <option value="OFFICE_OFF">🏢 Office Day Off / Declared Holiday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Office closed for celebration"
                      value={newHolidayData.description}
                      onChange={(e) => setNewHolidayData({ ...newHolidayData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold">
                    <input
                      type="checkbox"
                      checked={newHolidayData.is_day_off}
                      onChange={(e) => setNewHolidayData({ ...newHolidayData, is_day_off: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Office is Closed (Full Day Off — Do NOT count as Absent)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingHoliday}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingHoliday ? 'Saving...' : 'Save & Declare Day Off'}</span>
                  </button>
                </div>
              </form>

              {/* Declared Holidays List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Declared Festivals & Holidays ({holidaysList.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">All dates sorted chronologically</span>
                </div>

                {holidaysList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No holidays declared yet. Use the form above to add festival dates!
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
                        <tr>
                          <th className="px-3.5 py-2.5 text-left">Date</th>
                          <th className="px-3.5 py-2.5 text-left">Festival / Holiday</th>
                          <th className="px-3.5 py-2.5 text-left">Category</th>
                          <th className="px-3.5 py-2.5 text-center">Status</th>
                          <th className="px-3.5 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {holidaysList.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50 transition">
                            <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {h.date}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span className="font-extrabold text-slate-900">🪔 {h.name}</span>
                              {h.description && (
                                <span className="block text-[11px] text-slate-400 font-normal">{h.description}</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                h.holiday_type === 'FESTIVAL'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : h.holiday_type === 'NATIONAL'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}>
                                {h.holiday_type_display || h.holiday_type}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              {h.is_day_off ? (
                                <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  Office Day Off
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500">Working Day</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteHoliday(h.id)}
                                className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition"
                                title="Delete Holiday"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHolidayModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition"
              >
                Close Calendar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
