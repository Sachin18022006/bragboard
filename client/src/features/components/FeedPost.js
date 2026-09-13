import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { formatExactDateTime, formatExactWithRelative } from '../../utils/dateUtils';
import './FeedPost.css';

function FeedPost({ shoutout, onReport, currentUserId, onInteraction, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [localComments, setLocalComments] = useState(shoutout.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const initialLiked = Boolean(
    shoutout.reactions?.likedByMe ||
    (shoutout.likes || []).some(l => l.user_id === currentUserId || l.id === currentUserId)
  );
  const initialCount = shoutout.reactions?.thumbsUp !== undefined
    ? shoutout.reactions.thumbsUp
    : (shoutout.likes || []).length;

  const [likedByMe, setLikedByMe] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const { showSuccess, showError, showInfo } = useToast();

  const menuRef = useRef(null);

  useEffect(() => {
    setLocalComments(shoutout.comments || []);
  }, [shoutout.comments]);

  useEffect(() => {
    const isLiked = Boolean(
      shoutout.reactions?.likedByMe ||
      (shoutout.likes || []).some(l => l.user_id === currentUserId || l.id === currentUserId)
    );
    const count = shoutout.reactions?.thumbsUp !== undefined
      ? shoutout.reactions.thumbsUp
      : (shoutout.likes || []).length;
    setLikedByMe(isLiked);
    setLikeCount(count);
  }, [shoutout.reactions, shoutout.likes, currentUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Check if this shoutout was created by the currently logged-in user
  const isCreatedByMe = Boolean(
    currentUserId &&
    shoutout.sender_id &&
    Number(shoutout.sender_id) === Number(currentUserId)
  );

  const formatMessage = (message, taggedUsers) => {
    if (!message) return '';
    let formatted = message;
    if (taggedUsers && Array.isArray(taggedUsers)) {
      taggedUsers.forEach((user) => {
        if (user) {
          const regex = new RegExp(`@?${user}`, 'gi');
          formatted = formatted.replace(
            regex,
            `<span class="tagged-user">@${user}</span>`
          );
        }
      });
    }
    return formatted;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleReport = () => {
    if (onReport) onReport();
    setShowMenu(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/Dashboard#post-${shoutout.id}`);
    if (showInfo) showInfo('Post link copied to clipboard!');
    setShowMenu(false);
  };

  const handleDeleteShoutout = async () => {
    setShowMenu(false);
    if (!window.confirm("Are you sure you want to delete this shoutout? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/shoutouts/${shoutout.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (showSuccess) showSuccess('Shoutout deleted successfully.');
      if (onDelete) {
        onDelete(shoutout.id);
      } else if (onInteraction) {
        onInteraction(true);
      }
    } catch (err) {
      console.error("Failed to delete shoutout:", err);
      if (showError) showError('Failed to delete shoutout.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUserId) {
      if (showError) showError('Please sign in to like posts.');
      return;
    }
    if (isLiking) return;

    // Real-time optimistic update
    const previousLiked = likedByMe;
    const previousCount = likeCount;
    setLikedByMe(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);
    setIsLiking(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(
        `http://127.0.0.1:8000/shoutouts/${shoutout.id}/like?user_id=${currentUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onInteraction) onInteraction(true);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on failure
      setLikedByMe(previousLiked);
      setLikeCount(previousCount);
      if (showError) showError('Failed to update reaction.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    if (!currentUserId) {
      if (showError) showError('Please sign in to comment.');
      return;
    }

    setIsCommenting(true);
    const storedName = localStorage.getItem('name') || sessionStorage.getItem('name') || 'You';
    const optimisticComment = {
      id: 'temp-' + Date.now(),
      content: text,
      created_at: new Date().toISOString(),
      author: {
        id: currentUserId,
        name: storedName
      }
    };

    // Real-time optimistic update for comments!
    setLocalComments((prev) => [...prev, optimisticComment]);
    setCommentText('');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `http://127.0.0.1:8000/shoutouts/${shoutout.id}/comments?user_id=${currentUserId}`,
        { content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        setLocalComments((prev) =>
          prev.map((c) => (c.id === optimisticComment.id ? response.data : c))
        );
      }
      if (showSuccess) showSuccess('Comment added!');
      if (onInteraction) onInteraction(true);
    } catch (error) {
      console.error("Error adding comment:", error);
      setLocalComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      if (showError) showError('Failed to post comment.');
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <article className={`feed-post ${isDeleting ? 'deleting' : ''}`} id={`post-${shoutout.id}`}>
      <div className="post-header">
        <div className="post-avatar-wrapper">
          {shoutout.senderAvatar ? (
            <img src={shoutout.senderAvatar} alt={shoutout.sender} className="post-avatar-img" />
          ) : (
            <div className="avatar-initials">{getInitials(shoutout.sender)}</div>
          )}
        </div>

        <div className="post-header-text">
          <div className="author-line">
            <span className="post-author">{shoutout.sender}</span>
            {shoutout.department && (
              <span className="department-pill">{shoutout.department}</span>
            )}
            {isCreatedByMe && (
              <span className="my-post-pill">Author (You)</span>
            )}
          </div>
          <span
            className="post-time"
            title={formatExactDateTime(shoutout.created_at || shoutout.timestamp, true)}
          >
            {formatExactWithRelative(shoutout.created_at || shoutout.timestamp)}
          </span>
        </div>

        <div className="post-header-actions">
          {/* Direct Delete button ONLY for the shoutout's creator */}
          {isCreatedByMe && (
            <button
              className="post-delete-btn"
              onClick={handleDeleteShoutout}
              disabled={isDeleting}
              title="Delete this shoutout created by you"
              aria-label="Delete shoutout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <span>Delete</span>
            </button>
          )}

          <div className="post-menu-container" ref={menuRef}>
            <button
              className="post-menu-button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post options"
              title="Options"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="2" fill="currentColor" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="19" r="2" fill="currentColor" />
              </svg>
            </button>
            {showMenu && (
              <div className="post-menu-dropdown">
                <button className="post-menu-item" onClick={handleCopyLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Copy Link
                </button>

                {isCreatedByMe && (
                  <button className="post-menu-item danger" onClick={handleDeleteShoutout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    Delete Shoutout
                  </button>
                )}

                <button className="post-menu-item danger" onClick={handleReport}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
                  </svg>
                  Report Shoutout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {shoutout.title && shoutout.title !== 'Shoutout' && (
        <h3 className="post-headline">{shoutout.title}</h3>
      )}

      <div
        className="post-message"
        dangerouslySetInnerHTML={{
          __html: formatMessage(shoutout.message, shoutout.taggedUsers),
        }}
      />

      {shoutout.tags && shoutout.tags.length > 0 && (
        <div className="post-tags-list">
          {shoutout.tags.map((tag, idx) => (
            <span key={idx} className="post-tag-item">
              #{typeof tag === 'string' ? tag : tag.name}
            </span>
          ))}
        </div>
      )}

      {shoutout.recipients && shoutout.recipients.length > 0 ? (
        <div className="recipients-badge-list">
          <span className="recognized-label">Recognized:</span>
          {shoutout.recipients.map((rec, i) => (
            <span key={rec.id || i} className="recipient-pill">
              {rec.avatar ? (
                <img src={rec.avatar} alt={rec.name} className="recipient-pill-avatar" />
              ) : (
                <span>⭐</span>
              )}
              <span>{rec.name}</span>
            </span>
          ))}
        </div>
      ) : shoutout.taggedUsers && shoutout.taggedUsers.length > 0 ? (
        <div className="recipients-badge-list">
          <span className="recognized-label">Recognized:</span>
          {shoutout.taggedUsers.map((name, i) => (
            <span key={i} className="recipient-pill">
              ⭐ {name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="post-actions">
        <button
          className={`action-button like-button ${likedByMe ? 'liked' : ''}`}
          onClick={handleToggleLike}
          disabled={isLiking}
          title={likedByMe ? 'Unlike' : 'Like shoutout'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={likedByMe ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <span className="action-count">{likeCount}</span>
          <span className="action-text">{likedByMe ? 'Liked' : 'Like'}</span>
        </button>

        <button
          className={`action-button comment-toggle-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
          title="Comments"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="action-count">{localComments.length}</span>
          <span className="action-text">Comments</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {localComments.length === 0 ? (
              <p className="no-comments-hint">No comments yet. Be the first to comment!</p>
            ) : (
              localComments.map((comment) => (
                <div key={comment.id || Math.random()} className="comment-item">
                  <div className="comment-avatar">
                    {comment.author?.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author?.name}
                        className="comment-avatar-img"
                      />
                    ) : (
                      getInitials(comment.author?.name || 'User')
                    )}
                  </div>
                  <div className="comment-bubble">
                    <div className="comment-meta">
                      <span className="comment-author-name">{comment.author?.name || 'User'}</span>
                      <span
                        className="comment-time"
                        title={formatExactDateTime(comment.created_at, true)}
                      >
                        {formatExactWithRelative(comment.created_at)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="Write a supportive comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isCommenting}
              className="comment-input"
            />
            <button type="submit" className="comment-submit-btn" disabled={!commentText.trim() || isCommenting}>
              {isCommenting ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

export default FeedPost;
