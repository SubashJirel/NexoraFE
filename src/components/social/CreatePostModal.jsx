import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Film, ImagePlus, Trash2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { useCreateSocialPost, useUpdateSocialPost } from '@/hooks/useCreateSocialPost'

// ── helpers ───────────────────────────────────────────────────

function platformLabel(platform) {
  const map = { facebook: 'Facebook', instagram: 'Instagram' }
  return map[platform?.toLowerCase()] ?? platform
}

function toLocalDateTimeValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

const MAX_POST_IMAGES = 5
const MIN_IMAGE_WIDTH = 320
const MIN_ASPECT_RATIO = 0.8
const MAX_ASPECT_RATIO = 1.91
const MAX_REEL_SOURCE_BYTES = 250 * 1024 * 1024
const MIN_REEL_DURATION = 4
const MAX_REEL_DURATION = 60
const REEL_RATIO_TOLERANCE = 0.03

function initialMediaItems(post) {
  if (Array.isArray(post?.media) && post.media.length > 0) {
    return post.media.map((item) => ({
      key: `existing-${item.id}`,
      kind: 'existing',
      id: item.id,
      preview: item.image,
      name: `Image ${item.position + 1}`,
    }))
  }
  if (post?.image) {
    return [{
      key: 'legacy-0',
      kind: 'legacy',
      preview: post.image,
      name: 'Current image',
    }]
  }
  return []
}

function inspectImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error(`${file.name} is not an image.`))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error(`${file.name} exceeds the 10 MB image limit.`))
      return
    }

    const preview = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const ratio = image.naturalWidth / image.naturalHeight
      if (image.naturalWidth < MIN_IMAGE_WIDTH) {
        URL.revokeObjectURL(preview)
        reject(new Error(`${file.name} must be at least ${MIN_IMAGE_WIDTH}px wide.`))
      } else if (ratio < MIN_ASPECT_RATIO || ratio > MAX_ASPECT_RATIO) {
        URL.revokeObjectURL(preview)
        reject(new Error(`${file.name} must be between 4:5 and 1.91:1.`))
      } else {
        resolve({ preview, width: image.naturalWidth, height: image.naturalHeight })
      }
    }
    image.onerror = () => {
      URL.revokeObjectURL(preview)
      reject(new Error(`${file.name} could not be read as an image.`))
    }
    image.src = preview
  })
}

function inspectReel(file) {
  return new Promise((resolve, reject) => {
    const extensionAllowed = /\.(mp4|mov|m4v)$/i.test(file.name)
    if (!extensionAllowed || (file.type && !file.type.startsWith('video/'))) {
      reject(new Error('Upload an MP4, MOV, or M4V video.'))
      return
    }
    if (file.size > MAX_REEL_SOURCE_BYTES) {
      reject(new Error('The source video cannot exceed 250 MB.'))
      return
    }
    const preview = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const { duration, videoWidth: width, videoHeight: height } = video
      const ratio = width / height
      if (duration < MIN_REEL_DURATION || duration > MAX_REEL_DURATION) {
        URL.revokeObjectURL(preview)
        reject(new Error('A Reel must be between 4 and 60 seconds long.'))
      } else if (width < 540 || height < 960) {
        URL.revokeObjectURL(preview)
        reject(new Error('A Reel must be at least 540x960 pixels.'))
      } else if (Math.abs(ratio - (9 / 16)) > REEL_RATIO_TOLERANCE) {
        URL.revokeObjectURL(preview)
        reject(new Error(`A Reel must be vertical 9:16. This video is ${width}x${height}.`))
      } else {
        resolve({ preview, duration, width, height })
      }
    }
    video.onerror = () => {
      URL.revokeObjectURL(preview)
      reject(new Error('The selected video could not be read.'))
    }
    video.src = preview
  })
}

