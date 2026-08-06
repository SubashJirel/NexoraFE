import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  assignConversation,
  createLeadFromConversation,
  getConversation,
  getConversationMessages,
  getConversations,
  linkConversationLead,
  markConversationRead,
  replyToConversation,
  updateConversationStatus,
} from '@/services/inboxService'

export const CONVERSATIONS_KEY = ['inbox', 'conversations']
const conversationKey = (id) => ['inbox', 'conversations', id]
const messagesKey = (id) => ['inbox', 'conversations', id, 'messages']

export function useConversations(filters) {
  return useQuery({
    queryKey: [...CONVERSATIONS_KEY, filters],
    queryFn: () => getConversations(filters),
    refetchInterval: 15000,
  })
}

export function useConversation(id) {
  return useQuery({
    queryKey: conversationKey(id),
    queryFn: () => getConversation(id),
    enabled: Boolean(id),
  })
}

export function useConversationMessages(id) {
  return useQuery({
    queryKey: messagesKey(id),
    queryFn: () => getConversationMessages(id),
    enabled: Boolean(id),
    refetchInterval: id ? 10000 : false,
  })
}

function useConversationAction(id, mutationFn, successMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      if (result?.contact) queryClient.setQueryData(conversationKey(id), result)
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: messagesKey(id) })
      if (successMessage) toast.success(successMessage)
    },
    onError: (error) => toast.error(
      error.response?.data?.detail || error.response?.data?.message || 'Inbox action failed.'
    ),
  })
}

export function useReplyToConversation(id) {
  return useConversationAction(id, (text) => replyToConversation(id, text))
}

export function useAssignConversation(id) {
  return useConversationAction(id, (agentId) => assignConversation(id, agentId), 'Conversation assigned.')
}

export function useLinkConversationLead(id) {
  return useConversationAction(id, (leadId) => linkConversationLead(id, leadId), 'Lead linked.')
}

export function useCreateLeadFromConversation(id) {
  return useConversationAction(id, (payload) => createLeadFromConversation(id, payload), 'Lead created.')
}

export function useMarkConversationRead(id) {
  return useConversationAction(id, () => markConversationRead(id))
}

export function useUpdateConversationStatus(id) {
  return useConversationAction(id, (status) => updateConversationStatus(id, status), 'Conversation status updated.')
}
