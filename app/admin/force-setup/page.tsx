'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { PasswordInput } from '@/components/password-input'

export default function ForceSetup() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [passwordForEmail, setPasswordForEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'password' | 'email' | 'complete'>('password')

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters')
        setIsLoading(false)
        return
      }

      if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        setError('Password must contain uppercase, lowercase, and number')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/admin/force-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to change password')
        setIsLoading(false)
        return
      }

      setStep('email')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (newEmail !== confirmEmail) {
        setError('Emails do not match')
        setIsLoading(false)
        return
      }

      if (!newEmail.includes('@')) {
        setError('Invalid email format')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/admin/force-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-email', newEmail, password: passwordForEmail })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to change email')
        setIsLoading(false)
        return
      }

      setStep('complete')
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 3000)
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

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-serif font-bold text-primary mb-2 text-center">
            Initial Setup Required
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Please update your credentials before accessing the admin panel.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {step === 'complete' ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <p className="font-semibold mb-2">Setup Complete!</p>
              <p>Your credentials have been updated successfully. Redirecting to login...</p>
            </div>
          ) : step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                  Current Password
                </label>
                <PasswordInput
                  id="currentPassword"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-green-light transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Continue to Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="newEmail" className="block text-sm font-medium text-foreground mb-2">
                  New Email Address
                </label>
                <input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="confirmEmail" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Email Address
                </label>
                <input
                  id="confirmEmail"
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Re-enter email"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="passwordForEmail" className="block text-sm font-medium text-foreground mb-2">
                  Verify Password
                </label>
                <PasswordInput
                  id="passwordForEmail"
                  value={passwordForEmail}
                  onChange={setPasswordForEmail}
                  placeholder="Enter your new password to confirm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-green-light transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Completing Setup...' : 'Complete Setup'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
