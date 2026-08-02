// ── Status pipeline ────────────────────────────────────────────
export const LEAD_STATUSES = [
  { value: 'new',         label: 'New Inquiry',  color: '#8b969d', badge: 'neutral'  },
  { value: 'contacted',   label: 'Contacted',    color: '#f59e0b', badge: 'warning'  },
  { value: 'interested',  label: 'Interested',   color: '#3b82f6', badge: 'info'     },
  { value: 'site_visit',  label: 'Site Visit',   color: '#8b5cf6', badge: 'default'  },
  { value: 'negotiation', label: 'Negotiation',  color: '#f97316', badge: 'warning'  },
  { value: 'closed',      label: 'Closed',       color: '#496B5A', badge: 'success'  },
  { value: 'lost',        label: 'Lost',         color: '#ef4444', badge: 'error'    },
]

export const STATUS_MAP = Object.fromEntries(LEAD_STATUSES.map((s) => [s.value, s]))

// ── Sources ────────────────────────────────────────────────────
export const LEAD_SOURCES = [
  { value: 'website',   label: 'Website'   },
  { value: 'facebook',  label: 'Facebook'  },
  { value: 'instagram', label: 'Instagram' },
  { value: 'referral',  label: 'Referral'  },
  { value: 'walk_in',   label: 'Walk-in'   },
  { value: 'phone',     label: 'Phone'     },
  { value: 'other',     label: 'Other'     },
]

// ── Property types ─────────────────────────────────────────────
export const PROPERTY_TYPES = [
  { value: 'house',      label: 'House'      },
  { value: 'apartment',  label: 'Apartment'  },
  { value: 'land',       label: 'Land'       },
  { value: 'commercial', label: 'Commercial' },
  { value: 'villa',      label: 'Villa'      },
]

// ── Purposes ───────────────────────────────────────────────────
export const PURPOSES = [
  { value: 'sale',  label: 'Buy'  },
  { value: 'rent',  label: 'Rent' },
]

// ── Interaction types ──────────────────────────────────────────
export const INTERACTION_TYPES = [
  { value: 'call',    label: 'Call',      icon: '📞' },
  { value: 'email',   label: 'Email',     icon: '✉️' },
  { value: 'meeting', label: 'Meeting',   icon: '🤝' },
  { value: 'sms',     label: 'SMS',       icon: '💬' },
  { value: 'site_visit', label: 'Site Visit', icon: '🏠' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💚' },
  { value: 'other',   label: 'Other',     icon: '📝' },
]

// ── Interest levels ────────────────────────────────────────────
export const INTEREST_LEVELS = [
  { value: 'low',    label: 'Low',    badge: 'neutral' },
  { value: 'medium', label: 'Medium', badge: 'warning' },
  { value: 'high',   label: 'High',   badge: 'success' },
]

// ── Source badge color map ─────────────────────────────────────
export const SOURCE_BADGE = {
  website:   { variant: 'info',    short: 'WEB'  },
  facebook:  { variant: 'info',    short: 'FB'   },
  instagram: { variant: 'warning', short: 'IG'   },
  referral:  { variant: 'success', short: 'REF'  },
  walk_in:   { variant: 'default', short: 'WALK' },
  phone:     { variant: 'neutral', short: 'TEL'  },
  other:     { variant: 'neutral', short: 'OTH'  },
}

// ── Kanban column order ────────────────────────────────────────
export const KANBAN_COLUMNS = [
  'new', 'contacted', 'interested', 'site_visit', 'negotiation',
]

// ── Budget formatter ───────────────────────────────────────────
export function formatBudget(val) {
  if (!val) return null
  const n = Number(val)
  if (isNaN(n)) return val
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}
