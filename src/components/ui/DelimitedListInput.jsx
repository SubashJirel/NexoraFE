import { useEffect, useMemo, useRef, useState } from 'react'

import Input from '@/components/ui/Input'
import { formatDelimitedList, parseDelimitedList } from '@/utils/listInput'

export default function DelimitedListInput({
  label,
  value,
  onChange,
  maximum = 20,
  placeholder,
}) {
  const formattedValue = useMemo(() => formatDelimitedList(value), [value])
  const focused = useRef(false)
  const [draft, setDraft] = useState(formattedValue)
  const [overflow, setOverflow] = useState(false)
  const count = parseDelimitedList(draft).length

  useEffect(() => {
    if (focused.current) return
    setDraft(formattedValue)
    setOverflow(false)
  }, [formattedValue])

  function update(next) {
    const allValues = parseDelimitedList(next)
    setDraft(next)
    setOverflow(allValues.length > maximum)
    onChange(allValues.slice(0, maximum))
  }

  function normalizeDraft() {
    focused.current = false
    const values = parseDelimitedList(draft, { maximum })
    setDraft(values.join(', '))
    setOverflow(false)
    onChange(values)
  }

  return <Input
    label={label}
    value={draft}
    placeholder={placeholder}
    onFocus={() => { focused.current = true }}
    onChange={(event) => update(event.target.value)}
    onBlur={normalizeDraft}
    error={overflow ? `A maximum of ${maximum} entries is allowed.` : undefined}
    hint={`${Math.min(count, maximum)}/${maximum} entries · separate entries with commas or semicolons`}
  />
}
