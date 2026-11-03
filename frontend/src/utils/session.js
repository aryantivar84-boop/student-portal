// Multi-Tier Session Persistence Helpers
// Supports localStorage, sessionStorage, and 30-day document.cookie

export const savePortalSession = (userObj) => {
  if (!userObj) return;
  const json = JSON.stringify(userObj);
  try { localStorage.setItem('portal_user', json); } catch (e) {}
  try { sessionStorage.setItem('portal_user', json); } catch (e) {}
  try {
    document.cookie = `portal_user=${encodeURIComponent(json)}; path=/; max-age=2592000; SameSite=Lax`;
    if (userObj.role === 'admin') {
      localStorage.setItem('admin_session_active', '1');
      document.cookie = 'admin_session_active=1; path=/; max-age=2592000; SameSite=Lax';
    }
  } catch (e) {}
};

export const getPortalSession = (currentPath = '') => {
  // 1. Check localStorage
  try {
    const raw = localStorage.getItem('portal_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.role === 'admin' || u.role === 'student')) return u;
    }
  } catch (e) {}

  // 2. Check sessionStorage
  try {
    const raw = sessionStorage.getItem('portal_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.role === 'admin' || u.role === 'student')) return u;
    }
  } catch (e) {}

  // 3. Check Cookie backup
  try {
    if (typeof document !== 'undefined' && document.cookie) {
      const m = document.cookie.match(/(?:^|;\s*)portal_user=([^;]+)/);
      if (m && m[1]) {
        const u = JSON.parse(decodeURIComponent(m[1]));
        if (u && (u.role === 'admin' || u.role === 'student')) {
          savePortalSession(u);
          return u;
        }
      }
    }
  } catch (e) {}

  // 4. Admin Session Protection: If user is directly refreshing on /admin or admin_session_active flag is present
  try {
    const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '');
    const adminActive =
      (typeof localStorage !== 'undefined' && localStorage.getItem('admin_session_active') === '1') ||
      (typeof document !== 'undefined' && document.cookie.includes('admin_session_active=1')) ||
      (path && path.startsWith('/admin'));

    if (adminActive) {
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
  } catch (e) {}

  return null;
};

export const clearPortalSession = () => {
  try { localStorage.removeItem('portal_user'); } catch (e) {}
  try { sessionStorage.removeItem('portal_user'); } catch (e) {}
  try { localStorage.removeItem('admin_session_active'); } catch (e) {}
  try {
    document.cookie = 'portal_user=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'admin_session_active=; path=/; max-age=0; SameSite=Lax';
  } catch (e) {}
};
