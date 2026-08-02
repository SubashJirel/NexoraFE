import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * RequireGuest — redirects authenticated users away from auth pages (login, signup).
 */
export default function RequireGuest({ children }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
