import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSocialPost, getSocialPosts, publishSocialPost } from '@/services/socialPostService'
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
 * Sends multipart/form-data including an optional image file.
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
      toast.success('Post published successfully!')
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
