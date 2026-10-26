import { Routes, Route, Navigate } from 'react-router-dom';
import { getSession } from './api.js';
import Login from './components/Login.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ManagerDashboard from './components/ManagerDashboard.jsx';
import GuideDashboard from './components/GuideDashboard.jsx';
import TouristDashboard from './components/TouristDashboard.jsx';

function Protected({ role, children }) {
  const s = getSession();
  if (!s) return <Navigate to="/" replace />;
  if (s.role !== role) return <Navigate to={'/' + s.role} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
      <Route path="/manager" element={<Protected role="manager"><ManagerDashboard /></Protected>} />
      <Route path="/guide" element={<Protected role="guide"><GuideDashboard /></Protected>} />
      <Route path="/tourist" element={<Protected role="tourist"><TouristDashboard /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
