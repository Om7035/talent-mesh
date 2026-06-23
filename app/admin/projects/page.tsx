'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { Briefcase } from 'lucide-react'

export default function AdminProjects() {
  const { user } = useRequireAuth()

  if (!user || user.role !== 'ADMIN') return null

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">Platform Projects</h1>
          <p className="text-foreground/60">Overview of all jobs across the marketplace.</p>
        </div>

        <Card glass>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase className="w-12 h-12 text-foreground/20 mb-4" />
            <p className="font-semibold text-lg mb-1">No Active Projects</p>
            <p className="text-sm text-foreground/50">Projects will appear here once clients post them.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
