// ── Status definitions ─────────────────────────────────────────
export const SITE_VISIT_STATUSES = [
  { value: 'requested',   label: 'Requested',   badge: 'neutral',  color: '#8b969d' },
  { value: 'scheduled',   label: 'Scheduled',   badge: 'info',     color: '#3b82f6' },
  { value: 'completed',   label: 'Completed',   badge: 'success',  color: '#496B5A' },
  { value: 'cancelled',   label: 'Cancelled',   badge: 'error',    color: '#ef4444' },
  { value: 'no_show',     label: 'No Show',     badge: 'warning',  color: '#f59e0b' },
  { value: 'rescheduled', label: 'Rescheduled', badge: 'warning',  color: '#f97316' },
]

export const STATUS_MAP = Object.fromEntries(
  SITE_VISIT_STATUSES.map((s) => [s.value, s])
)

// ── Date helpers ───────────────────────────────────────────────

/** Format an ISO datetime string to a readable local date + time */
export function formatScheduledAt(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleString('en-IN', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

/** Format an ISO datetime to date-only */
export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/** Returns today's date in YYYY-MM-DD for date inputs */
export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
