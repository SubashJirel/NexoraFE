import { useRef, useState } from 'react'
import { X, ImagePlus, Trash2} from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import { useCreateSocialPost } from '@/hooks/useCreateSocialPost'

// ── helpers ───────────────────────────────────────────────────

function platformLabel(platform) {
  const map = { facebook: 'Facebook', instagram: 'Instagram' }
  return map[platform?.toLowerCase()] ?? platform
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

// ── image drop zone ───────────────────────────────────────────

function ImageDropZone({ file, onFile, onClear }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) onFile(f)
  }

  function handleChange(e) {
    const f = e.target.files?.[0]
    if (f) onFile(f)
    // reset so same file can be re-selected
    e.target.value = ''
  }

  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#263238]">Image</span>

      {file ? (
        <div className="relative rounded-xl overflow-hidden border border-[#DDE5E3] bg-[#F8FAFA]">
          <img
            src={preview}
            alt="preview"
            className="w-full max-h-64 object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Remove image"
          >
            <Trash2 size={13} />
          </button>
          <div className="px-3 py-2 bg-white border-t border-[#DDE5E3]">
            <p className="text-xs text-[#637079] truncate">{file.name}</p>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
            'py-10 cursor-pointer transition-colors duration-150',
            dragging
              ? 'border-[#496B5A] bg-[#eef3f0]'
              : 'border-[#DDE5E3] bg-[#F8FAFA] hover:border-[#B8C9C5] hover:bg-[#f0f4f2]'
          )}
        >
          <ImagePlus size={28} className="text-[#8b969d]" />
          <p className="text-sm text-[#637079]">
            <span className="font-semibold text-[#496B5A]">Click to upload</span> or drag &amp; drop
          </p>
          <p className="text-xs text-[#8b969d]">PNG, JPG, WEBP up to 10 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

// ── modal ─────────────────────────────────────────────────────

/**
 * CreatePostModal
 *
 * @param {boolean}  open          - controls visibility
 * @param {function} onClose       - called when modal should close
 * @param {Array}    connections   - list of connected social accounts
 */
export default function CreatePostModal({ open, onClose, connections = [] }) {
  const [accountId, setAccountId] = useState('')
  const [caption, setCaption] = useState('')
  const [status, setStatus] = useState('draft')
  const [image, setImage] = useState(null)

  const { mutate: createPost, isPending } = useCreateSocialPost({
    onSuccess: () => handleClose(),
  })

  const selectedAccount = connections.find((c) => String(c.id) === String(accountId))
  const captionMax = 2200
  const captionLength = caption.length

  function handleClose() {
    if (isPending) return
    setAccountId('')
    setCaption('')
    setStatus('draft')
    setImage(null)
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!accountId) return

    createPost({
      social_account: Number(accountId),
      platform: selectedAccount?.platform ?? 'facebook',
      caption,
      status,
      image: image ?? undefined,
    })
  }

  if (!open) return null

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
          <h3 className="text-base font-bold text-[#263238]">Create Post</h3>
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
          id="create-post-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* account selector */}
          <Select
            label="Account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            <option value="" disabled>Select a connected account</option>
            {connections.map((c) => (
              <option key={c.id} value={c.id}>
                {platformLabel(c.platform)} — {c.name || c.username || `#${c.id}`}
              </option>
            ))}
          </Select>

          {/* selected account badge */}
          {selectedAccount && (
            <div className="flex items-center gap-2 rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] px-3 py-2">
              <span className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-white text-xs shrink-0',
                selectedAccount.platform?.toLowerCase() === 'instagram' ? 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]' : 'bg-[#1877F2]'
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

          {/* image upload */}
          <ImageDropZone
            file={image}
            onFile={setImage}
            onClear={() => setImage(null)}
          />

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
        </form>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DDE5E3]">
          <Button
            variant="ghost"
            size="md"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-post-form"
            variant="primary"
            size="md"
            loading={isPending}
            disabled={!accountId}
          >
            {status === 'draft' ? 'Save Draft' : 'Schedule Post'}
          </Button>
        </div>
      </div>
    </div>
  )
}
