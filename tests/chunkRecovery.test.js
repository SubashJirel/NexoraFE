import assert from 'node:assert/strict'
import test from 'node:test'

import { attemptChunkRecovery, isDynamicImportError } from '../src/utils/chunkRecovery.js'

test('recognizes stale Vite dynamic import errors', () => {
  assert.equal(
    isDynamicImportError(
      new TypeError(
        'Failed to fetch dynamically imported module: https://crm.nexorarealtyos.com/assets/SettingsPage-ADsLnpic.js'
      )
    ),
    true
  )
})

test('recognizes common browser and webpack chunk errors', () => {
  assert.equal(isDynamicImportError(new Error('Importing a module script failed.')), true)
  assert.equal(isDynamicImportError(new Error('Loading chunk 42 failed.')), true)
})

test('does not treat ordinary request failures as deployment chunk errors', () => {
  assert.equal(isDynamicImportError(new Error('Request failed with status code 500')), false)
})

test('automatically reloads only once for the same failed chunk', () => {
  const originalWindow = globalThis.window
  const originalSessionStorage = globalThis.sessionStorage
  const values = new Map()
  let reloadCount = 0

  globalThis.window = {
    location: {
      pathname: '/settings',
      search: '',
      reload: () => {
        reloadCount += 1
      },
    },
  }
  globalThis.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }

  try {
    const error = new Error(
      'Failed to fetch dynamically imported module: https://crm.nexorarealtyos.com/assets/SettingsPage-old.js'
    )

    assert.equal(attemptChunkRecovery(error), true)
    assert.equal(attemptChunkRecovery(error), false)
    assert.equal(reloadCount, 1)
  } finally {
    globalThis.window = originalWindow
    globalThis.sessionStorage = originalSessionStorage
  }
})
