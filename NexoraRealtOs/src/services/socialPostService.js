import { apiClient } from '@/lib/axios'

export async function startMetaConnection() {
  const { data } = await apiClient.get('/social-posts/connections/meta/start/')
  return data
}
