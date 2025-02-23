import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

export const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated || !user) {
    return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  // Ensure user is accessing the correct dashboard based on their role
  const correctPath = user.role === 'parent' ? '/parent/dashboard' : '/teacher/dashboard';
  const isCorrectPath = location.pathname.startsWith(correctPath);

  if (!isCorrectPath) {
    return <Navigate to={correctPath} replace />;
  }

  return children;
};