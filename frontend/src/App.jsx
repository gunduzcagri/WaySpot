import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MapView from './components/MapView';
import RoutePlanner from './components/RoutePlanner';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import SharePage from './pages/SharePage';
import TestDataPage from './pages/TestDataPage';
import ThemeToggle from './components/ThemeToggle';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function MapLayout() {
  const [mapCenter, setMapCenter] = useState({ lat: 39.9334, lng: 32.8597 });

  return (
    <>
      <ThemeToggle />
      <nav style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1001, display: 'flex', gap: 8, background: 'rgba(20,22,26,0.85)', padding: '8px 12px', borderRadius: 999, border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
        <NavLink to="/" style={navStyle} end>Harita</NavLink>
        <NavLink to="/share" style={navStyle}>Paylaş</NavLink>
        <NavLink to="/profile" style={navStyle}>Profil</NavLink>
        <NavLink to="/business/dashboard" style={navStyle}>İşletme</NavLink>
        <NavLink to="/settings" style={navStyle}>Ayarlar</NavLink>
        <NavLink to="/test-data" style={{ ...navStyle, color: '#f59e0b' }}>Test</NavLink>
      </nav>
      <MapView onCenterChange={setMapCenter}>
        <RoutePlanner />
        <FeedPage center={mapCenter} />
      </MapView>
    </>
  );
}

const navStyle = { color: '#cbd5e1', textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 999, transition: 'background .2s' };

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><MapLayout /></ProtectedRoute>} />
          <Route path="/share" element={<ProtectedRoute><SharePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/business/dashboard" element={<ProtectedRoute><BusinessDashboardPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/test-data" element={<ProtectedRoute><TestDataPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
