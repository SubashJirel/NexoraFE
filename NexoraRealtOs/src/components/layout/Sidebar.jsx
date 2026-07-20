import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, Home, PhoneCall,
  CalendarCheck, BarChart3, Handshake, Settings,
  ChevronLeft, ChevronRight, LogOut, Bell, UserCheck, Share2,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import Avatar from '@/components/ui/Avatar'

const NAV_ITEMS = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard',    to: '/dashboard',    icon: LayoutDashboard },
    ],
  },
  {
    group: 'CRM',
    items: [
      { label: 'Leads',        to: '/leads',        icon: PhoneCall },
      { label: 'Contacts',     to: '/contacts',     icon: Users },
      { label: 'Agents',       to: '/agents',       icon: UserCheck },
      { label: 'Site Visits',  to: '/site-visits',  icon: CalendarCheck },
      { label: 'Deals',        to: '/deals',        icon: Handshake },
    ],
  },
  {
    group: 'Listings',
    items: [
      { label: 'Properties',   to: '/properties',   icon: Home },
      { label: 'Agencies',     to: '/agencies',     icon: Building2 },
    ],
  },
  {
    group: 'Reports',
    items: [
      { label: 'Analytics',    to: '/analytics',    icon: BarChart3 },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { label: 'Social Media', to: '/social-media', icon: Share2 },
    ],
  },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()
  const { user, clearAuth } = useAuthStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-[200] flex h-screen flex-col',
        'bg-[#263238] text-white',
        'transition-[width] duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          'flex h-[60px] shrink-0 items-center border-b border-white/10',
          sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-5'
        )}
      >
        <div className="h-8 w-8 shrink-0 rounded-lg bg-[#496B5A] flex items-center justify-center text-white font-bold text-sm">
          N
        </div>
        {!sidebarCollapsed && (
          <span className="text-base font-bold tracking-tight">Nexora</span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 no-scrollbar">
        {NAV_ITEMS.map((section) => (
          <div key={section.group} className="mb-4">
            {!sidebarCollapsed && (
              <p className="mb-1 px-5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {section.group}
              </p>
            )}
            {section.items.map((item) => (
              <NavItem key={item.to} item={item} collapsed={sidebarCollapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="shrink-0 border-t border-white/10 p-3 space-y-1">
        <NavItemButton
          icon={Settings}
          label="Settings"
          to="/settings"
          collapsed={sidebarCollapsed}
        />
        <button
          onClick={clearAuth}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2',
            'text-white/60 hover:bg-white/10 hover:text-white',
            'transition-colors duration-150 text-sm',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>

        {/* User pill */}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 mt-2">
            <Avatar alt={user?.name || 'User'} size="sm" src={user?.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{user?.name || 'User'}</p>
              <p className="truncate text-[10px] text-white/40">{user?.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={toggleSidebarCollapse}
        className={cn(
          'absolute -right-3 top-[72px] z-10',
          'flex h-6 w-6 items-center justify-center rounded-full',
          'bg-[#496B5A] text-white shadow-md',
          'hover:bg-[#3a5649] transition-colors duration-150'
        )}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft size={12} />
        }
      </button>
    </aside>
  )
}

function NavItem({ item, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg mx-2 px-3 py-2',
          'text-sm transition-colors duration-150',
          collapsed && 'justify-center mx-2 px-0',
          isActive
            ? 'bg-[#496B5A] text-white font-semibold'
            : 'text-white/60 hover:bg-white/10 hover:text-white'
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

function NavItemButton({ icon: Icon, label, to, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2',
          'text-sm transition-colors duration-150',
          collapsed && 'justify-center',
          isActive
            ? 'bg-[#496B5A] text-white font-semibold'
            : 'text-white/60 hover:bg-white/10 hover:text-white'
        )
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}
