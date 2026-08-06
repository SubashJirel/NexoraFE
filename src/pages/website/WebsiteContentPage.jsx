import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useCurrentAgency, useUpdateAgency } from '@/hooks/useAgency'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { PageSpinner } from '@/components/ui/Spinner'

export default function WebsiteContentPage() {
  const agencyQuery = useCurrentAgency()
  if (agencyQuery.isLoading) return <PageSpinner />
  if (!agencyQuery.data) return <Card>Unable to load website content.</Card>
  return <WebsiteContentForm key={agencyQuery.data.id} agency={agencyQuery.data} />
}

function WebsiteContentForm({ agency }) {
  const update = useUpdateAgency()
  const config = agency.website_config || {}
  const [statistics, setStatistics] = useState(config.statistics || [])
  const [testimonials, setTestimonials] = useState(config.testimonials || [])
  const [faqs, setFaqs] = useState(config.faqs || [])

  function save() {
    update.mutate({ website_config: { ...config, statistics, testimonials, faqs } })
  }

  return <div className="space-y-6"><div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">Website content</h2><p className="mt-1 text-sm text-[#637079]">Manage reusable statistics, testimonials, and FAQs shown by the public template.</p></div><Button onClick={save} loading={update.isPending}>Save content</Button></div>
    <ListEditor title="Statistics" items={statistics} setItems={setStatistics} empty={{ label: '', value: '', helper: '' }} fields={[['label', 'Label'], ['value', 'Value'], ['helper', 'Helper']]} />
    <ListEditor title="Testimonials" items={testimonials} setItems={setTestimonials} empty={{ name: '', role: '', location: '', quote: '', rating: 5 }} fields={[['name', 'Name'], ['role', 'Role'], ['location', 'Location'], ['rating', 'Rating', 'number'], ['quote', 'Quote', 'textarea']]} />
    <ListEditor title="Frequently asked questions" items={faqs} setItems={setFaqs} empty={{ question: '', answer: '' }} fields={[['question', 'Question'], ['answer', 'Answer', 'textarea']]} />
  </div>
}

function ListEditor({ title, items, setItems, empty, fields }) {
  function update(index, field, value) { setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)) }
  return <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">{title}</h3><Button size="sm" variant="outlined" leftIcon={<Plus size={14} />} onClick={() => setItems([...items, { ...empty }])}>Add</Button></div><div className="space-y-4">{items.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-[#DDE5E3] p-4 sm:grid-cols-2">{fields.map(([field, label, type]) => type === 'textarea' ? <div key={field} className="sm:col-span-2"><Textarea label={label} rows={3} value={item[field] || ''} onChange={(event) => update(index, field, event.target.value)} /></div> : <Input key={field} label={label} type={type || 'text'} value={item[field] ?? ''} onChange={(event) => update(index, field, type === 'number' ? Number(event.target.value) : event.target.value)} />)}<Button size="sm" variant="ghost" leftIcon={<Trash2 size={14} />} onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button></div>)}{!items.length && <p className="text-sm text-[#637079]">No items configured; the template defaults will be used.</p>}</div></Card>
}
