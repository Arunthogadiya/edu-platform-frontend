import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData') || 'null');

  if (!token || !userData) {
    return <Navigate to="/select-role" replace />;
  }

  return <>{children}</>;
};