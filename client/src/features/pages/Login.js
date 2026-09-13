import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../api/config';
import './Login.css';

const API_BASE = API_BASE_URL;

const MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
  OTP: 'otp',
};

const INITIAL_STATE = {
  fullName: '',
  employeeId: '',
  department: 'Engineering',
  email: '',
  password: '',
  role: 'user',
  rememberMe: false,
  otp: '',
};

const COPY = {
  [MODES.LOGIN]: {
    title: 'Sign in to Bragboard',
    subtitle: 'Celebrate your career wins and keep team recognition fresh.',
    cta: 'Sign in',
  },
  [MODES.REGISTER]: {
    title: 'Create your account',
    subtitle: 'Join Bragboard to start sharing and receiving shoutouts.',
    cta: 'Create Account',
  },
  [MODES.FORGOT]: {
    title: 'Reset your password',
    subtitle: 'Enter the email linked to your workspace. We’ll send you a single-use code.',
    cta: 'Send OTP',
  },
  [MODES.OTP]: {
    title: 'Verify email with OTP',
    subtitle: 'Check your inbox for a 6-digit verification code.',
    cta: 'Verify & Continue',
  },
};

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(MODES.LOGIN);
  const [formState, setFormState] = useState(INITIAL_STATE);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { showSuccess, showError } = useToast();

  const apiPost = async (path, payload) => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetStatus = () => setStatus(null);

  const handleModeChange = (nextMode) => {
    if (mode === nextMode) return;
    setMode(nextMode);
    resetStatus();
    setFormState(INITIAL_STATE);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    setIsSubmitting(true);

    try {
      switch (mode) {
        case MODES.LOGIN: {
          if (!formState.email || !formState.password) {
            setStatus({
              type: 'warning',
              text: 'Email and password are required to sign in.',
            });
            return;
          }

          const data = await apiPost('/auth/login', {
            email: formState.email,
            password: formState.password,
          });

          // Always clear previous session data to prevent cross-account profile leakage
          localStorage.removeItem('profile_photo');
          sessionStorage.removeItem('profile_photo');

          const role = data.role || 'user';
          const storage = formState.rememberMe ? localStorage : sessionStorage;
          storage.setItem('token', data.access_token);
          storage.setItem('token_type', data.token_type || 'bearer');
          storage.setItem('role', role);
          storage.setItem('email', formState.email);
          if (data.user_id) storage.setItem('user_id', data.user_id);
          if (data.name) storage.setItem('name', data.name);
          if (data.employee_id) storage.setItem('employee_id', data.employee_id);
          if (data.avatar) {
            storage.setItem('profile_photo', data.avatar);
          } else {
            localStorage.removeItem('profile_photo');
            sessionStorage.removeItem('profile_photo');
          }
          window.dispatchEvent(new Event('profilePhotoUpdated'));

          if (showSuccess) showSuccess(role === 'admin' ? 'Welcome back, Admin!' : 'Signed in successfully!');

          setTimeout(() => {
            if (role === 'admin') {
              navigate('/admin-dashboard');
            } else {
              navigate('/Dashboard');
            }
          }, 300);
          break;
        }

        case MODES.REGISTER: {
          const idLabel = formState.role === 'admin' ? 'Admin ID' : 'Employee ID';
          if (!formState.email || !formState.password || !formState.fullName || !formState.employeeId) {
            setStatus({
              type: 'warning',
              text: `Full name, ${idLabel}, email, and password are required to register.`,
            });
            return;
          }

          await apiPost('/auth/register', {
            email: formState.email,
            password: formState.password,
            full_name: formState.fullName,
            employee_id: formState.employeeId,
            department: formState.department || 'Engineering',
            role: formState.role || 'user',
          });

          if (showSuccess) showSuccess('Account registered successfully! Please sign in.');
          setStatus({
            type: 'success',
            text: 'Account registered successfully! Switching to sign in...',
          });

          setTimeout(() => {
            setMode(MODES.LOGIN);
          }, 1000);
          break;
        }

        case MODES.FORGOT: {
          if (!formState.email) {
            setStatus({
              type: 'warning',
              text: 'Add the email associated with your account first.',
            });
            return;
          }

          await apiPost('/auth/forgot-password', { email: formState.email });
          setStatus({
            type: 'success',
            text: `OTP sent to ${formState.email}. Check your inbox.`,
          });
          setMode(MODES.OTP);
          setFormState((prev) => ({ ...prev, otp: '' }));
          break;
        }

        case MODES.OTP: {
          if (!formState.otp || formState.otp.length < 6) {
            setStatus({
              type: 'error',
              text: 'Enter the 6-digit OTP from your email.',
            });
            return;
          }

          await apiPost('/auth/verify-otp', {
            email: formState.email,
            otp: formState.otp,
          });

          setStatus({
            type: 'success',
            text: 'OTP verified! You can now sign in.',
          });
          setMode(MODES.LOGIN);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      const msg = error.message || 'Something went wrong. Please try again.';
      setStatus({ type: 'error', text: msg });
      if (showError) showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusClassName = useMemo(() => {
    if (!status) return 'status-message';
    return `status-message status-${status.type}`;
  }, [status]);

  return (
    <main className="login-wrapper">
      {/* Top Header Bar to eliminate overlapping */}
      <header className="login-top-bar">
        <button className="login-back-home-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="login-top-brand" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
          </svg>
          <span>Bragboard Recognition</span>
        </div>
      </header>

      <div className="login-container">
        {/* Left Hero Showcase Sidebar with Image */}
        <div className="login-showcase">
          <div className="showcase-img-container">
            <img src={signinHeadsetImg} alt="Workspace employee wearing headset" className="showcase-img" />
            <div className="showcase-img-overlay">
              <span className="showcase-img-badge">🌟 Workplace Recognition</span>
            </div>
          </div>

          <div className="showcase-body">
            <h2>Transform Team Recognition into Everyday Wins 🚀</h2>
            <p>Empower your organisation with instant peer shoutouts, real-time leaderboards, and actionable employee engagement analytics.</p>

            <div className="feature-bullets">
              <div className="feature-item">
                <span className="feature-icon">📢</span>
                <div>
                  <strong>Peer Shoutouts & Badges</strong>
                  <p>Recognize core values and team contributions in real time.</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">🏆</span>
                <div>
                  <strong>Gamified Leaderboards</strong>
                  <p>Highlight top performers across departments automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <section className="login-card" aria-live="polite">
          <header className="login-header">
            <h1 id="login-heading">{COPY[mode].title}</h1>
            <p className="login-subtitle">{COPY[mode].subtitle}</p>
          </header>

          {(mode === MODES.LOGIN || mode === MODES.REGISTER) && (
            <div className="user-type-toggle">
              <div className="toggle-container">
                <button
                  type="button"
                  className={`toggle-option ${mode === MODES.LOGIN ? 'active' : ''}`}
                  onClick={() => handleModeChange(MODES.LOGIN)}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`toggle-option ${mode === MODES.REGISTER ? 'active' : ''}`}
                  onClick={() => handleModeChange(MODES.REGISTER)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
            {mode === MODES.REGISTER && (
              <>
                <label className="login-label" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="off"
                  value={formState.fullName}
                  onChange={handleChange}
                  required
                />

                <label className="login-label" htmlFor="role">
                  Account Type / Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formState.role}
                  onChange={handleChange}
                  className="role-select"
                >
                  <option value="user">Employee Account</option>
                  <option value="admin">Administrator Console</option>
                </select>

                <label className="login-label" htmlFor="employeeId">
                  {formState.role === 'admin' ? 'Admin ID' : 'Employee ID'}
                </label>
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  placeholder={formState.role === 'admin' ? 'e.g. ADM-001 or Admin ID' : 'e.g. EMP-1042'}
                  autoComplete="off"
                  value={formState.employeeId}
                  onChange={handleChange}
                  required
                />

                <label className="login-label" htmlFor="department">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={formState.department}
                  onChange={handleChange}
                  className="role-select"
                  required
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Success">Customer Success</option>
                  <option value="Operations">Operations</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="General">General</option>
                </select>
              </>
            )}

            {(mode === MODES.LOGIN || mode === MODES.REGISTER || mode === MODES.FORGOT) && (
              <>
                <label className="login-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="username email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {(mode === MODES.LOGIN || mode === MODES.REGISTER) && (
              <>
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete={mode === MODES.REGISTER ? 'new-password' : 'current-password'}
                    value={formState.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </>
            )}


            {mode === MODES.LOGIN && (
              <div className="login-actions">
                <label className="remember-toggle">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formState.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember me</span>
                </label>
                <div className="action-links">
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => handleModeChange(MODES.FORGOT)}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            {mode === MODES.OTP && (
              <>
                <label className="login-label" htmlFor="otp">
                  6-digit OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="••••••"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={formState.otp}
                  onChange={handleChange}
                />
              </>
            )}

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : COPY[mode].cta}
            </button>

            {(mode === MODES.FORGOT || mode === MODES.OTP) && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleModeChange(MODES.LOGIN)}
              >
                Back to Sign In
              </button>
            )}
          </form>

          <footer className="login-footer">
            {status && (
              <p role="status" className={statusClassName}>
                {status.text}
              </p>
            )}
          </footer>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
