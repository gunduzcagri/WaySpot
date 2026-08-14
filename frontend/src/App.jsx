import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
import BusinessDetailPage from './pages/BusinessDetailPage';
import ThemeToggle from './components/ThemeToggle';
import { Map, Navigation, Compass, PlusCircle, User, Settings, Sparkles } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function MainLayout({ children, isMapPage = false, mobileTab = 'map', setMobileTab }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={`app-root-layout ${isMapPage ? 'is-map-view' : 'is-page-view'}`}>
      {/* Desktop Top Navbar (Always rendered across all pages) */}
      <nav className="desktop-navbar">
        <NavLink to="/" className={({ isActive }) => `desktop-nav-link ${isActive && location.pathname === '/' ? 'active' : ''}`} end>
          <Map size={15} /> Harita
        </NavLink>
        <NavLink to="/share" className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}>
          <PlusCircle size={15} /> Paylaş
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}>
          <User size={15} /> Profil
        </NavLink>
        <NavLink to="/business/dashboard" className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}>
          İşletme
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={15} /> Ayarlar
        </NavLink>
        <NavLink to="/test-data" className={({ isActive }) => `desktop-nav-link test-link ${isActive ? 'active' : ''}`}>
          <Sparkles size={14} /> Test
        </NavLink>
      </nav>

      <ThemeToggle />

      {/* Page Body */}
      <div className={`app-main-content ${!isMapPage ? 'subpage-container' : ''}`}>
        {children}
      </div>

      {/* Mobile Bottom Navigation Bar (Always rendered across all pages on mobile) */}
      <nav className="mobile-bottom-navbar">
        <button 
          onClick={() => {
            if (location.pathname !== '/') {
              navigate('/?tab=map');
            } else if (setMobileTab) {
              setMobileTab('map');
            }
          }} 
          className={`mobile-nav-btn ${location.pathname === '/' && mobileTab === 'map' ? 'active' : ''}`}
        >
          <Map size={20} />
          <span>Harita</span>
        </button>

        <button 
          onClick={() => {
            if (location.pathname !== '/') {
              navigate('/?tab=route');
            } else if (setMobileTab) {
              setMobileTab('route');
            }
          }} 
          className={`mobile-nav-btn ${location.pathname === '/' && mobileTab === 'route' ? 'active' : ''}`}
        >
          <Navigation size={20} />
          <span>Rota</span>
        </button>

        <button 
          onClick={() => {
            if (location.pathname !== '/') {
              navigate('/?tab=feed');
            } else if (setMobileTab) {
              setMobileTab('feed');
            }
          }} 
          className={`mobile-nav-btn ${location.pathname === '/' && mobileTab === 'feed' ? 'active' : ''}`}
        >
          <Compass size={20} />
          <span>Keşfet</span>
        </button>

        <NavLink to="/share" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
          <PlusCircle size={20} />
          <span>Paylaş</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profil</span>
        </NavLink>
      </nav>
    </div>
  );
}

function MapLayout() {
  const [mapCenter, setMapCenter] = useState({ lat: 39.9334, lng: 32.8597 });
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'map';
  const [mobileTab, setMobileTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['map', 'route', 'feed'].includes(tabParam)) {
      setMobileTab(tabParam);
    }
  }, [searchParams]);

  return (
    <MainLayout isMapPage={true} mobileTab={mobileTab} setMobileTab={setMobileTab}>
      <MapView onCenterChange={setMapCenter}>
        <RoutePlanner 
          mobileTab={mobileTab} 
          setMobileTab={setMobileTab} 
        />
        <FeedPage 
          center={mapCenter} 
          mobileTab={mobileTab} 
          setMobileTab={setMobileTab} 
        />
      </MapView>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><MapLayout /></ProtectedRoute>} />
            <Route path="/business/:id" element={<ProtectedRoute><MainLayout><BusinessDetailPage /></MainLayout></ProtectedRoute>} />
            <Route path="/share" element={<ProtectedRoute><MainLayout><SharePage /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout><UserProfilePage /></MainLayout></ProtectedRoute>} />
            <Route path="/business/dashboard" element={<ProtectedRoute><MainLayout><BusinessDashboardPage /></MainLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><MainLayout><SettingsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/test-data" element={<ProtectedRoute><MainLayout><TestDataPage /></MainLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
