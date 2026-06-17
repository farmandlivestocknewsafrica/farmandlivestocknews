'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = 'Enter password',
  required = false,
  disabled = false,
  className = '',
  'aria-label': ariaLabel
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`w-full px-4 py-2 pr-12 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
