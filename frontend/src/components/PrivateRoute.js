import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, ...rest }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;

  // Use Route element to conditionally render the private component
  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
