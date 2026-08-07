import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PROPERTY_KEY } from '@/hooks/useProperties'
import { confirmPropertyFreshness, decidePropertyRepublish, getPropertyDuplicates, getPropertyHistory, requestPropertyRepublish, updatePropertyDuplicate } from '@/services/propertyService'

const HISTORY_KEY = (id) => ['properties', id, 'history']
const DUPLICATES_KEY = (id) => ['properties', id, 'duplicates']

export function usePropertyHistory(id) { return useQuery({ queryKey: HISTORY_KEY(id), queryFn: () => getPropertyHistory(id), enabled: Boolean(id) }) }
export function usePropertyDuplicates(id) { return useQuery({ queryKey: DUPLICATES_KEY(id), queryFn: () => getPropertyDuplicates(id), enabled: Boolean(id) }) }

function useLifecycleMutation(propertyId, mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn, onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(propertyId) })
    queryClient.invalidateQueries({ queryKey: HISTORY_KEY(propertyId) })
    queryClient.invalidateQueries({ queryKey: DUPLICATES_KEY(propertyId) })
  } })
}

export function useConfirmPropertyFreshness(id) { return useLifecycleMutation(id, (payload) => confirmPropertyFreshness(id, payload)) }
export function useRequestPropertyRepublish(id) { return useLifecycleMutation(id, () => requestPropertyRepublish(id)) }
export function useDecidePropertyRepublish(id) { return useLifecycleMutation(id, (payload) => decidePropertyRepublish(id, payload)) }
export function useReviewPropertyDuplicate(id) { return useLifecycleMutation(id, ({ flagId, status }) => updatePropertyDuplicate(flagId, status)) }
