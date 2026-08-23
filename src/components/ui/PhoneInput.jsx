import { useState } from 'react'

import Input from '@/components/ui/Input'
import { NEPAL_PHONE_ERROR, NEPAL_PHONE_PATTERN, isValidNepalPhone, nepalPhoneNationalDigits, toNepalPhoneValue } from '@/utils/phone'

export default function PhoneInput({ value = '', onChange, onBlur, hint, error, ...props }) {
  const [touched, setTouched] = useState(false)
  const validationError = touched && value && !isValidNepalPhone(value) ? NEPAL_PHONE_ERROR : ''

  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      leftAddon={<span className="text-xs font-semibold">+977</span>}
      className="pl-14"
      value={nepalPhoneNationalDigits(value)}
      onChange={(event) => onChange?.(toNepalPhoneValue(event.target.value))}
      onBlur={(event) => {
        setTouched(true)
        onBlur?.(event)
      }}
      pattern={NEPAL_PHONE_PATTERN}
      title={NEPAL_PHONE_ERROR}
      placeholder={props.placeholder || '98XXXXXXXX'}
      hint={hint || '10 digits · starts with 97, 98, or 01'}
      error={error || validationError}
    />
  )
}
