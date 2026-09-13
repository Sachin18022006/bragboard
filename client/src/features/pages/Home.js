import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import heroTeamImg from '../../assets/hero_team.jpg';
import leaderboardImg from '../../assets/leaderboard_showcase.jpg';
import reviewImg from '../../assets/review_employee.jpg';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 1,
      tabLabel: '💬 Peer Comments',
      icon: '💬',
      category: 'Peer Recognition & Comments',
      title: 'Heartfelt Peer Shoutouts & Active Discussions',
      description: 'Employees express genuine praise, tag core values, and celebrate team achievements with real-time comments, emoji reactions, and instant notifications.',
      type: 'custom_shoutout',
    },
    {
      id: 2,
      tabLabel: '🏆 Live Leaderboard',
      icon: '🏆',
      category: 'Leaderboard & Recognition Scoring',
      title: 'Automated Leaderboards & Top Performer Ranks',
      description: 'Track employee contributions transparently with real-time score tracking, monthly gold/silver/bronze rank podiums, and department leaderboards.',
      type: 'image',
      image: leaderboardImg,
      badgeText: '🏆 Top Ranked Performers',
      stat: '2,450 Points Earned',
    },
    {
      id: 3,
      tabLabel: '⭐ Heartfelt Reviews',
      icon: '⭐',
      category: 'Employee Experience & Reviews',
      title: 'Verified Employee Reviews & High Satisfaction',
      description: 'Real testimonials from managers and team members celebrating boosted workplace morale, retention, and a culture of daily appreciation.',
      type: 'image',
      image: reviewImg,
      badgeText: '⭐ 4.9 / 5 Rating',
      stat: '99% Team Morale Boost',
    },
    {
      id: 4,
      tabLabel: '🎯 Core Badges',
      icon: '🎯',
      category: 'Core Values & Achievement Analytics',
      title: 'Celebrate Core Values & Team Milestones',
      description: 'Reward behaviours aligned with company culture—Innovation, Teamwork, Leadership, and Customer Obsession with custom achievement badges.',
      type: 'custom_badges',
    }
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="landing-wrapper">
      {/* Top Navbar */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          <div className="landing-logo" onClick={() => navigate('/')}>
            <div className="landing-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
              </svg>
            </div>
            <span className="landing-logo-title">BragBoard</span>
            <span className="landing-logo-badge">Employee Recognition</span>
          </div>

          <div className="landing-nav-right">
            <button
              className="landing-signin-btn"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>

            <button
              className="landing-cta-btn"
              onClick={() => navigate('/login')}
            >
              Get Started →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <span className="pill-dot"></span> Next-Gen Employee Recognition Platform
            </div>

            <h1 className="hero-main-title">
              Transform Team Recognition into <span className="gradient-text">Everyday Wins 🚀</span>
            </h1>

            <p className="hero-description">
              Empower your organisation with instant peer shoutouts, real-time leaderboards,
              and actionable employee engagement analytics designed for high-performing teams.
            </p>

            <div className="hero-actions">
              <button
                className="hero-primary-btn"
                onClick={() => navigate('/login')}
              >
                <span>Get Started</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              <button
                className="hero-secondary-btn"
                onClick={() => navigate('/login')}
              >
                <span>Sign In to Account</span>
              </button>
            </div>

            {/* Social Trust Metrics */}
            <div className="hero-metrics">
              <div className="metric-item">
                <span className="metric-num">10k+</span>
                <span className="metric-lbl">Shoutouts Shared</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-num">99.4%</span>
                <span className="metric-lbl">Team Engagement</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-num">4.9 / 5</span>
                <span className="metric-lbl">Employee Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Featured Photo & Floating Badges */}
          <div className="hero-image-wrapper">
            <div className="hero-image-card">
              <img src={heroTeamImg} alt="Corporate team celebrating achievement together" className="hero-img" />
              <div className="floating-badge badge-top-right">
                <span className="badge-icon">🏆</span>
                <div>
                  <strong>Q3 Goal Achieved!</strong>
                  <p>128 Shoutouts sent this week</p>
                </div>
              </div>
              <div className="floating-badge badge-bottom-left">
                <span className="badge-icon">⭐</span>
                <div>
                  <strong>Top Contributor</strong>
                  <p>Sarah recognized by 12 peers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="landing-features">
        <div className="features-container">
          <div className="section-title-group">
            <span className="section-badge">Core Capabilities</span>
            <h2>Everything you need for an inspiring work culture</h2>
            <p>Designed for fast-growing startups to enterprise teams.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon icon-pink">📢</div>
              <h3>Peer Shoutouts & Badges</h3>
              <p>Recognize core values and team contributions in real time. Tag teammates, add categories, and celebrate milestones seamlessly.</p>
              <div className="feature-tag">Instant Recognition</div>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon icon-amber">🏆</div>
              <h3>Gamified Leaderboards</h3>
              <p>Highlight top performers across departments automatically. Real-time points, rank badges, and monthly top 3 podiums keep morale high.</p>
              <div className="feature-tag">Automated Scoring</div>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon icon-blue">🛡️</div>
              <h3>Enterprise Moderation</h3>
              <p>Built-in content safety filters, report management console, and real-time administrator analytics for company-wide transparency.</p>
              <div className="feature-tag">Enterprise Safe</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Examples Interactive Carousel Showcase */}
      <section className="landing-carousel-section">
        <div className="carousel-container">
          <div className="section-title-group">
            <span className="section-badge">Interactive Platform Showcase</span>
            <h2>See BragBoard in Action</h2>
            <p>Select any tab or let the carousel auto-play to explore real platform examples.</p>
          </div>

          {/* Prominent Top Tab Selectors */}
          <div className="carousel-tabs-nav">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={`carousel-tab-btn ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              >
                <span className="tab-icon">{slide.icon}</span>
                <span className="tab-label">{slide.tabLabel}</span>
                {index === currentSlide && <span className="active-pill-glow"></span>}
              </button>
            ))}
          </div>

          <div
            className="carousel-card-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Top Auto-Play Progress Countdown Line */}
            <div className="carousel-progress-track">
              <div
                key={currentSlide}
                className={`carousel-progress-fill ${!isPaused ? 'animate' : 'paused'}`}
              ></div>
            </div>

            {/* Header Badge Row inside Carousel Card */}
            <div className="carousel-card-top-bar">
              <div className="carousel-status-pill">
                <span className={`status-dot ${isPaused ? 'paused' : 'live'}`}></span>
                {isPaused ? 'Paused (Hovering)' : 'Auto-Rotating Preview'}
              </div>

              <div className="carousel-slide-counter">
                Example <strong>0{currentSlide + 1}</strong> of 0{slides.length}
              </div>
            </div>

            {/* Arrow Navigation */}
            <button className="carousel-nav-btn prev-btn" onClick={prevSlide} aria-label="Previous Slide">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            <button className="carousel-nav-btn next-btn" onClick={nextSlide} aria-label="Next Slide">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            {/* Slide Content */}
            <div className="carousel-slide-content">
              {/* Left Column: Text & CTA */}
              <div className="slide-text-col">
                <div className="slide-category-badge">
                  {slides[currentSlide].category}
                </div>

                <h3 className="slide-title">{slides[currentSlide].title}</h3>

                <p className="slide-desc">{slides[currentSlide].description}</p>

                <div className="slide-features-list">
                  <div className="slide-feature-item">
                    <span className="check-icon">✓</span>
                    <span>Real-time instant synchronization</span>
                  </div>
                  <div className="slide-feature-item">
                    <span className="check-icon">✓</span>
                    <span>Built for enterprise privacy & security</span>
                  </div>
                </div>

                <button className="slide-cta-btn" onClick={() => navigate('/login')}>
                  <span>Try BragBoard Now →</span>
                </button>
              </div>

              {/* Right Column: Visual Mock / Image */}
              <div className="slide-visual-col">
                {slides[currentSlide].type === 'custom_shoutout' && (
                  <div className="shoutout-demo-card">
                    <div className="shoutout-header">
                      <div className="user-avatar avatar-blue">AC</div>
                      <div className="user-info">
                        <strong>Alex Chen <span className="shoutout-action">recognized</span> Sarah Jenkins</strong>
                        <span className="shoutout-time">2 hours ago • Senior Frontend Dev</span>
                      </div>
                      <span className="badge-tag">🚀 Innovation</span>
                    </div>

                    <div className="shoutout-body">
                      <p>"Huge kudos to Sarah for taking ownership of our API scaling bottlenecks and optimizing database queries! Reduced response latency by 65%!"</p>
                    </div>

                    <div className="shoutout-reactions">
                      <span className="reaction-pill">❤️ 28</span>
                      <span className="reaction-pill">🙌 19</span>
                      <span className="reaction-pill">🔥 14</span>
                      <span className="comments-count">💬 4 Comments</span>
                    </div>

                    {/* Comments Thread */}
                    <div className="shoutout-comments">
                      <div className="comment-item">
                        <div className="comment-avatar avatar-purple">DK</div>
                        <div className="comment-content">
                          <strong>David Kim</strong>
                          <p>Outstanding work Sarah! Saved the release schedule! 👏</p>
                        </div>
                      </div>
                      <div className="comment-item">
                        <div className="comment-avatar avatar-green">ER</div>
                        <div className="comment-content">
                          <strong>Elena Rostova</strong>
                          <p>The client team is thrilled with the speed boost!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {slides[currentSlide].type === 'image' && (
                  <div className="carousel-image-card">
                    <img
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      className="carousel-slide-img"
                    />
                    <div className="carousel-floating-tag tag-top">
                      {slides[currentSlide].badgeText}
                    </div>
                    <div className="carousel-floating-tag tag-bottom">
                      {slides[currentSlide].stat}
                    </div>
                  </div>
                )}

                {slides[currentSlide].type === 'custom_badges' && (
                  <div className="badges-demo-card">
                    <div className="badges-header">
                      <h4>Core Values & Badges Showcase</h4>
                      <p>Recognize qualities that matter most to your team</p>
                    </div>
                    <div className="badges-grid">
                      <div className="badge-card-item">
                        <span className="b-icon">🚀</span>
                        <strong>Innovation Pioneer</strong>
                        <span className="b-count">142 Awarded</span>
                      </div>
                      <div className="badge-card-item">
                        <span className="b-icon">🤝</span>
                        <strong>Teamwork Champion</strong>
                        <span className="b-count">289 Awarded</span>
                      </div>
                      <div className="badge-card-item">
                        <span className="b-icon">💡</span>
                        <strong>Mentorship Star</strong>
                        <span className="b-count">95 Awarded</span>
                      </div>
                      <div className="badge-card-item">
                        <span className="b-icon">🎯</span>
                        <strong>Execution Master</strong>
                        <span className="b-count">310 Awarded</span>
                      </div>
                    </div>
                    <div className="badge-stat-bar">
                      <div className="stat-info">
                        <span>Monthly Core Value Engagement</span>
                        <strong>+48% vs last month</strong>
                      </div>
                      <div className="progress-bg">
                        <div className="progress-fill" style={{ width: '84%' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="carousel-footer-controls">
              <div className="slide-indicator">
                Showing Slide 0{currentSlide + 1} / 0{slides.length}
              </div>

              <div className="carousel-dots">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="landing-logo">
              <div className="landing-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
                </svg>
              </div>
              <span className="landing-logo-title">BragBoard</span>
            </div>
            <p>© 2026 Bragboard Inc. Enterprise Recognition Platform.</p>
          </div>
          <div className="footer-links">
            <button onClick={() => navigate('/login')}>Sign In</button>
            <button onClick={() => navigate('/login')}>Register</button>
            <button
              className="footer-mode-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

