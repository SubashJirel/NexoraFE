/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import PublicAgencyLayout from '@/components/public/PublicAgencyLayout'
import RequireAuth from './guards/RequireAuth'
import RequireGuest from './guards/RequireGuest'
import { PageSpinner } from '@/components/ui/Spinner'

// ── Lazy pages ───────────────────────────────────────────────
// Auth
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage      = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage= lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const VerifyLoginOTPPage= lazy(() => import('@/pages/auth/VerifyLoginOTPPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const PaymentRequiredPage = lazy(() => import('@/pages/auth/PaymentRequiredPage'))

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

  {
    path: 'agency/:slug',
    element: <PublicAgencyLayout />,
    children: [
      {
        index: true,
        lazy: () => import('@/pages/public/PublicAgencyPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'properties/:propertyId',
        lazy: () => import('@/pages/public/PublicPropertyPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'listings/:shareSlug',
        lazy: () => import('@/pages/public/PublicPropertyPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'agents/:agentId',
        lazy: () => import('@/pages/public/PublicAgentPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'map',
        lazy: () => import('@/pages/public/PublicMapPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'portal',
        lazy: () => import('@/pages/public/CustomerPortalPage').then((m) => ({ Component: m.default })),
      },
    ],
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
      { path: 'verify-login-otp', element: S(VerifyLoginOTPPage) },
      { path: 'reset-password', element: S(ResetPasswordPage) },
      { path: 'payment-required', element: S(PaymentRequiredPage) },
      { path: 'accept-invitation', lazy: () => import('@/pages/auth/AcceptInvitationPage').then((m) => ({ Component: m.default })) },
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
      {
        path: 'inbox',
        handle: { title: 'Inbox' },
        lazy: () => import('@/pages/inbox/InboxPage').then((m) => ({ Component: m.default })),
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
        path: 'properties/:id/edit',
        handle: { title: 'Edit Property' },
        lazy: () => import('@/pages/properties/EditPropertyPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'properties/add',
        handle: { title: 'Add Property' },
        lazy: () => import('@/pages/properties/add/AddPropertyPage').then((m) => ({ Component: m.default })),
      },
      // ── Agents ─────────────────────────────────────────────
      {
        path: 'agents',
        handle: { title: 'Agents' },
        lazy: () => import('@/pages/agents/AgentsPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'my-profile',
        handle: { title: 'My Profile' },
        lazy: () => import('@/pages/agents/AgentProfilePage').then((m) => ({ Component: m.default })),
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
      { path: 'offers', handle: { title: 'Offers' }, lazy: () => import('@/pages/offers/OffersPage').then((m) => ({ Component: m.default })) },
      { path: 'owners', handle: { title: 'Owners' }, lazy: () => import('@/pages/owners/OwnersPage').then((m) => ({ Component: m.default })) },
      { path: 'leases', handle: { title: 'Leases' }, lazy: () => import('@/pages/leases/LeasesPage').then((m) => ({ Component: m.default })) },
      { path: 'documents', handle: { title: 'Documents' }, lazy: () => import('@/pages/documents/DocumentsPage').then((m) => ({ Component: m.default })) },
      { path: 'tasks', handle: { title: 'Tasks' }, lazy: () => import('@/pages/tasks/TasksPage').then((m) => ({ Component: m.default })) },
      { path: 'calendar', handle: { title: 'Calendar' }, lazy: () => import('@/pages/calendar/CalendarPage').then((m) => ({ Component: m.default })) },
      { path: 'appointments', handle: { title: 'Appointments' }, lazy: () => import('@/pages/appointments/AppointmentsPage').then((m) => ({ Component: m.default })) },
      { path: 'availability', handle: { title: 'Availability' }, lazy: () => import('@/pages/appointments/AvailabilityPage').then((m) => ({ Component: m.default })) },
      { path: 'matching', handle: { title: 'Smart Matching' }, lazy: () => import('@/pages/matching/MatchingPage').then((m) => ({ Component: m.default })) },
      { path: 'compare', handle: { title: 'Compare Properties' }, lazy: () => import('@/pages/compare/ComparePage').then((m) => ({ Component: m.default })) },
      { path: 'notifications', handle: { title: 'Notifications' }, lazy: () => import('@/pages/notifications/NotificationsPage').then((m) => ({ Component: m.default })) },
      { path: 'team', handle: { title: 'Team & Invitations' }, lazy: () => import('@/pages/team/TeamPage').then((m) => ({ Component: m.default })) },
      { path: 'customization', handle: { title: 'Customization' }, lazy: () => import('@/pages/customization/CustomizationPage').then((m) => ({ Component: m.default })) },
      { path: 'audit-log', handle: { title: 'Audit Log' }, lazy: () => import('@/pages/audit/AuditLogPage').then((m) => ({ Component: m.default })) },
      { path: 'billing', handle: { title: 'Billing' }, lazy: () => import('@/pages/billing/BillingPage').then((m) => ({ Component: m.default })) },
      { path: 'platform-admin', handle: { title: 'Platform Admin' }, lazy: () => import('@/pages/admin/AdminPage').then((m) => ({ Component: m.default })) },
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
        element: <Navigate to="/settings" replace />,
      },
      // ── Social Media ────────────────────────────────────────
      {
        path: 'social-media',
        handle: { title: 'Social Media' },
        lazy: () => import('@/pages/social-media/SocialMediaPage').then((m) => ({ Component: m.default })),
      },
      { path: 'website-content', handle: { title: 'Website Content' }, lazy: () => import('@/pages/website/WebsiteContentPage').then((m) => ({ Component: m.default })) },
      { path: 'onboarding/website', handle: { title: 'Website Creator' }, lazy: () => import('@/pages/website/WebsiteOnboardingPage').then((m) => ({ Component: m.default })) },
      { path: 'website-submissions', handle: { title: 'Website Submissions' }, lazy: () => import('@/pages/website/WebsiteSubmissionsPage').then((m) => ({ Component: m.default })) },
      { path: 'agent-reviews', handle: { title: 'Agent Reviews' }, lazy: () => import('@/pages/website/AgentReviewsPage').then((m) => ({ Component: m.default })) },
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
