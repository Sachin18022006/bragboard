import { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import Header from '../layout/Header';
import { API_BASE_URL } from '../../api/config';
import { useToast } from '../../context/ToastContext';
import './AnalyticsPage.css';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b'];

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/analytics/overview`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      if (showError) showError('Could not load analytics summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || !data.export_records || data.export_records.length === 0) {
      if (showError) showError('No recognition records available for export.');
      return;
    }

    try {
      const headers = ['ID', 'Title', 'Sender', 'Sender Department', 'Recipients', 'Values / Tags', 'Likes', 'Comments', 'Date'];
      const rows = data.export_records.map(r => [
        r.id,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.sender || '').replace(/"/g, '""')}"`,
        `"${(r.sender_department || '').replace(/"/g, '""')}"`,
        `"${(r.recipients || '').replace(/"/g, '""')}"`,
        `"${(r.values_tags || '').replace(/"/g, '""')}"`,
        r.likes_count,
        r.comments_count,
        `"${r.date || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `BragBoard_Recognition_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (showSuccess) showSuccess('Executive CSV export downloaded successfully!');
    } catch (err) {
      console.error('CSV Export Error:', err);
      if (showError) showError('Failed to export CSV file.');
    }
  };

  const handleExportPDF = () => {
    if (!data) return;

    try {
      setExportingPDF(true);
      const doc = new jsPDF();

      // Brand Header Banner
      doc.setFillColor(37, 99, 235); // #2563eb
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('BragBoard — Executive Culture & Recognition Report', 14, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Enterprise Analytics`, 14, 26);

      // Section 1: Executive KPI Summary
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('1. Executive KPI Summary', 14, 44);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 48, 182, 28, 3, 3, 'FD');

      const s = data.summary;
      doc.text(`• Total Shoutouts Published: ${s.total_shoutouts}`, 20, 56);
      doc.text(`• Total Community Reactions: ${s.total_reactions} (${s.total_likes} Likes, ${s.total_comments} Comments)`, 20, 63);
      doc.text(`• Active Participants: ${s.active_users} employees | Participation Rate: ${s.participation_rate}`, 20, 70);

      // Section 2: Department Activity Breakdown
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('2. Department Participation Matrix', 14, 88);

      let startY = 96;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setFillColor(241, 245, 249);
      doc.rect(14, startY, 182, 8, 'F');
      doc.text('Department', 18, startY + 5.5);
      doc.text('Sent', 100, startY + 5.5);
      doc.text('Received', 135, startY + 5.5);
      doc.text('Total Activity', 165, startY + 5.5);

      startY += 8;
      doc.setFont('helvetica', 'normal');
      (data.department_stats || []).slice(0, 8).forEach((dept, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, startY, 182, 7, 'F');
        }
        doc.text(dept.department, 18, startY + 5);
        doc.text(String(dept.shoutouts_sent), 105, startY + 5);
        doc.text(String(dept.shoutouts_received), 140, startY + 5);
        doc.text(String(dept.total_activity), 172, startY + 5);
        startY += 7;
      });

      // Section 3: Top Recognized Employees
      startY += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('3. Top Recognized Team Members', 14, startY);

      startY += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setFillColor(241, 245, 249);
      doc.rect(14, startY, 182, 8, 'F');
      doc.text('Rank', 18, startY + 5.5);
      doc.text('Employee Name', 38, startY + 5.5);
      doc.text('Department', 110, startY + 5.5);
      doc.text('Recognitions Received', 150, startY + 5.5);

      startY += 8;
      doc.setFont('helvetica', 'normal');
      (data.top_contributors || []).forEach((user, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, startY, 182, 7, 'F');
        }
        doc.text(`#${idx + 1}`, 20, startY + 5);
        doc.text(user.name, 38, startY + 5);
        doc.text(user.department, 110, startY + 5);
        doc.text(`${user.count} awards`, 160, startY + 5);
        startY += 7;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Confidential — For Internal Company All-Hands and People Operations Review Only', 14, 285);

      doc.save(`BragBoard_Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      if (showSuccess) showSuccess('Executive PDF report generated and downloaded!');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      if (showError) showError('Failed to generate PDF report.');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="analytics-page">
        <Header />
        <main className="analytics-container loading-state">
          <div className="analytics-spinner"></div>
          <p>Compiling executive analytics and departmental trends...</p>
        </main>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="analytics-page">
      <Header />

      <main className="analytics-container">
        {/* Executive Header Banner */}
        <div className="analytics-header">
          <div className="analytics-title-group">
            <span className="analytics-badge">Executive Operations</span>
            <h1>Recognition & Culture Analytics</h1>
            <p className="analytics-subtitle">
              Real-time intelligence on cross-departmental collaboration, core company values, and team engagement.
            </p>
          </div>

          <div className="analytics-actions">
            <button
              className="export-btn pdf-btn"
              onClick={handleExportPDF}
              disabled={exportingPDF}
              title="Download branded executive PDF summary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {exportingPDF ? 'Generating PDF...' : 'Download PDF Report'}
            </button>

            <button
              className="export-btn csv-btn"
              onClick={handleExportCSV}
              title="Export complete recognition dataset as CSV"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <div className="kpi-icon-wrapper blue">🏆</div>
            <div className="kpi-info">
              <span className="kpi-label">Total Shoutouts</span>
              <h3 className="kpi-val">{s.total_shoutouts}</h3>
              <span className="kpi-meta">Across all departments</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="kpi-icon-wrapper green">❤️</div>
            <div className="kpi-info">
              <span className="kpi-label">Total Interactions</span>
              <h3 className="kpi-val">{s.total_reactions}</h3>
              <span className="kpi-meta">{s.total_likes} likes • {s.total_comments} comments</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="kpi-icon-wrapper purple">👥</div>
            <div className="kpi-info">
              <span className="kpi-label">Active Members</span>
              <h3 className="kpi-val">{s.active_users}</h3>
              <span className="kpi-meta">{s.participation_rate} participation rate</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="kpi-icon-wrapper orange">🏢</div>
            <div className="kpi-info">
              <span className="kpi-label">Top Department</span>
              <h3 className="kpi-val">{s.top_department}</h3>
              <span className="kpi-meta">Highest recognition activity</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="analytics-charts-grid">
          {/* Department Bar Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3>Department Collaboration Matrix</h3>
                <p>Recognitions sent vs received across teams</p>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.department_stats} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                  <XAxis dataKey="department" angle={-25} textAnchor="end" height={50} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="shoutouts_sent" name="Shoutouts Given" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shoutouts_received" name="Shoutouts Received" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Values Pie Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3>Core Values Celebrated</h3>
                <p>Breakdown by cultural principles</p>
              </div>
            </div>
            <div className="chart-wrapper pie-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.values_stats}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {data.values_stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Contributors Table */}
        <div className="analytics-table-card">
          <div className="chart-card-header">
            <div>
              <h3>Most Recognized Leaders</h3>
              <p>Employees driving high impact across the organization</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Recognitions</th>
                  <th>Impact Badge</th>
                </tr>
              </thead>
              <tbody>
                {data.top_contributors.map((user, idx) => (
                  <tr key={user.id}>
                    <td className="rank-cell">
                      <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                    </td>
                    <td className="user-cell">
                      <div className="user-info-flex">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="table-avatar" />
                        ) : (
                          <span className="table-avatar-initials">
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                          </span>
                        )}
                        <span className="user-table-name">{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="dept-pill">{user.department}</span>
                    </td>
                    <td>
                      <strong>{user.count}</strong> shoutouts
                    </td>
                    <td>
                      <span className="impact-tag">
                        {idx === 0 ? '🌟 MVP of the Month' : idx === 1 ? '🚀 High Achiever' : idx === 2 ? '🤝 Team Anchor' : '✨ Top Contributor'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPage;
