'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TPOReports() {
  const { user } = useRequireAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    apiClient('/tpo/report')
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  return (
    <DashboardLayout role="tpo">
      <div className="space-y-6 max-w-6xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-foreground/60">Generate and download college placement reports.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : !data ? (
          <div className="text-center py-12 text-foreground/50">Failed to load reports data.</div>
        ) : (
          <Card glass>
            <CardHeader>
              <CardTitle>Placement Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between p-4 border border-white/10 rounded-xl bg-white/5">
                  <span className="font-medium">Total Registered Students</span>
                  <span className="font-bold">{data.totalStudents || 0}</span>
                </div>
                <div className="flex justify-between p-4 border border-white/10 rounded-xl bg-white/5">
                  <span className="font-medium">Total Placed (Completed Projects)</span>
                  <span className="font-bold">{data.placedStudents || 0}</span>
                </div>
                <div className="flex justify-between p-4 border border-white/10 rounded-xl bg-white/5">
                  <span className="font-medium">Average Earnings per Student</span>
                  <span className="font-bold">₹{data.averageEarnings || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
