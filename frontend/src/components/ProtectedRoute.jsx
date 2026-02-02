import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="protected-loading">
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect to profile/login page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/profile" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
