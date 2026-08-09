import { NavLink } from 'react-router-dom'
import {
  CalendarCheck,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ListChecks,
  MapPinned,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  UsersRound,
  WalletCards,
  PhoneCall,
  Settings,
  Share2,
  UserCircle,
  UserCheck,
  Globe2,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import Avatar from '@/components/ui/Avatar'
import { useLocalization } from '@/context/useLocalization'

const NAV_ITEMS = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'CRM',
    items: [
      { label: 'Leads', to: '/leads', icon: PhoneCall },
      { label: 'Inbox', to: '/inbox', icon: MessageCircle },
      { label: 'Contacts', to: '/contacts', icon: UsersRound },
      {
        label: 'Agents',
        to: '/agents',
        icon: UserCheck,
        roles: ['agency_owner', 'agency_manager', 'super_admin'],
      },
      { label: 'Site Visits', to: '/site-visits', icon: CalendarCheck },
      { label: 'Deals', to: '/deals', icon: Handshake },
      { label: 'Offers', to: '/offers', icon: BriefcaseBusiness },
      { label: 'Owners', to: '/owners', icon: UserCircle },
      { label: 'Leases', to: '/leases', icon: WalletCards },
      { label: 'Tasks', to: '/tasks', icon: ListChecks },
      { label: 'Calendar', to: '/calendar', icon: CalendarCheck },
      { label: 'Appointments', to: '/appointments', icon: CalendarCheck },
    ],
  },
  {
    group: 'Listings',
    items: [
      { label: 'Properties', to: '/properties', icon: Home },
      { label: 'Smart Matching', to: '/matching', icon: Sparkles },
      { label: 'Compare', to: '/compare', icon: MapPinned },
      { label: 'Documents', to: '/documents', icon: FileText },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { label: 'Social Media', to: '/social-media', icon: Share2 },
      { label: 'Website Content', to: '/website-content', icon: Globe2, roles: ['agency_owner', 'agency_manager', 'super_admin'] },
      { label: 'Web Submissions', to: '/website-submissions', icon: MessageCircle },
      { label: 'Agent Reviews', to: '/agent-reviews', icon: Star, roles: ['agency_owner', 'agency_manager', 'super_admin'] },
    ],
  },
  {
    group: 'Reports',
    items: [{ label: 'Analytics', to: '/analytics', icon: BarChart3 }],
  },
  {
    group: 'Account',
    items: [
      { label: 'My Profile', to: '/my-profile', icon: UserCircle, roles: ['agent'] },
      { label: 'Notifications', to: '/notifications', icon: Bell },
      { label: 'Team & Invites', to: '/team', icon: UserPlus, roles: ['agency_owner', 'agency_manager', 'super_admin'] },
      { label: 'Availability', to: '/availability', icon: CalendarCheck },
      { label: 'Customization', to: '/customization', icon: SlidersHorizontal, roles: ['agency_owner', 'agency_manager', 'super_admin'] },
      { label: 'Audit Log', to: '/audit-log', icon: FileText, roles: ['agency_owner', 'agency_manager', 'super_admin'] },
      { label: 'Billing', to: '/billing', icon: WalletCards, roles: ['agency_owner', 'super_admin'] },
      { label: 'Platform Admin', to: '/platform-admin', icon: Settings, roles: ['super_admin'] },
      { label: 'Settings', to: '/settings', icon: Settings, roles: ['agency_owner', 'agency_manager', 'super_admin'] },
    ],
  },
]

export default function Sidebar() {
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    toggleSidebarCollapse,
  } = useUIStore()
  const { user, clearAuth } = useAuthStore()
  const { t } = useLocalization()

  const closeMobileSidebar = () => setSidebarOpen(false)
  const sections = NAV_ITEMS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || item.roles.includes(user?.role)
    ),
  })).filter((section) => section.items.length > 0)

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-[190] bg-black/40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-[200] flex h-screen w-60 flex-col bg-[#263238] text-white',
          'transition-[transform,width] duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-60'
        )}
      >
        <div
          className={cn(
            'flex h-[60px] shrink-0 items-center border-b border-white/10',
            sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-5'
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#496B5A] text-sm font-bold">
            N
          </div>
          <span className={cn('text-base font-bold tracking-tight', sidebarCollapsed && 'lg:hidden')}>
            Nexora
          </span>
        </div>

        <nav className="hover-scrollbar-dark flex-1 overflow-y-auto overflow-x-hidden py-4">
          {sections.map((section) => (
            <div key={section.group} className="mb-4">
              <p className={cn(
                'mb-1 px-5 text-[10px] font-semibold uppercase tracking-widest text-white/40',
                sidebarCollapsed && 'lg:hidden'
              )}>
                {t(section.group)}
              </p>
              {section.items.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  label={t(item.label)}
                  collapsed={sidebarCollapsed}
                  onNavigate={closeMobileSidebar}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => {
              clearAuth()
              closeMobileSidebar()
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white',
              sidebarCollapsed && 'lg:justify-center'
            )}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={cn(sidebarCollapsed && 'lg:hidden')}>{t('Logout')}</span>
          </button>

          <div className={cn(
            'mt-2 flex items-center gap-3 rounded-lg px-3 py-2',
            sidebarCollapsed && 'lg:hidden'
          )}>
            <Avatar alt={user?.name || 'User'} size="sm" src={user?.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{user?.name || 'User'}</p>
              <p className="truncate text-[10px] text-white/40">{user?.role}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSidebarCollapse}
          className="absolute -right-3 top-[72px] z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-[#496B5A] text-white shadow-md transition-colors hover:bg-[#3a5649] lg:flex"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  )
}

function NavItem({ item, label, collapsed, onNavigate }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => cn(
        'mx-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
        collapsed && 'lg:justify-center lg:px-0',
        isActive
          ? 'bg-[#496B5A] font-semibold text-white'
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      <span className={cn(collapsed && 'lg:hidden')}>{label}</span>
    </NavLink>
  )
}
