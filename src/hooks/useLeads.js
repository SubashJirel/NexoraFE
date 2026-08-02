import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeads, createLead, updateLead, deleteLead,
  getInteractions, createInteraction, deleteInteraction,
  getInterests, createInterest, deleteInterest,
} from '@/services/leadService'
import toast from 'react-hot-toast'

// ── Query keys ────────────────────────────────────────────────
export const LEADS_KEY              = ['leads']
export const INTERACTIONS_KEY = (id) => ['leads', id, 'interactions']
export const INTERESTS_KEY    = (id) => ['leads', id, 'interests']

// ── Leads ─────────────────────────────────────────────────────

export function useLeads() {
  return useQuery({
    queryKey: LEADS_KEY,
    queryFn:  getLeads,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateLead({ onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => createLead(payload),
    onSuccess: (lead) => {
      qc.setQueryData(LEADS_KEY, (old = []) => [lead, ...old])
      qc.invalidateQueries({ queryKey: LEADS_KEY })
      toast.success('Lead created!')
      onSuccess?.(lead)
    },
    onError: (err) => toast.error(_msg(err, 'Failed to create lead.')),
  })
}

export function useUpdateLead(leadId, { onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => updateLead(leadId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(LEADS_KEY, (old = []) =>
        old.map((l) => (String(l.id) === String(updated.id) ? updated : l))
      )
      qc.invalidateQueries({ queryKey: LEADS_KEY })
      toast.success('Lead updated!')
      onSuccess?.(updated)
    },
    onError: (err) => toast.error(_msg(err, 'Failed to update lead.')),
  })
}

export function useDeleteLead(leadId, { onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteLead(leadId),
    onSuccess: () => {
      qc.setQueryData(LEADS_KEY, (old = []) =>
        old.filter((l) => String(l.id) !== String(leadId))
      )
      qc.invalidateQueries({ queryKey: LEADS_KEY })
      toast.success('Lead deleted.')
      onSuccess?.()
    },
    onError: (err) => toast.error(_msg(err, 'Failed to delete lead.')),
  })
}

// ── Interactions ──────────────────────────────────────────────

export function useInteractions(leadId) {
  return useQuery({
    queryKey: INTERACTIONS_KEY(leadId),
    queryFn:  () => getInteractions(leadId),
    enabled:  Boolean(leadId),
  })
}

export function useCreateInteraction(leadId, { onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => createInteraction(leadId, payload),
    onSuccess: (item) => {
      qc.setQueryData(INTERACTIONS_KEY(leadId), (old = []) => [item, ...old])
      qc.invalidateQueries({ queryKey: INTERACTIONS_KEY(leadId) })
      toast.success('Interaction logged!')
      onSuccess?.(item)
    },
    onError: (err) => toast.error(_msg(err, 'Failed to log interaction.')),
  })
}

export function useDeleteInteraction(leadId, interactionId, { onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteInteraction(leadId, interactionId),
    onSuccess: () => {
      qc.setQueryData(INTERACTIONS_KEY(leadId), (old = []) =>
        old.filter((i) => String(i.id) !== String(interactionId))
      )
      onSuccess?.()
    },
    onError: (err) => toast.error(_msg(err, 'Failed to delete interaction.')),
  })
}

// ── Interests ─────────────────────────────────────────────────

export function useInterests(leadId) {
  return useQuery({
    queryKey: INTERESTS_KEY(leadId),
    queryFn:  () => getInterests(leadId),
    enabled:  Boolean(leadId),
  })
}

export function useCreateInterest(leadId, { onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => createInterest(leadId, payload),
    onSuccess: (item) => {
      qc.setQueryData(INTERESTS_KEY(leadId), (old = []) => [item, ...old])
      qc.invalidateQueries({ queryKey: INTERESTS_KEY(leadId) })
      toast.success('Interest added!')
      onSuccess?.(item)
    },
    onError: (err) => toast.error(_msg(err, 'Failed to add interest.')),
  })
}

export function useDeleteInterest(leadId, interestId, { onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteInterest(leadId, interestId),
    onSuccess: () => {
      qc.setQueryData(INTERESTS_KEY(leadId), (old = []) =>
        old.filter((i) => String(i.id) !== String(interestId))
      )
      onSuccess?.()
    },
    onError: (err) => toast.error(_msg(err, 'Failed to delete interest.')),
  })
}

// ── Shared error helper ───────────────────────────────────────
function _msg(err, fallback) {
  return (
    err.response?.data?.detail ||
    err.response?.data?.message ||
    Object.values(err.response?.data || {})[0]?.[0] ||
    fallback
  )
}
