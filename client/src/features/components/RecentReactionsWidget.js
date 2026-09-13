import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatExactDateTime, formatRelativeTime } from '../../utils/dateUtils';
import './Widget.css';

function RecentReactionsWidget({ refreshTrigger }) {
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    const handlePhotoUpdate = () => {
      fetchRecentReactions();
    };
    window.addEventListener('profilePhotoUpdated', handlePhotoUpdate);
    window.addEventListener('storage', handlePhotoUpdate);
    return () => {
      window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate);
      window.removeEventListener('storage', handlePhotoUpdate);
    };
  }, []);

  useEffect(() => {
    fetchRecentReactions();
  }, [refreshTrigger]);

  const fetchRecentReactions = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get('http://127.0.0.1:8000/shoutouts/reactions/recent', config);
      setReactions(response.data || []);
    } catch (error) {
      console.error("Error fetching recent reactions:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="widget-card">
      <div className="widget-header-row">
        <h3 className="widget-title">Recent Comments</h3>
        <span className="live-indicator-dot" title="Live real-time feed">● live</span>
      </div>
      <div className="widget-content">
        {reactions.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #666)', fontSize: '0.88rem', padding: '10px' }}>
            No recent comments.
          </p>
        ) : (
          reactions.map((reaction, index) => {
            const authorAvatar = reaction.author?.avatar;
            return (
              <div key={reaction.id || index} className="widget-comment-item">
                <div className="widget-avatar">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={reaction.author?.name || 'User'}
                      className="widget-avatar-img"
                    />
                  ) : (
                    <span className="avatar-initials">{getInitials(reaction.author?.name)}</span>
                  )}
                </div>
                <div className="widget-item-info">
                  <div className="widget-comment-header">
                    <span className="widget-comment-author" title={reaction.author?.name || 'Teammate'}>
                      {reaction.author?.name || 'Teammate'}
                    </span>
                    <span className="widget-comment-relative">
                      {formatRelativeTime(reaction.created_at)}
                    </span>
                  </div>
                  <p className="widget-comment-quote">
                    "{reaction.content}"
                  </p>
                  <span
                    className="widget-comment-datetime"
                    title={formatExactDateTime(reaction.created_at, true)}
                  >
                    {formatExactDateTime(reaction.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentReactionsWidget;
