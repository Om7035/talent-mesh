'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { Shield } from 'lucide-react'

export default function AdminDisputes() {
  const { user } = useRequireAuth()

  if (!user || user.role !== 'ADMIN') return null

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">Escrow Disputes</h1>
          <p className="text-foreground/60">Resolve conflicts between clients and students.</p>
        </div>

        <Card glass>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Shield className="w-12 h-12 text-emerald-400/50 mb-4" />
            <p className="font-semibold text-lg mb-1">No Active Disputes</p>
            <p className="text-sm text-foreground/50">All escrows are currently operating smoothly.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
