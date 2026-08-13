import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, ExternalLink, Globe2, Image, Plus, Rocket, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { PageSpinner } from '@/components/ui/Spinner'
import { getWebsiteOnboarding, publishWebsite, unpublishWebsite, updateWebsiteOnboarding } from '@/services/agencyService'
import { useAuthStore } from '@/store/authStore'

const STEPS = [
  { title: 'Agency identity', description: 'The essential details visitors need to trust and contact your agency.' },
  { title: 'Branding', description: 'Upload your brand media and select the colours used by your website.' },
  { title: 'Homepage', description: 'Write the first message visitors see when they open your website.' },
  { title: 'Company content', description: 'Explain your agency, mission, story, and services.' },
  { title: 'Trust content', description: 'Add statistics, testimonials, and frequently asked questions.' },
  { title: 'Social channels', description: 'Connect the public channels visitors can use to reach you.' },
  { title: 'Search visibility', description: 'Describe the website for Google and social sharing.' },
  { title: 'Review & publish', description: 'Review completeness, preview the generated URL, and publish.' },
]

const EMPTY_CONFIG = {
  hero_eyebrow: '', hero_title: '', hero_subtitle: '', mission: '', story: '', tagline: '',
  secondary_color: '#8FAF9B', accent_color: '#C8A96A', services: [], statistics: [], testimonials: [], faqs: [],
}

const PUBLISHING_FIELDS = {
  agency_name: { label: 'Agency name', step: 1 },
  public_email: { label: 'Public email', step: 1 },
  phone: { label: 'Public phone', step: 1 },
  about: { label: 'Agency description', step: 1, requirement: 'Minimum 40 characters' },
  location: { label: 'Address or service area', step: 1 },
  logo: { label: 'Agency logo', step: 2 },
  cover_image: { label: 'Homepage cover image', step: 2 },
  hero_title: { label: 'Homepage headline', step: 3, requirement: 'Minimum 8 characters' },
  hero_subtitle: { label: 'Homepage introduction', step: 3, requirement: 'Minimum 20 characters' },
  seo_title: { label: 'SEO title', step: 7, requirement: 'Minimum 8 characters' },
  seo_description: { label: 'SEO description', step: 7, requirement: 'Minimum 40 characters' },
}

export default function WebsiteOnboardingPage() {
  const query = useQuery({ queryKey: ['website-onboarding'], queryFn: getWebsiteOnboarding })
  if (query.isLoading) return <PageSpinner />
  if (query.isError) return <Card><p className="font-semibold text-red-600">Unable to load website onboarding.</p></Card>
  return <WebsiteWizard key={query.data.id} initial={query.data} />
}

