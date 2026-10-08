import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner className="min-h-screen" />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
