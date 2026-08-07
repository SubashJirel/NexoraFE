import { useState } from 'react'
import {
  BarChart3, Check, Copy, Download, ExternalLink, FileArchive,
  FileSpreadsheet, Image, Link2, MessageCircle, Plus, Printer,
  QrCode, Send, Share2, Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useCreateDistributionLink,
  useCreateDistributionSocialDraft,
  useDeleteDistributionLink,
  useDownloadDistributionAsset,
  usePropertyDistribution,
  useUpdateDistributionLink,
} from '@/hooks/usePropertyDistribution'
import { useSocialConnections } from '@/hooks/useSocialConnections'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const ASSET_ICONS = {
  facebook_post: Share2,
  instagram_post: Image,
  instagram_story: Image,
  watermarked_images: Image,
  brochure: FileArchive,
  window_card: Printer,
  qr_code: QrCode,
  portal_csv: FileSpreadsheet,
  media_package: Download,
}

const CHANNELS = [
  ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['story', 'Story'],
  ['whatsapp', 'WhatsApp'], ['viber', 'Viber'],
]

export default function PropertyDistributionPanel({ propertyId }) {
  const query = usePropertyDistribution(propertyId)
  if (query.isLoading) return <section className="rounded-2xl border border-[#DDE5E3] bg-white p-6 text-sm text-[#637079]">Preparing distribution toolkit...</section>
  if (query.isError) return <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">The distribution toolkit could not be loaded.</section>
  return <section className="space-y-5 rounded-2xl border border-[#DDE5E3] bg-white p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] sm:p-6">
    <ToolkitHeader propertyId={propertyId} data={query.data} />
    <AssetLibrary propertyId={propertyId} assets={query.data.assets} links={query.data.links} />
    <div className="grid gap-5 xl:grid-cols-2">
      <CopyLibrary data={query.data} />
      <SocialPublishing propertyId={propertyId} links={query.data.links} />
    </div>
    <TrackedLinks propertyId={propertyId} links={query.data.links} />
    <Attribution rows={query.data.attribution || []} />
  </section>
}

function ToolkitHeader({ propertyId, data }) {
  const download = useDownloadDistributionAsset(propertyId)
  return <div className="flex flex-col justify-between gap-4 border-b border-[#EEF2F2] pb-5 lg:flex-row lg:items-center">
    <div><div className="flex items-center gap-2"><Share2 size={18} className="text-[#496B5A]" /><h3 className="text-lg font-semibold text-[#263238]">Listing distribution toolkit</h3><Badge variant="success">{data.property.display_property_id}</Badge></div><p className="mt-1 text-sm text-[#637079]">Create once, then distribute consistent branded material across every sales channel.</p><button type="button" onClick={() => copyText(data.public_url, 'Public property link copied.')} className="mt-2 flex max-w-full items-center gap-1.5 text-left text-xs font-medium text-[#496B5A]"><Link2 size={13} /><span className="truncate">{data.public_url}</span><Copy size={12} /></button></div>
    <Button size="lg" leftIcon={<Download size={16} />} loading={download.isPending} onClick={() => download.mutate({ assetType: 'media_package' })}>Download complete package</Button>
  </div>
}

