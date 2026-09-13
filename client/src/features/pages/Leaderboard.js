import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Header from '../layout/Header';
import { StatCardSkeleton } from '../../components/Skeleton';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    fetchLeaders();

    const handlePhotoUpdate = () => {
      fetchLeaders();
    };
    window.addEventListener('profilePhotoUpdated', handlePhotoUpdate);
    window.addEventListener('storage', handlePhotoUpdate);
    return () => {
      window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate);
      window.removeEventListener('storage', handlePhotoUpdate);
    };
  }, []);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get('http://127.0.0.1:8000/users/leaderboard', config);
      setLeaders(response.data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
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

  // Get list of unique departments
  const departments = useMemo(() => {
    const depts = new Set(['All']);
    leaders.forEach((l) => {
      if (l.department) depts.add(l.department);
    });
    return Array.from(depts);
  }, [leaders]);

  // Filtered leaders based on search and department selection
  const filteredLeaders = useMemo(() => {
    return leaders.filter((leader) => {
      const matchesSearch =
        leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (leader.department && leader.department.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = selectedDept === 'All' || leader.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [leaders, searchQuery, selectedDept]);

  const topThree = filteredLeaders.slice(0, 3);

  return (
    <div className="leaderboard-container">
      <Header />

      <main className="leaderboard-content">
        <div className="leaderboard-card">
          <header className="leaderboard-header">
            <div className="header-badge">⭐ Workspace Rankings</div>
            <h1 className="leaderboard-title">Top Recognized Teammates</h1>
            <p className="leaderboard-subtitle">
              Celebrating team members who consistently excel, collaborate, and uplift others.
            </p>
          </header>

          {/* Controls Bar: Search & Department Filter */}
          <div className="leaderboard-controls">
            <div className="leaderboard-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="bragboard-leaderboard-search"
                name="bragboard_leaderboard_search"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="Search performer or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="dept-filter-pills">
              {departments.map((dept) => (
                <button
                  key={dept}
                  className={`dept-pill ${selectedDept === dept ? 'active' : ''}`}
                  onClick={() => setSelectedDept(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="skeleton-loading-container">
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          ) : filteredLeaders.length === 0 ? (
            <div className="empty-leaderboard">
              <span className="empty-icon">🏆</span>
              <h3>No rankings available yet</h3>
              <p>Give shoutouts to your colleagues on the Dashboard to get them on the leaderboard!</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {topThree.length > 0 && (
                <div className="podium-section">
                  {/* Rank 2 (Silver) */}
                  {topThree[1] && (
                    <div className="podium-card rank-2">
                      <div className="podium-crown">🥈</div>
                      <div className="podium-avatar">
                        {topThree[1].avatar ? (
                          <img
                            src={topThree[1].avatar}
                            alt={topThree[1].name}
                            className="podium-avatar-img"
                          />
                        ) : (
                          getInitials(topThree[1].name)
                        )}
                      </div>
                      <div className="podium-name">{topThree[1].name}</div>
                      <span className="podium-dept">{topThree[1].department || 'General'}</span>
                      <div className="podium-score">
                        <strong>{topThree[1].score}</strong> points
                      </div>
                    </div>
                  )}

                  {/* Rank 1 (Gold) */}
                  {topThree[0] && (
                    <div className="podium-card rank-1">
                      <div className="podium-crown">👑</div>
                      <div className="podium-avatar">
                        {topThree[0].avatar ? (
                          <img
                            src={topThree[0].avatar}
                            alt={topThree[0].name}
                            className="podium-avatar-img"
                          />
                        ) : (
                          getInitials(topThree[0].name)
                        )}
                      </div>
                      <div className="podium-name">{topThree[0].name}</div>
                      <span className="podium-dept">{topThree[0].department || 'General'}</span>
                      <div className="podium-score">
                        <strong>{topThree[0].score}</strong> points
                      </div>
                    </div>
                  )}

                  {/* Rank 3 (Bronze) */}
                  {topThree[2] && (
                    <div className="podium-card rank-3">
                      <div className="podium-crown">🥉</div>
                      <div className="podium-avatar">
                        {topThree[2].avatar ? (
                          <img
                            src={topThree[2].avatar}
                            alt={topThree[2].name}
                            className="podium-avatar-img"
                          />
                        ) : (
                          getInitials(topThree[2].name)
                        )}
                      </div>
                      <div className="podium-name">{topThree[2].name}</div>
                      <span className="podium-dept">{topThree[2].department || 'General'}</span>
                      <div className="podium-score">
                        <strong>{topThree[2].score}</strong> points
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Full Rankings List */}
              <div className="leaderboard-table">
                <div className="table-header-row">
                  <span>Rank</span>
                  <span>Employee</span>
                  <span>Department</span>
                  <span style={{ textAlign: 'right' }}>Score</span>
                </div>

                {filteredLeaders.map((leader, index) => {
                  const rank = index + 1;
                  return (
                    <div key={leader.id || leader.name} className="leaderboard-row">
                      <div className={`rank-badge rank-${rank <= 3 ? rank : 'other'}`}>
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>

                      <div className="user-info">
                        <div className="user-avatar">
                          {leader.avatar ? (
                            <img
                              src={leader.avatar}
                              alt={leader.name}
                              className="user-avatar-img"
                            />
                          ) : (
                            getInitials(leader.name)
                          )}
                        </div>
                        <span className="user-name">{leader.name}</span>
                      </div>

                      <div className="user-dept">
                        <span className="dept-tag">{leader.department || 'General'}</span>
                      </div>

                      <div className="score-container">
                        <span className="user-score-num">{leader.score}</span>
                        <span className="score-label">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
