import MyShoutouts from './features/pages/MyShoutouts';
import Leaderboard from './features/pages/Leaderboard';
import FeedPage from './features/pages/FeedPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './features/pages/Dashboard';
import Settings from './features/pages/Settings';
import LoginPage from './features/pages/Login';
import AdminDashboard from './features/pages/AdminDashboard';
import AdminModeration from './features/pages/AdminModeration';
import AdminReports from './features/pages/AdminReports';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import AnalyticsPage from './features/pages/AnalyticsPage';
import Home from './features/pages/Home';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/moderation" element={<AdminModeration />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-shoutouts" element={<MyShoutouts />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
