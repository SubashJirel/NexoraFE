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
import { publishSocialPost } from '@/services/socialPostService'

export const DISTRIBUTION_KEY = (propertyId) => ['properties', propertyId, 'distribution']
const message = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.error_message ||
  error?.response?.data?.publish_results
    ?.map((result) => result.error_message)
    .filter(Boolean)
    .join(' | ') ||
  Object.values(error?.response?.data || {})
    .filter((value) => typeof value === 'string')
    .join(' ') ||
  fallback

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
    mutationFn: async (payload) => {
      const { publish_now: publishNow, ...draftPayload } = payload
      const draft = await createDistributionSocialDraft(propertyId, draftPayload)

      if (!publishNow) return draft

      try {
        return await publishSocialPost(
          draft.id,
          draft.target_platforms?.length ? draft.target_platforms : [draft.platform],
        )
      } catch (error) {
        // Preserve this for actionable timeout messaging: the draft exists even
        // if the browser could not wait for Meta to finish publishing it.
        error.distributionDraft = draft
        throw error
      }
    },
    onSuccess: (post, payload) => {
      if (!payload.publish_now) {
        toast.success('Social draft created.')
      } else if (post.status === 'published') {
        toast.success('Property post published.')
      } else if (post.status === 'partial') {
        const detail = post.error_message || 'One or more targets failed.'
        toast.error(`Property post was only partially published. ${detail}`)
      } else {
        toast.error(post.error_message || 'Meta did not publish the property post.')
      }
    },
    onError: (error) => {
      if (error.code === 'ECONNABORTED' && error.distributionDraft) {
        toast.error(
          'The draft was created, but Meta is taking longer than expected. Check Social Media before retrying.',
        )
        return
      }
      toast.error(message(error, 'Could not create or publish the social post.'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
      queryClient.invalidateQueries({ queryKey: DISTRIBUTION_KEY(propertyId) })
    },
  })
}
