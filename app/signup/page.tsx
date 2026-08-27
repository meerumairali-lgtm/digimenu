'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import Navbar from '@/app/components/Navbar'

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupClient />
    </Suspense>
  )
}

function SignupClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })
if (error || !data.user) {
  setError(error?.message || 'Something went wrong. Please try again.')
  setLoading(false)
  return
}

if (typeof window !== 'undefined' && (window as any).gtag) {
  (window as any).gtag('event', 'sign_up', { method: 'email' })
}

if (data.session) {
  router.push('/dashboard/setup')
} else {
  setConfirmationSent(true)
  setLoading(false)
}
  }

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ colorScheme: 'light' }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
            <p className="text-gray-500 text-sm">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then log in to get started.
            </p>
            <Link href="/login" className="inline-block mt-6 text-sky-500 font-medium hover:underline text-sm">
              Go to login
            </Link>
          </div>
        </main>
        <footer className="border-t border-gray-100 px-6 py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Menuberg. All rights reserved.
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ colorScheme: 'light' }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Start your Menuberg account today
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-400 hover:bg-sky-500 text-[#0D1B2A] font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm mt-1"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-sky-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-100 px-6 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Menuberg. All rights reserved.
      </footer>
    </div>
  )
}