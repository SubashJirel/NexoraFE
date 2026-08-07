import test from 'node:test'
import assert from 'node:assert/strict'

import {
  convertDate,
  formatAddress,
  formatCurrency,
  formatDate,
  formatPhone,
  toLatinDigits,
  toNepaliDigits,
} from '../src/lib/localization.js'

test('converts known Nepal new year between AD and BS', () => {
  assert.equal(convertDate('2024-04-13', 'bs'), '2081-01-01')
  assert.equal(convertDate('२०८१-०१-०१', 'ad'), '2024-04-13')
  assert.equal(
    formatDate('2024-04-13', { language: 'ne', dateSystem: 'bs', nepaliDigits: true }),
    '२०८१ वैशाख १ गते',
  )
})

test('formats Nepal currency, phones, digits, and addresses', () => {
  assert.equal(toNepaliDigits('2081'), '२०८१')
  assert.equal(toLatinDigits('२०८१'), '2081')
  assert.equal(formatCurrency(32_500_000, { language: 'ne', nepaliDigits: true }), 'रु. ३.२५ करोड')
  assert.equal(formatPhone('९८०१२३४५६७', { nepaliDigits: true }), '+९७७ ९८० १२३ ४५६७')
  assert.equal(
    formatAddress(
      { tole: 'Baluwatar', ward_number: '4', municipality: 'Kathmandu', district: 'Kathmandu', province: 'Bagmati' },
      { language: 'ne', nepaliDigits: true },
    ),
    'Baluwatar, वडा नं. ४, Kathmandu, Kathmandu, Bagmati, नेपाल',
  )
})
