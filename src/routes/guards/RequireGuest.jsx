import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * RequireGuest — redirects authenticated users away from auth pages (login, signup).
 */
export default function RequireGuest({ children }) {
  const { isAuthenticated, user, agency } = useAuthStore()

  if (isAuthenticated) {
    const needsWebsiteSetup =
      ['agency_owner', 'agency_manager'].includes(user?.role) &&
      agency?.website_onboarding_status !== 'completed'

    return <Navigate to={needsWebsiteSetup ? '/onboarding/website' : '/dashboard'} replace />
  }

  return children
}
