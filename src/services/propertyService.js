import apiClient from '@/lib/axios'

/**
 * GET /api/properties/filter-options/
 * Returns dynamic dropdown options for property_types, statuses,
 * locations, and agents — sourced from the current data in the backend.
 *
 * @returns {{ property_types, statuses, locations, agents }}
 */
export async function getPropertyFilterOptions() {
  const { data } = await apiClient.get('/properties/filter-options/')
  return data
}

/**
 * GET /api/properties/
 * Accepts optional filter params: property_type, status, location, assigned_agent, search
 * Empty/falsy values are stripped before sending.
 *
 * @param {object} [params]
 */
export async function getProperties(params = {}) {
  // Strip empty values so they don't appear as blank query params
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
  const { data } = await apiClient.get('/properties/', { params: clean })
  return data
}

/**
 * GET /api/properties/{propertyId}/
 * Fetches a single property with its full details.
 *
 * @param {number|string} propertyId
 * @returns {object}
 */
export async function getProperty(propertyId) {
  const { data } = await apiClient.get(`/properties/${propertyId}/`)
  return data
}

/**
 * POST /api/properties/
 * Creates a new property and returns it with its generated id.
 *
 * @param {object} payload - property fields (no media)
 * @returns {object} created property (id, title, …)
 */
export async function createProperty(payload) {
  const { data } = await apiClient.post('/properties/', payload)
  return data   // 201 response contains the full property including id
}

/**
 * PUT /api/properties/{propertyId}/
 * Updates a property and returns the updated record.
 *
 * @param {number|string} propertyId
 * @param {object} payload
 * @returns {object}
 */
export async function updateProperty(propertyId, payload) {
  const { data } = await apiClient.put(`/properties/${propertyId}/`, payload)
  return data
}

/**
 * DELETE /api/properties/{propertyId}/
 * Removes a property record.
 *
 * @param {number|string} propertyId
 * @returns {object|void}
 */
export async function deleteProperty(propertyId) {
  const { data } = await apiClient.delete(`/properties/${propertyId}/`)
  return data
}

/**
 * POST /api/properties/{propertyId}/media/
 * Uploads a single media file for a property.
 *
 * The file is sent as multipart/form-data so the backend receives
 * a real file object, not a base64 string.
 *
 * @param {number|string} propertyId
 * @param {object} mediaPayload - { file: File, media_type, title, caption, sort_order, is_primary }
 */
export async function uploadPropertyMedia(propertyId, mediaPayload) {
  const form = new FormData()
  form.append('media_type', mediaPayload.media_type || 'image')
  form.append('file',       mediaPayload.file)
  form.append('is_primary', String(mediaPayload.is_primary ?? false))
  form.append('sort_order', String(mediaPayload.sort_order ?? 0))
  if (mediaPayload.title)   form.append('title',   mediaPayload.title)
  if (mediaPayload.caption) form.append('caption', mediaPayload.caption)

  const { data } = await apiClient.post(
    `/properties/${propertyId}/media/`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

/**
 * DELETE /api/properties/media/{mediaId}/
 * Removes a single media record from a property.
 *
 * @param {number|string} mediaId
 * @returns {object|void}
 */
export async function deletePropertyMedia(mediaId) {
  const { data } = await apiClient.delete(`/properties/media/${mediaId}/`)
  return data
}

export async function updatePropertyMedia(mediaId, payload) {
  const { data } = await apiClient.patch(`/properties/media/${mediaId}/`, payload)
  return data
}

export async function getPropertyVerification(propertyId) {
  const { data } = await apiClient.get(`/properties/${propertyId}/verification/`)
  return data
}

export async function updatePropertyVerification(propertyId, payload) {
  const { data } = await apiClient.patch(`/properties/${propertyId}/verification/`, payload)
  return data
}

export async function updatePropertyVerificationDocument(propertyId, documentType, payload) {
  const hasFile = payload.file instanceof File
  if (!hasFile) {
    const { data } = await apiClient.patch(
      `/properties/${propertyId}/verification/documents/${documentType}/`, payload
    )
    return data
  }
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value)
  })
  const { data } = await apiClient.patch(
    `/properties/${propertyId}/verification/documents/${documentType}/`, form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

export async function confirmPropertyFreshness(propertyId, payload) {
  const { data } = await apiClient.post(`/properties/${propertyId}/freshness/confirm/`, payload)
  return data
}

export async function requestPropertyRepublish(propertyId) {
  const { data } = await apiClient.post(`/properties/${propertyId}/republish/request/`)
  return data
}

export async function decidePropertyRepublish(propertyId, payload) {
  const { data } = await apiClient.post(`/properties/${propertyId}/republish/decision/`, payload)
  return data
}

export async function getPropertyHistory(propertyId) {
  const { data } = await apiClient.get(`/properties/${propertyId}/history/`)
  return data
}

export async function getPropertyDuplicates(propertyId) {
  const { data } = await apiClient.get(`/properties/${propertyId}/duplicates/`)
  return data
}

export async function updatePropertyDuplicate(flagId, status) {
  const { data } = await apiClient.patch(`/properties/duplicates/${flagId}/`, { status })
  return data
}

/**
 * Orchestrates both APIs as a single atomic action:
 *  1. POST /api/properties/          → get propertyId
 *  2. POST /api/properties/{id}/media/ for each file (parallel)
 *
 * @param {object}   propertyPayload - form fields
 * @param {File[]}   mediaFiles      - array of File objects (may be empty)
 * @returns {object} created property with populated media array
 */
export async function createPropertyWithMedia(propertyPayload, mediaFiles = []) {
  // Step 1 — create the property
  const property = await createProperty(propertyPayload)

  // Step 2 — upload all media in parallel (fire-and-forget style;
  //           if media fails we still have the property)
  if (mediaFiles.length > 0) {
    const uploads = mediaFiles.map((file, index) =>
      uploadPropertyMedia(property.id, {
        file,
        media_type: file.type.startsWith('video') ? 'video' : 'image',
        is_primary: index === 0,   // first image is primary
        sort_order: index,
        title: file.name.replace(/\.[^.]+$/, ''),
      })
    )
    const results = await Promise.allSettled(uploads)
    // Attach successful uploads to the returned object
    property.media = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
    property.media_upload_failures = results.flatMap((result, index) => result.status === 'rejected' ? [{
      file: mediaFiles[index],
      index,
      message: mediaUploadError(result.reason),
    }] : [])
  }

  return property
}

export async function retryPropertyMediaFailures(propertyId, failures = []) {
  const results = await Promise.allSettled(failures.map((failure) =>
    uploadPropertyMedia(propertyId, {
      file: failure.file,
      media_type: failure.file.type.startsWith('video') ? 'video' : 'image',
      is_primary: failure.index === 0,
      sort_order: failure.index,
      title: failure.file.name.replace(/\.[^.]+$/, ''),
    })
  ))
  return {
    uploaded: results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []),
    failures: results.flatMap((result, index) => result.status === 'rejected' ? [{
      ...failures[index],
      message: mediaUploadError(result.reason),
    }] : []),
  }
}

function mediaUploadError(error) {
  const data = error?.response?.data
  if (data?.detail) return data.detail
  const first = data && Object.values(data)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === 'string') return first
  return error?.message || 'Upload failed.'
}
