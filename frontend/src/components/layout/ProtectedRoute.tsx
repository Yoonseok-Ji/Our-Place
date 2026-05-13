import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute() {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/landing" replace />;
  return <Outlet />;
}

export function CoupleRoute() {
  const { token, couple, coupleResolved } = useAuthStore();

  if (!token) return <Navigate to="/landing" replace />;

  if (!coupleResolved) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-[3px] border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted">잠깐만요...</p>
      </div>
    );
  }

  if (!couple || couple.status !== 'active') return <Navigate to="/connect" replace />;
  return <Outlet />;
}
