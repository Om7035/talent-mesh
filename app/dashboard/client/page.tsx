'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Users, IndianRupee, Clock, Eye, CheckCircle, Plus, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function SkeletonCard() {
  return <div className="h-28 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
}

export default function ClientDashboard() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const [profile, setProfile] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const [profileData, analyticsData, projectsData] = await Promise.all([
          apiClient('/clients/me'),
          apiClient('/analytics/client'),
          apiClient('/projects/my/list'),
        ])
        setProfile(profileData)
        setAnalytics(analyticsData)
        setProjects(Array.isArray(projectsData) ? projectsData : [])
      } catch (err) {
        console.error('Failed to fetch client data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (authLoading || (!user && !profile)) {
    return (
      <DashboardLayout role="client">
        <div className="space-y-8">
          <SkeletonCard />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const activeProjectsCount = analytics?.overview?.projectsActive || 0
  const totalSpent = analytics?.overview?.totalSpent || 0
  const completionRate = analytics?.overview?.hiringRate || 0

  return (
    <DashboardLayout role="client">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
              {user?.name?.split(' ').map((n:string) => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-sm text-foreground/60">
                {profile?.companyName || 'Independent Client'} · {profile?.industry || 'Hiring Talent'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/client/post-project">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Post New Project
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <StatCard
              title="Active Projects"
              value={loading ? '—' : String(activeProjectsCount)}
              description="Currently ongoing"
              icon={<Briefcase className="w-5 h-5 text-emerald-400" />}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Budget Posted"
              value={loading ? '—' : `₹${totalSpent.toLocaleString()}`}
              description="All time"
              icon={<IndianRupee className="w-5 h-5 text-emerald-400" />}
              trend={totalSpent > 0 ? { value: 12, direction: 'up' } : undefined}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Avg Rating"
              value={loading ? '—' : `${analytics?.overview?.avgRating?.toFixed(1) || '0.0'} ★`}
              description="From students"
              icon={<Users className="w-5 h-5 text-emerald-400" />}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Hiring Rate"
              value={loading ? '—' : `${completionRate}%`}
              description="Of posted projects"
              icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
            />
          </motion.div>
        </motion.div>

        {/* Active Projects List */}
        <motion.div variants={itemVariants}>
          <Card glass>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>Manage ongoing and past projects</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
                  <p className="text-foreground/60 mb-4">You haven't posted any projects yet.</p>
                  <Link href="/client/post-project">
                    <Button className="bg-emerald-600 hover:bg-emerald-500">Post Your First Project</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1">
                      {/* Animated glowing border effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/20 group-hover:via-teal-500/20 group-hover:to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 blur-md" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg group-hover:text-emerald-400 transition-colors">{project.title}</h3>
                          <p className="text-sm text-foreground/50 mt-1 line-clamp-1">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${
                            project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20' :
                            project.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/20'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-foreground text-lg tracking-tight">₹{project.budget?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-4 border-t border-white/10 text-foreground/60">
                        <div className="flex items-center gap-5">
                          <span className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg"><Eye className="w-4 h-4 text-emerald-400/70" /> <span className="font-medium">{(project.applications || []).length} applicants</span></span>
                          <span className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg"><Clock className="w-4 h-4 text-emerald-400/70" /> <span className="font-medium">{project.timelineDays ? `${project.timelineDays} days` : 'Flexible'}</span></span>
                        </div>
                        <Link href={`/client/projects/${project.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs border-white/20 bg-transparent hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm">Manage Project</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  )
}
