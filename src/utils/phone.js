const NEPALI_TO_LATIN = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
}

export const NEPAL_PHONE_ERROR =
  'Enter 10 digits starting with 97, 98, or 01.'
export const NEPAL_PHONE_PATTERN = '(?:97|98|01)[0-9]{8}'

function latinDigits(value = '') {
  return String(value)
    .replace(/[०-९]/g, (digit) => NEPALI_TO_LATIN[digit])
    .replace(/\D/g, '')
}

export function nepalPhoneNationalDigits(value = '') {
  const raw = String(value).trim()
  let digits = latinDigits(raw)

  if (digits.startsWith('00977')) digits = digits.slice(5)
  else if (raw.startsWith('+977') || (digits.startsWith('977') && digits.length > 10)) {
    digits = digits.slice(3)
  }

  return digits
}

export function isValidNepalPhone(value) {
  return /^(?:97|98|01)\d{8}$/.test(nepalPhoneNationalDigits(value))
}

export function toNepalPhoneValue(value) {
  const national = nepalPhoneNationalDigits(value)
  return national ? `+977${national}` : ''
}

export function normalizeNepalPhone(value) {
  return isValidNepalPhone(value) ? toNepalPhoneValue(value) : ''
}
