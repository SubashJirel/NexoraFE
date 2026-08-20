export const PREVIEW_MESSAGES = Object.freeze({
  READY: 'NEXORA_PREVIEW_READY',
  CONFIG: 'NEXORA_PREVIEW_CONFIG',
  SCROLL_TO: 'NEXORA_PREVIEW_SCROLL_TO',
  SECTION_CLICK: 'NEXORA_PREVIEW_SECTION_CLICK',
})

export const PREVIEW_DEVICES = Object.freeze({
  desktop: { label: 'Desktop', width: '100%' },
  tablet: { label: 'Tablet', width: '768px' },
  mobile: { label: 'Mobile', width: '390px' },
})

export function configuredPreviewUrl() {
  const configured = import.meta.env.VITE_WEBSITE_PREVIEW_URL || 'http://localhost:5174/?preview=1'
  const url = new URL(configured, window.location.href)
  url.searchParams.set('preview', '1')
  return url.toString()
}

export function configuredPreviewOrigin(url) {
  const derived = new URL(url).origin
  const configured = import.meta.env.VITE_WEBSITE_PREVIEW_ORIGIN?.replace(/\/$/, '')
  if (configured && configured !== derived) {
    throw new Error('The configured website preview origin does not match the preview URL.')
  }
  return configured || derived
}
