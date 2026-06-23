'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, Users, IndianRupee, Briefcase } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'

export default function TPOAnalytics() {
  const { user } = useRequireAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    apiClient('/tpo/analytics')
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  return (
    <DashboardLayout role="tpo">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold">Analytics Overview</h1>
          <p className="text-foreground/60">Key metrics for your college's student talent.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : !data ? (
          <div className="text-center py-12 text-foreground/50">Failed to load analytics data.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Students"
              value={data.totalStudents || '0'}
              description="Registered from your college"
              icon={<Users className="w-5 h-5 text-blue-400" />}
            />
            <StatCard
              title="Verified Students"
              value={data.verifiedStudents || '0'}
              description="Approved by TPO"
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            />
            <StatCard
              title="Total Earnings"
              value={`₹${data.totalEarnings || 0}`}
              description="Earned by students"
              icon={<IndianRupee className="w-5 h-5 text-amber-400" />}
            />
            <StatCard
              title="Active Placements"
              value={data.activePlacements || '0'}
              description="Currently working"
              icon={<Briefcase className="w-5 h-5 text-purple-400" />}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
