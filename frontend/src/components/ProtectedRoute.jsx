import React from 'react';
import { Navigate } from 'react-router-dom';

// A simple protected route component
// For this frontend-first approach, we'll check localStorage for a mock user
const ProtectedRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem('kaammitra_user') || 'null');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
