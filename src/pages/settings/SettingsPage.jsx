import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarDays, CheckCircle2, Clock3, CreditCard, Globe2, Languages, MapPin } from 'lucide-react'
import { useCurrentAgency, useUpdateAgency } from '@/hooks/useAgency'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { useLocalization } from '@/context/useLocalization'

export default function SettingsPage() {
  const role = useAuthStore((state) => state.user?.role)
  const query = useCurrentAgency()

  if (!['agency_owner', 'agency_manager', 'super_admin'].includes(role)) return <AccessMessage />
  if (query.isLoading) return <PageSpinner />
  if (query.isError) return <ErrorMessage />
  return <OrganizationSettingsForm key={query.data.id} agency={query.data} />
}

function OrganizationSettingsForm({ agency }) {
  const mutation = useUpdateAgency()
  const localization = useLocalization()
  const { t } = localization
  const [form, setForm] = useState(() => ({
    name: agency.name || '',
    about: agency.about || '',
    email: agency.email || '',
    phone: agency.phone || '',
    address: agency.address || '',
    province: agency.province || '',
    district: agency.district || '',
    city: agency.city || '',
    municipality: agency.municipality || '',
    ward_number: agency.ward_number || '',
    tole: agency.tole || '',
    default_language: agency.default_language || 'en',
    default_date_system: agency.default_date_system || 'ad',
    use_nepali_digits: agency.use_nepali_digits ?? false,
    timezone: agency.timezone || 'Asia/Kathmandu',
    message_templates: JSON.parse(JSON.stringify(agency.resolved_message_templates || agency.message_templates || {})),
  }))

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function setMessage(template, field, value) {
    setForm((current) => ({
      ...current,
      message_templates: {
        ...current.message_templates,
        [template]: {
          ...current.message_templates[template],
          ne: { ...current.message_templates[template]?.ne, [field]: value },
        },
      },
    }))
  }

  function submit(event) {
    event.preventDefault()
    mutation.mutate(form)
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">{t('Organization settings')}</h2>
          <p className="mt-1 text-sm text-[#637079]">Manage the agency workspace, internal defaults, localization, and reusable messages.</p>
        </div>
        <Button type="submit" loading={mutation.isPending}>{t('Save organization settings')}</Button>
      </div>

      <WebsiteStudioSummary agency={agency} />
      <SubscriptionCard agency={agency} />

      <SettingsCard icon={Building2} title={t('Organization profile')} description="The canonical agency identity used throughout the CRM. Website presentation is managed separately in Website Studio.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Organization name" value={form.name} onChange={(event) => set('name', event.target.value)} required />
          <Input label="License number" value={agency.license_number} disabled />
          <div className="sm:col-span-2">
            <Textarea label="Organization description" rows={4} value={form.about} onChange={(event) => set('about', event.target.value)} hint="Internal/default profile text. Copy it to the website draft explicitly from Website Studio." />
          </div>
          <Input label="Default agency email" type="email" value={form.email} onChange={(event) => set('email', event.target.value)} hint="Used as an organization default, not as an automatic website update." />
          <Input label="Default agency phone" value={form.phone} onChange={(event) => set('phone', event.target.value)} hint="Used as an organization default, not as an automatic website update." />
        </div>
      </SettingsCard>

      <SettingsCard icon={MapPin} title={t('Office location')} description="Structured location data used by the CRM and available as defaults for website content.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label={t('Province')} value={form.province} onChange={(event) => set('province', event.target.value)} />
          <Input label={t('District')} value={form.district} onChange={(event) => set('district', event.target.value)} />
          <Input label={t('Municipality')} value={form.municipality} onChange={(event) => set('municipality', event.target.value)} />
          <Input label={t('Ward')} value={form.ward_number} onChange={(event) => set('ward_number', event.target.value)} />
          <Input label={t('Tole')} value={form.tole} onChange={(event) => set('tole', event.target.value)} />
          <Input label="City (legacy)" value={form.city} onChange={(event) => set('city', event.target.value)} />
          <div className="sm:col-span-3">
            <Input label="Office address" value={form.address} onChange={(event) => set('address', event.target.value)} />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard icon={Languages} title={t('Workspace localization')} description="Set CRM defaults for language, calendar, digits, Nepal time, and reusable Nepali messages.">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#263238]">{t('Default interface language')}<select value={form.default_language} onChange={(event) => set('default_language', event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] px-3"><option value="en">English</option><option value="ne">नेपाली</option></select></label>
          <label className="text-sm font-medium text-[#263238]">{t('Default date system')}<select value={form.default_date_system} onChange={(event) => set('default_date_system', event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] px-3"><option value="ad">AD (Gregorian)</option><option value="bs">BS (विक्रम संवत्)</option></select></label>
          <Input label="Timezone" value={form.timezone} disabled leftIcon={<CalendarDays size={15} />} />
          <label className="flex items-center gap-3 self-end rounded-lg border border-[#DDE5E3] px-3 py-2.5 text-sm"><input type="checkbox" checked={form.use_nepali_digits} onChange={(event) => set('use_nepali_digits', event.target.checked)} />Use Nepali digits (१२३)</label>
        </div>
        <div className="mt-6 border-t border-[#DDE5E3] pt-5">
          <h4 className="text-sm font-semibold text-[#263238]">{t('Message templates')}</h4>
          <p className="mt-1 text-xs text-[#637079]">Variables in braces are filled automatically. Keep them when editing a template.</p>
          <div className="mt-4 space-y-4">
            {Object.entries(form.message_templates).map(([key, template]) => (
              <div key={key} className="rounded-xl bg-[#F8FAFA] p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#496B5A]">{key.replaceAll('_', ' ')}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label={t('Subject')} value={template.ne?.subject || ''} onChange={(event) => setMessage(key, 'subject', event.target.value)} />
                  <div className="sm:col-span-2"><Textarea label={t('Message')} rows={3} value={template.ne?.body || ''} onChange={(event) => setMessage(key, 'body', event.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={mutation.isPending}>{t('Save organization settings')}</Button>
      </div>
    </form>
  )
}

function WebsiteStudioSummary({ agency }) {
  const published = Boolean(agency.is_website_published)
  return (
    <Card className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#eef3f0] p-3 text-[#496B5A]"><Globe2 size={20} /></div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#263238]">Website Studio</p>
            <Badge variant={published ? 'success' : 'neutral'}>{published ? 'Live' : 'Private draft'}</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-[#637079]">Public branding, contact details, pages, services, social links, SEO, domains and publishing are managed in one place.</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8b969d]">
            <span>{agency.website_completion_percentage || 0}% complete</span>
            <span>Version {agency.website_config_version || 0}</span>
            {agency.website_draft_updated_at && <span>Draft updated {new Date(agency.website_draft_updated_at).toLocaleString()}</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {published && agency.website_url && <a href={agency.website_url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg border border-[#496B5A] px-4 text-sm font-semibold text-[#496B5A] hover:bg-[#eef3f0]">Open live website</a>}
        <Link to="/onboarding/website" className="inline-flex h-9 items-center justify-center rounded-lg bg-[#496B5A] px-4 text-sm font-semibold text-white hover:bg-[#3a5649]">Manage Website</Link>
      </div>
    </Card>
  )
}

function SubscriptionCard({ agency }) {
  const localization = useLocalization()
  const active = agency.payment_status === 'paid' && agency.is_active
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#eef3f0] p-3 text-[#496B5A]"><CreditCard size={20} /></div>
        <div>
          <div className="flex items-center gap-2"><p className="font-semibold text-[#263238]">Agency subscription</p><Badge variant={active ? 'success' : 'warning'}>{agency.payment_status}</Badge></div>
          <p className="mt-1 text-sm text-[#637079]">{agency.subscription_expires_at ? `Access expires ${localization.date(agency.subscription_expires_at)}` : 'No expiration date is currently set.'}</p>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-[#637079]">
        <span className="flex items-center gap-1"><CheckCircle2 size={14} />{agency.is_active ? 'Active' : 'Inactive'}</span>
        {agency.paid_at && <span className="flex items-center gap-1"><Clock3 size={14} />Paid {localization.date(agency.paid_at)}</span>}
      </div>
    </Card>
  )
}

function SettingsCard({ icon: Icon, title, description, children }) {
  return <Card><div className="mb-5 flex items-start gap-3 border-b border-[#DDE5E3] pb-4"><div className="rounded-lg bg-[#eef3f0] p-2 text-[#496B5A]"><Icon size={17} /></div><div><h3 className="font-semibold text-[#263238]">{title}</h3><p className="mt-0.5 text-xs text-[#637079]">{description}</p></div></div>{children}</Card>
}

function AccessMessage() {
  return <Card><p className="font-semibold text-[#263238]">Organization settings are available to owners and managers.</p></Card>
}

function ErrorMessage() {
  return <Card><p className="font-semibold text-red-600">Unable to load organization settings.</p></Card>
}
