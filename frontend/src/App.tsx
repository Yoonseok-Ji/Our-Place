import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { couplesApi } from './api/couples';
import { ProtectedRoute, CoupleRoute } from './components/layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConnectCouplePage from './pages/ConnectCouplePage';
import MapPage from './pages/MapPage';
import TimelinePage from './pages/TimelinePage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { token, setCouple } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    couplesApi.getMyCouple()
      .then(setCouple)
      .catch(() => setCouple(null));
  }, [token]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#191F28',
            border: '1px solid #E5E8EB',
            borderRadius: '16px',
            fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#3182F6', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 로그인 필요 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/connect" element={<ConnectCouplePage />} />
        </Route>

        {/* 커플 연결 필요 */}
        <Route element={<CoupleRoute />}>
          <Route path="/"         element={<MapPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/profile"  element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
