'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, Briefcase } from 'lucide-react'

export default function StudentProjects() {
  const { user } = useRequireAuth()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    apiClient('/applications/my')
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-foreground/60">Projects you have applied to or are working on.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : applications.length === 0 ? (
          <Card glass>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="w-12 h-12 text-foreground/20 mb-4" />
              <p className="font-semibold text-lg mb-1">No applications yet</p>
              <p className="text-sm text-foreground/50">Apply to projects in the Marketplace to see them here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map(app => (
              <Card glass key={app.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{app.project?.title || 'Unknown Project'}</h3>
                      <p className="text-sm text-foreground/60 line-clamp-2 mt-1">{app.project?.description}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex-shrink-0">
                      {app.status}
                    </span>
                  </div>
                  {app.proposal && (
                    <div className="mt-4 pt-4 border-t border-white/5 text-sm text-foreground/80 italic">
                      "{app.proposal}"
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
