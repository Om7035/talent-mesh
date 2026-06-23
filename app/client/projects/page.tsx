'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, Briefcase } from 'lucide-react'

export default function ClientProjects() {
  const { user } = useRequireAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    apiClient('/projects/my/list')
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  return (
    <DashboardLayout role="client">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-foreground/60">Manage projects you have posted.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : projects.length === 0 ? (
          <Card glass>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="w-12 h-12 text-foreground/20 mb-4" />
              <p className="font-semibold text-lg mb-1">No projects found</p>
              <p className="text-sm text-foreground/50">You haven't posted any projects yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => (
              <Card glass key={project.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{project.title}</h3>
                      <p className="text-sm text-foreground/60 mt-1">{project.description}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex-shrink-0">
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-4 text-sm text-foreground/70">
                    <div><strong>Budget:</strong> ₹{project.budget?.toLocaleString()}</div>
                    <div><strong>Duration:</strong> {project.duration || 'Flexible'}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
