import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  contactPublicAgency,
  getPublicAgency,
  getPublicAgent,
  getPublicAgents,
  getPublicProperties,
  getPublicProperty,
  getPublicPropertyByShareSlug,
  getPublicPropertyOptions,
  getSimilarProperties,
  requestPublicSiteVisit,
  submitPropertyInquiry,
} from '@/services/publicService'

export function usePublicAgency(slug) {
  return useQuery({ queryKey: ['public', 'agency', slug], queryFn: () => getPublicAgency(slug), enabled: Boolean(slug) })
}

export function usePublicAgents(license) {
  return useQuery({ queryKey: ['public', license, 'agents'], queryFn: () => getPublicAgents(license), enabled: Boolean(license) })
}

export function usePublicAgent(license, id) {
  return useQuery({ queryKey: ['public', license, 'agents', id], queryFn: () => getPublicAgent(license, id), enabled: Boolean(license && id) })
}

export function usePublicProperties(license, filters) {
  return useQuery({ queryKey: ['public', license, 'properties', filters], queryFn: () => getPublicProperties(license, filters), enabled: Boolean(license) })
}

export function usePublicPropertyOptions(license) {
  return useQuery({ queryKey: ['public', license, 'property-options'], queryFn: () => getPublicPropertyOptions(license), enabled: Boolean(license) })
}

export function usePublicProperty(license, id) {
  return useQuery({ queryKey: ['public', license, 'properties', id], queryFn: () => getPublicProperty(license, id), enabled: Boolean(license && id) })
}

export function usePublicPropertyByShareSlug(slug, shareSlug) {
  return useQuery({ queryKey: ['public', slug, 'listings', shareSlug], queryFn: () => getPublicPropertyByShareSlug(slug, shareSlug), enabled: Boolean(slug && shareSlug) })
}

export function useSimilarProperties(license, id) {
  return useQuery({ queryKey: ['public', license, 'properties', id, 'similar'], queryFn: () => getSimilarProperties(license, id), enabled: Boolean(license && id) })
}

function usePublicMutation(mutationFn, message) {
  return useMutation({
    mutationFn,
    onSuccess: () => toast.success(message),
    onError: (error) => toast.error(error.response?.data?.detail || 'Unable to submit your request.'),
  })
}

export function usePublicInquiry(license, id) {
  return usePublicMutation((payload) => submitPropertyInquiry(license, id, payload), 'Inquiry sent successfully.')
}

export function usePublicSiteVisitRequest(license, id) {
  return usePublicMutation((payload) => requestPublicSiteVisit(license, id, payload), 'Site visit requested.')
}

export function usePublicAgencyContact(license) {
  return usePublicMutation((payload) => contactPublicAgency(license, payload), 'Message sent successfully.')
}
