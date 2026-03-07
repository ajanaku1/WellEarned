import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const { login, loginWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      const code = err.code
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else {
        setError('Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try {
      const result = await loginWithGoogle()
      // Send first-time Google users to onboarding
      const isNewUser = result?.user?.metadata?.creationTime === result?.user?.metadata?.lastSignInTime
      navigate(isNewUser ? '/onboarding' : from, { replace: true })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(`Google sign-in failed: ${err.code || err.message}`)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/WellEarnedLogo.png" alt="WellEarned" className="w-16 h-16 rounded-xl mx-auto mb-4 shadow-md" />
          <h1 className="text-2xl font-bold gradient-text">WellEarned</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Sign in to continue.</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-colors"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => { setShowReset(true); setResetEmail(email) }} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium min-h-[44px]">
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {showReset && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Reset Password</h3>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent"
              />
              {resetMsg && (
                <p className={`text-sm ${resetMsg.includes('sent') ? 'text-emerald-600' : 'text-red-500'}`}>{resetMsg}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setShowReset(false); setResetMsg('') }} className="btn-secondary flex-1 text-sm py-2">
                  Cancel
                </button>
                <button
                  disabled={resetLoading || !resetEmail.trim()}
                  onClick={async () => {
                    setResetLoading(true)
                    setResetMsg('')
                    try {
                      await resetPassword(resetEmail.trim())
                      setResetMsg('Reset email sent! Check your inbox.')
                    } catch (err) {
                      if (err.code === 'auth/user-not-found') {
                        setResetMsg('No account found with this email.')
                      } else {
                        setResetMsg('Failed to send reset email. Try again.')
                      }
                    } finally {
                      setResetLoading(false)
                    }
                  }}
                  className="btn-primary flex-1 text-sm py-2"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">or continue with</span>
            </div>
          </div>

          <button onClick={handleGoogle} className="btn-secondary w-full flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-emerald-600 font-medium hover:text-emerald-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
