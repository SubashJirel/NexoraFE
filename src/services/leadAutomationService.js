import apiClient from '@/lib/axios'

export async function getLeadAutomationSettings() {
  const { data } = await apiClient.get('/leads/automation/settings/')
  return data
}

export async function updateLeadAutomationSettings(payload) {
  const { data } = await apiClient.patch('/leads/automation/settings/', payload)
  return data
}

export async function getLeadAssignmentRules() {
  const { data } = await apiClient.get('/leads/automation/rules/')
  return data
}

export async function createLeadAssignmentRule(payload) {
  const { data } = await apiClient.post('/leads/automation/rules/', payload)
  return data
}

export async function updateLeadAssignmentRule(id, payload) {
  const { data } = await apiClient.patch(`/leads/automation/rules/${id}/`, payload)
  return data
}

export async function deleteLeadAssignmentRule(id) {
  await apiClient.delete(`/leads/automation/rules/${id}/`)
}

export async function getLeadAutomationDashboard() {
  const { data } = await apiClient.get('/leads/automation/dashboard/')
  return data
}

export async function getLeadDuplicates(status = '') {
  const { data } = await apiClient.get('/leads/automation/duplicates/', {
    params: status ? { status } : {},
  })
  return data
}

export async function reviewLeadDuplicate(id, status) {
  const { data } = await apiClient.patch(`/leads/automation/duplicates/${id}/`, { status })
  return data
}

export async function getLeadAutomationEvents() {
  const { data } = await apiClient.get('/leads/automation/events/')
  return data
}

export async function runLeadAutomation() {
  const { data } = await apiClient.post('/leads/automation/process/')
  return data
}
