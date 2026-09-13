import { useState, useEffect } from 'react';
import axios from 'axios';
import './Widget.css';

function TopTaggedWidget({ refreshTrigger }) {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const handlePhotoUpdate = () => {
      fetchTopTagged();
    };
    window.addEventListener('profilePhotoUpdated', handlePhotoUpdate);
    window.addEventListener('storage', handlePhotoUpdate);
    return () => {
      window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate);
      window.removeEventListener('storage', handlePhotoUpdate);
    };
  }, []);

  const fetchTopTagged = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get('http://127.0.0.1:8000/users/top-tagged', config);
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching top tagged:", error);
    }
  };

  useEffect(() => {
    fetchTopTagged();
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
      <h3 className="widget-title">Top Tagged Employees</h3>
      <div className="widget-content">
        {employees.map((employee, index) => {
          const avatarSrc = employee.avatar;
          return (
            <div key={index} className="widget-item">
              <div className="widget-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={employee.name} className="widget-avatar-img" />
                ) : (
                  <span className="avatar-initials">{getInitials(employee.name)}</span>
                )}
              </div>
              <div className="widget-item-info">
                <span className="widget-item-name">{employee.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopTaggedWidget;

