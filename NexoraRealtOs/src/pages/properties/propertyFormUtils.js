export const INITIAL_FORM = {
  title: '',
  property_type: 'house',
  purpose: 'sale',
  price: '',
  currency: 'NPR',
  province: '',
  district: '',
  city: '',
  neighbourhood: '',
  address: '',
  latitude: '',
  longitude: '',
  bedrooms: 1,
  bathrooms: 1,
  floors: 1,
  land_area_value: '',
  land_area_unit: 'aana',
  built_up_area_value: '',
  built_up_area_unit: 'sqft',
  road_access_value: '',
  road_access_unit: 'ft',
  amenities: '',
  virtual_tour_url: '',
  short_description: '',
  description: '',
  status: 'draft',
  is_published: false,
  is_featured: false,
  assigned_agent: null,
}

export function validateStep(step, form) {
  const errors = {}

  if (step === 1) {
    if (!form.title.trim()) errors.title = 'Title is required'
    if (!form.property_type) errors.property_type = 'Select a property type'
    if (!form.purpose) errors.purpose = 'Select a purpose'
    if (!form.price) errors.price = 'Price is required'
    if (isNaN(Number(form.price))) errors.price = 'Must be a valid number'
    if (!form.province.trim()) errors.province = 'Province is required'
  }

  if (step === 2) {
    if (!form.district) errors.district = 'Select a district'
    if (!form.city.trim()) errors.city = 'City is required'
    if (!form.address.trim()) errors.address = 'Address is required'
  }

  return errors
}

export function buildPropertyPayload(form) {
  const status = form.status || 'draft'

  return {
    title: form.title.trim(),
    property_type: form.property_type,
    purpose: form.purpose,
    price: form.price,
    currency: form.currency || 'NPR',
    province: form.province.trim(),
    district: form.district,
    city: form.city.trim(),
    neighbourhood: form.neighbourhood.trim() || '',
    address: form.address.trim(),
    latitude: form.latitude || null,
    longitude: form.longitude || null,
    bedrooms: Number(form.bedrooms) || null,
    bathrooms: Number(form.bathrooms) || null,
    floors: Number(form.floors) || null,
    land_area_value: form.land_area_value || null,
    land_area_unit: form.land_area_unit,
    built_up_area_value: form.built_up_area_value || null,
    built_up_area_unit: form.built_up_area_unit,
    road_access_value: form.road_access_value || null,
    road_access_unit: form.road_access_unit,
    amenities: form.amenities || '',
    virtual_tour_url: form.virtual_tour_url || '',
    short_description: form.short_description.trim(),
    description: form.description.trim(),
    status,
    is_published: status === 'active',
    is_featured: form.is_featured,
    published_at: status === 'active' ? new Date().toISOString() : null,
    assigned_agent: form.assigned_agent ?? null,
  }
}

export function propertyToForm(property) {
  return {
    ...INITIAL_FORM,
    title: property.title ?? '',
    property_type: property.property_type ?? 'house',
    purpose: property.purpose ?? 'sale',
    price: property.price ?? '',
    currency: property.currency ?? 'NPR',
    province: property.province ?? '',
    district: property.district ?? '',
    city: property.city ?? '',
    neighbourhood: property.neighbourhood ?? '',
    address: property.address ?? '',
    latitude: property.latitude ?? '',
    longitude: property.longitude ?? '',
    bedrooms: property.bedrooms ?? 1,
    bathrooms: property.bathrooms ?? 1,
    floors: property.floors ?? 1,
    land_area_value: property.land_area_value ?? '',
    land_area_unit: property.land_area_unit ?? 'aana',
    built_up_area_value: property.built_up_area_value ?? '',
    built_up_area_unit: property.built_up_area_unit ?? 'sqft',
    road_access_value: property.road_access_value ?? '',
    road_access_unit: property.road_access_unit ?? 'ft',
    amenities: property.amenities ?? '',
    virtual_tour_url: property.virtual_tour_url ?? '',
    short_description: property.short_description ?? '',
    description: property.description ?? '',
    status: property.status ?? 'draft',
    is_published: Boolean(property.is_published),
    is_featured: Boolean(property.is_featured),
    assigned_agent: property.assigned_agent ?? null,
  }
}
