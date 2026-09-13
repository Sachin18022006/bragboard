import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import { formatRelativeTime } from '../../utils/dateUtils';
import './NotificationCenter.css';

function NotificationCenter({ currentUserId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!currentUserId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications?user_id=${currentUserId}`);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 12 seconds for real-time notifications
    const interval = setInterval(fetchNotifications, 12000);

    // Close on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read?user_id=${currentUserId}`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/notifications/read-all?user_id=${currentUserId}`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'shoutout':
        return '🏆';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      default:
        return '✨';
    }
  };

  return (
    <div className="notification-center-wrapper" ref={dropdownRef}>
      <button
        className={`notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <svg
          className="bell-svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge" key={unreadCount}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-popover animate-fadeIn">
          <div className="notification-popover-header">
            <div className="header-left">
              <span className="notif-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="unread-pill">{unreadCount} new</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={handleMarkAllRead}
                disabled={loading}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">🔔</span>
                <p className="empty-title">All caught up!</p>
                <p className="empty-desc">You will be notified when teammates recognize you or interact with your posts.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notif.is_read) handleMarkAsRead(notif.id);
                  }}
                >
                  <div className="notif-type-badge">
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">{formatRelativeTime(notif.created_at)}</span>
                  </div>

                  {!notif.is_read && (
                    <span className="unread-dot" title="Unread"></span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="notification-popover-footer">
            <span>Real-time recognition updates</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
