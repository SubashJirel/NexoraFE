import { useState } from 'react'
import { Award, BriefcaseBusiness, Camera, CheckCircle2, Home, UserRound } from 'lucide-react'
import { useAgentProfile, useUpdateAgentProfile } from '@/hooks/useAgentProfile'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { PageSpinner } from '@/components/ui/Spinner'

export default function AgentProfilePage() {
  const query = useAgentProfile()
  if (query.isLoading) return <PageSpinner />
  if (query.isError) return <Card><p className="text-red-600">Unable to load your profile.</p></Card>
  return <ProfileForm key={query.data.profile_updated_at || query.data.id} profile={query.data} />
}

function ProfileForm({ profile }) {
  const mutation = useUpdateAgentProfile()
  const [form, setForm] = useState(() => ({
    full_name: profile.full_name || '', phone: profile.phone || '', designation: profile.designation || '',
    location: profile.location || '', years_experience: profile.years_experience ?? '', bio: profile.bio || '',
    languages: (profile.languages || []).join(', '), specialties: (profile.specialties || []).join(', '),
    linkedin_url: profile.linkedin_url || '', instagram_url: profile.instagram_url || '', facebook_url: profile.facebook_url || '',
    show_phone_publicly: profile.show_phone_publicly !== false, show_email_publicly: profile.show_email_publicly !== false,
    profile_image: null,
  }))
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  function submit(event) {
    event.preventDefault()
    mutation.mutate({
      ...form,
      years_experience: form.years_experience === '' ? 0 : Number(form.years_experience),
      languages: form.languages.split(',').map((item) => item.trim()).filter(Boolean),
      specialties: form.specialties.split(',').map((item) => item.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold text-[#263238]">My agent profile</h2><p className="mt-1 text-sm text-[#637079]">Keep your public profile accurate and complete.</p></div>
        <Badge variant={profile.profile_completed ? 'success' : 'warning'}>{profile.profile_completed ? 'Profile complete' : 'Profile incomplete'}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={BriefcaseBusiness} label="Deals closed" value={profile.deals_closed} />
        <Metric icon={Home} label="Current listings" value={profile.current_listing_ids?.length || 0} />
        <Metric icon={Award} label="Sold or rented" value={profile.sold_property_ids?.length || 0} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="h-fit text-center">
          <Avatar alt={profile.full_name} src={profile.profile_image_url} size="xl" className="mx-auto" />
          <p className="mt-3 font-semibold text-[#263238]">{profile.full_name}</p>
          <p className="text-xs text-[#637079]">{profile.email}</p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#eef3f0] px-3 py-2 text-xs font-semibold text-[#496B5A]">
            <Camera size={14} /> Change photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => set('profile_image', e.target.files?.[0] || null)} />
          </label>
          {form.profile_image && <p className="mt-2 truncate text-[11px] text-[#637079]">{form.profile_image.name}</p>}
          <div className="mt-5 space-y-2 border-t border-[#DDE5E3] pt-4 text-left text-xs text-[#637079]">
            {(profile.current_listing_ids || []).slice(0, 5).map((id) => <p key={id} className="flex items-center gap-2"><CheckCircle2 size={12} />{id}</p>)}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-2 border-b border-[#DDE5E3] pb-4"><UserRound size={18} className="text-[#496B5A]" /><h3 className="font-semibold text-[#263238]">Professional details</h3></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
            <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <Input label="Designation" value={form.designation} onChange={(e) => set('designation', e.target.value)} placeholder="Senior Property Advisor" />
            <Input label="Location" value={form.location} onChange={(e) => set('location', e.target.value)} />
            <Input label="Years of experience" type="number" min="0" max="80" value={form.years_experience} onChange={(e) => set('years_experience', e.target.value)} />
            <Input label="Languages" hint="Comma-separated" value={form.languages} onChange={(e) => set('languages', e.target.value)} />
            <div className="sm:col-span-2"><Input label="Specialties" hint="Comma-separated" value={form.specialties} onChange={(e) => set('specialties', e.target.value)} /></div>
            <div className="sm:col-span-2"><Textarea label="Biography" rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)} /></div>
            <Input label="LinkedIn URL" type="url" value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} />
            <Input label="Instagram URL" type="url" value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} />
            <Input label="Facebook URL" type="url" value={form.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} />
            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 text-sm text-[#263238]"><input type="checkbox" checked={form.show_phone_publicly} onChange={(e) => set('show_phone_publicly', e.target.checked)} />Show my phone publicly</label><label className="flex items-center gap-2 text-sm text-[#263238]"><input type="checkbox" checked={form.show_email_publicly} onChange={(e) => set('show_email_publicly', e.target.checked)} />Show my email publicly</label></div>
          </div>
          <div className="mt-6 flex justify-end"><Button type="submit" size="lg" loading={mutation.isPending}>Save profile</Button></div>
        </Card>
      </div>
    </form>
  )
}

function Metric({ icon: Icon, label, value }) {
  return <Card className="flex items-center gap-3"><div className="rounded-lg bg-[#eef3f0] p-2 text-[#496B5A]"><Icon size={17} /></div><div><p className="text-xl font-bold text-[#263238]">{value}</p><p className="text-xs text-[#637079]">{label}</p></div></Card>
}
