import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, CloudUpload, Film, Star, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import Input from '@/components/ui/Input'

export default function Step4Media({
  files,
  onChange,
  form,
  onFormChange,
  allowMediaUpload = true,
  existingMedia = [],
  onDeleteExisting,
  deletingExistingId,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [mediaError, setMediaError] = useState('')

  function addFiles(incoming) {
    const selected = Array.from(incoming)
    const valid = selected.filter((file) => (
      ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(file.type)
      && file.size <= 15 * 1024 * 1024
    ))
    setMediaError(
      valid.length === selected.length
        ? ''
        : 'Use JPEG, PNG, WebP, or MP4 files no larger than 15 MB each.'
    )
    onChange([...files, ...valid])
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index))
  }

  // Moving an image to index 0 makes it the property cover.
  function makePrimary(index) {
    if (!files[index]?.type.startsWith('image/')) return
    const reordered = [...files]
    const [picked]  = reordered.splice(index, 1)
    onChange([picked, ...reordered])
  }

  function moveFile(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= files.length) return
    const reordered = [...files]
    const [picked] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, picked)
    onChange(reordered)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">

      {allowMediaUpload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed',
            'p-10 cursor-pointer transition-all duration-150 text-center select-none',
            dragging
              ? 'border-[#496B5A] bg-[#eef3f0]'
              : 'border-[#DDE5E3] bg-[#F8FAFA] hover:border-[#B8C9C5] hover:bg-white'
          )}
        >
          <div className="h-14 w-14 rounded-2xl bg-[#eef3f0] flex items-center justify-center">
            <CloudUpload size={28} className="text-[#496B5A]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#263238]">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs text-[#8b969d]">
              JPEG, PNG, WebP, or MP4 — max 15 MB each
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-2 rounded-lg bg-white border border-[#DDE5E3] text-sm font-medium text-[#496B5A] hover:bg-[#eef3f0] transition-colors"
          >
            Select Files
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4"
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
          />
        </div>
      )}

      {mediaError && <p className="text-xs font-medium text-red-600">{mediaError}</p>}

      {existingMedia.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-[#637079]">
            Existing property media ({existingMedia.length})
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {existingMedia.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl border border-[#DDE5E3] bg-[#EEF2F2]">
                {item.media_type === 'video' || item.media_type === 'reel' ? (
                  <video src={item.file || item.external_url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={item.card_image || item.thumbnail || item.file} alt={item.alt_text || item.title || 'Property media'} className="h-full w-full object-cover" />
                )}
                {item.is_primary && (
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-[#496B5A] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <Star size={9} fill="currentColor" /> Primary
                  </span>
                )}
                {(item.media_type === 'video' || item.media_type === 'reel') && (
                  <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <Film size={10} /> Video
                  </span>
                )}
                {onDeleteExisting && (
                  <button
                    type="button"
                    onClick={() => onDeleteExisting(item)}
                    disabled={String(deletingExistingId) === String(item.id)}
                    title="Delete saved media"
                    aria-label={`Delete ${item.title || 'saved media'}`}
                    className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-500 opacity-100 shadow-sm transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                  >
                    {String(deletingExistingId) === String(item.id)
                      ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                      : <X size={14} />}
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#8b969d]">
            Delete saved items from their thumbnail. Newly selected files are appended when you save.
          </p>
        </div>
      )}

      {/* Pro tip — only when empty */}
      {allowMediaUpload && files.length === 0 && (
        <div className="flex gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3.5">
          <span className="text-amber-500 shrink-0 mt-0.5">💡</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Pro Tip:</span> High-quality photos can increase leads
            by up to 40%. Ensure images are well-lit and cover the living room, kitchen, bedrooms,
            and exterior.
          </p>
        </div>
      )}

      {/* Preview grid */}
      {allowMediaUpload && files.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#637079] mb-2">
            {files.length} file{files.length > 1 ? 's' : ''} selected
            &nbsp;·&nbsp; First image is the property cover
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {files.map((file, i) => (
              <PreviewTile
                key={i}
                file={file}
                index={i}
                total={files.length}
                isPrimary={file.type.startsWith('image/') && i === files.findIndex((item) => item.type.startsWith('image/'))}
                onRemove={removeFile}
                onMakePrimary={makePrimary}
                onMove={moveFile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Virtual tour URL — maps to virtual_tour_url in API */}
      <div className="pt-2 border-t border-[#DDE5E3]">
        <Input
          label="Virtual Tour URL"
          type="url"
          placeholder="https://yourtour.example.com/..."
          value={form.virtual_tour_url}
          onChange={(e) => onFormChange('virtual_tour_url', e.target.value)}
          hint="Optional — link to a 360° tour or video walkthrough"
        />
      </div>
      <Input
        label="Video Tour URL"
        type="url"
        placeholder="https://youtube.com/..."
        value={form.video_tour_url}
        onChange={(e) => onFormChange('video_tour_url', e.target.value)}
        hint="Optional hosted walkthrough or presentation video"
      />
    </div>
  )
}

function PreviewTile({ file, index, total, isPrimary, onRemove, onMakePrimary, onMove }) {
  const isVideo = file.type.startsWith('video/')
  const url = useMemo(() => URL.createObjectURL(file), [file])

  useEffect(() => () => URL.revokeObjectURL(url), [url])

  return (
    <div className="group relative rounded-xl overflow-hidden border border-[#DDE5E3] aspect-square bg-[#EEF2F2]">
      {isVideo ? (
        <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
      ) : (
        <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
      )}

      {isPrimary && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#496B5A] text-white rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
          <Star size={9} fill="currentColor" /> Primary
        </div>
      )}

      {isVideo && (
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          <Film size={10} /> Video
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
          title="Move left"
          className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-[#496B5A] hover:bg-white disabled:opacity-40"
        >
          <ChevronLeft size={13} />
        </button>
        {!isVideo && !isPrimary && (
          <button
            type="button"
            onClick={() => onMakePrimary(index)}
            title="Set as primary"
            className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-[#496B5A] hover:bg-white transition-colors"
          >
            <Star size={13} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onMove(index, index + 1)}
          disabled={index === total - 1}
          title="Move right"
          className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-[#496B5A] hover:bg-white disabled:opacity-40"
        >
          <ChevronRight size={13} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          title="Remove"
          className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
