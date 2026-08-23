import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSocialPost,
  getSocialPosts,
  publishSocialPost,
  updateSocialPost,
  deleteSocialPost,
} from '@/services/socialPostService'
import toast from 'react-hot-toast'

export const SOCIAL_POSTS_KEY = ['social-posts']

/** Fetch all social posts */
export function useSocialPosts(params = {}) {
  return useQuery({
    queryKey: [...SOCIAL_POSTS_KEY, params],
    queryFn: () => getSocialPosts(params),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Create a new social post.
 * Sends multipart/form-data including up to five ordered image files.
 */
export function useCreateSocialPost({ onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSocialPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_KEY })
      toast.success('Post created successfully!')
      onSuccess?.(data)
    },
    onError: (err) => {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data ?? {}).flat().join(' ') ||
        'Failed to create post. Please try again.'
      toast.error(detail)
    },
  })
}

/**
 * Publish a post to one or more platforms.
 * Invalidates the posts list so the status badge updates automatically.
 *
 * Usage:
 *   const { mutate, isPending } = usePublishSocialPost()
 *   mutate({ id: 1, platforms: ['facebook'] })
 */
export function usePublishSocialPost({ onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, platforms }) => publishSocialPost(id, platforms),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_KEY })
      if (data.status === 'partial') {
        toast.error(data.error_message || 'The post was published to only some selected platforms.')
      } else {
        toast.success('Post published successfully!')
      }
      onSuccess?.(data)
    },
    onError: (err) => {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data ?? {}).flat().join(' ') ||
        'Failed to publish post. Please try again.'
      toast.error(detail)
    },
  })
}

/**
 * Partially update (PATCH) a social post.
 * Only sends the fields you pass — safe to call with just { caption } for example.
 *
 * Usage:
 *   const { mutate, isPending } = useUpdateSocialPost()
 *   mutate({ id: 1, caption: 'new text', images: [File], media_order: ['new:0'] })
 */
export function useUpdateSocialPost({ onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }) => updateSocialPost(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_KEY })
      toast.success('Post updated successfully!')
      onSuccess?.(data)
    },
    onError: (err) => {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data ?? {}).flat().join(' ') ||
        'Failed to update post. Please try again.'
      toast.error(detail)
    },
  })
}

/**
 * Delete a social post.
 *
 * Usage:
 *   const { mutate, isPending } = useDeleteSocialPost()
 *   mutate(postId)
 */
export function useDeleteSocialPost({ onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => deleteSocialPost(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_POSTS_KEY })
      if (data?.code === 'post_deleted_with_remote_warnings') {
        toast(data.detail, {
          icon: '⚠️',
          duration: 8000,
        })
      } else {
        toast.success('Post deleted from Nexora and connected social platforms.')
      }
      onSuccess?.()
    },
    onError: (err) => {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to delete post. Please try again.'
      toast.error(detail)
    },
  })
}
