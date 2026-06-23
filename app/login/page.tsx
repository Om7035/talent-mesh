'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      // Update global auth state — navbar updates instantly
      login(data.accessToken, data.refreshToken, data.user)
      const role = data.user.role.toLowerCase()
      router.push(`/dashboard/${role}`)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/[0.05] via-background to-background pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] px-4"
        >
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            <div className="text-center mb-8 relative z-10">
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Welcome Back</h1>
              <p className="text-sm text-foreground/60">Sign in to your TalentMesh account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                  {error}
                </div>
              )}
              {/* Email */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <label htmlFor="email" className="block text-xs font-medium text-foreground/70 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
                    required
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="relative z-10"
              >
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-medium text-foreground/70 uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-foreground/50 hover:text-foreground transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
                    required
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-white text-black font-semibold text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-6 text-center text-sm text-muted-foreground"
            >
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-accent hover:text-accent-hover font-semibold transition-colors">
                Sign up
              </Link>
            </motion.div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/50 text-gray-400">Or continue as</span>
              </div>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Student', email: 'sarah@mit.edu', pwd: 'Password123!' },
                { label: 'Client', email: 'alex@techcorp.com', pwd: 'Password123!' },
                { label: 'Recruiter', email: 'recruiter@google.com', pwd: 'Password123!' },
              ].map((role) => (
                <button
                  key={role.label}
                  type="button"
                  onClick={() => {
                    setEmail(role.email)
                    setPassword(role.pwd)
                  }}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-foreground transition-colors text-xs font-medium z-10 relative"
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-center text-xs text-gray-500 mt-8"
          >
            Click a role button above to auto-fill demo credentials.
          </motion.p>
        </motion.div>
      </main>
    </>
  )
}
