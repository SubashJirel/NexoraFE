import apiClient from '@/lib/axios'

export async function getCurrentAgency() {
  const { data } = await apiClient.get('/agencies/me/')
  return data
}

export async function updateCurrentAgency(payload) {
  const form = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) form.append(key, value)
    else if (value !== undefined && value !== null) form.append(key, value)
  })

  const { data } = await apiClient.patch('/agencies/me/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
