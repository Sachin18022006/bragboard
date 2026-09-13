import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShieldAlert, FileText, ArrowLeft } from 'lucide-react';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('role');
    localStorage.removeItem('email');
    sessionStorage.removeItem('email');
    localStorage.removeItem('name');
    sessionStorage.removeItem('name');
    localStorage.removeItem('employee_id');
    sessionStorage.removeItem('employee_id');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 text-gray-100">
      <div className="flex items-center gap-3">
        <div
          className="text-blue-500 font-bold text-xl flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/admin-dashboard')}
        >
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/30">B</div>
          <span className="font-extrabold tracking-tight text-white">BragBoard</span>
          <span className="bg-blue-900/60 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-800">Admin</span>
        </div>

        <button
          onClick={() => navigate('/Dashboard')}
          className="flex items-center gap-1.5 ml-4 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700"
          title="Return to Employee App"
        >
          <ArrowLeft size={14} /> Back to App
        </button>
      </div>

      <div className="flex items-center gap-6 text-gray-400 text-sm font-medium">
        <button
          onClick={() => navigate('/admin-dashboard')}
          className={`flex items-center gap-2 transition-colors ${location.pathname === '/admin-dashboard' ? 'text-blue-400 font-semibold' : 'hover:text-white'}`}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button
          onClick={() => navigate('/admin/moderation')}
          className={`flex items-center gap-2 transition-colors ${location.pathname === '/admin/moderation' ? 'text-blue-400 font-semibold' : 'hover:text-white'}`}
        >
          <ShieldAlert size={18} /> Moderation
        </button>
        <button
          onClick={() => navigate('/admin/reports')}
          className={`flex items-center gap-2 transition-colors ${location.pathname === '/admin/reports' ? 'text-blue-400 font-semibold' : 'hover:text-white'}`}
        >
          <FileText size={18} /> Reports
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 ml-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
