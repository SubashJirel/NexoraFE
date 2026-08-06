import apiClient from '@/lib/axios'

export async function getConversations(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  )
  const { data } = await apiClient.get('/inbox/conversations/', { params: clean })
  return data
}

export async function getConversation(id) {
  const { data } = await apiClient.get(`/inbox/conversations/${id}/`)
  return data
}

export async function getConversationMessages(id) {
  const { data } = await apiClient.get(`/inbox/conversations/${id}/messages/`)
  return data
}

export async function replyToConversation(id, text) {
  const { data } = await apiClient.post(`/inbox/conversations/${id}/reply/`, { text })
  return data
}

export async function assignConversation(id, assignedAgent) {
  const { data } = await apiClient.post(`/inbox/conversations/${id}/assign/`, {
    assigned_agent: assignedAgent,
  })
  return data
}

export async function linkConversationLead(id, lead) {
  const { data } = await apiClient.post(`/inbox/conversations/${id}/link-lead/`, { lead })
  return data
}

export async function createLeadFromConversation(id, payload) {
  const { data } = await apiClient.post(`/inbox/conversations/${id}/create-lead/`, payload)
  return data
}

export async function markConversationRead(id) {
  const { data } = await apiClient.post(`/inbox/conversations/${id}/mark-read/`)
  return data
}

export async function updateConversationStatus(id, status) {
  const { data } = await apiClient.post(`/inbox/conversations/${id}/status/`, { status })
  return data
}
