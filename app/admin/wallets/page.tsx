'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { CreditCard } from 'lucide-react'

export default function AdminWallets() {
  const { user } = useRequireAuth()

  if (!user || user.role !== 'ADMIN') return null

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">Platform Wallets</h1>
          <p className="text-foreground/60">Monitor global ledger and user balances.</p>
        </div>

        <Card glass>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard className="w-12 h-12 text-foreground/20 mb-4" />
            <p className="font-semibold text-lg mb-1">No Wallet Activity</p>
            <p className="text-sm text-foreground/50">User wallets and transactions will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
