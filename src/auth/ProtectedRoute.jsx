import { Navigate } from 'react-router-dom'
import { isAuthenticated } from './auth'

// Wrapper component that redirects to /login if not authenticated
export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}
