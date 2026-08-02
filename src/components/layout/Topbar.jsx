import { Search, Bell, Menu } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/cn'
import Avatar from '@/components/ui/Avatar'

export default function Topbar({ title }) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-[100] flex h-[60px] items-center gap-4',
        'border-b border-[#DDE5E3] bg-white/90 backdrop-blur-sm px-5',
        'transition-[left] duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-8 w-8 rounded-lg text-[#637079] hover:bg-[#EEF2F2] transition-colors lg:hidden"
        aria-label="Toggle navigation"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      {title && (
        <h1 className="text-base font-semibold text-[#263238] hidden sm:block">{title}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={15} className="absolute left-3 text-[#8b969d] pointer-events-none" />
        <input
          type="search"
          placeholder="Search..."
          className={cn(
            'h-9 w-56 lg:w-72 rounded-lg border border-[#DDE5E3]',
            'bg-[#F8FAFA] pl-9 pr-3 text-sm text-[#263238]',
            'placeholder:text-[#8b969d]',
            'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
            'transition-all duration-150'
          )}
        />
      </div>

      {/* Notifications */}
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#637079] hover:bg-[#EEF2F2] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {/* Unread dot */}
        <span
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-white"
          aria-hidden="true"
        />
      </button>

      {/* User avatar */}
      <button
        className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-[#EEF2F2] transition-colors"
        aria-label="Open user menu"
      >
        <Avatar alt={user?.name || 'User'} src={user?.avatarUrl} size="sm" status="online" />
        <span className="hidden sm:block text-sm font-medium text-[#263238] max-w-[120px] truncate">
          {user?.name || 'User'}
        </span>
      </button>
    </header>
  )
}
