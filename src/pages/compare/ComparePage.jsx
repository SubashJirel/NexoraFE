import { useState } from 'react'
import { useProperties } from '@/hooks/useProperties'
import operationsService from '@/services/operationsService'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const labels = { price: 'Price', property_type: 'Type', purpose: 'Purpose', city: 'City', district: 'District', bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', land_area_value: 'Land area', built_up_area_value: 'Built-up area', amenities: 'Amenities' }

export default function ComparePage() {
  const query = useProperties(); const [selected, setSelected] = useState([]); const [rows, setRows] = useState([])
  function toggle(id) { setSelected((values) => values.includes(id) ? values.filter((value) => value !== id) : values.length < 4 ? [...values, id] : values) }
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#263238]">Property comparison</h2><p className="mt-1 text-sm text-[#637079]">Compare up to four listings side by side for client discussions.</p></div><Card><div className="flex flex-wrap gap-2">{(query.data || []).map((item) => <button key={item.id} onClick={() => toggle(item.id)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selected.includes(item.id) ? 'border-[#496B5A] bg-[#eef3f0] text-[#496B5A]' : 'border-[#DDE5E3]'}`}>{item.title}</button>)}</div><Button className="mt-4" disabled={selected.length < 2} onClick={async () => setRows(await operationsService.compare(selected))}>Compare selected</Button></Card>{rows.length > 0 && <Card className="overflow-x-auto p-0"><table className="w-full min-w-[720px] text-sm"><thead><tr className="bg-[#F8FAFA]"><th className="px-5 py-4 text-left">Feature</th>{rows.map((item) => <th key={item.id} className="px-5 py-4 text-left">{item.title}</th>)}</tr></thead><tbody>{Object.entries(labels).map(([key, label]) => <tr key={key} className="border-t border-[#EEF2F2]"><td className="px-5 py-4 font-semibold">{label}</td>{rows.map((item) => <td key={item.id} className="px-5 py-4 text-[#637079]">{Array.isArray(item[key]) ? item[key].join(', ') : String(item[key] ?? '—').replaceAll('_', ' ')}{key === 'price' ? ` ${item.currency}` : ''}</td>)}</tr>)}</tbody></table></Card>}</div>
}
