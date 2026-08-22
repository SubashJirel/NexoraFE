import assert from 'node:assert/strict'
import test from 'node:test'
import {
  INITIAL_FORM,
  buildPropertyPayload,
  propertyToForm,
  validateStep,
} from '../src/pages/properties/propertyFormUtils.js'

test('published properties use the backend available status contract', () => {
  const payload = buildPropertyPayload({
    ...INITIAL_FORM,
    title: '  Family Home  ',
    price: '25000000',
    province: 'Bagmati',
    district: 'Kathmandu',
    city: 'Kathmandu',
    address: 'Lazimpat',
    status: 'available',
  })

  assert.equal(payload.title, 'Family Home')
  assert.equal(payload.status, 'available')
  assert.equal(payload.is_published, true)
  assert.equal('published_at' in payload, false)
})

test('draft properties are never marked as published', () => {
  const payload = buildPropertyPayload({
    ...INITIAL_FORM,
    title: 'Draft listing',
    province: 'Bagmati',
    district: 'Kathmandu',
    city: 'Kathmandu',
    address: 'Lazimpat',
    price: '100',
    is_published: true,
  })

  assert.equal(payload.status, 'draft')
  assert.equal(payload.is_published, false)
  assert.equal('published_at' in payload, false)
})

test('reserved and under-negotiation properties remain public', () => {
  for (const status of ['reserved', 'under_negotiation']) {
    const payload = buildPropertyPayload({ ...INITIAL_FORM, status })
    assert.equal(payload.is_published, true)
    assert.equal('published_at' in payload, false)
  }
})

test('property validation identifies required fields by step', () => {
  assert.deepEqual(Object.keys(validateStep(1, INITIAL_FORM)).sort(), [
    'price',
    'province',
    'title',
  ])
  assert.deepEqual(Object.keys(validateStep(2, INITIAL_FORM)).sort(), [
    'address',
    'city',
    'district',
    'municipality',
  ])
})

test('API properties are safely normalised for editing', () => {
  const form = propertyToForm({
    title: 'Land parcel',
    property_type: 'land',
    bedrooms: null,
    assigned_agent: 12,
    seo_title: 'Land for sale in Kathmandu',
    seo_description: 'A serviced land parcel available in Kathmandu.',
  })

  assert.equal(form.property_type, 'land')
  assert.equal(form.bedrooms, 1)
  assert.equal(form.assigned_agent, 12)
  assert.equal(form.seo_title, 'Land for sale in Kathmandu')
  assert.equal(form.seo_description, 'A serviced land parcel available in Kathmandu.')

  const payload = buildPropertyPayload(form)
  assert.equal(payload.seo_title, 'Land for sale in Kathmandu')
  assert.equal(payload.seo_description, 'A serviced land parcel available in Kathmandu.')
})
