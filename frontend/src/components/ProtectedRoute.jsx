import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

// Usage: <ProtectedRoute element={<Component/>} role="admin|user|optional" />
const ProtectedRoute = ({ element, role }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="text-gray-600">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return element
}

export default ProtectedRoute
