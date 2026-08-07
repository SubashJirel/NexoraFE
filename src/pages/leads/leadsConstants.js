export const LEAD_STATUSES = [
  { value: 'new', label: 'New Inquiry', color: '#8b969d', badge: 'neutral' },
  { value: 'contacted', label: 'Contacted', color: '#f59e0b', badge: 'warning' },
  { value: 'interested', label: 'Interested', color: '#3b82f6', badge: 'info' },
  { value: 'site_visit_scheduled', label: 'Site Visit Scheduled', color: '#8b5cf6', badge: 'default' },
  { value: 'site_visit_completed', label: 'Site Visit Completed', color: '#6366f1', badge: 'info' },
  { value: 'negotiating', label: 'Negotiating', color: '#f97316', badge: 'warning' },
  { value: 'token_booking', label: 'Token / Booking', color: '#14b8a6', badge: 'info' },
  { value: 'won', label: 'Won', color: '#496B5A', badge: 'success' },
  { value: 'lost', label: 'Lost', color: '#ef4444', badge: 'error' },
  { value: 'follow_up_later', label: 'Follow Up Later', color: '#64748b', badge: 'neutral' },
  { value: 'archived', label: 'Archived', color: '#94a3b8', badge: 'neutral' },
]

export const STATUS_MAP = Object.fromEntries(LEAD_STATUSES.map((status) => [status.value, status]))

export const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'viber', label: 'Viber' },
  { value: 'phone', label: 'Phone inquiry' },
  { value: 'manual', label: 'Manual' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'property_portal', label: 'Property portal' },
]

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'flat', label: 'Flat' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office_space', label: 'Office Space' },
]

export const PURPOSES = [
  { value: 'sale', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'lease', label: 'Lease' },
]

export const INTERACTION_TYPES = [
  { value: 'call', label: 'Call', icon: 'Call' },
  { value: 'email', label: 'Email', icon: 'Email' },
  { value: 'meeting', label: 'Meeting', icon: 'Meet' },
  { value: 'sms', label: 'SMS', icon: 'SMS' },
  { value: 'site_visit', label: 'Site Visit', icon: 'Visit' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'WA' },
  { value: 'viber', label: 'Viber', icon: 'VB' },
  { value: 'facebook', label: 'Facebook', icon: 'FB' },
  { value: 'instagram', label: 'Instagram', icon: 'IG' },
  { value: 'walk_in', label: 'Walk-in', icon: 'Walk' },
  { value: 'property_portal', label: 'Property portal', icon: 'Portal' },
  { value: 'other', label: 'Other', icon: 'Note' },
]

export const INTEREST_LEVELS = [
  { value: 'low', label: 'Low', badge: 'neutral' },
  { value: 'medium', label: 'Medium', badge: 'warning' },
  { value: 'high', label: 'High', badge: 'success' },
]

export const SOURCE_BADGE = {
  website: { variant: 'info', short: 'WEB' },
  facebook: { variant: 'info', short: 'FB' },
  instagram: { variant: 'warning', short: 'IG' },
  tiktok: { variant: 'neutral', short: 'TT' },
  whatsapp: { variant: 'success', short: 'WA' },
  viber: { variant: 'default', short: 'VB' },
  phone: { variant: 'info', short: 'CALL' },
  manual: { variant: 'neutral', short: 'MAN' },
  referral: { variant: 'success', short: 'REF' },
  walk_in: { variant: 'default', short: 'WALK' },
  property_portal: { variant: 'warning', short: 'PORTAL' },
}

export const KANBAN_COLUMNS = [
  'new',
  'contacted',
  'interested',
  'site_visit_scheduled',
  'negotiating',
]

export function formatBudget(value) {
  if (!value) return null
  const amount = Number(value)
  if (Number.isNaN(amount)) return value
  if (amount >= 10000000) return `NPR ${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `NPR ${(amount / 100000).toFixed(1)}L`
  return `NPR ${amount.toLocaleString('en-IN')}`
}
