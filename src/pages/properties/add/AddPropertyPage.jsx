import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCreateProperty } from '@/hooks/useCreateProperty'
import Button from '@/components/ui/Button'
import { INITIAL_FORM, validateStep, buildPropertyPayload } from '../propertyFormUtils'
import { useResource } from '@/hooks/useOperations'
import { retryPropertyMediaFailures } from '@/services/propertyService'

import Step1BasicInfo   from './steps/Step1BasicInfo'
import Step2Location    from './steps/Step2Location'
import Step3Details     from './steps/Step3Details'
import Step4Media       from './steps/Step4Media'
import Step5Description from './steps/Step5Description'
import Step6Publish     from './steps/Step6Publish'

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Property Details' },
  { id: 4, label: 'Media Assets' },
  { id: 5, label: 'Description' },
  { id: 6, label: 'Publish' },
]

export default function AddPropertyPage() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(1)
  const [form, setForm]           = useState(INITIAL_FORM)
  const [mediaFiles, setMediaFiles] = useState([])
  const [errors, setErrors]       = useState({})
  const [mediaRecovery, setMediaRecovery] = useState(null)
  const [isRetryingMedia, setIsRetryingMedia] = useState(false)
  const customFields = useResource('custom-fields', { module: 'property' })

  const { mutate: createProperty, isPending } = useCreateProperty({
    onSuccess: (property) => {
      if (property.media_upload_failures?.length) {
        setMediaRecovery({ property, failures: property.media_upload_failures })
      } else {
        navigate(`/properties/${property.id}`)
      }
    },
  })

  async function retryMedia() {
    setIsRetryingMedia(true)
    try {
      const result = await retryPropertyMediaFailures(mediaRecovery.property.id, mediaRecovery.failures)
      if (result.failures.length) {
        setMediaRecovery((current) => ({ ...current, failures: result.failures }))
      } else {
        navigate(`/properties/${mediaRecovery.property.id}`)
      }
    } finally {
      setIsRetryingMedia(false)
    }
  }

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function goNext() {
    const stepErrors = validateStep(step, form)
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return }
    setErrors({})
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  function goBack() {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  function submit(status) {
    const e1 = validateStep(1, form)
    const e2 = validateStep(2, form)
    const all = { ...e1, ...e2 }
    if (Object.keys(all).length) {
      setErrors(all)
      setStep(Object.keys(e1).length ? 1 : 2)
      return
    }
    const submissionForm = status ? { ...form, status } : form
    createProperty({ propertyPayload: buildPropertyPayload(submissionForm), mediaFiles })
  }

  const stepProps = { form, errors, onChange, customFields: customFields.data || [] }

  if (mediaRecovery) return (
    <div className="mx-auto max-w-2xl space-y-5 py-8">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={22} />
          <div>
            <h2 className="text-xl font-bold text-[#263238]">Property saved; some media needs attention</h2>
            <p className="mt-2 text-sm leading-6 text-[#637079]">The listing is safe and was not duplicated. Retry the failed files now, or open its media library and repair them later.</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[#DDE5E3] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#263238]">Failed uploads ({mediaRecovery.failures.length})</h3>
        <ul className="mt-3 space-y-2">
          {mediaRecovery.failures.map((failure) => (
            <li key={`${failure.file.name}-${failure.index}`} className="rounded-lg bg-[#F8FAFA] p-3 text-sm">
              <p className="font-medium text-[#263238]">{failure.file.name}</p>
              <p className="mt-1 text-xs text-red-600">{failure.message}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button leftIcon={<RefreshCw size={15} />} onClick={retryMedia} loading={isRetryingMedia}>Retry failed uploads</Button>
          <Button variant="outlined" onClick={() => navigate(`/properties/${mediaRecovery.property.id}`)} disabled={isRetryingMedia}>Open media library</Button>
          <Button variant="ghost" onClick={() => navigate('/properties')} disabled={isRetryingMedia}>Finish without media</Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">Add New Property</h2>
          <p className="mt-1 text-sm text-[#637079]">
            Create a high-impact listing for your agency in minutes
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outlined" size="md" onClick={() => submit('draft')} loading={isPending} disabled={isPending}>
            Save as Draft
          </Button>
          <Button variant="primary" size="md" onClick={() => submit('available')} loading={isPending} disabled={isPending}>
            Publish &amp; Save
          </Button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex gap-6">
        {/* Vertical stepper */}
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

        {/* Step content */}
        <div className="flex-1 min-w-0">
          {/* Mobile progress */}
          <div className="sm:hidden flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar">
            {STEPS.map((s) => (
              <div key={s.id} className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                s.id === step ? 'flex-1 bg-[#496B5A]' :
                s.id < step   ? 'w-6 bg-[#8FAF9B]' : 'w-6 bg-[#DDE5E3]'
              )} />
            ))}
          </div>

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
              {step === 4 && <Step4Media       files={mediaFiles} onChange={setMediaFiles} form={form} onFormChange={onChange} />}
              {step === 5 && <Step5Description {...stepProps} />}
              {step === 6 && <Step6Publish     {...stepProps} />}
            </div>

            <div className="flex items-center justify-between px-6 pb-6 pt-2">
              <Button
                variant="ghost" size="md"
                leftIcon={<ChevronLeft size={15} />}
                onClick={goBack}
                disabled={step === 1 || isPending}
              >
                Back
              </Button>

              {step < STEPS.length ? (
                <Button variant="primary" size="md" rightIcon={<ChevronRight size={15} />} onClick={goNext}>
                  Continue
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outlined" size="md" onClick={() => submit('draft')} loading={isPending}>
                    Save Draft
                  </Button>
                  <Button variant="primary" size="md" onClick={() => submit('available')} loading={isPending}>
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
