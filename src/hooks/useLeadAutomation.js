import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createLeadAssignmentRule,
  deleteLeadAssignmentRule,
  getLeadAssignmentRules,
  getLeadAutomationDashboard,
  getLeadAutomationEvents,
  getLeadAutomationSettings,
  getLeadDuplicates,
  reviewLeadDuplicate,
  runLeadAutomation,
  updateLeadAssignmentRule,
  updateLeadAutomationSettings,
} from '@/services/leadAutomationService'

export const AUTOMATION_KEY = ['lead-automation']
const errorMessage = (error, fallback) =>
  error?.response?.data?.detail || Object.values(error?.response?.data || {})?.flat?.()?.[0] || fallback

export function useLeadAutomationSettings() {
  return useQuery({ queryKey: [...AUTOMATION_KEY, 'settings'], queryFn: getLeadAutomationSettings })
}

export function useLeadAssignmentRules() {
  return useQuery({ queryKey: [...AUTOMATION_KEY, 'rules'], queryFn: getLeadAssignmentRules })
}

export function useLeadAutomationDashboard() {
  return useQuery({
    queryKey: [...AUTOMATION_KEY, 'dashboard'], queryFn: getLeadAutomationDashboard,
    refetchInterval: 60_000,
  })
}

export function useLeadDuplicates(status = 'pending') {
  return useQuery({
    queryKey: [...AUTOMATION_KEY, 'duplicates', status], queryFn: () => getLeadDuplicates(status),
  })
}

export function useLeadAutomationEvents() {
  return useQuery({ queryKey: [...AUTOMATION_KEY, 'events'], queryFn: getLeadAutomationEvents })
}

function useAutomationMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTOMATION_KEY })
      toast.success(successMessage)
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not update lead automation.')),
  })
}

export const useUpdateLeadAutomationSettings = () =>
  useAutomationMutation(updateLeadAutomationSettings, 'Automation settings saved.')
export const useCreateLeadAssignmentRule = () =>
  useAutomationMutation(createLeadAssignmentRule, 'Assignment rule created.')
export const useUpdateLeadAssignmentRule = () =>
  useAutomationMutation(({ id, payload }) => updateLeadAssignmentRule(id, payload), 'Assignment rule updated.')
export const useDeleteLeadAssignmentRule = () =>
  useAutomationMutation(deleteLeadAssignmentRule, 'Assignment rule removed.')
export const useReviewLeadDuplicate = () =>
  useAutomationMutation(({ id, status }) => reviewLeadDuplicate(id, status), 'Duplicate review saved.')
export const useRunLeadAutomation = () =>
  useAutomationMutation(runLeadAutomation, 'Lead automation processed.')
