import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationCenter from '../components/NotificationCenter';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showInfo } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('profile_photo') || '');

  const navItems = [
    { label: 'Dashboard', route: '/Dashboard', icon: '📊' },
    { label: 'Feed', route: '/feed', icon: '📢' },
    { label: 'My Shoutouts', route: '/my-shoutouts', icon: '🏆' },
    { label: 'Leaderboard', route: '/leaderboard', icon: '⭐' },
    { label: 'Analytics', route: '/analytics', icon: '📈' },
    { label: 'Settings', route: '/settings', icon: '⚙️' },
  ];

  useEffect(() => {
    const syncProfileData = () => {
      const email = localStorage.getItem('email') || sessionStorage.getItem('email') || '';
      const role = localStorage.getItem('role') || sessionStorage.getItem('role') || 'user';
      let name = localStorage.getItem('name') || sessionStorage.getItem('name') || '';
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const photo = localStorage.getItem('profile_photo') || '';

      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.name && !name) name = decoded.name;
          if (decoded.user_id) setCurrentUserId(decoded.user_id);
        } catch (e) {
          console.error("Header: token decoding error", e);
        }
      }

      setUserEmail(email);
      setUserRole(role);
      setUserName(name);
      setProfilePhoto(photo);
    };

    syncProfileData();

    window.addEventListener('profilePhotoUpdated', syncProfileData);
    window.addEventListener('storage', syncProfileData);

    return () => {
      window.removeEventListener('profilePhotoUpdated', syncProfileData);
      window.removeEventListener('storage', syncProfileData);
    };
  }, []);

  const getActiveRoute = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/dashboard')) return '/Dashboard';
    if (path.includes('/my-shoutouts')) return '/my-shoutouts';
    if (path.includes('/leaderboard')) return '/leaderboard';
    if (path.includes('/analytics')) return '/analytics';
    if (path.includes('/settings')) return '/settings';
    if (path.includes('/feed')) return '/feed';
    return '/Dashboard';
  };

  const currentRoute = getActiveRoute();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setProfilePhoto('');
    setCurrentUserId(null);
    window.dispatchEvent(new Event('profilePhotoUpdated'));
    if (showInfo) showInfo('Signed out successfully.');
    navigate('/login');
  };

  const getInitials = (nameStr, emailStr) => {
    const target = (nameStr && nameStr.trim()) ? nameStr.trim() : (emailStr || '');
    if (!target) return 'U';
    const parts = target.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return target.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Top Header: Only Sidebar Toggle + Logo on Left, Notification Bell + SA Avatar Symbol on Right */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar Navigation"
              aria-label="Toggle Sidebar Navigation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <div className="logo" onClick={() => navigate('/Dashboard')} style={{ cursor: 'pointer' }}>
              <div className="logo-icon-wrapper">
                <svg className="logo-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
                </svg>
              </div>
              <span className="logo-text">BragBoard</span>
            </div>
          </div>

          <div className="header-right">
            {currentUserId && (
              <NotificationCenter currentUserId={currentUserId} />
            )}

            <div
              className="user-avatar-symbol"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={userName ? `User: ${userName}` : (userEmail ? `User: ${userEmail}` : 'Account Options')}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt={userName} className="header-avatar-img" />
              ) : (
                getInitials(userName, userEmail)
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Collapsible Sidebar Drawer */}
      <div className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`app-sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => { setSidebarOpen(false); navigate('/Dashboard'); }}>
            <div className="logo-icon-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
              </svg>
            </div>
            <span className="logo-text">BragBoard</span>
          </div>

          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close Sidebar">
            ✕
          </button>
        </div>

        <div className="sidebar-body">
          <div className="sidebar-section-title">Navigation Menu</div>
          <nav className="sidebar-nav-list">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSidebarOpen(false);
                    navigate(item.route);
                  }}
                >
                  <span className="s-icon">{item.icon}</span>
                  <span className="s-label">{item.label}</span>
                </button>
              );
            })}

            {userRole === 'admin' && (
              <button
                className="sidebar-nav-item admin-item"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate('/admin-dashboard');
                }}
              >
                <span className="s-icon">🛡️</span>
                <span className="s-label">Admin Console</span>
              </button>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-block">
            <div className="sidebar-user-info" onClick={() => { setSidebarOpen(false); navigate('/settings'); }}>
              <div className="user-avatar-symbol">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={userName} className="header-avatar-img" />
                ) : (
                  getInitials(userName, userEmail)
                )}
              </div>
              <div className="sidebar-user-details">
                <strong>{userName || (userEmail ? userEmail.split('@')[0] : 'Employee')}</strong>
                <span>{userRole === 'admin' ? 'Administrator' : 'Team Member'}</span>
              </div>
            </div>

            <div className="sidebar-footer-buttons">
              <button className="sidebar-mode-toggle" onClick={toggleTheme} title="Toggle Theme">
                {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </button>

              <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
                Logout 🚪
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Header;