function PlatformIcon({ platform, size = 16 }) {
  if (platform?.toLowerCase() === 'instagram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

// ── ordered image gallery ─────────────────────────────────────

/**
 * ImageGalleryField
 * The first item is the carousel cover; the remaining items are child slides.
 */
function ImageGalleryField({ items, error, isValidating, onFiles, onMove, onRemove }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    onFiles(Array.from(e.dataTransfer.files ?? []))
  }

  function handleChange(e) {
    onFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const canAddMore = items.length < MAX_POST_IMAGES

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#263238]">Images</span>
        <span className="text-xs text-[#8b969d]">{items.length} / {MAX_POST_IMAGES}</span>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.key} className="overflow-hidden rounded-xl border border-[#DDE5E3] bg-[#F8FAFA]">
              <div className="relative aspect-square">
                <img src={item.preview} alt={`Post image ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#496B5A] px-2 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(item.key)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-[#DDE5E3] bg-white px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => onMove(index, index - 1)}
                  disabled={index === 0}
                  className="rounded p-1 text-[#637079] hover:bg-[#EEF2F2] disabled:opacity-25"
                  aria-label={`Move image ${index + 1} left`}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="min-w-0 truncate text-[11px] text-[#637079]">{item.name}</span>
                <button
                  type="button"
                  onClick={() => onMove(index, index + 1)}
                  disabled={index === items.length - 1}
                  className="rounded p-1 text-[#637079] hover:bg-[#EEF2F2] disabled:opacity-25"
                  aria-label={`Move image ${index + 1} right`}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 transition-colors duration-150',
            dragging
              ? 'border-[#496B5A] bg-[#eef3f0]'
              : 'border-[#DDE5E3] bg-[#F8FAFA] hover:border-[#B8C9C5] hover:bg-[#f0f4f2]'
          )}
        >
          <ImagePlus size={25} className="text-[#8b969d]" />
          <p className="text-sm text-[#637079]">
            <span className="font-semibold text-[#496B5A]">Choose images</span> or drag &amp; drop
          </p>
          <p className="text-center text-xs text-[#8b969d]">
            Up to 5 images · 4:5 to 1.91:1 · 10 MB each
          </p>
          {isValidating && <p className="text-xs font-medium text-[#496B5A]">Checking images…</p>}
        </div>
      )}

      {items.length > 1 && (
        <p className="text-xs text-[#637079]">
          The cover is shown first. The other images are slides in the same carousel post.
        </p>
      )}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

function ReelField({ item, error, isValidating, onFile, onRemove }) {
  const inputRef = useRef(null)
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#263238]">Reel video</span>
      {item ? (
        <div className="overflow-hidden rounded-xl border border-[#DDE5E3] bg-black">
          <div className="relative mx-auto aspect-[9/16] max-h-[360px] w-auto max-w-full">
            <video src={item.preview} controls playsInline preload="metadata" className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
              aria-label="Remove Reel video"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2 text-xs text-[#637079]">
            <span className="min-w-0 truncate">{item.name}</span>
            <span>{item.duration ? `${Math.round(item.duration)} sec` : 'Compressed Reel'}</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DDE5E3] bg-[#F8FAFA] py-8 hover:border-[#B8C9C5] hover:bg-[#f0f4f2]"
        >
          <Upload size={25} className="text-[#8b969d]" />
          <span className="text-sm font-semibold text-[#496B5A]">Choose Reel video</span>
          <span className="px-4 text-center text-xs text-[#8b969d]">
            MP4/MOV · vertical 9:16 · 4–60 sec · stored output compressed to 15 MB or less
          </span>
        </button>
      )}
      {isValidating && <p className="text-xs font-medium text-[#496B5A]">Checking video…</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <p className="text-xs text-[#637079]">
        Nexora converts the upload to 720x1280 H.264 before saving it. Processing can take a moment.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/x-m4v,.mp4,.mov,.m4v"
        className="hidden"
        onChange={(event) => {
          onFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}

// ── modal ─────────────────────────────────────────────────────

/**
 * CreatePostModal — handles both create and edit modes.
 *
 * Create mode:  pass `connections` + leave `post` undefined
 * Edit mode:    pass `post` (existing post object); `connections` not needed
 *
 * @param {boolean}  open        - controls visibility
 * @param {function} onClose     - called when modal should close
 * @param {Array}    connections - connected social accounts (create mode)
 * @param {Object}   [post]      - existing post to edit (edit mode)
 */
export default function CreatePostModal(props) {
  if (!props.open) return null
  return <PostFormModal key={props.post?.id ?? 'new-post'} {...props} />
}

function PostFormModal({ onClose, connections = [], post }) {
  const isEditMode = Boolean(post)

  // ── form state ──────────────────────────────────────────────
  const [accountId, setAccountId] = useState(() => String(post?.social_account ?? ''))
  const [targetPlatforms, setTargetPlatforms] = useState(() => (
    post?.target_platforms?.length ? post.target_platforms : post?.platform ? [post.platform] : []
  ))
  const [caption, setCaption] = useState(() => post?.caption ?? '')
  const [status, setStatus] = useState(() => post?.status ?? 'draft')
  const [scheduledAt, setScheduledAt] = useState(() => toLocalDateTimeValue(post?.scheduled_at))
  const [postFormat, setPostFormat] = useState(() => post?.post_format ?? (post?.video ? 'reel' : 'image'))
  const [mediaItems, setMediaItems] = useState(() => initialMediaItems(post))
  const [videoItem, setVideoItem] = useState(() => post?.video ? ({
    kind: 'existing',
    preview: post.video,
    name: 'Current Reel',
    duration: post.video_duration_seconds,
  }) : null)
  const [mediaError, setMediaError] = useState('')
  const [isValidatingMedia, setIsValidatingMedia] = useState(false)

  // ── mutations ───────────────────────────────────────────────
  const { mutate: createPost, isPending: isCreating } = useCreateSocialPost({
    onSuccess: () => handleClose(),
  })
  const { mutate: updatePost, isPending: isUpdating } = useUpdateSocialPost({
    onSuccess: () => handleClose(),
  })

  const isPending = isCreating || isUpdating

  // ── derived ─────────────────────────────────────────────────
  const selectedAccount = connections.find((c) => String(c.id) === String(accountId))
  const linkedAccounts = selectedAccount
    ? connections.filter((account) => (
        account.status === 'connected' &&
        account.page_id &&
        account.page_id === selectedAccount.page_id
      ))
    : []
  const availablePlatforms = [...new Set(
    (linkedAccounts.length ? linkedAccounts : selectedAccount ? [selectedAccount] : [])
      .map((account) => account.platform)
      .filter(Boolean)
  )]
  const captionMax    = 2200
  const captionLength = caption.length

  // ── handlers ────────────────────────────────────────────────
  function handleClose() {
    if (isPending) return
    mediaItems.forEach((item) => {
      if (item.kind === 'new') URL.revokeObjectURL(item.preview)
    })
    if (videoItem?.kind === 'new') URL.revokeObjectURL(videoItem.preview)
    onClose()
  }

  function handleFormatChange(nextFormat) {
    if (isEditMode || nextFormat === postFormat) return
    mediaItems.forEach((item) => {
      if (item.kind === 'new') URL.revokeObjectURL(item.preview)
    })
    if (videoItem?.kind === 'new') URL.revokeObjectURL(videoItem.preview)
    setMediaItems([])
    setVideoItem(null)
    setMediaError('')
    setPostFormat(nextFormat)
  }

  async function handleFiles(files) {
    if (!files.length) return
    setMediaError('')
    const availableSlots = MAX_POST_IMAGES - mediaItems.length
    if (files.length > availableSlots) {
      setMediaError(`You can add ${availableSlots} more image${availableSlots === 1 ? '' : 's'}.`)
      return
    }

    setIsValidatingMedia(true)
    try {
      const results = await Promise.allSettled(files.map(async (file, index) => ({
        file,
        ...(await inspectImage(file)),
        key: `new-${Date.now()}-${index}`,
        kind: 'new',
        name: file.name,
      })))
      const failed = results.find((result) => result.status === 'rejected')
      if (failed) {
        results.forEach((result) => {
          if (result.status === 'fulfilled') URL.revokeObjectURL(result.value.preview)
        })
        throw failed.reason
      }
      const inspected = results.map((result) => result.value)
      setMediaItems((current) => [...current, ...inspected])
    } catch (error) {
      setMediaError(error.message || 'One of the selected images is invalid.')
    } finally {
      setIsValidatingMedia(false)
    }
  }

  function handleRemoveMedia(key) {
    setMediaItems((current) => {
      const removed = current.find((item) => item.key === key)
      if (removed?.kind === 'new') URL.revokeObjectURL(removed.preview)
      return current.filter((item) => item.key !== key)
    })
    setMediaError('')
  }

  function handleMoveMedia(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= mediaItems.length) return
    setMediaItems((current) => {
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  async function handleVideoFile(file) {
    if (!file) return
    setMediaError('')
    setIsValidatingMedia(true)
    try {
      const inspected = await inspectReel(file)
      if (videoItem?.kind === 'new') URL.revokeObjectURL(videoItem.preview)
      setVideoItem({ ...inspected, file, kind: 'new', name: file.name })
    } catch (error) {
      setMediaError(error.message || 'The selected Reel video is invalid.')
    } finally {
      setIsValidatingMedia(false)
    }
  }

  function handleRemoveVideo() {
    if (videoItem?.kind === 'new') URL.revokeObjectURL(videoItem.preview)
    setVideoItem(null)
    setMediaError('')
  }

  function handleAccountChange(event) {
    const nextAccountId = event.target.value
    const nextAccount = connections.find((account) => String(account.id) === nextAccountId)
    const nextPlatforms = nextAccount
      ? [...new Set(connections
          .filter((account) => (
            account.status === 'connected' &&
            account.page_id &&
            account.page_id === nextAccount.page_id
          ))
          .map((account) => account.platform))]
      : []
    setAccountId(nextAccountId)
    setTargetPlatforms(nextPlatforms.length ? nextPlatforms : nextAccount ? [nextAccount.platform] : [])
  }

  function toggleTargetPlatform(platform) {
    setTargetPlatforms((current) => (
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    ))
  }

  function buildMediaPayload() {
    if (postFormat === 'reel') {
      return {
        post_format: 'reel',
        ...(videoItem?.kind === 'new' ? { video: videoItem.file } : {}),
      }
    }
    const images = mediaItems
      .filter((item) => item.kind === 'new')
      .map((item) => item.file)
    const newIndexes = new Map()
    mediaItems
      .filter((item) => item.kind === 'new')
      .forEach((item, index) => newIndexes.set(item.key, index))
    const media_order = mediaItems.map((item) => {
      if (item.kind === 'existing') return `existing:${item.id}`
      if (item.kind === 'legacy') return 'legacy:0'
      return `new:${newIndexes.get(item.key)}`
    })
    return { post_format: 'image', images, media_order }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (isValidatingMedia || mediaError) return
    if (!targetPlatforms.length) return
    if (postFormat === 'reel' && !videoItem) {
      setMediaError('Upload a Reel video before saving.')
      return
    }
    if (postFormat === 'image' && targetPlatforms.includes('instagram')) {
      if (mediaItems.length === 0) {
        setMediaError('Instagram publishing requires at least one JPEG image.')
        return
      }
      const invalidInstagramImage = mediaItems.find((item) => {
        if (item.kind === 'new') return item.file?.type !== 'image/jpeg'
        return item.preview && !/\.jpe?g(?:$|\?)/i.test(item.preview)
      })
      if (invalidInstagramImage) {
        setMediaError('Instagram publishing requires JPEG images. Remove or replace the non-JPEG image.')
        return
      }
    }
    const mediaPayload = buildMediaPayload()

    if (isEditMode) {
      if (status === 'scheduled' && !scheduledAt) return
      updatePost({
        id: post.id,
        caption,
        status,
        target_platforms: targetPlatforms,
        scheduled_at: status === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
        ...mediaPayload,
      })
    } else {
      if (!accountId) return
      if (status === 'scheduled' && !scheduledAt) return
      createPost({
        social_account: Number(accountId),
        platform: selectedAccount?.platform ?? 'facebook',
        target_platforms: targetPlatforms,
        caption,
        status,
        scheduled_at: status === 'scheduled' ? new Date(scheduledAt).toISOString() : undefined,
        ...mediaPayload,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE5E3]">
          <h3 className="text-base font-bold text-[#263238]">
            {isEditMode ? `Edit ${postFormat === 'reel' ? 'Reel' : 'Post'}` : 'Create Social Content'}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#637079] hover:bg-[#EEF2F2] hover:text-[#263238] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <form
          id="post-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* account selector — create mode only */}
          {!isEditMode && (
            <>
              <Select
                label="Account"
                value={accountId}
                onChange={handleAccountChange}
                required
              >
                <option value="" disabled>Select a connected account</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {platformLabel(c.platform)} — {c.name || c.username || `#${c.id}`}
                  </option>
                ))}
              </Select>

              {selectedAccount && (
                <div className="flex items-center gap-2 rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] px-3 py-2">
                  <span className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-white text-xs shrink-0',
                    selectedAccount.platform?.toLowerCase() === 'instagram'
                      ? 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]'
                      : 'bg-[#1877F2]'
                  )}>
                    <PlatformIcon platform={selectedAccount.platform} size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#263238] truncate">{selectedAccount.name}</p>
                    {selectedAccount.username && (
                      <p className="text-[11px] text-[#637079]">@{selectedAccount.username}</p>
                    )}
                  </div>
                  <span className="ml-auto inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    Connected
                  </span>
                </div>
              )}

              {selectedAccount && availablePlatforms.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#263238]">Publish targets</span>
                  <div className="flex flex-wrap gap-2">
                    {availablePlatforms.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => toggleTargetPlatform(platform)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold capitalize',
                          targetPlatforms.includes(platform)
                            ? 'border-[#496B5A] bg-[#eef3f0] text-[#496B5A]'
                            : 'border-[#DDE5E3] bg-white text-[#637079]'
                        )}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                  {availablePlatforms.length > 1 && (
                    <p className="text-xs text-[#637079]">
                      Facebook and Instagram will publish from this linked Page at the same time.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* edit mode — show platform badge (read-only) */}
          {isEditMode && post?.platform && (
            <div className="flex items-center gap-2 rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] px-3 py-2">
              <span className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-white text-xs shrink-0',
                post.platform?.toLowerCase() === 'instagram'
                  ? 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]'
                  : 'bg-[#1877F2]'
              )}>
                <PlatformIcon platform={post.platform} size={13} />
              </span>
              <p className="text-xs font-semibold text-[#263238] capitalize">{post.platform}</p>
              <span className="ml-auto text-[11px] text-[#8b969d]">Platform cannot be changed</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#263238]">Content type</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFormatChange('image')}
                disabled={isEditMode}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold',
                  postFormat === 'image' ? 'border-[#496B5A] bg-[#eef3f0] text-[#496B5A]' : 'border-[#DDE5E3] text-[#637079]',
                  isEditMode && 'cursor-default'
                )}
              >
                <ImagePlus size={16} /> Images
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange('reel')}
                disabled={isEditMode}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold',
                  postFormat === 'reel' ? 'border-[#496B5A] bg-[#eef3f0] text-[#496B5A]' : 'border-[#DDE5E3] text-[#637079]',
                  isEditMode && 'cursor-default'
                )}
              >
                <Film size={16} /> Reel
              </button>
            </div>
          </div>

          {postFormat === 'reel' ? (
            <ReelField
              item={videoItem}
              error={mediaError}
              isValidating={isValidatingMedia}
              onFile={handleVideoFile}
              onRemove={handleRemoveVideo}
            />
          ) : (
            <ImageGalleryField
              items={mediaItems}
              error={mediaError}
              isValidating={isValidatingMedia}
              onFiles={handleFiles}
              onMove={handleMoveMedia}
              onRemove={handleRemoveMedia}
            />
          )}

          {/* caption */}
          <div className="flex flex-col gap-1.5">
            <Textarea
              label="Caption"
              placeholder="Write your post caption…"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={captionMax}
            />
            <p className={cn(
              'text-right text-xs',
              captionLength > captionMax * 0.9 ? 'text-amber-500' : 'text-[#8b969d]'
            )}>
              {captionLength} / {captionMax}
            </p>
          </div>

          {/* status */}
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft — save without publishing</option>
            <option value="scheduled">Scheduled — publish later</option>
          </Select>

          {status === 'scheduled' && (
            <Input
              label="Publish date and time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              min={toLocalDateTimeValue(new Date())}
              required
            />
          )}
        </form>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DDE5E3]">
          <Button variant="ghost" size="md" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="post-form"
            variant="primary"
            size="md"
            loading={isPending}
            disabled={(!isEditMode && !accountId) || !targetPlatforms.length || isValidatingMedia || Boolean(mediaError)}
          >
            {isEditMode
              ? 'Save Changes'
              : status === 'draft' ? 'Save Draft' : 'Schedule Post'}
          </Button>
        </div>
      </div>
    </div>
  )
}
