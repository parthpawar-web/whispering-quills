import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c77966] mx-auto mb-4"></div>
          <p className="text-[#7a4a3a] italic font-serif">Opening storybook...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin page visited by normal user -> redirect to library (Access Denied)
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/library" replace />;
  }

  return children;
};

export default ProtectedRoute;
