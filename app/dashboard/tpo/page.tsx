'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Award, IndianRupee, Trophy, Loader2, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'
import Link from 'next/link'

const TIER_COLORS: Record<string, string> = {
  BEGINNER: '#94a3b8',
  RISING_TALENT: '#3b82f6',
  PROFESSIONAL: '#8b5cf6',
  ELITE: '#f59e0b',
}
const VERIFICATION_COLORS: Record<string, string> = {
  VERIFIED: '#10b981',
  PENDING: '#f59e0b',
  REJECTED: '#ef4444',
  MANUAL_REVIEW: '#3b82f6',
}

export default function TPODashboard() {
  const { user } = useRequireAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!user) return
    Promise.all([
      apiClient('/tpo/analytics'),
      apiClient('/tpo/students?limit=100'),
      apiClient('/tpo/verifications/pending'),
    ])
      .then(([analyticsRes, studentsRes, pendingRes]) => {
        setAnalytics(analyticsRes)
        setStudents(studentsRes?.students || [])
        setPendingCount(Array.isArray(pendingRes) ? pendingRes.length : 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const tierCounts = students.reduce((acc: Record<string, number>, s: any) => {
    acc[s.clusterTier] = (acc[s.clusterTier] || 0) + 1
    return acc
  }, {})
  const tierData = Object.entries(tierCounts).map(([name, value]) => ({ name, value }))

  const verificationCounts = students.reduce((acc: Record<string, number>, s: any) => {
    acc[s.verificationStatus] = (acc[s.verificationStatus] || 0) + 1
    return acc
  }, {})
  const verificationData = Object.entries(verificationCounts).map(([name, value]) => ({ name, value }))

  const topStudents = [...students]
    .sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0))
    .slice(0, 5)

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  if (!user) return null

  return (
    <DashboardLayout role="tpo">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold">College Analytics & Placement</h1>
          <p className="text-foreground/60">Track student performance across your college</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : (
          <>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariants}>
                <StatCard title="Total Students" value={analytics?.totalStudents ?? 0} description="Registered on platform" icon={<Users className="w-5 h-5" />} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard title="Pending Verifications" value={pendingCount} description="Awaiting your review" icon={<ShieldAlert className="w-5 h-5" />} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard title="Avg Reputation Score" value={analytics?.avgReputation?.toFixed(1) ?? '0.0'} description="Out of 100" icon={<Award className="w-5 h-5" />} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard title="Total Earnings" value={`₹${Number(analytics?.totalEarnings ?? 0).toLocaleString()}`} description="By all students" icon={<IndianRupee className="w-5 h-5" />} />
              </motion.div>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Reputation Tier Distribution</CardTitle>
                    <CardDescription>Students by clustering tier</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tierData.length === 0 ? (
                      <p className="text-sm text-foreground/50 py-8 text-center">No students yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={tierData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorBeginner" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#94a3b8" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#64748b" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="colorRising" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="colorElite" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#d97706" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {tierData.map((entry, i) => {
                              const gradId = entry.name === 'BEGINNER' ? 'colorBeginner' : entry.name === 'RISING_TALENT' ? 'colorRising' : entry.name === 'PROFESSIONAL' ? 'colorPro' : 'colorElite'
                              return <Cell key={i} fill={`url(#${gradId})`} />
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>Across all your college's students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {verificationData.length === 0 ? (
                      <p className="text-sm text-foreground/50 py-8 text-center">No students yet.</p>
                    ) : (
                      <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <defs>
                            <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#d97706" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                          <Pie data={verificationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                            {verificationData.map((entry, i) => {
                              const gradId = entry.name === 'VERIFIED' ? 'colorVerified' : entry.name === 'PENDING' ? 'colorPending' : entry.name === 'REJECTED' ? 'colorRejected' : 'colorManual'
                              return <Cell key={i} fill={`url(#${gradId})`} />
                            })}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                        <div className="mt-2 space-y-1.5">
                          {verificationData.map((v, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{v.name}</span>
                              <span className="font-semibold">{v.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Top Performing Students</CardTitle>
                  <CardDescription>Your college's highest-reputation talent</CardDescription>
                </CardHeader>
                <CardContent>
                  {topStudents.length === 0 ? (
                    <p className="text-sm text-foreground/50 py-8 text-center">No students yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {topStudents.map((student) => (
                        <div key={student.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{student.user?.name}</h3>
                              <p className="text-sm text-foreground/60">{student.department?.name || 'Unassigned'} · {student.clusterTier}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg text-accent">{student.reputationScore?.toFixed(1)}</div>
                              <div className="text-xs text-foreground/60">Reputation</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div><span className="text-foreground/60">Projects: </span><span className="font-semibold">{student.projectsCompleted}</span></div>
                              <div><span className="text-foreground/60">Earnings: </span><span className="font-semibold">₹{Number(student.totalEarnings).toLocaleString()}</span></div>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{student.verificationStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {pendingCount > 0 && (
              <motion.div variants={itemVariants}>
                <Link href="/tpo/students" className="block p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-sm text-amber-400 font-medium">
                  {pendingCount} student{pendingCount > 1 ? 's' : ''} awaiting verification — review them now →
                </Link>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
