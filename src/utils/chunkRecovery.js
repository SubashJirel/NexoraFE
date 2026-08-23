const RECOVERY_STORAGE_KEY = 'nexora:chunk-recovery'
const RECOVERY_WINDOW_MS = 60_000

const DYNAMIC_IMPORT_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /failed to load module script/i,
  /loading chunk [\w-]+ failed/i,
  /chunkloaderror/i,
]

function getErrorMessage(error) {
  if (typeof error === 'string') return error
  return error?.message || error?.reason?.message || ''
}

export function isDynamicImportError(error) {
  const message = getErrorMessage(error)
  return DYNAMIC_IMPORT_PATTERNS.some((pattern) => pattern.test(message))
}

function getRecoverySignature(error) {
  const message = getErrorMessage(error)
  const assetUrl = message.match(/https?:\/\/\S+|\/assets\/\S+/i)?.[0]
  return assetUrl || `${window.location.pathname}${window.location.search}`
}

/**
 * Reload once for a failed deployment chunk. The session guard ensures a real
 * outage cannot trap the browser in a refresh loop.
 */
export function attemptChunkRecovery(error, { force = false } = {}) {
  if (typeof window === 'undefined' || (!force && !isDynamicImportError(error))) {
    return false
  }

  const signature = getRecoverySignature(error)
  const now = Date.now()

  try {
    const previous = JSON.parse(sessionStorage.getItem(RECOVERY_STORAGE_KEY) || 'null')
    const recentlyRetried =
      previous?.signature === signature && now - previous.timestamp < RECOVERY_WINDOW_MS

    if (recentlyRetried) return false

    sessionStorage.setItem(
      RECOVERY_STORAGE_KEY,
      JSON.stringify({ signature, timestamp: now })
    )
  } catch {
    // If storage is unavailable, leave recovery to the visible reload button
    // rather than risking an unbounded automatic refresh loop.
    return false
  }

  window.location.reload()
  return true
}

let installed = false

export function installChunkRecovery() {
  if (installed || typeof window === 'undefined') return
  installed = true

  window.addEventListener('vite:preloadError', (event) => {
    const recoveryStarted = attemptChunkRecovery(event.payload, { force: true })
    if (recoveryStarted) event.preventDefault()
  })
}
