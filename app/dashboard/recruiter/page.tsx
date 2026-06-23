'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Target, TrendingUp, CheckCircle, Star, MapPin, Search, Loader2, BookOpen, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b']

export default function RecruiterDashboard() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const [profile, setProfile] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const fetchProfileAndCandidates = async () => {
    try {
      const [p, c] = await Promise.all([
        apiClient('/recruiters/me').catch(() => null),
        apiClient('/students/search?limit=10'),
      ])
      setProfile(p)
      setCandidates(Array.isArray(c?.data) ? c.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchProfileAndCandidates()
  }, [user])

  const handleSearch = async () => {
    setSearching(true)
    try {
      const res = await apiClient(`/students/search?query=${encodeURIComponent(searchQuery)}&limit=10`)
      setCandidates(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  if (authLoading || (!user && !profile)) {
    return (
      <DashboardLayout role="recruiter">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
      </DashboardLayout>
    )
  }

  const chartData = [
    { month: 'Jan', views: 40, searches: 20 },
    { month: 'Feb', views: 60, searches: 35 },
    { month: 'Mar', views: 80, searches: 50 },
    { month: 'Apr', views: 120, searches: 75 },
    { month: 'May', views: 150, searches: 95 },
  ]

  const hiringPipelineData = [
    { name: 'Sourced', value: candidates.length * 5 || 35 },
    { name: 'Contacted', value: candidates.length * 2 || 18 },
    { name: 'Interviewed', value: 8 },
    { name: 'Hired', value: 3 },
  ]

  return (
    <DashboardLayout role="recruiter">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
              {user?.name?.split(' ').map((n:string) => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Talent Discovery</h1>
              <p className="text-sm text-foreground/60">
                {profile?.companyName || 'Independent Recruiter'} · Find verified student talent
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-xs">
              <Target className="w-3.5 h-3.5 mr-1.5" /> Saved Searches
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <StatCard title="Candidates Viewed" value={loading ? '—' : '284'} description="This month" icon={<Users className="w-5 h-5 text-purple-400" />} trend={{ value: 42, direction: 'up' }} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard title="Shortlisted" value={loading ? '—' : '35'} description="Top matches" icon={<Target className="w-5 h-5 text-purple-400" />} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard title="Offers Sent" value={loading ? '—' : '8'} description="Active offers" icon={<TrendingUp className="w-5 h-5 text-purple-400" />} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard title="Hired" value={loading ? '—' : '5'} description="This quarter" icon={<CheckCircle className="w-5 h-5 text-purple-400" />} />
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants}>
          <Card glass>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by skills (e.g. React, Python), major, or location..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching} className="h-[46px] px-8 bg-purple-600 hover:bg-purple-500">
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Candidates Grid */}
        <motion.div variants={itemVariants}>
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Discovered Talent</CardTitle>
                <CardDescription>Top students matching your criteria</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {loading || searching ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                  <p className="text-foreground/60 mb-2">No candidates found</p>
                  <p className="text-sm text-foreground/40">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {candidate.user?.avatarUrl ? (
                            <img src={candidate.user.avatarUrl} alt={candidate.user.name} className="w-full h-full rounded-xl object-cover" />
                          ) : (
                            candidate.user?.name?.split(' ').map((n:string) => n[0]).join('').slice(0,2) || '?'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-foreground truncate">{candidate.user?.name}</h3>
                              <p className="text-sm text-foreground/60 truncate">{candidate.major || 'Student'}</p>
                            </div>
                            {candidate.reputationScore > 0 && (
                              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20 text-xs font-bold">
                                <Star className="w-3 h-3 fill-yellow-500" />
                                {(candidate.reputationScore / 20).toFixed(1)}
                              </div>
                            )}
                            {candidate.clusterTier && (
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${
                                candidate.clusterTier === 'ELITE' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20 shadow-sm shadow-amber-400/10' :
                                candidate.clusterTier === 'RISING_TALENT' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-sm shadow-emerald-400/10' :
                                candidate.clusterTier === 'PROFESSIONAL' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20 shadow-sm shadow-blue-400/10' :
                                'bg-slate-400/10 text-slate-400 border-slate-400/20'
                              }`}>
                                {candidate.clusterTier === 'ELITE' && '🏆 '}
                                {candidate.clusterTier === 'RISING_TALENT' && '🚀 '}
                                {candidate.clusterTier === 'PROFESSIONAL' && '⭐ '}
                                {candidate.clusterTier === 'BEGINNER' && '🌱 '}
                                {candidate.clusterTier.replace('_', ' ')}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-foreground/50">
                            {candidate.college?.name && (
                              <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> <span className="truncate max-w-[120px]">{candidate.college.name}</span></div>
                            )}
                            {candidate.location && (
                              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span className="truncate max-w-[100px]">{candidate.location}</span></div>
                            )}
                            <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {candidate.projectsCompleted || 0} projects</div>
                          </div>

                          {candidate.skills && candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-4">
                              {candidate.skills.slice(0, 4).map((s: any) => (
                                <span key={s.skillId} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-white/5 border border-white/10 text-foreground/70">
                                  {s.skill?.name}
                                </span>
                              ))}
                              {candidate.skills.length > 4 && (
                                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-white/5 border border-white/10 text-foreground/50">
                                  +{candidate.skills.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                            <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 bg-transparent hover:bg-white/5">View Profile</Button>
                            <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-500">Contact</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card glass>
              <CardHeader>
                <CardTitle>Sourcing Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="views" stroke="#a855f7" strokeWidth={3} />
                    <Line type="monotone" dataKey="searches" stroke="#06b6d4" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card glass>
              <CardHeader>
                <CardTitle>Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={hiringPipelineData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {hiringPipelineData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {hiringPipelineData.map((stage, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-foreground/70">{stage.name}</span>
                      </div>
                      <span className="font-bold">{stage.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  )
}
