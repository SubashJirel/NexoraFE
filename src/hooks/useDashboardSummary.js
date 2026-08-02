import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '@/services/dashboardService'

export const DASHBOARD_SUMMARY_KEY = ['dashboard-summary']

export function useDashboardSummary() {
  return useQuery({
    queryKey: DASHBOARD_SUMMARY_KEY,
    queryFn: getDashboardSummary,
    staleTime: 1000 * 60 * 2,
  })
}
