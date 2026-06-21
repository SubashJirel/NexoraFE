import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * RequireAuth — redirects unauthenticated users to /login.
 * Preserves the attempted URL so we can redirect back after login.
 *
 * @param {string[]} roles - optional list of allowed roles
 */
export default function RequireAuth({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/403" replace />
  }

  return children
}
