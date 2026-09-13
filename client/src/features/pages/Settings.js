import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import Header from '../layout/Header';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import './Settings.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

function Settings() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('profile_photo') || '');
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  const fileInputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    const email = localStorage.getItem('email') || sessionStorage.getItem('email') || '';
    const role = localStorage.getItem('role') || sessionStorage.getItem('role') || 'user';
    let name = localStorage.getItem('name') || sessionStorage.getItem('name') || '';
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    let uId = null;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.name && !name) name = decoded.name;
        if (decoded.user_id) {
          uId = decoded.user_id;
          setUserId(decoded.user_id);
        }
      } catch (e) {
        console.error("Settings: token decoding error", e);
      }
    }

    setUserEmail(email);
    setUserRole(role);
    setUserName(name);

    // Fetch user details to sync avatar with database
    fetch(`${API_BASE}/users`)
      .then((res) => res.json())
      .then((users) => {
        const me = users.find((u) => (uId && u.id === uId) || (email && u.email === email));
        if (me && me.avatar) {
          setProfilePhoto(me.avatar);
          localStorage.setItem('profile_photo', me.avatar);
          window.dispatchEvent(new Event('profilePhotoUpdated'));
        } else {
          // If current logged-in user has no avatar, ensure photo is cleared from view and storage
          setProfilePhoto('');
          localStorage.removeItem('profile_photo');
          sessionStorage.removeItem('profile_photo');
          window.dispatchEvent(new Event('profilePhotoUpdated'));
        }
      })
      .catch((err) => console.error("Error syncing profile avatar:", err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (showError) showError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (showWarning) showWarning('Image size is large. It will be automatically compressed.');
    }

    setIsPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Center-crop and scale to max 256x256 using Canvas for high quality and lightweight storage
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);

        const currentId = userId || Number(localStorage.getItem('user_id'));
        if (!currentId) {
          if (showError) showError('User session expired. Please log in again.');
          setIsPhotoLoading(false);
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/users/${currentId}/avatar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: compressedBase64 }),
          });

          if (!res.ok) {
            throw new Error('Failed to update avatar on server.');
          }

          setProfilePhoto(compressedBase64);
          localStorage.setItem('profile_photo', compressedBase64);
          window.dispatchEvent(new Event('profilePhotoUpdated'));
          if (showSuccess) showSuccess('Profile photo uploaded successfully!');
        } catch (err) {
          console.error("Avatar upload error:", err);
          if (showError) showError('Failed to update profile photo.');
        } finally {
          setIsPhotoLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async () => {
    if (!profilePhoto) return;

    setIsPhotoLoading(true);
    try {
      const currentId = userId || Number(localStorage.getItem('user_id'));
      if (currentId) {
        await fetch(`${API_BASE}/users/${currentId}/avatar`, {
          method: 'DELETE',
        });
      }
    } catch (err) {
      console.error("Avatar delete error:", err);
    } finally {
      setProfilePhoto('');
      localStorage.removeItem('profile_photo');
      sessionStorage.removeItem('profile_photo');
      window.dispatchEvent(new Event('profilePhotoUpdated'));
      if (showSuccess) showSuccess('Profile photo removed.');
      setIsPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getInitials = (nameStr, emailStr) => {
    const target = (nameStr && nameStr.trim()) ? nameStr.trim() : (emailStr || '');
    if (!target) return 'ME';
    const parts = target.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return target.substring(0, 2).toUpperCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'Empty', color: 'gray' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 25, text: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 50, text: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 75, text: 'Good', color: '#3b82f6' };
    return { score: 100, text: 'Strong', color: '#10b981' };
  };

  const strength = calculatePasswordStrength(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      if (showWarning) showWarning('Please fill in all password fields.');
      return;
    }

    if (formData.newPassword.length < 8) {
      if (showWarning) showWarning('New password must be at least 8 characters long.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      if (showError) showError('New password and confirm password do not match.');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      if (showWarning) showWarning('New password must be different from current password.');
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const email = localStorage.getItem('email') || sessionStorage.getItem('email');

    if (!email) {
      if (showError) showError('Session expired. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email,
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Password update failed.');
      }

      if (showSuccess) showSuccess('Password changed successfully!');

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      if (showError) showError(error.message || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-container">
      <Header />

      <main className="settings-content">
        <div className="settings-card">
          <header className="settings-header">
            <span className="settings-badge">⚙️ Preferences</span>
            <h1 className="settings-title">Account Settings</h1>
            <p className="settings-subtitle">Manage your profile credentials, theme preferences, and security.</p>
          </header>

          {/* User Profile Overview & Avatar Management */}
          <div className="settings-profile-box">
            <div className="profile-avatar-large">
              {profilePhoto ? (
                <img src={profilePhoto} alt={userName} className="profile-photo-img" />
              ) : (
                getInitials(userName, userEmail)
              )}
            </div>
            <div className="profile-details">
              <h3>{userName || (userEmail ? userEmail.split('@')[0] : 'Workspace Member')}</h3>
              <p className="profile-email">{userEmail || 'No email provided'}</p>
              <div className="profile-actions-row">
                <span className="role-pill">{userRole === 'admin' ? 'Administrator Console' : 'Employee Account'}</span>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  className="photo-btn upload-photo-btn"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={isPhotoLoading}
                >
                  {isPhotoLoading ? '⏳ Processing...' : (profilePhoto ? '🔄 Change Photo' : '📷 Upload Photo')}
                </button>

                {profilePhoto && (
                  <button
                    type="button"
                    className="photo-btn delete-photo-btn"
                    onClick={handleDeletePhoto}
                    disabled={isPhotoLoading}
                    title="Remove custom profile photo"
                  >
                    🗑️ Delete Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Theme Preference Card */}
          <div className="settings-section">
            <div className="section-header">
              <h2>Appearance & Theme</h2>
              <p>Customize the workspace interface colors for optimal comfort.</p>
            </div>
            <div className="theme-select-card" onClick={toggleTheme}>
              <div className="theme-info">
                <span className="theme-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <div>
                  <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'} Active</strong>
                  <p>Click to switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</p>
                </div>
              </div>
              <button type="button" className="toggle-switch-btn">
                Switch Theme
              </button>
            </div>
          </div>

          {/* Password Security Form */}
          <div className="settings-section">
            <div className="section-header">
              <h2>Security & Password</h2>
              <p>Update your account password to keep your bragboard secure.</p>
            </div>

            <form className="settings-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="form-input"
                  required
                  minLength={8}
                />
                {formData.newPassword && (
                  <div className="strength-meter">
                    <div className="strength-bar-bg">
                      <div
                        className="strength-bar-fill"
                        style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                      />
                    </div>
                    <span className="strength-text" style={{ color: strength.color }}>
                      {strength.text} Password
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="settings-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating Password...' : '🔒 Change Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
