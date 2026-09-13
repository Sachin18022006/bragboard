import { useState, useEffect } from 'react';
import axios from 'axios';
import './Widget.css';

function LeaderboardWidget({ refreshTrigger }) {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get('http://127.0.0.1:8000/users/leaderboard', config);
      setLeaders(response.data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, [refreshTrigger]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="widget-card">
      <h3 className="widget-title">Leaderboard</h3>
      <div className="widget-content">
        {leaders.map((leader, index) => {
          const avatarSrc = leader.avatar;
          return (
            <div key={index} className="leaderboard-item">
              <div className="widget-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={leader.name} className="widget-avatar-img" />
                ) : (
                  <span className="avatar-initials">{getInitials(leader.name)}</span>
                )}
              </div>
              <div className="widget-item-info">
                <span className="widget-item-name">{leader.name}</span>
              </div>
              <div className="widget-item-value">{leader.score}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LeaderboardWidget;