function WebsiteWizard({ initial }) {
  const queryClient = useQueryClient()
  const updateAuthAgency = useAuthStore((state) => state.updateAgency)
  const [step, setStep] = useState(Math.min(Math.max(initial.website_onboarding_step || 1, 1), STEPS.length))
  const [form, setForm] = useState(() => ({ ...initial, website_draft_config: { ...EMPTY_CONFIG, ...(initial.website_draft_config || {}) }, logo: null, cover_image: null }))
  const [serverState, setServerState] = useState(initial)

  const saveMutation = useMutation({
    mutationFn: updateWebsiteOnboarding,
    onSuccess: (data) => {
      setServerState(data)
      setForm((current) => ({ ...current, ...data, website_draft_config: { ...EMPTY_CONFIG, ...data.website_draft_config }, logo: null, cover_image: null }))
      queryClient.setQueryData(['website-onboarding'], data)
      toast.success('Website draft saved.')
    },
    onError: (error) => toast.error(apiError(error, 'Unable to save this step.')),
  })
  const publishMutation = useMutation({
    mutationFn: publishWebsite,
    onSuccess: (data) => {
      setServerState(data)
      setForm((current) => ({ ...current, ...data, website_draft_config: { ...EMPTY_CONFIG, ...data.website_draft_config }, logo: null, cover_image: null }))
      queryClient.setQueryData(['website-onboarding'], data)
      updateAuthAgency({ website_onboarding_status: data.website_onboarding_status, is_website_published: true })
      toast.success('Your agency website is live.')
    },
    onError: (error) => toast.error(apiError(error, 'The website could not be published.')),
  })
  const unpublishMutation = useMutation({
    mutationFn: unpublishWebsite,
    onSuccess: (data) => {
      setServerState(data)
      setForm((current) => ({ ...current, ...data, website_draft_config: { ...EMPTY_CONFIG, ...data.website_draft_config }, logo: null, cover_image: null }))
      queryClient.setQueryData(['website-onboarding'], data)
      updateAuthAgency({ is_website_published: false })
      toast.success('Your agency website is now private.')
    },
    onError: (error) => toast.error(apiError(error, 'The website could not be unpublished.')),
  })

  const completion = serverState.completion_percentage ?? 0
  const previewUrl = serverState.preview_url
  const current = STEPS[step - 1]
  const missingFields = new Set(serverState.missing_fields || [])
  const savePayload = useMemo(() => ({
    name: form.name, email: form.email, phone: form.phone, about: form.about,
    address: form.address, province: form.province, district: form.district, municipality: form.municipality,
    ward_number: form.ward_number, tole: form.tole, business_hours: form.business_hours,
    primary_color: form.primary_color || '#496B5A', seo_title: form.seo_title, seo_description: form.seo_description,
    facebook_url: form.facebook_url, instagram_url: form.instagram_url, tiktok_url: form.tiktok_url,
    youtube_url: form.youtube_url, linkedin_url: form.linkedin_url, whatsapp_number: form.whatsapp_number,
    viber_number: form.viber_number, website_draft_config: form.website_draft_config,
    website_onboarding_step: step, ...(form.logo ? { logo: form.logo } : {}), ...(form.cover_image ? { cover_image: form.cover_image } : {}),
  }), [form, step])

  function set(field, value) { setForm((currentForm) => ({ ...currentForm, [field]: value })) }
  function setConfig(field, value) { setForm((currentForm) => ({ ...currentForm, website_draft_config: { ...currentForm.website_draft_config, [field]: value } })) }
  async function save(nextStep = step) {
    await saveMutation.mutateAsync({ ...savePayload, website_onboarding_step: nextStep })
  }
  async function next() { const target = Math.min(step + 1, STEPS.length); await save(target); setStep(target) }
  async function back() { const target = Math.max(step - 1, 1); await save(target); setStep(target) }
  function isStepComplete(number) {
    const requiredFields = Object.entries(PUBLISHING_FIELDS).filter(([, field]) => field.step === number)
    if (requiredFields.length) return requiredFields.every(([key]) => !missingFields.has(key))
    return number < (serverState.website_onboarding_step || 1)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#496B5A]">Website creator</p><h1 className="mt-2 text-3xl font-bold text-[#263238]">Create your agency website</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#637079]">Complete each section, preview the dedicated agency URL, then publish when the required information is ready.</p></div>
        <div className="flex items-center gap-3"><span className="text-sm font-semibold text-[#496B5A]">{completion}% complete</span><div className="h-2 w-36 overflow-hidden rounded-full bg-[#DDE5E3]"><div className="h-full rounded-full bg-[#496B5A] transition-all" style={{ width: `${completion}%` }} /></div></div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="h-fit xl:sticky xl:top-6">
          <ol className="space-y-1">{STEPS.map((item, index) => { const number = index + 1; const active = number === step; const complete = isStepComplete(number); return <li key={item.title}><button type="button" onClick={() => setStep(number)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm ${active ? 'bg-[#eef3f0] font-semibold text-[#496B5A]' : 'text-[#637079] hover:bg-[#F8FAFA]'}`}><span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active || complete ? 'bg-[#496B5A] text-white' : 'bg-[#EEF2F2]'}`}>{complete && !active ? <Check size={14} /> : number}</span>{item.title}</button></li> })}</ol>
        </Card>

        <Card padding="lg">
          <div className="border-b border-[#DDE5E3] pb-5"><p className="text-xs font-bold uppercase tracking-wide text-[#8b969d]">Step {step} of {STEPS.length}</p><h2 className="mt-2 text-2xl font-bold text-[#263238]">{current.title}</h2><p className="mt-1 text-sm text-[#637079]">{current.description}</p></div>
          <div className="py-6">{renderStep(step, form, set, setConfig, setStep)}</div>
          <div className="flex flex-col-reverse gap-3 border-t border-[#DDE5E3] pt-5 sm:flex-row sm:justify-between">
            <Button variant="outlined" leftIcon={<ArrowLeft size={15} />} onClick={back} disabled={step === 1 || saveMutation.isPending}>Back</Button>
            <div className="flex flex-wrap gap-3"><Button variant="ghost" onClick={() => save()} loading={saveMutation.isPending}>Save draft</Button>{step < STEPS.length ? <Button rightIcon={<ArrowRight size={15} />} onClick={next} loading={saveMutation.isPending}>Save & continue</Button> : <><Button leftIcon={<Rocket size={15} />} onClick={() => publishMutation.mutate()} loading={publishMutation.isPending} disabled={!serverState.is_ready_to_publish}>{serverState.is_website_published ? 'Update live website' : 'Publish website'}</Button>{serverState.is_website_published && <Button variant="outlined" onClick={() => unpublishMutation.mutate()} loading={unpublishMutation.isPending}>Unpublish</Button>}</>}</div>
          </div>
        </Card>
      </div>

      {step === 8 && <div className="grid gap-4 lg:grid-cols-2"><Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-[#263238]">Private draft preview</p><p className="mt-1 text-sm text-[#637079]">The signed preview link expires after 24 hours. Save first to see the latest answers.</p></div><a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#496B5A] px-4 py-2 text-sm font-semibold text-[#496B5A]"><ExternalLink size={15} />Preview draft</a></Card>{serverState.is_website_published && <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-[#263238]">Public website</p><p className="mt-1 text-sm text-[#637079]">Visitors can now access your agency website.</p></div><a href={serverState.website_url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#496B5A] px-4 py-2 text-sm font-semibold text-white"><ExternalLink size={15} />Open live site</a></Card>}</div>}
    </div>
  )
}

function renderStep(step, form, set, setConfig, setStep) {
  const config = form.website_draft_config
  if (step === 1) return <div className="grid gap-4 sm:grid-cols-2"><Input label="Agency name" value={form.name || ''} onChange={(e) => set('name', e.target.value)} required /><Input label="Public email" type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} required /><Input label="Public phone" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} required /><Input label="Business hours" value={form.business_hours || ''} onChange={(e) => set('business_hours', e.target.value)} placeholder="Sun–Fri, 9:00–18:00" /><div className="sm:col-span-2"><Textarea label="Agency description" rows={5} value={form.about || ''} onChange={(e) => set('about', e.target.value)} minLength={40} error={minimumError(form.about, 40)} hint={minimumHint(form.about, 40, 'Describe your agency, expertise, and service area.')} required /></div><Input label="Province" value={form.province || ''} onChange={(e) => set('province', e.target.value)} /><Input label="District" value={form.district || ''} onChange={(e) => set('district', e.target.value)} /><Input label="Municipality" value={form.municipality || ''} onChange={(e) => set('municipality', e.target.value)} /><Input label="Ward" value={form.ward_number || ''} onChange={(e) => set('ward_number', e.target.value)} /><div className="sm:col-span-2"><Input label="Public address" value={form.address || ''} onChange={(e) => set('address', e.target.value)} required /></div></div>
  if (step === 2) return <div className="grid gap-6 sm:grid-cols-2"><UploadField label="Agency logo" current={typeof form.logo === 'string' ? form.logo : null} file={form.logo} onChange={(file) => set('logo', file)} /><UploadField label="Homepage cover image" current={typeof form.cover_image === 'string' ? form.cover_image : null} file={form.cover_image} onChange={(file) => set('cover_image', file)} /><ColorField label="Primary colour" value={form.primary_color || '#496B5A'} onChange={(value) => set('primary_color', value)} /><ColorField label="Secondary colour" value={config.secondary_color} onChange={(value) => setConfig('secondary_color', value)} /><ColorField label="Accent colour" value={config.accent_color} onChange={(value) => setConfig('accent_color', value)} /></div>
  if (step === 3) return <div className="space-y-4"><Input label="Agency tagline" value={config.tagline} onChange={(e) => setConfig('tagline', e.target.value)} maxLength={120} /><Input label="Hero eyebrow" value={config.hero_eyebrow} onChange={(e) => setConfig('hero_eyebrow', e.target.value)} /><Input label="Main homepage headline" value={config.hero_title} onChange={(e) => setConfig('hero_title', e.target.value)} minLength={8} error={minimumError(config.hero_title, 8)} hint={minimumHint(config.hero_title, 8)} required /><Textarea label="Homepage introduction" rows={4} value={config.hero_subtitle} onChange={(e) => setConfig('hero_subtitle', e.target.value)} minLength={20} error={minimumError(config.hero_subtitle, 20)} hint={minimumHint(config.hero_subtitle, 20, 'Summarize what visitors can expect from your agency.')} required /></div>
  if (step === 4) return <div className="space-y-5"><Textarea label="Mission" rows={4} value={config.mission} onChange={(e) => setConfig('mission', e.target.value)} /><Textarea label="Company story" rows={6} value={config.story} onChange={(e) => setConfig('story', e.target.value)} /><ListEditor title="Services" items={config.services} empty={{ title: '', description: '' }} fields={[['title', 'Service title'], ['description', 'Description', 'textarea']]} onChange={(items) => setConfig('services', items)} /></div>
  if (step === 5) return <div className="space-y-6"><ListEditor title="Statistics" items={config.statistics} empty={{ label: '', value: '', helper: '' }} fields={[['label', 'Label'], ['value', 'Value'], ['helper', 'Helper']]} onChange={(items) => setConfig('statistics', items)} /><ListEditor title="Testimonials" items={config.testimonials} empty={{ name: '', role: '', location: '', quote: '', rating: 5 }} fields={[['name', 'Name'], ['role', 'Role'], ['location', 'Location'], ['rating', 'Rating', 'number'], ['quote', 'Quote', 'textarea']]} onChange={(items) => setConfig('testimonials', items)} /><ListEditor title="Frequently asked questions" items={config.faqs} empty={{ question: '', answer: '' }} fields={[['question', 'Question'], ['answer', 'Answer', 'textarea']]} onChange={(items) => setConfig('faqs', items)} /></div>
  if (step === 6) return <div className="grid gap-4 sm:grid-cols-2"><Input label="WhatsApp number" value={form.whatsapp_number || ''} onChange={(e) => set('whatsapp_number', e.target.value)} /><Input label="Viber number" value={form.viber_number || ''} onChange={(e) => set('viber_number', e.target.value)} />{['facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url', 'linkedin_url'].map((field) => <Input key={field} type="url" label={field.replace('_url', '').replace('_', ' ')} className="capitalize" value={form[field] || ''} onChange={(e) => set(field, e.target.value)} />)}</div>
  if (step === 7) return <div className="space-y-4"><Input label="SEO title" value={form.seo_title || ''} onChange={(e) => set('seo_title', e.target.value)} maxLength={70} hint="Aim for 50–60 characters." /><Textarea label="SEO description" rows={4} value={form.seo_description || ''} onChange={(e) => set('seo_description', e.target.value)} maxLength={180} hint="Explain your agency and service area in at least 40 characters." /></div>
  return <div className="space-y-6"><div className={`rounded-xl border p-5 ${form.is_ready_to_publish ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-start gap-3"><Globe2 className="mt-0.5 text-[#496B5A]" size={21} /><div><p className="font-semibold text-[#263238]">{form.is_website_published ? 'Your website is published' : 'Complete the publishing checklist'}</p><p className="mt-1 text-sm text-[#637079]">Missing items show their requirement and link directly to the correct step. Save that step to refresh this checklist.</p></div></div></div><div><h3 className="font-semibold text-[#263238]">Required information</h3><ul className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(PUBLISHING_FIELDS).map(([key, field]) => { const missing = (form.missing_fields || []).includes(key); return <li key={key}><button type="button" onClick={() => setStep(field.step)} className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${missing ? 'border-amber-200 bg-amber-50 hover:bg-amber-100' : 'border-[#DDE5E3] hover:bg-[#F8FAFA]'}`}><span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${missing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{missing ? '!' : <Check size={12} />}</span><span className="min-w-0 flex-1"><span className="block">{field.label}</span>{missing && field.requirement && <span className="block text-xs text-amber-700">{field.requirement} · Step {field.step}</span>}</span><ArrowRight size={14} className="shrink-0 text-[#8b969d]" /></button></li> })}</ul></div></div>
}

