import { Outlet, useMatches } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/cn'

/**
 * AppLayout — the main shell for all authenticated pages.
 * Sidebar + Topbar + scrollable content area.
 *
 * Route handles (route.handle.title) are used for the page title in Topbar.
 */
export default function AppLayout() {
  const { sidebarCollapsed } = useUIStore()
  const matches = useMatches()

  // Pick the deepest matching route with a handle.title
  const pageTitle = [...matches]
    .reverse()
    .find((m) => m.handle?.title)?.handle?.title

  return (
    <div className="min-h-screen bg-[#F8FAFA]">
      <Sidebar />

      <Topbar title={pageTitle} />

      <main
        className={cn(
          'min-h-screen pt-[60px] transition-[padding-left] duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-60'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: { primary: '#496B5A', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  )
}
