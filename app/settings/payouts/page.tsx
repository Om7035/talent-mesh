'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Building2, Smartphone } from 'lucide-react'

export default function PayoutSettings() {
  const { user } = useRequireAuth()

  if (!user) return null

  return (
    <DashboardLayout role={user.role.toLowerCase() as any}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Payout Settings</h1>
          <p className="text-foreground/60">Manage how you receive your earnings.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <CardTitle>Bank Account</CardTitle>
              </div>
              <CardDescription>Direct deposit to your bank.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground/60">Bank Name</label>
                <input type="text" className="w-full bg-background/50 border border-white/10 rounded-lg p-2" placeholder="e.g., Chase Bank" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground/60">Account Number</label>
                <input type="text" className="w-full bg-background/50 border border-white/10 rounded-lg p-2" placeholder="••••••••1234" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground/60">Routing Number</label>
                <input type="text" className="w-full bg-background/50 border border-white/10 rounded-lg p-2" placeholder="123456789" />
              </div>
              <Button className="w-full">Save Bank Details</Button>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <CardTitle>UPI ID (India)</CardTitle>
              </div>
              <CardDescription>Instant transfer via UPI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground/60">Virtual Payment Address (UPI ID)</label>
                <input type="text" className="w-full bg-background/50 border border-white/10 rounded-lg p-2" placeholder="username@bank" />
              </div>
              <Button className="w-full">Save UPI Details</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
