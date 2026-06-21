import { TrendingUp, Users, Home, Handshake, PhoneCall, CalendarCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const STATS = [
  { label: 'Total Leads',      value: '128',  change: '+12%', trend: 'up',   icon: PhoneCall,     color: 'text-[#496B5A]', bg: 'bg-[#eef3f0]' },
  { label: 'Active Listings',  value: '34',   change: '+4%',  trend: 'up',   icon: Home,           color: 'text-[#6FAFA8]', bg: 'bg-[#f0f8f8]' },
  { label: 'Site Visits',      value: '56',   change: '-2%',  trend: 'down', icon: CalendarCheck,  color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Closed Deals',     value: '9',    change: '+33%', trend: 'up',   icon: Handshake,      color: 'text-[#496B5A]', bg: 'bg-[#eef3f0]' },
  { label: 'Active Agents',    value: '12',   change: '0%',   trend: 'flat', icon: Users,          color: 'text-[#8FAF9B]', bg: 'bg-[#f4f8f5]' },
  { label: 'Revenue MTD',      value: '₹4.2L',change: '+18%', trend: 'up',   icon: TrendingUp,     color: 'text-blue-600',  bg: 'bg-blue-50' },
]

const RECENT_LEADS = [
  { name: 'Aarav Mehta',    source: 'Website',   status: 'new',        time: '2m ago',   budget: '₹80L' },
  { name: 'Priya Sharma',   source: 'Facebook',  status: 'contacted',  time: '1h ago',   budget: '₹1.2Cr' },
  { name: 'Rohan Kapoor',   source: 'Referral',  status: 'site_visit', time: '3h ago',   budget: '₹60L' },
  { name: 'Sneha Iyer',     source: 'Instagram', status: 'negotiation',time: '1d ago',   budget: '₹2Cr' },
  { name: 'Vikram Singh',   source: 'Walk-in',   status: 'new',        time: '2d ago',   budget: '₹45L' },
]

const STATUS_BADGE = {
  new:         { variant: 'info',    label: 'New' },
  contacted:   { variant: 'warning', label: 'Contacted' },
  site_visit:  { variant: 'default', label: 'Site Visit' },
  negotiation: { variant: 'success', label: 'Negotiation' },
  closed:      { variant: 'primary', label: 'Closed' },
  lost:        { variant: 'error',   label: 'Lost' },
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#263238]">
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h2>
        <p className="mt-1 text-sm text-[#637079]">
          Here's what's happening at your agency today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} padding="md" hoverable>
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <Icon size={18} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-[#263238]">{stat.value}</p>
              <p className="mt-0.5 text-xs text-[#637079]">{stat.label}</p>
              <p className={`mt-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-600' :
                stat.trend === 'down' ? 'text-red-500' : 'text-[#8b969d]'
              }`}>
                {stat.change} vs last month
              </p>
            </Card>
          )
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <a href="/leads" className="text-xs font-medium text-[#496B5A] hover:underline">
                View all →
              </a>
            </CardHeader>
            <CardBody>
              <div className="space-y-1">
                {RECENT_LEADS.map((lead) => {
                  const badge = STATUS_BADGE[lead.status]
                  return (
                    <div
                      key={lead.name}
                      className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-[#F8FAFA] transition-colors cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-full bg-[#d5e3da] flex items-center justify-center text-[#496B5A] font-semibold text-xs shrink-0">
                        {lead.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#263238] truncate">{lead.name}</p>
                        <p className="text-xs text-[#637079]">{lead.source} · {lead.budget}</p>
                      </div>
                      <Badge variant={badge.variant} dot>{badge.label}</Badge>
                      <p className="text-xs text-[#8b969d] shrink-0">{lead.time}</p>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Add Lead',     icon: PhoneCall,    color: 'bg-[#eef3f0] text-[#496B5A]' },
                  { label: 'New Property', icon: Home,         color: 'bg-[#f0f8f8] text-[#6FAFA8]' },
                  { label: 'Schedule Visit',icon: CalendarCheck,color: 'bg-amber-50 text-amber-600' },
                  { label: 'Create Deal',  icon: Handshake,    color: 'bg-[#eef3f0] text-[#496B5A]' },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.label}
                      className="flex flex-col items-center gap-2 rounded-xl p-4 border border-[#DDE5E3] hover:border-[#496B5A] hover:shadow-sm transition-all text-center"
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color}`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-xs font-medium text-[#263238]">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
