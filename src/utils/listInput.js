export function parseDelimitedList(value, { maximum = Infinity } = {}) {
  const source = Array.isArray(value) ? value : [value]
  const seen = new Set()
  const result = []

  for (const part of source.flatMap((item) => String(item ?? '').split(/[,;\n]+/))) {
    const item = part.trim()
    if (!item) continue
    const key = item.toLocaleLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
    if (result.length >= maximum) break
  }

  return result
}

export function formatDelimitedList(value) {
  return parseDelimitedList(value).join(', ')
}
