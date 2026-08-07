import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createDistributionLink,
  createDistributionSocialDraft,
  deleteDistributionLink,
  downloadDistributionAsset,
  getPropertyDistribution,
  updateDistributionLink,
} from '@/services/propertyDistributionService'

export const DISTRIBUTION_KEY = (propertyId) => ['properties', propertyId, 'distribution']
const message = (error, fallback) =>
  error?.response?.data?.detail || Object.values(error?.response?.data || {}).flat().join(' ') || fallback

export function usePropertyDistribution(propertyId) {
  return useQuery({
    queryKey: DISTRIBUTION_KEY(propertyId),
    queryFn: () => getPropertyDistribution(propertyId),
    enabled: Boolean(propertyId),
  })
}

function useDistributionMutation(propertyId, mutationFn, successText) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISTRIBUTION_KEY(propertyId) })
      toast.success(successText)
    },
    onError: (error) => toast.error(message(error, 'Distribution action failed.')),
  })
}

export const useCreateDistributionLink = (propertyId) =>
  useDistributionMutation(propertyId, (payload) => createDistributionLink(propertyId, payload), 'Tracked link created.')
export const useUpdateDistributionLink = (propertyId) =>
  useDistributionMutation(propertyId, ({ id, payload }) => updateDistributionLink(id, payload), 'Tracked link updated.')
export const useDeleteDistributionLink = (propertyId) =>
  useDistributionMutation(propertyId, deleteDistributionLink, 'Tracked link deleted.')

export function useDownloadDistributionAsset(propertyId) {
  return useMutation({
    mutationFn: ({ assetType, linkId, localization }) => downloadDistributionAsset(propertyId, assetType, linkId, localization),
    onSuccess: (filename) => toast.success(`${filename} downloaded.`),
    onError: (error) => toast.error(message(error, 'Could not generate this asset.')),
  })
}

export function useCreateDistributionSocialDraft(propertyId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => createDistributionSocialDraft(propertyId, payload),
    onSuccess: (post, payload) => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
      toast.success(payload.publish_now && post.status === 'published' ? 'Property published.' : 'Social draft created.')
    },
    onError: (error) => toast.error(message(error, 'Could not create the social post.')),
  })
}
