'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Trophy, Briefcase, IndianRupee, Award, Star, TrendingUp, Edit, Eye, ExternalLink, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }

function SkeletonCard() {
  return <div className="h-28 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
}

export default function StudentDashboard() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const [profileData, projectsData, recommendationsData] = await Promise.all([
          apiClient('/students/me'),
          apiClient('/applications/my'),
          apiClient('/recommendations/for-me?limit=5').catch(() => []),
        ])
        setProfile(profileData)
        setProjects(projectsData?.applications || projectsData || [])
        setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : [])
      } catch (err) {
        console.error('Failed to fetch student data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (authLoading || (!user && !profile)) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-8">
          <SkeletonCard />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const skills = profile?.skills || []
  const skillData = skills.slice(0, 4).map((s: any) => ({
    name: s.skill?.name || s.name,
    value: s.endorsed || 25,
  }))

  const completedContracts = profile?.contracts || []

  return (
    <DashboardLayout role="student">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

        {/* Header with Profile Summary */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              {user?.name?.split(' ').map((n:string) => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-sm text-foreground/60">
                {profile?.college?.name || 'TalentMesh'} · {profile?.major || 'Student'}
                {profile?.clusterTier === 'ELITE' && <span className="ml-2 text-amber-400 text-xs font-bold border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 rounded shadow-sm shadow-amber-400/10">🏆 Elite Performer</span>}
                {profile?.clusterTier === 'RISING_TALENT' && <span className="ml-2 text-emerald-400 text-xs font-bold border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 rounded shadow-sm shadow-emerald-400/10">🚀 Rising Talent</span>}
                {profile?.clusterTier === 'PROFESSIONAL' && <span className="ml-2 text-blue-400 text-xs font-bold border border-blue-400/20 bg-blue-400/10 px-1.5 py-0.5 rounded shadow-sm shadow-blue-400/10">⭐ Professional</span>}
                {profile?.clusterTier === 'BEGINNER' && <span className="ml-2 text-slate-400 text-xs font-bold border border-slate-400/20 bg-slate-400/10 px-1.5 py-0.5 rounded">🌱 Beginner</span>}
                {profile?.verificationStatus === 'VERIFIED' && (
                  <span className="ml-2 text-emerald-400 text-xs font-medium">✓ Verified</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/student/profile">
              <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-xs">
                <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Find Projects
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <StatCard
              title="Reputation Score"
              value={loading ? '—' : `${profile?.reputationScore?.toFixed(1) || '0.0'}`}
              description="Out of 100"
              icon={<Trophy className="w-5 h-5" />}
              trend={profile?.reputationScore > 0 ? { value: Math.round(profile.reputationScore), direction: 'up' } : undefined}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Projects Completed"
              value={loading ? '—' : String(profile?.projectsCompleted || 0)}
              description="All time"
              icon={<Briefcase className="w-5 h-5" />}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Earnings"
              value={loading ? '—' : `₹${(profile?.totalEarnings || 0).toLocaleString()}`}
              description="Lifetime"
              icon={<IndianRupee className="w-5 h-5" />}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Avg Rating"
              value={loading ? '—' : `${profile?.avgClientRating?.toFixed(1) || '0.0'} ★`}
              description="From clients"
              icon={<Award className="w-5 h-5" />}
            />
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card glass>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Browse Projects', href: '/marketplace', icon: <TrendingUp className="w-4 h-4" />, color: 'from-blue-500/20 to-blue-600/10' },
                  { label: 'My Applications', href: '/student/projects', icon: <Briefcase className="w-4 h-4" />, color: 'from-violet-500/20 to-violet-600/10' },
                  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-4 h-4" />, color: 'from-emerald-500/20 to-emerald-600/10' },
                  { label: 'Leaderboard', href: '/student/leaderboard', icon: <Trophy className="w-4 h-4" />, color: 'from-amber-500/20 to-amber-600/10' },
                ].map(action => (
                  <Link key={action.label} href={action.href} className={`p-4 rounded-xl border border-white/5 bg-gradient-to-br ${action.color} hover:border-white/10 transition-all text-center group`}>
                    <div className="text-foreground/60 group-hover:text-foreground transition-colors flex justify-center mb-2">{action.icon}</div>
                    <p className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">{action.label}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills */}
          <motion.div variants={itemVariants}>
            <Card glass className="h-full">
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
                <CardDescription>{skills.length} skills added</CardDescription>
              </CardHeader>
              <CardContent>
                {skills.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-foreground/50 mb-3">No skills added yet</p>
                    <Link href="/student/profile">
                      <Button variant="outline" size="sm" className="border-white/10 text-xs">Add Skills</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {skillData.length > 0 && (
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={skillData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                            {skillData.map((_: any, index: number) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div className="space-y-2 mt-2">
                      {skills.slice(0, 5).map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-foreground/80">{s.skill?.name || s.name}</span>
                          </div>
                          <span className="text-xs text-foreground/50 capitalize">{s.level || 'Intermediate'}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card glass className="h-full">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Your latest project applications</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-foreground/50 mb-3">No applications yet</p>
                    <Link href="/marketplace">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs">Browse Projects</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((app: any, idx: number) => (
                      <div key={app.id || idx} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all">
                        <div>
                          <p className="text-sm font-medium text-foreground">{app.project?.title || 'Project'}</p>
                          <p className="text-xs text-foreground/50">{app.project?.client?.companyName || 'Client'} · ₹{app.project?.budget?.toLocaleString()}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border ${
                          app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          app.status === 'SHORTLISTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Profile Completeness */}
        {profile && (
          <motion.div variants={itemVariants}>
            <Card glass>
              <CardHeader>
                <CardTitle>Profile Completeness</CardTitle>
                <CardDescription>Complete your profile to get more project recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const items = [
                    { label: 'Name', done: !!user?.name },
                    { label: 'Bio', done: !!profile?.bio },
                    { label: 'Location', done: !!profile?.location },
                    { label: 'Skills', done: skills.length > 0 },
                    { label: 'GitHub', done: !!profile?.githubUrl },
                    { label: 'LinkedIn', done: !!profile?.linkedinUrl },
                  ]
                  const pct = Math.round((items.filter(i => i.done).length / items.length) * 100)
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">{pct}% complete</span>
                        <Link href="/student/profile"><span className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Complete profile →</span></Link>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 mb-4">
                        <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {items.map(item => (
                          <div key={item.label} className={`flex items-center gap-2 text-xs ${item.done ? 'text-emerald-400' : 'text-foreground/40'}`}>
                            <span>{item.done ? '✓' : '○'}</span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI Recommended Projects */}
        {recommendations.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card glass>
              <CardHeader>
                <CardTitle>Recommended For You</CardTitle>
                <CardDescription>AI-matched projects based on your skills, reputation, and difficulty fit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec: any) => (
                    <Link
                      key={rec.id}
                      href={`/marketplace/${rec.project?.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{rec.project?.title}</p>
                        <p className="text-xs text-foreground/50">{rec.project?.client?.companyName || 'Client'} · ₹{Number(rec.project?.budget).toLocaleString()}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20">
                        {Math.round(rec.matchScore)}% match
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
