export const AREA_UNITS = [
  ['ropani', 'Ropani'], ['aana', 'Aana'], ['paisa', 'Paisa'], ['daam', 'Daam'],
  ['bigha', 'Bigha'], ['kattha', 'Kattha'], ['dhur', 'Dhur'],
  ['sqft', 'Square Feet'], ['sqm', 'Square Metres'],
].map(([value, label]) => ({ value, label }))

const SQFT = { sqft: 1, sqm: 10.7639104167, ropani: 5476, aana: 342.25, paisa: 85.5625, daam: 21.390625, bigha: 72900, kattha: 3645, dhur: 182.25 }

export function convertArea(value, from, to) {
  const number = Number(value)
  if (!Number.isFinite(number) || !SQFT[from] || !SQFT[to]) return null
  return number * SQFT[from] / SQFT[to]
}

export function formatAreaConversions(value, unit) {
  if (!value) return []
  return ['aana', 'ropani', 'paisa', 'daam', 'kattha', 'dhur', 'bigha', 'sqft', 'sqm'].map((target) => ({
    unit: target,
    value: convertArea(value, unit, target),
  })).filter((item) => item.value != null)
}

export function formatNpr(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  if (amount >= 10000000) return `NPR ${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`
  if (amount >= 100000) return `NPR ${(amount / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`
  return `NPR ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function pricePerUnit(price, areaValue, areaUnit, targetUnit) {
  const area = convertArea(areaValue, areaUnit, targetUnit)
  return area > 0 ? Number(price) / area : null
}
