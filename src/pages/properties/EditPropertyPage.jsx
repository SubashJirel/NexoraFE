import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useProperty } from '@/hooks/useProperties'
import { useUpdateProperty } from '@/hooks/useUpdateProperty'
import { useDeletePropertyMedia } from '@/hooks/useDeletePropertyMedia'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'

import Step1BasicInfo from './add/steps/Step1BasicInfo'
import Step2Location from './add/steps/Step2Location'
import Step3Details from './add/steps/Step3Details'
import Step4Media from './add/steps/Step4Media'
import Step5Description from './add/steps/Step5Description'
import Step6Publish from './add/steps/Step6Publish'
import { INITIAL_FORM, validateStep, buildPropertyPayload, propertyToForm } from './propertyFormUtils'
import { useResource } from '@/hooks/useOperations'

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Property Details' },
  { id: 4, label: 'Media Assets' },
  { id: 5, label: 'Description' },
  { id: 6, label: 'Publish' },
]

export default function EditPropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: property, isLoading, isError } = useProperty(id)
  const customFields = useResource('custom-fields', { module: 'property' })

  const [step, setStep] = useState(1)
  const [formState, setForm] = useState(null)
  const [mediaFiles, setMediaFiles] = useState([])
  const [errors, setErrors] = useState({})
  const form = property ? (formState ?? propertyToForm(property)) : INITIAL_FORM

  const { mutate: updateProperty, isPending } = useUpdateProperty(id, {
    onSuccess: () => navigate(`/properties/${id}`),
  })
  const deleteMedia = useDeletePropertyMedia(id)

  function deleteExistingMedia(item) {
    const description = item.media_type === 'video' || item.media_type === 'reel'
      ? 'this saved video'
      : 'this saved image'
    if (window.confirm(`Delete ${description}? This removes it from the property immediately.`)) {
      deleteMedia.mutate(item.id)
    }
  }

  function onChange(field, value) {
    setForm((current) => ({ ...(current ?? propertyToForm(property)), [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }))
  }

  function goNext() {
    const stepErrors = validateStep(step, form)
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((current) => Math.min(current + 1, STEPS.length))
  }

  function goBack() {
    setErrors({})
    setStep((current) => Math.max(current - 1, 1))
  }

  function submit() {
    const e1 = validateStep(1, form)
    const e2 = validateStep(2, form)
    const all = { ...e1, ...e2 }
    if (Object.keys(all).length) {
      setErrors(all)
      setStep(Object.keys(e1).length ? 1 : 2)
      return
    }

    updateProperty({ propertyPayload: buildPropertyPayload(form), mediaFiles })
  }

  const stepProps = { form, errors, onChange, customFields: customFields.data || [] }

  if (isLoading) return <PageSpinner />

  if (isError || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-base font-semibold text-[#263238]">Failed to load property</p>
        <p className="text-sm text-[#637079]">The record may be unavailable or the server is unreachable.</p>
        <Button variant="outlined" size="sm" onClick={() => navigate('/properties')}>
          Back to properties
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="outlined" size="sm" onClick={() => navigate(`/properties/${id}`)} leftIcon={<ChevronLeft size={15} />}>
            Back to Details
          </Button>
          <h2 className="mt-4 text-2xl font-bold text-[#263238]">Edit Property</h2>
          <p className="mt-1 text-sm text-[#637079]">Update the details for {property.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outlined" size="md" onClick={() => navigate(`/properties/${id}`)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={submit} loading={isPending} disabled={isPending}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden sm:flex flex-col gap-1 w-44 shrink-0 pt-1">
          {STEPS.map((s) => {
            const done = s.id < step
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
                  done ? 'bg-[#496B5A] text-white' :
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

        <div className="flex-1 min-w-0">
          <div className="sm:hidden flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  s.id === step ? 'flex-1 bg-[#496B5A]' :
                  s.id < step ? 'w-6 bg-[#8FAF9B]' : 'w-6 bg-[#DDE5E3]'
                )}
              />
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE5E3] shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]">
            <div className="px-6 pt-6 pb-3 border-b border-[#DDE5E3]">
              <h3 className="text-base font-bold text-[#263238]">
                Step {step}: {STEPS[step - 1].label}
              </h3>
            </div>

            <div className="p-6">
              {step === 1 && <Step1BasicInfo {...stepProps} />}
              {step === 2 && <Step2Location {...stepProps} />}
              {step === 3 && <Step3Details {...stepProps} />}
              {step === 4 && (
                <Step4Media
                  files={mediaFiles}
                  onChange={setMediaFiles}
                  existingMedia={property.media || []}
                  onDeleteExisting={deleteExistingMedia}
                  deletingExistingId={deleteMedia.isPending ? deleteMedia.variables : null}
                  form={form}
                  onFormChange={onChange}
                />
              )}
              {step === 5 && <Step5Description {...stepProps} />}
              {step === 6 && <Step6Publish {...stepProps} />}
            </div>

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
                  disabled={isPending}
                >
                  Continue
                </Button>
              ) : (
                <Button variant="primary" size="md" onClick={submit} loading={isPending} disabled={isPending}>
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
