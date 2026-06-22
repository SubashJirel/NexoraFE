import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import RequireAuth from './guards/RequireAuth'
import RequireGuest from './guards/RequireGuest'
import { PageSpinner } from '@/components/ui/Spinner'

// ── Lazy pages ───────────────────────────────────────────────
// Auth
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage      = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage= lazy(() => import('@/pages/auth/ForgotPasswordPage'))

// App
const DashboardPage     = lazy(() => import('@/pages/dashboard/DashboardPage'))
const NotFoundPage      = lazy(() => import('@/pages/errors/NotFoundPage'))
const ForbiddenPage     = lazy(() => import('@/pages/errors/ForbiddenPage'))

// Wrap lazy pages in Suspense
const S = (Component) => (
  <Suspense fallback={<PageSpinner />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  // ── Root redirect ──────────────────────────────────────────
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // ── Auth routes ────────────────────────────────────────────
  {
    element: (
      <RequireGuest>
        <AuthLayout />
      </RequireGuest>
    ),
    children: [
      { path: 'login',           element: S(LoginPage) },
      { path: 'register',        element: S(RegisterPage) },
      { path: 'forgot-password', element: S(ForgotPasswordPage) },
    ],
  },

  // ── App routes (authenticated) ─────────────────────────────
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'dashboard',
        element: S(DashboardPage),
        handle: { title: 'Dashboard' },
      },
      // ── Leads (Sprint 2) ────────────────────────────────────
      {
        path: 'leads',
        handle: { title: 'Leads' },
        lazy: () => import('@/pages/leads/LeadsPage').then((m) => ({ Component: m.default })),
      },
      // ── Properties ─────────────────────────────────────────
      {
        path: 'properties',
        handle: { title: 'Properties' },
        lazy: () => import('@/pages/properties/PropertiesPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'properties/:id',
        handle: { title: 'Property Details' },
        lazy: () => import('@/pages/properties/PropertyDetailsPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'properties/add',
        handle: { title: 'Add Property' },
        lazy: () => import('@/pages/properties/add/AddPropertyPage').then((m) => ({ Component: m.default })),
      },
      // ── Contacts ───────────────────────────────────────────
      {
        path: 'contacts',
        handle: { title: 'Contacts' },
        lazy: () => import('@/pages/contacts/ContactsPage').then((m) => ({ Component: m.default })),
      },
      // ── Site Visits ────────────────────────────────────────
      {
        path: 'site-visits',
        handle: { title: 'Site Visits' },
        lazy: () => import('@/pages/site-visits/SiteVisitsPage').then((m) => ({ Component: m.default })),
      },
      // ── Deals ──────────────────────────────────────────────
      {
        path: 'deals',
        handle: { title: 'Deals' },
        lazy: () => import('@/pages/deals/DealsPage').then((m) => ({ Component: m.default })),
      },
      // ── Analytics ──────────────────────────────────────────
      {
        path: 'analytics',
        handle: { title: 'Analytics' },
        lazy: () => import('@/pages/analytics/AnalyticsPage').then((m) => ({ Component: m.default })),
      },
      // ── Agencies ───────────────────────────────────────────
      {
        path: 'agencies',
        handle: { title: 'Agencies' },
        lazy: () => import('@/pages/agencies/AgenciesPage').then((m) => ({ Component: m.default })),
      },
      // ── Settings ───────────────────────────────────────────
      {
        path: 'settings',
        handle: { title: 'Settings' },
        lazy: () => import('@/pages/settings/SettingsPage').then((m) => ({ Component: m.default })),
      },
    ],
  },

  // ── Error pages ────────────────────────────────────────────
  { path: '403', element: S(ForbiddenPage) },
  { path: '*',   element: S(NotFoundPage) },
])
