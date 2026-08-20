import { useState } from 'react'
import { Building2, CalendarDays, CheckCircle2, Clock3, CreditCard, Globe2, Image, Languages, Link2, MapPin } from 'lucide-react'
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

  if (!['agency_owner', 'agency_manager', 'super_admin'].includes(role)) {
    return <AccessMessage />
  }
  if (query.isLoading) return <PageSpinner />
  if (query.isError) return <ErrorMessage />

  return <AgencySettingsForm key={query.data.id} agency={query.data} />
}

function AgencySettingsForm({ agency }) {
  const mutation = useUpdateAgency()
  const localization = useLocalization()
  const { t } = localization
  const websiteUrl = agency.website_url || `http://localhost:5173/?tenant=${encodeURIComponent(agency.slug)}`
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
    business_hours: agency.business_hours || '',
    primary_color: agency.primary_color || '#496B5A',
    facebook_url: agency.facebook_url || '',
    instagram_url: agency.instagram_url || '',
    tiktok_url: agency.tiktok_url || '',
    youtube_url: agency.youtube_url || '',
    linkedin_url: agency.linkedin_url || '',
    whatsapp_number: agency.whatsapp_number || '',
    viber_number: agency.viber_number || '',
    seo_title: agency.seo_title || '',
    seo_description: agency.seo_description || '',
    custom_domain: agency.custom_domain || '',
    website_template: agency.website_template || 'luxury-agency',
    default_language: agency.default_language || 'en',
    default_date_system: agency.default_date_system || 'ad',
    use_nepali_digits: agency.use_nepali_digits ?? false,
    timezone: agency.timezone || 'Asia/Kathmandu',
    message_templates: JSON.parse(JSON.stringify(agency.resolved_message_templates || agency.message_templates || {})),
    is_website_published: agency.is_website_published ?? true,
    logo: null,
    cover_image: null,
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
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">{t('Agency settings')}</h2>
          <p className="mt-1 text-sm text-[#637079]">Manage your public identity, contact information, and subscription.</p>
        </div>
        <div className="flex gap-2">
          <a href={websiteUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg border border-[#496B5A] px-4 text-sm font-semibold text-[#496B5A] hover:bg-[#eef3f0]">Open live website</a>
          <Button type="submit" loading={mutation.isPending}>{t('Save changes')}</Button>
        </div>
      </div>

      <SubscriptionCard agency={agency} />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SettingsCard icon={Building2} title={t('Agency profile')} description="Information shown across Nexora and your public property site.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Agency name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              <Input label="License number" value={agency.license_number} disabled />
              <div className="sm:col-span-2">
                <Textarea label="About" rows={5} value={form.about} onChange={(e) => set('about', e.target.value)} />
              </div>
              <Input label="Public email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              <Input label={t('Phone')} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              <Input label="Business hours" value={form.business_hours} onChange={(e) => set('business_hours', e.target.value)} placeholder="Sun–Fri, 9:00–18:00" />
              <Input label="Brand color" type="color" className="h-10 p-1" value={form.primary_color} onChange={(e) => set('primary_color', e.target.value)} />
            </div>
          </SettingsCard>

          <SettingsCard icon={MapPin} title={t('Location')} description="Used on public listings and contact pages.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label={t('Province')} value={form.province} onChange={(e) => set('province', e.target.value)} />
              <Input label={t('District')} value={form.district} onChange={(e) => set('district', e.target.value)} />
              <Input label={t('Municipality')} value={form.municipality} onChange={(e) => set('municipality', e.target.value)} />
              <Input label={t('Ward')} value={form.ward_number} onChange={(e) => set('ward_number', e.target.value)} />
              <Input label={t('Tole')} value={form.tole} onChange={(e) => set('tole', e.target.value)} />
              <Input label="City (legacy)" value={form.city} onChange={(e) => set('city', e.target.value)} />
              <div className="sm:col-span-3">
                <Input label={t('Address')} value={form.address} onChange={(e) => set('address', e.target.value)} />
              </div>
            </div>
          </SettingsCard>

          <SettingsCard icon={Languages} title={t('Localization')} description="Set agency defaults for language, calendar, digits, Nepal time, and reusable Nepali messages.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#263238]">{t('Default interface language')}<select value={form.default_language} onChange={(e) => set('default_language', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] px-3"><option value="en">English</option><option value="ne">नेपाली</option></select></label>
              <label className="text-sm font-medium text-[#263238]">{t('Default date system')}<select value={form.default_date_system} onChange={(e) => set('default_date_system', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] px-3"><option value="ad">AD (Gregorian)</option><option value="bs">BS (विक्रम संवत्)</option></select></label>
              <Input label="Timezone" value={form.timezone} disabled leftIcon={<CalendarDays size={15} />} />
              <label className="flex items-center gap-3 self-end rounded-lg border border-[#DDE5E3] px-3 py-2.5 text-sm"><input type="checkbox" checked={form.use_nepali_digits} onChange={(e) => set('use_nepali_digits', e.target.checked)} />Use Nepali digits (१२३)</label>
            </div>
            <div className="mt-6 border-t border-[#DDE5E3] pt-5">
              <h4 className="text-sm font-semibold text-[#263238]">{t('Message templates')}</h4>
              <p className="mt-1 text-xs text-[#637079]">Variables in braces are filled automatically. Keep them when editing a template.</p>
              <div className="mt-4 space-y-4">
                {Object.entries(form.message_templates).map(([key, template]) => (
                  <div key={key} className="rounded-xl bg-[#F8FAFA] p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#496B5A]">{key.replaceAll('_', ' ')}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label={t('Subject')} value={template.ne?.subject || ''} onChange={(e) => setMessage(key, 'subject', e.target.value)} />
                      <div className="sm:col-span-2"><Textarea label={t('Message')} rows={3} value={template.ne?.body || ''} onChange={(e) => setMessage(key, 'body', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SettingsCard>

          <SettingsCard icon={Globe2} title={t('Public website')} description="Publish and customize the SEO storefront rendered by the selected template.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#263238]">Template<select value={form.website_template} onChange={(e) => set('website_template', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] px-3"><option value="luxury-agency">Luxury agency</option></select></label>
              <div className="self-end rounded-lg border border-[#DDE5E3] px-3 py-2 text-sm text-[#637079]">Publishing is managed in <a href="/onboarding/website" className="font-semibold text-[#496B5A] hover:underline">Website Creator</a>.</div>
              <Input label="Custom domain" value={form.custom_domain} onChange={(e) => set('custom_domain', e.target.value)} placeholder="homes.example.com" />
              <Input label="SEO title" value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} maxLength={70} />
              <div className="sm:col-span-2"><Textarea label="SEO description" rows={3} value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} maxLength={180} /></div>
            </div>
          </SettingsCard>

          <SettingsCard icon={Link2} title={t('Social and messaging')} description="Give customers direct ways to reach your team.">
            <div className="grid gap-4 sm:grid-cols-2">
              {['facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url', 'linkedin_url'].map((field) => (
                <Input key={field} label={field.replace('_url', '').replace('_', ' ')} type="url" value={form[field]} onChange={(e) => set(field, e.target.value)} className="capitalize" />
              ))}
              <Input label="WhatsApp number" value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} />
              <Input label="Viber number" value={form.viber_number} onChange={(e) => set('viber_number', e.target.value)} />
            </div>
          </SettingsCard>
        </div>

        <SettingsCard icon={Image} title={t('Brand media')} description="Upload a logo and cover image for the public storefront.">
          <div className="space-y-5">
            <ImageField label="Logo" current={agency.logo} onChange={(file) => set('logo', file)} />
            <ImageField label="Cover image" current={agency.cover_image} onChange={(file) => set('cover_image', file)} />
            <div className="rounded-lg bg-[#F8FAFA] p-3 text-xs text-[#637079]">
              Public URL slug: <span className="font-semibold text-[#263238]">{agency.slug}</span>
            </div>
          </div>
        </SettingsCard>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={mutation.isPending}>{t('Save agency settings')}</Button>
      </div>
    </form>
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
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[#263238]">Agency subscription</p>
            <Badge variant={active ? 'success' : 'warning'}>{agency.payment_status}</Badge>
          </div>
          <p className="mt-1 text-sm text-[#637079]">
            {agency.subscription_expires_at
              ? `Access expires ${localization.date(agency.subscription_expires_at)}`
              : 'No expiration date is currently set.'}
          </p>
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
  return (
    <Card>
      <div className="mb-5 flex items-start gap-3 border-b border-[#DDE5E3] pb-4">
        <div className="rounded-lg bg-[#eef3f0] p-2 text-[#496B5A]"><Icon size={17} /></div>
        <div><h3 className="font-semibold text-[#263238]">{title}</h3><p className="mt-0.5 text-xs text-[#637079]">{description}</p></div>
      </div>
      {children}
    </Card>
  )
}

function ImageField({ label, current, onChange }) {
  return (
    <label className="block text-sm font-medium text-[#263238]">
      {label}
      {current && <img src={current} alt="" className="mt-2 h-28 w-full rounded-lg border border-[#DDE5E3] object-cover" />}
      <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0] || null)} className="mt-2 block w-full text-xs text-[#637079] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef3f0] file:px-3 file:py-2 file:font-semibold file:text-[#496B5A]" />
    </label>
  )
}

function AccessMessage() {
  return <Card><p className="font-semibold text-[#263238]">Agency settings are available to owners and managers.</p></Card>
}

function ErrorMessage() {
  return <Card><p className="font-semibold text-red-600">Unable to load agency settings.</p></Card>
}
