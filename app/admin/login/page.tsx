'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FormEvent, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PasswordInput } from '@/components/password-input'
import { Loader2, ShieldCheck, LogIn } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')
  const [loadState, setLoadState] = useState<'idle' | 'verifying' | 'authenticating' | 'redirecting'>('idle')

  useEffect(() => {
    // Check for success message from setup
    if (searchParams.get('setup') === 'success') {
      setSuccess('Admin account created! Please sign in with your credentials.')
    }

    // Check if setup is needed
    async function checkSetup() {
      try {
        const response = await fetch('/api/admin/check-setup')
        const data = await response.json()
        
        if (data.needsSetup) {
          router.push('/admin/setup')
          return
        }
      } catch (err) {
        console.error('[v0] Setup check failed:', err)
      } finally {
        setCheckingSetup(false)
      }
    }
    
    checkSetup()
  }, [router, searchParams])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)
    setLoadState('verifying')
    setStatusMessage('Validating your credentials...')

    // Simulate a brief delay so users see the validation step
    await new Promise(resolve => setTimeout(resolve, 800))

    setLoadState('authenticating')
    setStatusMessage('Authenticating your account...')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setLoadState('idle')
        setStatusMessage('')
        setError(data.message || 'Login failed. Please try again.')
        setIsLoading(false)
        return
      }

      setLoadState('redirecting')
      setStatusMessage('Redirecting to dashboard...')

      // Give user a moment to see the redirect message
      await new Promise(resolve => setTimeout(resolve, 600))

      // Redirect based on whether credentials need to be changed
      const redirectParam = searchParams.get('redirect')
      const redirectTo =
        data.redirectTo ||
        (redirectParam && redirectParam.startsWith('/') ? redirectParam : null) ||
        '/admin/dashboard'

      window.dispatchEvent(new Event('auth:change'))
      window.location.href = redirectTo
    } catch (err) {
      setLoadState('idle')
      setStatusMessage('')
      setError('An error occurred. Please try again.')
      console.error(err)
      setIsLoading(false)
    }
  }

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-[#2d5016] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2d5016]/70 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#2d5016]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e8a04a]/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo with fade-in animation */}
        <div className="mb-8 text-center animate-fade-in-down">
          <Link href="/" className="inline-block group">
            <Image 
              src="/logo.png" 
              alt="Farm & Livestock News Africa" 
              width={250} 
              height={100}
              className="h-24 w-auto mx-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>
        </div>

        {/* Login Card with fade-in animation */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-8 shadow-xl shadow-black/5 animate-fade-in-up">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#2d5016]/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-[#2d5016]" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-[#2d5016] mb-1">Admin Login</h1>
          <p className="text-gray-500 mb-6 text-sm">Sign in to access the admin dashboard</p>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl animate-scale-in">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl animate-scale-in">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in-up-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/30 focus:border-[#2d5016] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="animate-fade-in-up-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Animated status message */}
            {isLoading && (
              <div className="animate-fade-in-up-3 p-4 bg-[#2d5016]/5 rounded-xl border border-[#2d5016]/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Loader2 className="w-5 h-5 text-[#2d5016] animate-spin" />
                    <div className="absolute inset-0 w-5 h-5 rounded-full bg-[#2d5016]/10 animate-ping" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#2d5016]">
                      {statusMessage}
                    </p>
                    {/* Progress dots */}
                    <div className="flex gap-1 mt-2">
                      <div className={`w-2 h-2 rounded-full transition-all duration-500 ${loadState === 'verifying' || loadState === 'authenticating' || loadState === 'redirecting' ? 'bg-[#2d5016]' : 'bg-gray-200'}`} />
                      <div className={`w-2 h-2 rounded-full transition-all duration-500 ${loadState === 'authenticating' || loadState === 'redirecting' ? 'bg-[#2d5016]' : 'bg-gray-200'}`} />
                      <div className={`w-2 h-2 rounded-full transition-all duration-500 ${loadState === 'redirecting' ? 'bg-[#2d5016]' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#2d5016] text-white font-semibold rounded-xl hover:bg-[#3a6b1e] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2 animate-fade-in-up-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadState === 'verifying' ? 'Verifying...' : loadState === 'authenticating' ? 'Authenticating...' : 'Redirecting...'}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in-up-4">
            <p className="text-sm text-gray-500 text-center mb-2">
              Need admin access?
            </p>
            <p className="text-xs text-gray-400 text-center mb-4">
              Contact system administrator at +260 974 399 695
            </p>
            <Link href="/admin/forgot-password" className="text-xs text-[#2d5016] hover:text-[#3a6b1e] transition-colors block text-center hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="mt-6 text-center animate-fade-in-up-5">
            <Link href="/" className="text-sm text-gray-500 hover:text-[#2d5016] transition-colors inline-flex items-center gap-1 group">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <div className="w-12 h-12 border-4 border-[#2d5016] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#2d5016]/70 font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}