function AssetLibrary({ propertyId, assets, links }) {
  const download = useDownloadDistributionAsset(propertyId)
  const [linkId, setLinkId] = useState('')
  const [active, setActive] = useState('')
  function get(assetType) {
    setActive(assetType)
    download.mutate({ assetType, linkId }, { onSettled: () => setActive('') })
  }
  return <div><div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h4 className="text-sm font-semibold text-[#263238]">Downloadable assets</h4><p className="mt-0.5 text-xs text-[#637079]">Every QR and creative can use a tracked campaign link.</p></div><div className="w-full sm:w-64"><Select size="sm" label="Link embedded in assets" value={linkId} onChange={(event) => setLinkId(event.target.value)}><option value="">Standard public link</option>{links.filter((link) => link.is_active).map((link) => <option key={link.id} value={link.id}>{link.label || link.source}</option>)}</Select></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{assets.map((asset) => { const Icon = ASSET_ICONS[asset.type] || Download; return <button key={asset.type} type="button" onClick={() => get(asset.type)} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition hover:border-[#8FAF9B] hover:bg-[#F8FAFA] ${asset.type === 'media_package' ? 'border-[#8FAF9B] bg-[#eef3f0]' : 'border-[#DDE5E3]'}`}><span className="rounded-lg bg-white p-2 text-[#496B5A] shadow-sm"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#263238]">{asset.label}</span><span className="text-[11px] uppercase text-[#8b969d]">{active === asset.type ? 'Generating...' : asset.extension}</span></span><Download size={14} className="text-[#637079]" /></button> })}</div></div>
}

function CopyLibrary({ data }) {
  const [language, setLanguage] = useState('english')
  const [channel, setChannel] = useState('facebook')
  const [mode, setMode] = useState('captions')
  const content = mode === 'portal' ? data.portal_ad[language] : data.captions[language][channel]
  return <div className="rounded-xl border border-[#DDE5E3] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-[#263238]">Copy library</h4><p className="mt-0.5 text-xs text-[#637079]">Rule-based English and Nepali marketing copy.</p></div><div className="flex rounded-lg bg-[#F1F5F3] p-1"><button type="button" onClick={() => setMode('captions')} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${mode === 'captions' ? 'bg-white text-[#496B5A] shadow-sm' : 'text-[#637079]'}`}>Captions</button><button type="button" onClick={() => setMode('portal')} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${mode === 'portal' ? 'bg-white text-[#496B5A] shadow-sm' : 'text-[#637079]'}`}>Portal ad</button></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setLanguage('english')} className={`rounded-full px-3 py-1 text-xs font-semibold ${language === 'english' ? 'bg-[#496B5A] text-white' : 'bg-[#EEF2F2] text-[#637079]'}`}>English</button><button type="button" onClick={() => setLanguage('nepali')} className={`rounded-full px-3 py-1 text-xs font-semibold ${language === 'nepali' ? 'bg-[#496B5A] text-white' : 'bg-[#EEF2F2] text-[#637079]'}`}>नेपाली</button>{mode === 'captions' && CHANNELS.map(([value, label]) => <button key={value} type="button" onClick={() => setChannel(value)} className={`rounded-full px-3 py-1 text-xs ${channel === value ? 'bg-[#263238] text-white' : 'border border-[#DDE5E3] text-[#637079]'}`}>{label}</button>)}</div><div className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[#F8FAFA] p-3 text-xs leading-5 text-[#263238]">{content}</div><div className="mt-3 flex justify-end"><Button size="sm" variant="outlined" leftIcon={<Copy size={13} />} onClick={() => copyText(content, 'Marketing copy copied.')}>Copy text</Button></div></div>
}

function SocialPublishing({ propertyId, links }) {
  const { data: connections = [] } = useSocialConnections()
  const mutation = useCreateDistributionSocialDraft(propertyId)
  const accounts = connections.filter((account) => account.status === 'connected' && ['facebook', 'instagram'].includes(account.platform))
  const [form, setForm] = useState({ social_account: '', language: 'english', link: '' })
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const selected = accounts.find((item) => String(item.id) === String(form.social_account))
  const submit = (publishNow) => mutation.mutate({ ...form, social_account: Number(form.social_account), link: form.link ? Number(form.link) : null, publish_now: publishNow })
  return <div className="rounded-xl border border-[#DDE5E3] p-4"><div><h4 className="text-sm font-semibold text-[#263238]">Facebook and Instagram</h4><p className="mt-0.5 text-xs text-[#637079]">Build a branded post draft or publish directly through a connected Meta account.</p></div>{accounts.length ? <><div className="mt-4 grid gap-3 sm:grid-cols-2"><Select label="Connected account" size="sm" value={form.social_account} onChange={(event) => set('social_account', event.target.value)}><option value="">Choose account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({account.platform})</option>)}</Select><Select label="Caption language" size="sm" value={form.language} onChange={(event) => set('language', event.target.value)}><option value="english">English</option><option value="nepali">नेपाली</option></Select><Select label="Tracked link" size="sm" value={form.link} onChange={(event) => set('link', event.target.value)}><option value="">Standard public link</option>{links.filter((link) => link.is_active).map((link) => <option key={link.id} value={link.id}>{link.label || link.source}</option>)}</Select><div className="flex items-end gap-2"><Button size="sm" variant="outlined" disabled={!selected} loading={mutation.isPending} onClick={() => submit(false)}>Create draft</Button><Button size="sm" disabled={!selected} loading={mutation.isPending} leftIcon={<Send size={13} />} onClick={() => submit(true)}>Publish now</Button></div></div>{selected?.platform === 'instagram' && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">Instagram Story files are downloadable above. Meta direct publishing currently creates the Instagram feed post.</p>}</> : <div className="mt-4 rounded-lg bg-[#F8FAFA] p-4 text-center"><p className="text-sm font-medium text-[#263238]">No Meta account connected</p><p className="mt-1 text-xs text-[#637079]">Connect Facebook or Instagram from Social Media to publish directly.</p></div>}</div>
}

function TrackedLinks({ propertyId, links }) {
  const create = useCreateDistributionLink(propertyId)
  const update = useUpdateDistributionLink(propertyId)
  const remove = useDeleteDistributionLink(propertyId)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ label: '', source: 'facebook', medium: 'social', campaign: '' })
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  function submit(event) { event.preventDefault(); create.mutate(form, { onSuccess: () => { setOpen(false); setForm({ label: '', source: 'facebook', medium: 'social', campaign: '' }) } }) }
  return <div className="rounded-xl border border-[#DDE5E3] p-4"><div className="flex items-center justify-between gap-3"><div><h4 className="text-sm font-semibold text-[#263238]">Source-tracked short links</h4><p className="mt-0.5 text-xs text-[#637079]">Attribute clicks, inquiries, and site visits to each distribution channel.</p></div><Button size="sm" onClick={() => setOpen((value) => !value)} leftIcon={<Plus size={13} />}>New link</Button></div>{open && <form onSubmit={submit} className="mt-4 grid gap-3 rounded-xl bg-[#F8FAFA] p-4 sm:grid-cols-2 lg:grid-cols-4"><Input label="Label" size="sm" value={form.label} onChange={(event) => set('label', event.target.value)} placeholder="Dashain Facebook" /><Input label="Source" size="sm" value={form.source} onChange={(event) => set('source', event.target.value)} required /><Input label="Medium" size="sm" value={form.medium} onChange={(event) => set('medium', event.target.value)} required /><Input label="Campaign" size="sm" value={form.campaign} onChange={(event) => set('campaign', event.target.value)} /><div className="flex gap-2 sm:col-span-2 lg:col-span-4 lg:justify-end"><Button type="button" variant="outlined" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" size="sm" loading={create.isPending}>Create tracked link</Button></div></form>}<div className="mt-4 space-y-2">{links.length ? links.map((link) => <div key={link.id} className="flex flex-col gap-3 rounded-lg border border-[#EEF2F2] p-3 sm:flex-row sm:items-center"><span className={`h-2.5 w-2.5 rounded-full ${link.is_active ? 'bg-emerald-500' : 'bg-[#B8C9C5]'}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#263238]">{link.label || link.source}</p><p className="truncate text-[11px] text-[#637079]">{link.short_url}</p></div><div className="flex items-center gap-2"><Badge variant="neutral">{link.click_count} clicks</Badge><button type="button" onClick={() => copyText(link.short_url, 'Tracked link copied.')} className="rounded-lg p-2 text-[#496B5A] hover:bg-[#eef3f0]" aria-label="Copy link"><Copy size={14} /></button><button type="button" onClick={() => update.mutate({ id: link.id, payload: { is_active: !link.is_active } })} className="rounded-lg p-2 text-[#637079] hover:bg-[#EEF2F2]" aria-label={link.is_active ? 'Disable link' : 'Enable link'}>{link.is_active ? <Check size={14} /> : <ExternalLink size={14} />}</button><button type="button" onClick={() => window.confirm('Delete this tracked link?') && remove.mutate(link.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete link"><Trash2 size={14} /></button></div></div>) : <p className="py-4 text-center text-xs text-[#637079]">No tracked links yet. Create one for Facebook, WhatsApp, Viber, portals, or referrals.</p>}</div></div>
}

function Attribution({ rows }) {
  return <div className="rounded-xl border border-[#DDE5E3] p-4"><div className="flex items-center gap-2"><BarChart3 size={16} className="text-[#496B5A]" /><h4 className="text-sm font-semibold text-[#263238]">Distribution attribution</h4></div>{rows.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[520px] text-xs"><thead><tr className="bg-[#F8FAFA] text-left text-[#637079]"><th className="px-3 py-2">Source</th><th className="px-3 py-2">All events</th><th className="px-3 py-2">Inquiries</th><th className="px-3 py-2">Site visits</th></tr></thead><tbody>{rows.map((row) => <tr key={row.utm_source} className="border-t border-[#EEF2F2]"><td className="px-3 py-2 font-semibold text-[#263238]">{row.utm_source}</td><td className="px-3 py-2">{row.total}</td><td className="px-3 py-2">{row.inquiries}</td><td className="px-3 py-2">{row.site_visits}</td></tr>)}</tbody></table></div> : <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#F8FAFA] p-3 text-xs text-[#637079]"><MessageCircle size={15} />Tracked clicks and inquiries will appear here once links are shared.</div>}</div>
}

async function copyText(value, success) {
  await navigator.clipboard.writeText(value)
  toast.success(success)
}