function trimmedLength(value) { return (value || '').trim().length }
function minimumError(value, minimum) { const length = trimmedLength(value); return length > 0 && length < minimum ? `${minimum - length} more character${minimum - length === 1 ? '' : 's'} required.` : undefined }
function minimumHint(value, minimum, context = '') { return `${trimmedLength(value)}/${minimum} minimum characters${context ? ` · ${context}` : ''}` }

function UploadField({ label, current, file, onChange }) { return <label className="block text-sm font-medium text-[#263238]"><span className="flex items-center gap-2"><Image size={15} />{label}</span><div className="mt-2 flex min-h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#B8C6C1] bg-[#F8FAFA]">{file ? <p className="px-4 text-center text-sm text-[#496B5A]">{file.name}</p> : current ? <img src={current} alt="" className="h-36 w-full object-cover" /> : <p className="px-4 text-center text-xs text-[#637079]">JPG, PNG or WebP, maximum 5 MB</p>}</div><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onChange(e.target.files?.[0] || null)} className="mt-2 block w-full text-xs text-[#637079] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef3f0] file:px-3 file:py-2 file:font-semibold file:text-[#496B5A]" /></label> }
function ColorField({ label, value, onChange }) { return <label className="block text-sm font-medium text-[#263238]">{label}<div className="mt-1 flex items-center gap-3 rounded-lg border border-[#DDE5E3] p-2"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-9 rounded border-0" /><span className="text-sm uppercase text-[#637079]">{value}</span></div></label> }
function ListEditor({ title, items, empty, fields, onChange }) { function update(index, field, value) { onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)) } return <div className="rounded-xl border border-[#DDE5E3] p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-[#263238]">{title}</h3><Button size="sm" variant="outlined" leftIcon={<Plus size={13} />} onClick={() => onChange([...items, { ...empty }])}>Add</Button></div><div className="mt-4 space-y-4">{items.map((item, index) => <div key={index} className="grid gap-3 rounded-lg bg-[#F8FAFA] p-4 sm:grid-cols-2">{fields.map(([field, label, type]) => type === 'textarea' ? <div key={field} className="sm:col-span-2"><Textarea label={label} rows={3} value={item[field] || ''} onChange={(e) => update(index, field, e.target.value)} /></div> : <Input key={field} label={label} type={type || 'text'} value={item[field] ?? ''} onChange={(e) => update(index, field, type === 'number' ? Number(e.target.value) : e.target.value)} />)}<Button size="sm" variant="ghost-danger" leftIcon={<Trash2 size={13} />} onClick={() => onChange(items.filter((_, i) => i !== index))}>Remove</Button></div>)}{!items.length && <p className="text-sm text-[#8b969d]">No items added yet.</p>}</div></div> }
function apiError(error, fallback) { const data = error.response?.data; if (data?.detail) return data.detail; const first = data && Object.values(data)[0]; return Array.isArray(first) ? first[0] : typeof first === 'string' ? first : fallback }
