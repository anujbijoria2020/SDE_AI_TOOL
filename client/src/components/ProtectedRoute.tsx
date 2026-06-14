import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-bg-sidebar/30 gap-4 select-none">
        <Spinner className="text-accent w-8 h-8" />
        <span className="text-xs text-text-muted font-medium tracking-wide animate-pulse">
          Loading workspace...
        </span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
