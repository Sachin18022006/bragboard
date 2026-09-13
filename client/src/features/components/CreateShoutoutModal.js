import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import './CreateShoutoutModal.css';

const CATEGORIES = [
  { label: '🌟 Excellence', value: 'Excellence' },
  { label: '🤝 Teamwork', value: 'Teamwork' },
  { label: '💡 Innovation', value: 'Innovation' },
  { label: '🚀 Leadership', value: 'Leadership' },
  { label: '🎓 Mentorship', value: 'Mentorship' },
];

function CreateShoutoutModal({ onClose, onSubmit }) {
  const { showWarning, showError } = useToast();
  const [formData, setFormData] = useState({
    message: '',
    taggedUser: '',
    category: 'Excellence',
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'

  const MAX_CHARS = 500;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get('http://127.0.0.1:8000/users', config);
        setAvailableUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MAX_CHARS) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (cat) => {
    setFormData((prev) => ({ ...prev, category: cat }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      if (showWarning) showWarning('Please enter a shoutout message.');
      return;
    }

    setIsPosting(true);
    const selectedUser = availableUsers.find(u => String(u.id) === String(formData.taggedUser));

    const newShoutout = {
      id: Date.now(),
      sender: 'You',
      senderAvatar: '',
      timestamp: 'Just now',
      message: `[${formData.category}] ${formData.message}`,
      taggedUsers: selectedUser ? [selectedUser.name] : [],
      recipientId: Number(formData.taggedUser) || 1,
      reactions: { emoji: 0, thumbsUp: 0 },
      comments: 0,
    };

    try {
      await onSubmit(newShoutout);
    } catch (err) {
      if (showError) showError('Failed to post shoutout. Please check connection.');
    } finally {
      setIsPosting(false);
    }
  };

  const selectedUserObj = availableUsers.find(u => String(u.id) === String(formData.taggedUser));
  const charCount = formData.message.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge">📢 Recognition</span>
            <h2>Give a Shoutout</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="modal-tab-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            ✏️ Compose
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            👁️ Live Preview
          </button>
        </div>

        {activeTab === 'write' ? (
          <form className="modal-form" onSubmit={handleSubmit}>
            {/* Recipient Field */}
            <div className="form-group">
              <label htmlFor="taggedUser">Recognize Teammate</label>
              <select
                id="taggedUser"
                name="taggedUser"
                value={formData.taggedUser}
                onChange={handleChange}
                className="form-select"
                disabled={loadingUsers}
              >
                <option value="">Choose a colleague to shoutout...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.department ? `(${user.department})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="form-group">
              <label>Recognition Core Value / Category</label>
              <div className="category-pills-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`category-pill ${formData.category === cat.value ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Field */}
            <div className="form-group">
              <div className="label-with-counter">
                <label htmlFor="message">Shoutout Message</label>
                <span className={`char-counter ${charCount > 450 ? 'warning' : ''}`}>
                  {charCount} / {MAX_CHARS}
                </span>
              </div>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="What impressive milestone, core value, or help did they deliver? Be specific..."
                className="form-textarea"
                rows="5"
                required
              />
              {selectedUserObj && (
                <p className="form-hint">
                  💡 Tip: Mentioning <strong>{selectedUserObj.name}</strong> will highlight their name in the workspace feed.
                </p>
              )}
            </div>

            <footer className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isPosting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isPosting}>
                {isPosting ? 'Posting...' : '🚀 Share Shoutout'}
              </button>
            </footer>
          </form>
        ) : (
          <div className="preview-container">
            <p className="preview-heading">Here's how your shoutout will look to the team:</p>
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-avatar">YOU</div>
                <div>
                  <span className="preview-author">You</span>
                  <span className="preview-time">• Just now</span>
                </div>
                <span className="preview-category-badge">{formData.category}</span>
              </div>
              <p className="preview-message">
                {formData.message || <em>(Type a message to see preview...)</em>}
              </p>
              {selectedUserObj && (
                <div className="preview-recipient">
                  <span>Recognizing: </span>
                  <strong className="recipient-pill">⭐ {selectedUserObj.name}</strong>
                </div>
              )}
            </div>

            <footer className="modal-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn-secondary" onClick={() => setActiveTab('write')}>
                Back to Edit
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit} disabled={isPosting}>
                {isPosting ? 'Posting...' : '🚀 Share Shoutout'}
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateShoutoutModal;
