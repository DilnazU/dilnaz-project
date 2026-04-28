import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import GuestChat from './pages/GuestChat';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import AnalysisPage from './pages/AnalysisPage';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#020817' }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#00ff87', borderRightColor: '#0ea5e9' }} />
      </div>
    );
  }

  return (
    <div className="h-screen" style={{ background: '#020817', color: '#f1f5f9' }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/guest" element={<GuestChat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Dashboard />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}