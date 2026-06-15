'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { PasswordInput } from '@/components/password-input'

export default function AdminRegister() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  function checkPasswordStrength(pwd: string) {
    const errors: string[] = []
    if (pwd.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(pwd)) errors.push('Uppercase letter')
    if (!/[a-z]/.test(pwd)) errors.push('Lowercase letter')
    if (!/\d/.test(pwd)) errors.push('Number')
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) errors.push('Special character')
    setPasswordErrors(errors)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (passwordErrors.length > 0) {
        setError('Password does not meet strength requirements')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/admin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.')
        return
      }

      setSuccess('Admin account created successfully! Redirecting to login...')
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Image 
              src="/logo.png" 
              alt="Farm & Livestock News Africa" 
              width={250} 
              height={100}
              className="h-24 w-auto mx-auto"
              priority
            />
          </Link>
        </div>

        {/* Registration Card */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-primary mb-2">Create Admin Account</h1>
          <p className="text-muted-foreground mb-6 text-sm">Set up your first administrator account</p>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 text-green-600 text-sm rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(value) => {
                  setPassword(value)
                  checkPasswordStrength(value)
                }}
                placeholder="Create a strong password"
                required
              />
              {passwordErrors.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-500/10 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium mb-1">Password must include:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {passwordErrors.map((error) => (
                      <li key={error}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || passwordErrors.length > 0}
              className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-green-primary transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
            <Link href="/admin/login" className="text-sm text-primary hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
