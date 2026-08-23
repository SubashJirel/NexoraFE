import test from 'node:test'
import assert from 'node:assert/strict'

import { formatDelimitedList, parseDelimitedList } from '../src/utils/listInput.js'

test('parses multiple comma and semicolon separated website values', () => {
  assert.deepEqual(
    parseDelimitedList('Residential sales, Commercial property; Rentals'),
    ['Residential sales', 'Commercial property', 'Rentals'],
  )
})

test('removes empty and case-insensitive duplicate list values', () => {
  assert.deepEqual(
    parseDelimitedList('Kathmandu, , Lalitpur, kathmandu'),
    ['Kathmandu', 'Lalitpur'],
  )
})

test('applies list limits and formats saved values', () => {
  assert.deepEqual(parseDelimitedList('One, Two, Three', { maximum: 2 }), ['One', 'Two'])
  assert.equal(formatDelimitedList(['Kathmandu', 'Lalitpur']), 'Kathmandu, Lalitpur')
})
