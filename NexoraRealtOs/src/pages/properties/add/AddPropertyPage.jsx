import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCreateProperty } from '@/hooks/useCreateProperty'
import Button from '@/components/ui/Button'

import Step1BasicInfo    from './steps/Step1BasicInfo'
import Step2Location     from './steps/Step2Location'
import Step3Details      from './steps/Step3Details'
import Step4Media        from './steps/Step4Media'
import Step5Description  from './steps/Step5Description'
import Step6Publish      from './steps/Step6Publish'

// ── Step definitions ──────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info',        short: 'Basic Info' },
  { id: 2, label: 'Location',          short: 'Location' },
  { id: 3, label: 'Property Details',  short: 'Details' },
  { id: 4, label: 'Media Assets',      short: 'Media' },
  { id: 5, label: 'Description',       short: 'Description' },
  { id: 6, label: 'Publish',           short: 'Publish' },
]

const INITIAL_FORM = {
  // Step 1
  title: '', property_type: 'house', purpose: 'sale', price: '', province: '',
  // Step 2
  district: '', city: '', address: '', neighbourhood: '',
  // Step 3
  bedrooms: 1, bathrooms: 1, floors: 1, land_area: '', built_up_area: '', road_access: '', features: [],
  // Step 5
  summary: '', description: '',
  // Step 6
  status: 'draft', assigned_agent: null, is_public: true, featured: false,
}

// ── Per-step field validators ─────────────────────────────────
function validateStep(step, form) {
  const e = {}
  if (step === 1) {
    if (!form.title.trim())        e.title         = 'Title is required'
    if (!form.property_type)       e.property_type = 'Select a property type'
    if (!form.purpose)             e.purpose       = 'Select a purpose'
    if (!form.price)               e.price         = 'Price is required'
    if (isNaN(Number(form.price))) e.price         = 'Price must be a number'
    if (!form.province.trim())     e.province      = 'Province is required'
  }
  if (step === 2) {
    if (!form.district) e.district = 'Select a district'
    if (!form.city.trim())    e.city    = 'City is required'
    if (!form.address.trim()) e.address = 'Address is required'
  }
  return e
}

export default function AddPropertyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [mediaFiles, setMediaFiles] = useState([])
  const [errors, setErrors] = useState({})

  const { mutate: createProperty, isPending } = useCreateProperty({
    onSuccess: () => navigate('/properties'),
  })

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function goNext() {
    const stepErrors = validateStep(step, form)
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  function goBack() {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  function handleSaveDraft() {
    submit('draft')
  }

  function handlePublish() {
    // Final validation across key fields before submitting
    const e1 = validateStep(1, form)
    const e2 = validateStep(2, form)
    const allErrors = { ...e1, ...e2 }
    if (Object.keys(allErrors).length) {
      setErrors(allErrors)
      setStep(Object.keys(e1).length ? 1 : 2)
      return
    }
    submit(form.status === 'draft' ? 'active' : form.status)
  }

  function submit(status) {
    // Build the payload exactly matching the API shape
    const propertyPayload = {
      title:          form.title.trim(),
      property_type:  form.property_type,
      purpose:        form.purpose,
      price:          String(form.price),
      province:       form.province.trim(),
      district:       form.district,
      city:           form.city.trim(),
      address:        form.address.trim(),
      bedrooms:       form.bedrooms,
      bathrooms:      form.bathrooms,
      description:    form.description.trim(),
      status,
      assigned_agent: form.assigned_agent ?? null,
    }

    createProperty({ propertyPayload, mediaFiles })
  }

  const stepProps = { form, errors, onChange }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">Add New Property</h2>
          <p className="mt-1 text-sm text-[#637079]">
            Create a high-impact listing for your agency in minutes
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outlined"
            size="md"
            onClick={handleSaveDraft}
            loading={isPending}
            disabled={isPending}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handlePublish}
            loading={isPending}
            disabled={isPending}
          >
            Publish &amp; Save
          </Button>
        </div>
      </div>

      {/* ── Stepper layout ───────────────────────────────────── */}
      <div className="flex gap-6">

        {/* Left: vertical step nav */}
        <aside className="hidden sm:flex flex-col gap-1 w-44 shrink-0 pt-1">
          {STEPS.map((s) => {
            const done    = s.id < step
            const current = s.id === step
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { setErrors({}); setStep(s.id) }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                  current ? 'bg-[#eef3f0]' : 'hover:bg-[#F8FAFA]'
                )}
              >
                {/* Step circle */}
                <span className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  done    ? 'bg-[#496B5A] text-white' :
                  current ? 'bg-[#496B5A] text-white ring-4 ring-[#496B5A]/20' :
                            'bg-[#EEF2F2] text-[#8b969d]'
                )}>
                  {done ? <Check size={13} /> : s.id}
                </span>
                <span className={cn(
                  'text-xs font-medium leading-tight',
                  current ? 'text-[#496B5A]' : done ? 'text-[#263238]' : 'text-[#8b969d]'
                )}>
                  {s.label}
                </span>
              </button>
            )
          })}
        </aside>

        {/* Right: step content */}
        <div className="flex-1 min-w-0">

          {/* Mobile step indicator */}
          <div className="sm:hidden flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  s.id === step ? 'flex-1 bg-[#496B5A]' :
                  s.id < step   ? 'w-6 bg-[#8FAF9B]' : 'w-6 bg-[#DDE5E3]'
                )}
              />
            ))}
          </div>

          {/* Step card */}
          <div className="bg-white rounded-2xl border border-[#DDE5E3] shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]">
            <div className="px-6 pt-6 pb-3 border-b border-[#DDE5E3]">
              <h3 className="text-base font-bold text-[#263238]">
                Step {step}: {STEPS[step - 1].label}
              </h3>
            </div>

            <div className="p-6">
              {step === 1 && <Step1BasicInfo   {...stepProps} />}
              {step === 2 && <Step2Location    {...stepProps} />}
              {step === 3 && <Step3Details     {...stepProps} />}
              {step === 4 && <Step4Media files={mediaFiles} onChange={setMediaFiles} />}
              {step === 5 && <Step5Description {...stepProps} />}
              {step === 6 && <Step6Publish     {...stepProps} />}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 pb-6 pt-2">
              <Button
                variant="ghost"
                size="md"
                leftIcon={<ChevronLeft size={15} />}
                onClick={goBack}
                disabled={step === 1 || isPending}
              >
                Back
              </Button>

              {step < STEPS.length ? (
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ChevronRight size={15} />}
                  onClick={goNext}
                >
                  Continue
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="md"
                    onClick={handleSaveDraft}
                    loading={isPending}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handlePublish}
                    loading={isPending}
                  >
                    Publish &amp; Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
