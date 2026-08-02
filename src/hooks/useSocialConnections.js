import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSocialConnections,
  startMetaConnection,
  deleteSocialConnection,
} from '@/services/socialPostService'
import toast from 'react-hot-toast'

export const SOCIAL_CONNECTIONS_KEY = ['social-connections']

/** Fetch all connected social accounts */
export function useSocialConnections() {
  return useQuery({
    queryKey: SOCIAL_CONNECTIONS_KEY,
    queryFn: getSocialConnections,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Start the Meta OAuth flow.
 * Redirects the browser to Facebook's auth dialog.
 */
export function useStartMetaConnection() {
  return useMutation({
    mutationFn: startMetaConnection,
    onSuccess: ({ auth_url }) => {
      if (auth_url) {
        window.location.href = auth_url
      } else {
        toast.error('Could not get Facebook auth URL. Please try again.')
      }
    },
    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to start Facebook connection. Please try again.'
      toast.error(msg)
    },
  })
}

/** Disconnect a social account */
export function useDisconnectSocialAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => deleteSocialConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_CONNECTIONS_KEY })
      toast.success('Account disconnected.')
    },
    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to disconnect. Please try again.'
      toast.error(msg)
    },
  })
}
