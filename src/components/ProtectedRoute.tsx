import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gray-200)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && profile?.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
