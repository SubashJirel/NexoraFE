import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSocialConnections,
  startMetaConnection,
  deleteSocialConnection,
  getMetaConnectionSession,
  completeMetaConnectionSession,
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

export function useMetaConnectionSession(token) {
  return useQuery({
    queryKey: ['meta-connection-session', token],
    queryFn: () => getMetaConnectionSession(token),
    enabled: Boolean(token),
    retry: false,
  })
}

export function useCompleteMetaConnectionSession({ onSuccess } = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ token, pageIds }) => completeMetaConnectionSession(token, pageIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_CONNECTIONS_KEY })
      const warning = data.warning_count
        ? ` ${data.warning_count} capability warning${data.warning_count === 1 ? '' : 's'} need attention.`
        : ''
      toast.success(`${data.connected_count} social account${data.connected_count === 1 ? '' : 's'} connected.${warning}`)
      onSuccess?.(data)
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.detail ||
        'Could not connect the selected Meta Pages. Please try again.',
      )
    },
  })
}
