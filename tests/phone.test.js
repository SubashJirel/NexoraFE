import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isValidNepalPhone,
  nepalPhoneNationalDigits,
  normalizeNepalPhone,
  toNepalPhoneValue,
} from '../src/utils/phone.js'

test('normalizes Nepal mobile and landline phone values', () => {
  assert.equal(normalizeNepalPhone('9801234567'), '+9779801234567')
  assert.equal(normalizeNepalPhone('+977 9701234567'), '+9779701234567')
  assert.equal(normalizeNepalPhone('01-1234-5678'), '+9770112345678')
  assert.equal(normalizeNepalPhone('९८०१२३४५६७'), '+9779801234567')
})

test('rejects unsupported prefixes and non-ten-digit national values', () => {
  for (const value of ['9601234567', '980123456', '98012345678', '+14155552671']) {
    assert.equal(isValidNepalPhone(value), false)
    assert.equal(normalizeNepalPhone(value), '')
  }
})

test('keeps a +977 prefix while the user enters national digits', () => {
  assert.equal(toNepalPhoneValue('98'), '+97798')
  assert.equal(nepalPhoneNationalDigits('+97798'), '98')
})
