import { useRef, useState } from 'react'
import { CloudUpload, X, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import Input from '@/components/ui/Input'

export default function Step4Media({ files, onChange, form, onFormChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function addFiles(incoming) {
    const valid = Array.from(incoming).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    onChange([...files, ...valid])
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index))
  }

  // Moving picked file to index 0 makes it the primary
  function makePrimary(index) {
    const reordered = [...files]
    const [picked]  = reordered.splice(index, 1)
    onChange([picked, ...reordered])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">

      {/* Drop zone */}
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
            JPG, PNG, WEBP, MP4 — max 10 MB each
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
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Pro tip — only when empty */}
      {files.length === 0 && (
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
      {files.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#637079] mb-2">
            {files.length} file{files.length > 1 ? 's' : ''} selected
            &nbsp;·&nbsp; First image is set as primary
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {files.map((file, i) => (
              <PreviewTile
                key={i}
                file={file}
                index={i}
                isPrimary={i === 0}
                onRemove={removeFile}
                onMakePrimary={makePrimary}
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
    </div>
  )
}

function PreviewTile({ file, index, isPrimary, onRemove, onMakePrimary }) {
  const isVideo = file.type.startsWith('video/')
  const url     = URL.createObjectURL(file)

  return (
    <div className="group relative rounded-xl overflow-hidden border border-[#DDE5E3] aspect-square bg-[#EEF2F2]">
      {isVideo ? (
        <video src={url} className="h-full w-full object-cover" />
      ) : (
        <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
      )}

      {isPrimary && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#496B5A] text-white rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
          <Star size={9} fill="currentColor" /> Primary
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {!isPrimary && (
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
