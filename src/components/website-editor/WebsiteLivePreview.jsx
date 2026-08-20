import { useCallback, useEffect, useRef, useState } from 'react'
import { Expand, Monitor, RefreshCw, Smartphone, Tablet, X } from 'lucide-react'

import Button from '@/components/ui/Button'
import { PREVIEW_DEVICES, PREVIEW_MESSAGES, configuredPreviewOrigin, configuredPreviewUrl } from './previewProtocol'

const DEVICE_ICONS = { desktop: Monitor, tablet: Tablet, mobile: Smartphone }

const PREVIEW = (() => {
  try {
    const url = configuredPreviewUrl()
    return { url, origin: configuredPreviewOrigin(url), error: '' }
  } catch (error) {
    return { url: '', origin: '', error: error.message }
  }
})()

export default function WebsiteLivePreview({
  payload,
  activeSection,
  scrollRequest,
  device,
  onDeviceChange,
  onSectionSelect,
}) {
  const iframeRef = useRef(null)
  const readyRef = useRef(false)
  const payloadRef = useRef(payload)
  const activeSectionRef = useRef(activeSection)
  const [frameKey, setFrameKey] = useState(0)
  const [status, setStatus] = useState(PREVIEW.error ? 'error' : 'loading')
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState(PREVIEW.error)
  const preview = PREVIEW

  const send = useCallback((message) => {
    if (!preview.origin || !iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(message, preview.origin)
  }, [preview.origin])

  useEffect(() => { payloadRef.current = payload }, [payload])
  useEffect(() => { activeSectionRef.current = activeSection }, [activeSection])

  useEffect(() => {
    if (preview.error) {
      return undefined
    }
    const receive = (event) => {
      if (event.origin !== preview.origin || event.source !== iframeRef.current?.contentWindow) return
      if (!event.data || typeof event.data !== 'object') return
      if (event.data.type === PREVIEW_MESSAGES.READY) {
        readyRef.current = true
        setStatus('ready')
        setError('')
        send({ type: PREVIEW_MESSAGES.CONFIG, payload: payloadRef.current })
        if (activeSectionRef.current) {
          window.setTimeout(() => send({
            type: PREVIEW_MESSAGES.SCROLL_TO,
            payload: { section: activeSectionRef.current },
          }), 80)
        }
      }
      if (event.data.type === PREVIEW_MESSAGES.SECTION_CLICK && typeof event.data.payload?.section === 'string') {
        onSectionSelect?.(event.data.payload.section)
      }
    }
    window.addEventListener('message', receive)
    const timeout = window.setTimeout(() => {
      if (!readyRef.current) {
        setStatus('error')
        setError('The website preview did not respond. Make sure NexoraTemplate is running and its allowed CRM origin is configured.')
      }
    }, 12000)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('message', receive)
    }
  }, [frameKey, onSectionSelect, preview.error, preview.origin, send])

  useEffect(() => {
    if (!readyRef.current) return
    send({ type: PREVIEW_MESSAGES.CONFIG, payload })
  }, [payload, send])

  useEffect(() => {
    if (!readyRef.current || !activeSection) return
    send({ type: PREVIEW_MESSAGES.SCROLL_TO, payload: { section: activeSection } })
  }, [activeSection, scrollRequest, send])

  function retry() {
    readyRef.current = false
    setStatus('loading')
    setError('')
    setFrameKey((value) => value + 1)
  }

  const panelClass = expanded
    ? 'fixed inset-3 z-[100] flex flex-col overflow-hidden rounded-2xl border border-[#CBD7D2] bg-[#E9EFEC] shadow-2xl'
    : 'flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#CBD7D2] bg-[#E9EFEC]'

  return (
    <section className={panelClass} aria-label="Live website preview">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-[#CBD7D2] bg-white px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-[#263238]">Live website</p>
          <p className="text-[11px] text-[#637079]">Unsaved changes appear instantly</p>
        </div>
        <div className="flex items-center gap-1">
          {Object.entries(PREVIEW_DEVICES).map(([key, item]) => {
            const Icon = DEVICE_ICONS[key]
            return <button key={key} type="button" title={item.label} aria-label={`${item.label} preview`} aria-pressed={device === key} onClick={() => onDeviceChange(key)} className={`grid size-8 place-items-center rounded-md ${device === key ? 'bg-[#496B5A] text-white' : 'text-[#637079] hover:bg-[#EEF2F2]'}`}><Icon size={15} /></button>
          })}
          <button type="button" title={expanded ? 'Close expanded preview' : 'Expand preview'} aria-label={expanded ? 'Close expanded preview' : 'Expand preview'} onClick={() => setExpanded((value) => !value)} className="ml-1 grid size-8 place-items-center rounded-md text-[#637079] hover:bg-[#EEF2F2]">{expanded ? <X size={16} /> : <Expand size={16} />}</button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-4">
        {status !== 'ready' && <div className="absolute inset-4 z-10 grid place-items-center rounded-xl bg-white/95 text-center"><div className="max-w-sm px-6">{status === 'error' ? <><p className="font-semibold text-[#263238]">Preview unavailable</p><p className="mt-2 text-sm leading-6 text-[#637079]">{error}</p><Button className="mt-4" size="sm" variant="outlined" leftIcon={<RefreshCw size={14} />} onClick={retry}>Retry preview</Button></> : <><div className="mx-auto h-9 w-9 animate-pulse rounded-full bg-[#D8E3DE]" /><p className="mt-3 text-sm font-medium text-[#637079]">Loading the real website…</p></>}</div></div>}
        {preview.url && <iframe
          key={frameKey}
          ref={iframeRef}
          title="Live agency website preview"
          src={preview.url}
          sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          onLoad={() => { if (!readyRef.current) setStatus('loading') }}
          className="mx-auto block h-full min-h-[640px] rounded-lg bg-white transition-[width] duration-200"
          style={{ width: PREVIEW_DEVICES[device]?.width || '100%', maxWidth: '100%' }}
        />}
      </div>
    </section>
  )
}
