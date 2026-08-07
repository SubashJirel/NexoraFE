export const INITIAL_FORM = {
  title: '',
  property_type: 'house',
  purpose: 'sale',
  price: '',
  currency: 'NPR',
  province: '',
  district: '',
  city: '',
  municipality: '', ward_number: '', tole: '', landmark: '',
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
  land_use_classification: '', road_type: '', facing_direction: '',
  mohada_value: '', pichhad_value: '', plot_dimension_unit: 'ft', plot_shape: '',
  has_water_supply: null, has_electricity: null, has_drainage: null, has_sewage: null,
  major_road_type: '', nearest_major_road: '', major_road_distance_value: '', major_road_distance_unit: 'm',
  amenities: '',
  virtual_tour_url: '',
  video_tour_url: '',
  short_description: '',
  description: '',
  seo_title: '',
  seo_description: '',
  custom_data: {},
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
    if (!form.municipality.trim()) errors.municipality = 'Municipality is required'
    if (form.ward_number && (Number(form.ward_number) < 1 || Number(form.ward_number) > 99)) errors.ward_number = 'Enter ward 1–99'
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
    municipality: form.municipality.trim(), ward_number: String(form.ward_number || ''),
    tole: form.tole.trim(), landmark: form.landmark.trim(),
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
    land_use_classification: form.land_use_classification, road_type: form.road_type,
    facing_direction: form.facing_direction || null,
    mohada_value: form.mohada_value || null, pichhad_value: form.pichhad_value || null,
    plot_dimension_unit: form.plot_dimension_unit, plot_shape: form.plot_shape,
    has_water_supply: form.has_water_supply, has_electricity: form.has_electricity,
    has_drainage: form.has_drainage, has_sewage: form.has_sewage,
    major_road_type: form.major_road_type, nearest_major_road: form.nearest_major_road.trim(),
    major_road_distance_value: form.major_road_distance_value || null,
    major_road_distance_unit: form.major_road_distance_unit,
    amenities: form.amenities || '',
    virtual_tour_url: form.virtual_tour_url || '',
    video_tour_url: form.video_tour_url || '',
    short_description: form.short_description.trim(),
    description: form.description.trim(),
    seo_title: form.seo_title?.trim() || '',
    seo_description: form.seo_description?.trim() || '',
    custom_data: form.custom_data || {},
    status,
    is_published: status === 'available',
    is_featured: form.is_featured,
    published_at: status === 'available' ? new Date().toISOString() : null,
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
    municipality: property.municipality ?? '', ward_number: property.ward_number ?? '',
    tole: property.tole ?? '', landmark: property.landmark ?? '',
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
    land_use_classification: property.land_use_classification ?? '', road_type: property.road_type ?? '',
    facing_direction: property.facing_direction ?? '', mohada_value: property.mohada_value ?? '',
    pichhad_value: property.pichhad_value ?? '', plot_dimension_unit: property.plot_dimension_unit ?? 'ft',
    plot_shape: property.plot_shape ?? '', has_water_supply: property.has_water_supply ?? null,
    has_electricity: property.has_electricity ?? null, has_drainage: property.has_drainage ?? null,
    has_sewage: property.has_sewage ?? null, major_road_type: property.major_road_type ?? '',
    nearest_major_road: property.nearest_major_road ?? '',
    major_road_distance_value: property.major_road_distance_value ?? '',
    major_road_distance_unit: property.major_road_distance_unit ?? 'm',
    amenities: property.amenities ?? '',
    virtual_tour_url: property.virtual_tour_url ?? '',
    video_tour_url: property.video_tour_url ?? '',
    short_description: property.short_description ?? '',
    description: property.description ?? '',
    seo_title: property.seo_title ?? '',
    seo_description: property.seo_description ?? '',
    custom_data: property.custom_data ?? {},
    status: property.status ?? 'draft',
    is_published: Boolean(property.is_published),
    is_featured: Boolean(property.is_featured),
    assigned_agent: property.assigned_agent ?? null,
  }
}
