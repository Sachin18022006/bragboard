import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../layout/Header';
import Feed from '../components/Feed';
import Sidebar from '../components/Sidebar';
import CreateShoutoutModal from '../components/CreateShoutoutModal';
import ReportShoutoutModal from '../components/ReportShoutoutModal';
import ReportedShoutoutsModal from '../components/ReportedShoutoutsModal';
import { PostSkeleton, StatCardSkeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import './Dashboard.css';

const POPULAR_TAGS = ['#excellence', '#teamwork', '#leadership', '#innovation', '#problemsolver', '#peerlearning'];

function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isViewReportsOpen, setIsViewReportsOpen] = useState(false);
  const [currentShoutoutToReport, setCurrentShoutoutToReport] = useState(null);

  const [reportedShoutouts, setReportedShoutouts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [refreshWidgetsTrigger, setRefreshWidgetsTrigger] = useState(0);

  // Registered employees state and dropdown visibility
  const [employees, setEmployees] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const email = localStorage.getItem('email') || sessionStorage.getItem('email') || '';
    const storedName = localStorage.getItem('name') || sessionStorage.getItem('name') || '';
    setUserEmail(email);
    setUserName(storedName);

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.user_id);
        if (decoded.name && !storedName) {
          setUserName(decoded.name);
        }
      } catch (e) {
        console.error("Dashboard: Invalid token", e);
      }
    }
    fetchShoutouts();
    fetchRegisteredEmployees();

    // Close search dropdown on click outside
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Sync widgets and feed when profile photo is updated
    const handlePhotoUpdate = () => {
      fetchShoutouts(true);
      fetchRegisteredEmployees();
      setRefreshWidgetsTrigger(prev => prev + 1);
    };
    window.addEventListener('profilePhotoUpdated', handlePhotoUpdate);
    window.addEventListener('storage', handlePhotoUpdate);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate);
      window.removeEventListener('storage', handlePhotoUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRegisteredEmployees = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/users');
      setEmployees(response.data || []);
    } catch (err) {
      console.error("Failed to fetch registered employees:", err);
    }
  };

  const fetchShoutouts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get('http://127.0.0.1:8000/shoutouts', config);

      const formattedShoutouts = (response.data || []).map(item => {
        const likedByMe = (item.likes || []).some(
          l => l.user_id === currentUserId || l.id === currentUserId
        );
        return {
          id: item.id,
          sender: item.sender?.name || 'Anonymous',
          sender_id: item.sender?.id,
          senderAvatar: item.sender?.avatar || '',
          department: item.sender?.department || 'General',
          title: item.title || 'Shoutout',
          created_at: item.created_at,
          timestamp: formatRelativeTime(item.created_at),
          message: item.message,
          tags: (item.tags || []).map(t => typeof t === 'string' ? t : t.name),
          taggedUsers: (item.recipients || []).map(r => r.name),
          recipients: item.recipients || [],
          reactions: {
            emoji: 0,
            thumbsUp: (item.likes || []).length,
            likedByMe: likedByMe
          },
          likes: item.likes || [],
          comments: item.comments || []
        };
      });
      setShoutouts(formattedShoutouts);
    } catch (error) {
      console.error("Error fetching shoutouts:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateShoutout = async (newShoutout) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        if (showError) showError("Session expired. Please log in.");
        window.location.href = "/login";
        return;
      }
      const decoded = jwtDecode(token);

      const payload = {
        title: newShoutout.title || "Recognition Shoutout",
        message: newShoutout.message,
        sender_id: Number(decoded.user_id || currentUserId || 1),
        recipient_id: Number(newShoutout.recipientId || 1),
        tags: newShoutout.taggedUsers || []
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://127.0.0.1:8000/shoutouts', payload, config);

      if (showSuccess) showSuccess("Shoutout published successfully!");
      setIsCreateModalOpen(false);
      fetchShoutouts(true);
      setRefreshWidgetsTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to create shoutout", error);
      setIsCreateModalOpen(false);
      fetchShoutouts(true);
    }
  };

  const handleDeleteShoutout = (deletedId) => {
    // Instant real-time UI removal
    setShoutouts((prev) => prev.filter((s) => s.id !== deletedId));
    setRefreshWidgetsTrigger((prev) => prev + 1);
    fetchShoutouts(true);
  };

  const handleInteraction = () => {
    // Real-time background sync for comments and likes
    setRefreshWidgetsTrigger((prev) => prev + 1);
    fetchShoutouts(true);
  };

  const handleReportClick = (shoutout) => {
    setCurrentShoutoutToReport(shoutout);
    setIsReportModalOpen(true);
  };

  const fetchMyReports = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const response = await axios.get(`http://127.0.0.1:8000/api/shoutout-reports/my-reports?reporter_id=${decoded.user_id}`);
      setReportedShoutouts(response.data || []);
    } catch (error) {
      console.error("Error fetching my reports:", error);
    }
  };

  const handleSubmitReport = async (reportData) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);

      const payload = {
        shoutout_id: currentShoutoutToReport.id,
        reason: reportData.category,
        description: reportData.reason
      };

      await axios.post(`http://127.0.0.1:8000/api/shoutout-reports?reporter_id=${decoded.user_id}`, payload);

      setIsReportModalOpen(false);
      setCurrentShoutoutToReport(null);
      if (showSuccess) showSuccess('Report submitted for review.');
      fetchMyReports();
    } catch (error) {
      console.error("Failed to submit report:", error);
      if (showError) showError("Failed to submit report.");
    }
  };

  // Comprehensive Real-Time Filter and Sort for Shoutouts
  const filteredAndSortedShoutouts = useMemo(() => {
    let list = [...shoutouts];

    if (searchQuery.trim()) {
      const rawQ = searchQuery.toLowerCase().trim();
      const cleanQ = rawQ.replace(/^[@#]/, '');
      list = list.filter((s) => {
        const msg = (s.message || '').toLowerCase();
        const title = (s.title || '').toLowerCase();
        const sender = (s.sender || '').toLowerCase();
        const dept = (s.department || '').toLowerCase();
        const recipients = (s.taggedUsers || []).map((u) => (u || '').toLowerCase());
        const tags = (s.tags || []).map((t) => (typeof t === 'string' ? t : t.name || '').toLowerCase());

        return (
          msg.includes(rawQ) || msg.includes(cleanQ) ||
          title.includes(rawQ) || title.includes(cleanQ) ||
          sender.includes(rawQ) || sender.includes(cleanQ) ||
          dept.includes(rawQ) || dept.includes(cleanQ) ||
          recipients.some((u) => u.includes(rawQ) || u.includes(cleanQ)) ||
          tags.some((t) => t.includes(rawQ) || t.includes(cleanQ))
        );
      });
    }

    if (sortBy === 'department') {
      list.sort((a, b) => (a.department || '').localeCompare(b.department || ''));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return list;
  }, [shoutouts, searchQuery, sortBy]);

  // Autocomplete Suggestions for Registered Employees & Tags
  const matchingEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees.slice(0, 8);
    }
    const q = searchQuery.toLowerCase().trim().replace(/^[@#]/, '');
    return employees.filter(emp =>
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q) ||
      (emp.email || '').toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  const matchingTags = useMemo(() => {
    if (!searchQuery.trim()) {
      return POPULAR_TAGS;
    }
    const q = searchQuery.toLowerCase().trim().replace(/^[@#]/, '');
    return POPULAR_TAGS.filter(tag => tag.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleSelectEmployee = (emp) => {
    setSearchQuery(emp.name);
    setIsSearchOpen(false);
  };

  const handleSelectTag = (tag) => {
    setSearchQuery(tag);
    setIsSearchOpen(false);
  };

  // Derived KPI Stats
  const totalShoutoutsCount = shoutouts.length;
  const totalReactionsCount = shoutouts.reduce((acc, s) => acc + (s.reactions?.thumbsUp || 0), 0);
  const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Teammate');

  return (
    <div className="dashboard-container">
      <Header />

      <main className="dashboard-content">
        <div className="dashboard-main">
          {/* Welcome Banner */}
          <div className="hero-banner">
            <div className="hero-text">
              <span className="hero-badge">Workspace Recognition Hub</span>
              <h1>Welcome back, {displayName}! 👋</h1>
              <p>Celebrate team victories, highlight core values, and boost team morale.</p>
            </div>
            <button
              className="hero-cta-btn"
              onClick={() => setIsCreateModalOpen(true)}
            >
              ✨ Give Recognition
            </button>
          </div>

          {/* KPI Stat Cards */}
          <div className="kpi-grid">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Total Shoutouts</span>
                    <span className="kpi-icon">📢</span>
                  </div>
                  <div className="kpi-value">{totalShoutoutsCount}</div>
                  <span className="kpi-trend positive">↑ Active this month</span>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Reactions & Likes</span>
                    <span className="kpi-icon">❤️</span>
                  </div>
                  <div className="kpi-value">{totalReactionsCount}</div>
                  <span className="kpi-trend positive">↑ High engagement</span>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Community Status</span>
                    <span className="kpi-icon">🏆</span>
                  </div>
                  <div className="kpi-value">Top 10%</div>
                  <span className="kpi-trend neutral">Active Contributor</span>
                </div>
              </>
            )}
          </div>

          {/* Search & Sort Controls Toolbar */}
          <div className="dashboard-toolbar">
            <div className="search-bar-wrapper" ref={searchContainerRef}>
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="bragboard-workspace-search"
                name="bragboard_workspace_search"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="Search registered teammates (e.g. Priya, Sachin), tags, or feed..."
                className="search-input"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  title="Clear search"
                >
                  ×
                </button>
              )}

              {/* Interactive Autocomplete Suggestions Dropdown */}
              {isSearchOpen && (
                <div className="search-autocomplete-dropdown">
                  <div className="search-dropdown-section">
                    <div className="search-dropdown-title">
                      <span>👥 Registered Teammates</span>
                      <span className="search-section-count">({matchingEmployees.length})</span>
                    </div>
                    {matchingEmployees.length === 0 ? (
                      <div className="search-dropdown-empty">No teammates match "{searchQuery}"</div>
                    ) : (
                      <div className="search-suggestions-list">
                        {matchingEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            className="search-suggestion-item"
                            onMouseDown={() => handleSelectEmployee(emp)}
                          >
                            <div className="suggestion-avatar">
                              {emp.avatar ? (
                                <img src={emp.avatar} alt={emp.name} className="suggestion-avatar-img" />
                              ) : (
                                (emp.name || 'U').substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="suggestion-info">
                              <span className="suggestion-name">{emp.name}</span>
                              <span className="suggestion-dept">{emp.department || 'General'}</span>
                            </div>
                            <span className="suggestion-action-hint">Filter shoutouts →</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {matchingTags.length > 0 && (
                    <div className="search-dropdown-section">
                      <div className="search-dropdown-title">
                        <span>🏷️ Recognition Tags</span>
                      </div>
                      <div className="search-tag-chips">
                        {matchingTags.map((tag) => (
                          <button
                            type="button"
                            key={tag}
                            className="search-tag-chip"
                            onMouseDown={() => handleSelectTag(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="toolbar-actions">
              <select
                className="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort by Date</option>
                <option value="department">Sort by Department</option>
              </select>

              <button
                className="my-reports-btn"
                onClick={() => {
                  fetchMyReports();
                  setIsViewReportsOpen(true);
                }}
              >
                📋 My Reports
              </button>
            </div>
          </div>

          {/* Feed List with Loading Skeletons */}
          {loading ? (
            <div className="skeletons-wrapper">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : filteredAndSortedShoutouts.length === 0 ? (
            <div className="empty-search-card">
              <div className="empty-search-icon">🔍</div>
              <h3>No shoutouts found</h3>
              <p>No results matched "{searchQuery}". Try searching for another name, message, department, or tag.</p>
              {searchQuery && (
                <button className="reset-search-btn" onClick={() => setSearchQuery('')}>
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <Feed
              shoutouts={filteredAndSortedShoutouts}
              onReport={handleReportClick}
              currentUserId={currentUserId}
              onInteraction={handleInteraction}
              onDelete={handleDeleteShoutout}
            />
          )}
        </div>

        {/* Sidebar Widgets with Real-Time Refresh */}
        <Sidebar refreshTrigger={refreshWidgetsTrigger} />
      </main>

      {/* Floating Action Button (FAB) */}
      <button
        className="floating-create-btn"
        onClick={() => setIsCreateModalOpen(true)}
        aria-label="Create Shoutout"
        title="Give Recognition"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="fab-text">Give Recognition</span>
      </button>

      {isCreateModalOpen && (
        <CreateShoutoutModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateShoutout}
        />
      )}

      {isReportModalOpen && currentShoutoutToReport && (
        <ReportShoutoutModal
          shoutoutSender={currentShoutoutToReport.sender}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleSubmitReport}
        />
      )}

      {isViewReportsOpen && (
        <ReportedShoutoutsModal
          reports={reportedShoutouts}
          onClose={() => setIsViewReportsOpen(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
