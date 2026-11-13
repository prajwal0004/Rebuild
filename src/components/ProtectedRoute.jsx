import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { session, loading, recovering } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="splash">Loading…</div>;
  if (recovering) return <Navigate to="/reset-password" replace />;
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
