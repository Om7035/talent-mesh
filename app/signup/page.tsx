'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, CheckCircle, GraduationCap, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface College {
  id: string
  name: string
  city?: string | null
}

export default function SignupPage() {
  const [role, setRole] = useState<'student' | 'client' | 'recruiter' | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', collegeId: '', phone: '' })
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    if (role === 'student' && colleges.length === 0) {
      apiClient('/colleges')
        .then((data) => setColleges(data))
        .catch(() => setColleges([]))
    }
  }, [role, colleges.length])

  const roles = [
    { id: 'student', title: 'Student', description: 'Find freelance projects and build your portfolio', icon: '👨‍🎓' },
    { id: 'client', title: 'Client', description: 'Hire verified student talent for your projects', icon: '🏢' },
    { id: 'recruiter', title: 'Recruiter', description: 'Discover pre-vetted talent for hiring', icon: '🎯' },
  ]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role?.toUpperCase(),
      }
      if (role === 'student') {
        payload.collegeId = formData.collegeId
        payload.phone = formData.phone
      }
      const data = await apiClient('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      login(data.accessToken, data.refreshToken, data.user)
      const userRole = data.user.role.toLowerCase()
      router.push(`/dashboard/${userRole}`)
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/[0.05] via-background to-background pt-20 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-[600px] px-4"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12 relative z-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Join TalentMesh</h1>
            <p className="text-sm text-foreground/60">Start your journey in the talent marketplace</p>
          </motion.div>

          {/* Role Selection */}
          {!role ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              {roles.map((r) => (
                <motion.button
                  key={r.id}
                  variants={itemVariants}
                  onClick={() => setRole(r.id as 'student' | 'client' | 'recruiter')}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left group shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform relative z-10">{r.icon}</div>
                  <h3 className="text-base font-semibold text-foreground mb-1 relative z-10">{r.title}</h3>
                  <p className="text-xs text-foreground/60 relative z-10">{r.description}</p>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-10 mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden max-w-[450px] mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              
              {/* Role Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-xl font-bold text-foreground">
                  Sign up as {role.charAt(0).toUpperCase() + role.slice(1)}
                </h2>
                <button
                  onClick={() => setRole(null)}
                  className="text-xs text-foreground/50 hover:text-foreground transition-colors"
                >
                  Change role
                </button>
              </div>

              <form onSubmit={handleSignup} className="space-y-6 relative z-10">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                    {error}
                  </div>
                )}
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <label htmlFor="name" className="block text-xs font-medium text-foreground/70 mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
                      required
                    />
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  <label htmlFor="email" className="block text-xs font-medium text-foreground/70 mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
                      required
                    />
                  </div>
                </motion.div>

                {/* College (Student only) */}
                {role === 'student' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.18, duration: 0.4 }}
                  >
                    <label htmlFor="collegeId" className="block text-xs font-medium text-foreground/70 mb-2 uppercase tracking-wider">
                      College
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40 z-10" />
                      <select
                        id="collegeId"
                        value={formData.collegeId}
                        onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all appearance-none"
                        required
                      >
                        <option value="" disabled className="text-black">
                          Select your college
                        </option>
                        {colleges.map((college) => (
                          <option key={college.id} value={college.id} className="text-black">
                            {college.name}{college.city ? ` — ${college.city}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Phone (Student only) */}
                {role === 'student' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.19, duration: 0.4 }}
                  >
                    <label htmlFor="phone" className="block text-xs font-medium text-foreground/70 mb-2 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label htmlFor="password" className="block text-xs font-medium text-foreground/70 mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
                      required
                    />
                  </div>
                </motion.div>

                {/* Terms & Conditions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <label className="flex items-start gap-2 text-xs text-foreground/60 cursor-pointer">
                    <input type="checkbox" className="rounded mt-0.5" required />
                    <span>
                      I agree to the{' '}
                      <Link href="#" className="text-foreground hover:text-white transition-colors underline underline-offset-2">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" className="text-foreground hover:text-white transition-colors underline underline-offset-2">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-white text-black font-semibold text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-6 text-center text-sm text-foreground/50 relative z-10"
              >
                Already have an account?{' '}
                <Link href="/login" className="text-foreground hover:text-white font-medium transition-colors">
                  Sign in
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
          >
            {[
              { title: 'Verified Talent', icon: '✓' },
              { title: 'Real Projects', icon: '📋' },
              { title: 'Fair Pricing', icon: '💰' },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} className="text-center bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className="text-xs text-foreground/60">{feature.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </>
  )
}
