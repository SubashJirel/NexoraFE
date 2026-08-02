import { Link } from 'react-router-dom'
import {
  Users,
  Home,
  Handshake,
  PhoneCall,
  CalendarCheck,
  Eye,
  Building2,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const STATUS_BADGE = {
  new: { variant: 'info', label: 'New' },
  contacted: { variant: 'warning', label: 'Contacted' },
  interested: { variant: 'success', label: 'Interested' },
  site_visit: { variant: 'default', label: 'Site Visit' },
  negotiation: { variant: 'primary', label: 'Negotiation' },
  closed: { variant: 'primary', label: 'Closed' },
  lost: { variant: 'error', label: 'Lost' },
}

function formatStatusLabel(status) {
  const normalized = String(status || '').toLowerCase()
  return STATUS_BADGE[normalized]?.label || normalized.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getStatusVariant(status) {
  return STATUS_BADGE[String(status || '').toLowerCase()]?.variant || 'neutral'
}

function StatCard({ label, value, icon: Icon, color, bg, helperText }) {
  return (
    <Card padding="md" hoverable>
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
        <Icon size={18} className={color} />
      </div>
      <p className="text-2xl font-bold text-[#263238]">{value}</p>
      <p className="mt-0.5 text-xs text-[#637079]">{label}</p>
      {helperText ? <p className="mt-1 text-xs font-medium text-[#8b969d]">{helperText}</p> : null}
    </Card>
  )
}

function EmptyState({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-[#DDE5E3] bg-[#F8FAFA] px-4 py-8 text-center text-sm text-[#637079]">
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, error } = useDashboardSummary()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const totals = data?.totals || {}
  const followUps = data?.follow_ups || {}
  const siteVisits = data?.site_visits || {}
  const leadsByStatus = data?.leads_by_status || {}
  const leadsBySource = data?.leads_by_source || {}
  const topProperties = data?.top_properties || []

  const stats = [
    {
      label: 'Total Leads',
      value: totals.leads ?? 0,
      helperText: `${totals.new_leads ?? 0} new leads`,
      icon: PhoneCall,
      color: 'text-[#496B5A]',
      bg: 'bg-[#eef3f0]',
    },
    {
      label: 'Properties',
      value: totals.properties ?? 0,
      helperText: `${totals.published_properties ?? 0} published`,
      icon: Home,
      color: 'text-[#6FAFA8]',
      bg: 'bg-[#f0f8f8]',
    },
    {
      label: 'Site Visits Today',
      value: siteVisits.today ?? 0,
      helperText: `${siteVisits.upcoming ?? 0} upcoming`,
      icon: CalendarCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Inquiries',
      value: totals.inquiries ?? 0,
      helperText: `${totals.property_views ?? 0} total views`,
      icon: Handshake,
      color: 'text-[#496B5A]',
      bg: 'bg-[#eef3f0]',
    },
    {
      label: 'Agents',
      value: totals.agents ?? 0,
      helperText: 'Active team members',
      icon: Users,
      color: 'text-[#8FAF9B]',
      bg: 'bg-[#f4f8f5]',
    },
    {
      label: 'Follow-ups Due',
      value: (followUps.overdue ?? 0) + (followUps.due_today ?? 0),
      helperText: `${followUps.upcoming ?? 0} upcoming`,
      icon: AlertCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  const leadStatusItems = Object.entries(leadsByStatus)
    .sort((a, b) => b[1] - a[1])

  const leadSourceItems = Object.entries(leadsBySource)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#263238]">
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h2>
        <p className="mt-1 text-sm text-[#637079]">
          Here&apos;s what&apos;s happening at your agency today.
        </p>
      </div>

      {isError ? (
        <Card padding="md">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-sm font-semibold">Failed to load dashboard summary</p>
              <p className="mt-1 text-sm text-red-600">
                {error?.response?.data?.detail || error?.message || 'Something went wrong while fetching dashboard data.'}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} value={isLoading ? '—' : stat.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Leads by Status</CardTitle>
              <Link to="/leads" className="text-xs font-medium text-[#496B5A] hover:underline">
                View all →
              </Link>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <EmptyState>Loading lead status summary…</EmptyState>
              ) : leadStatusItems.length ? (
                <div className="space-y-3">
                  {leadStatusItems.map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between gap-3 rounded-lg border border-[#DDE5E3] p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={getStatusVariant(status)} dot>
                          {formatStatusLabel(status)}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold text-[#263238]">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>No lead status data available.</EmptyState>
              )}
            </CardBody>
          </Card>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Top Properties</CardTitle>
              <Link to="/properties" className="text-xs font-medium text-[#496B5A] hover:underline">
                View all →
              </Link>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <EmptyState>Loading top properties…</EmptyState>
              ) : topProperties.length ? (
                <div className="space-y-3">
                  {topProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#DDE5E3] p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#263238]">{property.title}</p>
                        <p className="mt-1 text-xs text-[#637079]">Property ID: {property.id}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#637079] shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFA] px-2.5 py-1">
                          <Eye size={14} /> {property.view_count ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFA] px-2.5 py-1">
                          <Handshake size={14} /> {property.inquiry_count ?? 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>No property performance data available.</EmptyState>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <EmptyState>Loading lead sources…</EmptyState>
              ) : leadSourceItems.length ? (
                <div className="space-y-3">
                  {leadSourceItems.map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between rounded-lg bg-[#F8FAFA] px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef3f0] text-[#496B5A]">
                          <PhoneCall size={16} />
                        </div>
                        <span className="truncate text-sm font-medium capitalize text-[#263238]">{source}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#263238]">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>No lead source data available.</EmptyState>
              )}
            </CardBody>
          </Card>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-[#F8FAFA] px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm text-[#637079]">
                    <AlertCircle size={16} className="text-red-500" />
                    Overdue follow-ups
                  </div>
                  <span className="text-sm font-semibold text-[#263238]">{isLoading ? '—' : (followUps.overdue ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#F8FAFA] px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm text-[#637079]">
                    <CalendarCheck size={16} className="text-amber-600" />
                    Follow-ups due today
                  </div>
                  <span className="text-sm font-semibold text-[#263238]">{isLoading ? '—' : (followUps.due_today ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#F8FAFA] px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm text-[#637079]">
                    <Building2 size={16} className="text-[#6FAFA8]" />
                    Property views
                  </div>
                  <span className="text-sm font-semibold text-[#263238]">{isLoading ? '—' : (totals.property_views ?? 0)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
