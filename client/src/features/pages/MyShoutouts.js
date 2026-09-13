import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../layout/Header';
import FeedPost from '../components/FeedPost';
import { PostSkeleton } from '../../components/Skeleton';
import { formatRelativeTime } from '../../utils/dateUtils';
import './MyShoutouts.css';

const MyShoutouts = () => {
  const [shoutouts, setShoutouts] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.user_id);
      } catch (e) {
        console.error("Invalid token", e);
      }
    }
    fetchShoutouts();

    const handlePhotoUpdate = () => fetchShoutouts(true);
    window.addEventListener('profilePhotoUpdated', handlePhotoUpdate);
    window.addEventListener('storage', handlePhotoUpdate);
    return () => {
      window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate);
      window.removeEventListener('storage', handlePhotoUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShoutouts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };
      const res = await axios.get('http://127.0.0.1:8000/shoutouts', config);

      const formatted = (res.data || []).map(item => {
        const likedByMe = (item.likes || []).some(l => l.user_id === currentUserId || l.id === currentUserId);
        const recipientIds = (item.recipients || []).map(r => r.id);

        return {
          id: item.id,
          sender: item.sender?.name || 'Anonymous',
          sender_id: item.sender?.id,
          recipient_ids: recipientIds,
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
      setShoutouts(formatted);
    } catch (err) {
      console.error("Error fetching shoutouts:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDeleteShoutout = (deletedId) => {
    setShoutouts(prev => prev.filter(s => s.id !== deletedId));
    fetchShoutouts(true);
  };

  // Filter list by tab and search query
  const filteredShoutouts = useMemo(() => {
    return shoutouts.filter(s => {
      const isTabMatch = activeTab === 'received'
        ? s.recipient_ids.includes(currentUserId)
        : s.sender_id === currentUserId;

      if (!isTabMatch) return false;
      if (!searchQuery.trim()) return true;

      const rawQ = searchQuery.toLowerCase().trim();
      const cleanQ = rawQ.replace(/^[@#]/, '');
      const msg = (s.message || '').toLowerCase();
      const title = (s.title || '').toLowerCase();
      const sender = (s.sender || '').toLowerCase();
      const dept = (s.department || '').toLowerCase();
      const recipients = (s.taggedUsers || []).map(u => (u || '').toLowerCase());
      const tags = (s.tags || []).map(t => (typeof t === 'string' ? t : t.name || '').toLowerCase());

      return (
        msg.includes(rawQ) || msg.includes(cleanQ) ||
        title.includes(rawQ) || title.includes(cleanQ) ||
        sender.includes(rawQ) || sender.includes(cleanQ) ||
        dept.includes(rawQ) || dept.includes(cleanQ) ||
        recipients.some(u => u.includes(rawQ) || u.includes(cleanQ)) ||
        tags.some(t => t.includes(rawQ) || t.includes(cleanQ))
      );
    });
  }, [shoutouts, activeTab, currentUserId, searchQuery]);

  const receivedCount = useMemo(() => {
    return shoutouts.filter(s => s.recipient_ids.includes(currentUserId)).length;
  }, [shoutouts, currentUserId]);

  const givenCount = useMemo(() => {
    return shoutouts.filter(s => s.sender_id === currentUserId).length;
  }, [shoutouts, currentUserId]);

  return (
    <div className="my-shoutouts-container">
      <Header />

      <main className="my-shoutouts-content">
        <div className="my-shoutouts-card">
          <header className="page-header">
            <div>
              <span className="page-badge">🏆 Portfolio</span>
              <h1 className="page-title">My Recognition History</h1>
              <p className="page-subtitle">Track your contributions, sent praises, and received honors.</p>
            </div>

            <div className="stats-pills-row">
              <div className="stat-pill">
                <span className="pill-val">{receivedCount}</span>
                <span className="pill-lbl">Received</span>
              </div>
              <div className="stat-pill">
                <span className="pill-val">{givenCount}</span>
                <span className="pill-lbl">Given</span>
              </div>
            </div>
          </header>

          <div className="shoutouts-toolbar">
            <div className="tabs-container">
              <button
                className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
                onClick={() => setActiveTab('received')}
              >
                📥 Received ({receivedCount})
              </button>
              <button
                className={`tab-button ${activeTab === 'given' ? 'active' : ''}`}
                onClick={() => setActiveTab('given')}
              >
                📤 Given ({givenCount})
              </button>
            </div>

            <div className="shoutouts-search">
              <input
                type="text"
                id="bragboard-my-shoutouts-search"
                name="bragboard_my_shoutouts_search"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="Search my shoutouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="skeletons-container">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : filteredShoutouts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📢</span>
              <h3>No shoutouts {activeTab === 'received' ? 'received' : 'given'} yet</h3>
              <p>
                {activeTab === 'received'
                  ? 'When teammates recognize your work, their shoutouts will show up here.'
                  : 'Start recognizing your colleagues on the Dashboard to build your team spirit!'}
              </p>
            </div>
          ) : (
            <div className="shoutouts-list">
              {filteredShoutouts.map((s) => (
                <FeedPost
                  key={s.id}
                  shoutout={s}
                  onReport={() => { }}
                  currentUserId={currentUserId}
                  onInteraction={() => fetchShoutouts(true)}
                  onDelete={handleDeleteShoutout}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyShoutouts;
