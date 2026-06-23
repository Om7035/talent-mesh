'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, Users, IndianRupee, Briefcase, Brain, RefreshCw } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { Button } from '@/components/ui/button'

export default function AdminAnalytics() {
  const { user } = useRequireAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  const fetchStats = () => {
    setLoading(true)
    apiClient('/admin/stats')
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) return
    fetchStats()
  }, [user])

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      await apiClient('/admin/ml/recalculate-clusters', { method: 'POST' })
      fetchStats()
    } catch (e) {
      console.error(e)
    } finally {
      setRecalculating(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold">Platform Statistics</h1>
          <p className="text-foreground/60">Global metrics across all users and projects.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : !data ? (
          <div className="text-center py-12 text-foreground/50">Failed to load platform stats.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={data.totalUsers || '0'}
              description={`Registered accounts`}
              icon={<Users className="w-5 h-5 text-blue-400" />}
            />
            <StatCard
              title="Total Projects"
              value={data.totalProjects || '0'}
              description={`${data.totalContracts || 0} contracts active`}
              icon={<Briefcase className="w-5 h-5 text-emerald-400" />}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${data.totalRevenue || 0}`}
              description="Platform fees collected"
              icon={<IndianRupee className="w-5 h-5 text-amber-400" />}
            />
            <StatCard
              title="Active Disputes"
              value={data.openDisputes || '0'}
              description="Requiring attention"
              icon={<TrendingUp className="w-5 h-5 text-red-400" />}
            />
          </div>
        )}

        {/* ML Panel */}
        {!loading && data && (
          <Card glass className="mt-8 border-indigo-500/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <CardTitle>Student Segmentation (K-Means)</CardTitle>
                  <p className="text-sm text-foreground/60 mt-1">
                    Last Run: {data.systemMetrics?.lastClusterRunAt ? new Date(data.systemMetrics.lastClusterRunAt).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleRecalculate} 
                disabled={recalculating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Recalculate Clusters
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium text-foreground/60 mb-1 flex items-center gap-1">🏆 Elite</span>
                  <span className="text-3xl font-bold text-amber-400">{data.systemMetrics?.totalElites || 0}</span>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium text-foreground/60 mb-1 flex items-center gap-1">⭐ Professional</span>
                  <span className="text-3xl font-bold text-blue-400">{data.systemMetrics?.totalProfessionals || 0}</span>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium text-foreground/60 mb-1 flex items-center gap-1">🚀 Rising Talent</span>
                  <span className="text-3xl font-bold text-emerald-400">{data.systemMetrics?.totalRisingTalents || 0}</span>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium text-foreground/60 mb-1 flex items-center gap-1">🌱 Beginner</span>
                  <span className="text-3xl font-bold text-slate-400">{data.systemMetrics?.totalBeginners || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
