import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Role hierarchy: owner > admin > manager > staff > customer
  if (requiredRole) {
    const roleHierarchy = {
      owner: 5,
      admin: 4,
      manager: 3,
      staff: 2,
      customer: 1,
    };

    const userRoleLevel = roleHierarchy[user?.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return <Navigate to="/admin/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
