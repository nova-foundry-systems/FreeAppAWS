import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute() {
  const { user, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <Outlet />
}
