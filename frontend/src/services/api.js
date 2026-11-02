const API_BASE = 'http://localhost:8000/api';

export const getMediaUrl = (urlOrPath) => {
  if (!urlOrPath) return '';
  if (typeof urlOrPath !== 'string') return '';
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://') || urlOrPath.startsWith('data:') || urlOrPath.startsWith('blob:')) {
    return urlOrPath;
  }
  const cleanPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `http://localhost:8000${cleanPath}`;
};

export const api = {
  getMediaUrl,
  // Auth
  register: async (data) => {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data)
    });
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  },

  // Student Attendance
  getTodayAttendance: async (studentId) => {
    const res = await fetch(`${API_BASE}/student/attendance/today/?student_id=${studentId}`);
    return res.json();
  },

  clockIn: async (studentId) => {
    const res = await fetch(`${API_BASE}/student/attendance/clock-in/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    return res.json();
  },

  pauseWork: async (studentId, reason, accumulatedSeconds) => {
    const res = await fetch(`${API_BASE}/student/attendance/pause/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, reason, accumulated_seconds: accumulatedSeconds })
    });
    return res.json();
  },

  resumeWork: async (studentId) => {
    const res = await fetch(`${API_BASE}/student/attendance/resume/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    return res.json();
  },

  clockOut: async (studentId, accumulatedSeconds) => {
    const res = await fetch(`${API_BASE}/student/attendance/clock-out/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, accumulated_seconds: accumulatedSeconds })
    });
    return res.json();
  },

  // Work Reports
  submitDailyReport: async (studentId, tasks, summary) => {
    const res = await fetch(`${API_BASE}/student/report/submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, tasks, summary })
    });
    return res.json();
  },

  getDailyReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/student/reports/?${query}`);
    return res.json();
  },

  // Admin APIs
  getStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/students/?${query}`);
    return res.json();
  },

  verifyStudent: async (studentId, action) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  },

  verifyAllStudents: async (action = 'approve') => {
    const res = await fetch(`${API_BASE}/admin/students/verify-all/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  },

  toggleDocumentApproval: async (studentId, docType, approved) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/documents/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_type: docType, approved })
    });
    return res.json();
  },

  updateOfferLetter: async (studentId, data) => {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/offer-letter/`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data)
    });
    return res.json();
  },

  getOfferAssetUrl: (assetName) => {
    return `${API_BASE}/documents/assets/${assetName}/`;
  },

  getMediaUrl: (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  },

  updateCertificate: async (studentId, data) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/certificate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateStudentProfile: async (studentId, data) => {
    const res = await fetch(`${API_BASE}/student/profile/${studentId}/update/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  },


  getAdminAttendance: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/attendance/?${query}`);
    return res.json();
  },

  getAttendanceDailyReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/attendance/daily-report/?${query}`);
    return res.json();
  },

  // Holidays & Festivals Calendar
  getHolidays: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/holidays/?${query}`);
    return res.json();
  },

  createHoliday: async (data) => {
    const res = await fetch(`${API_BASE}/holidays/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteHoliday: async (holidayId) => {
    const res = await fetch(`${API_BASE}/holidays/${holidayId}/`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Subjects & Notes
  getSubjects: async () => {
    const res = await fetch(`${API_BASE}/subjects/`);
    return res.json();
  },

  createSubject: async (data) => {
    const res = await fetch(`${API_BASE}/subjects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  allocateSubject: async (studentId, subjectId, action = 'allocate') => {
    const res = await fetch(`${API_BASE}/subjects/allocate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, subject_id: subjectId, action })
    });
    return res.json();
  },

  getStudentAllocatedSubjects: async (studentId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/subjects/`);
    return res.json();
  },

  getNotes: async (studentId = null) => {
    const url = studentId ? `${API_BASE}/notes/?student_id=${studentId}` : `${API_BASE}/notes/`;
    const res = await fetch(url);
    return res.json();
  },

  createNote: async (data) => {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE}/notes/`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data)
    });
    return res.json();
  },

  deleteNote: async (noteId) => {
    const res = await fetch(`${API_BASE}/notes/${noteId}/`, {
      method: 'DELETE'
    });
    return res.json();
  },

  getNoteDocumentUrl: (docUrl) => {
    if (!docUrl) return '';
    if (docUrl.startsWith('http://') || docUrl.startsWith('https://')) return docUrl;
    return `http://localhost:8000${docUrl.startsWith('/') ? '' : '/'}${docUrl}`;
  },

  // MCQ Exams
  getMCQCategories: async () => {
    const res = await fetch(`${API_BASE}/mcq/categories/`);
    return res.json();
  },

  createMCQCategory: async (data) => {
    const res = await fetch(`${API_BASE}/mcq/categories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getMCQQuestions: async (categoryId, forAdmin = false) => {
    const res = await fetch(`${API_BASE}/mcq/questions/?category_id=${categoryId}&for_admin=${forAdmin}`);
    return res.json();
  },

  createMCQQuestion: async (data) => {
    const res = await fetch(`${API_BASE}/mcq/questions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  submitMCQExam: async (studentId, categoryId, answers) => {
    const res = await fetch(`${API_BASE}/mcq/submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, category_id: categoryId, answers })
    });
    return res.json();
  },

  getExamResults: async (studentId = null) => {
    const url = studentId ? `${API_BASE}/mcq/results/?student_id=${studentId}` : `${API_BASE}/mcq/results/`;
    const res = await fetch(url);
    return res.json();
  },

  // Student Profile
  getStudentProfile: async (studentId) => {
    const res = await fetch(`${API_BASE}/student/profile/${studentId}/`);
    return res.json();
  },

  // News & Announcements / Notifications
  getNews: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/news/?${query}`);
    return res.json();
  },

  postNews: async (data) => {
    const res = await fetch(`${API_BASE}/news/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteNews: async (noticeId) => {
    const res = await fetch(`${API_BASE}/news/${noticeId}/`, {
      method: 'DELETE'
    });
    return res.json();
  },

  markNoticeRead: async (noticeId, studentId) => {
    const res = await fetch(`${API_BASE}/news/${noticeId}/mark-read/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    return res.json();
  },

  markAllNoticesRead: async (studentId) => {
    const res = await fetch(`${API_BASE}/news/mark-all-read/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    return res.json();
  },

  // PDF & Word (.docx) URLs
  getOfferLetterUrl: (studentId, preview = false) =>
    `${API_BASE}/documents/offer-letter/${studentId}/${preview ? '?preview=1' : ''}`,
  getOfferLetterDocxUrl: (studentId, preview = false) =>
    `${API_BASE}/documents/offer-letter/${studentId}/word/${preview ? '?preview=1' : ''}`,
  importOfferLetterDocx: async (studentId, file, autoSave = false) => {
    const formData = new FormData();
    formData.append('docx_file', file);
    if (autoSave) formData.append('auto_save', 'true');
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/import-offer-letter-docx/`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  getCertificateUrl: (studentId, preview = false) =>
    `${API_BASE}/documents/certificate/${studentId}/${preview ? '?preview=1' : ''}`,
};

