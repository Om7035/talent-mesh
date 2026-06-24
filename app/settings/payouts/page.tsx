'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Building2, Smartphone, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function PayoutSettings() {
  const { user } = useRequireAuth()
  const [loading, setLoading] = useState(true)
  const [savingBank, setSavingBank] = useState(false)
  const [savingUpi, setSavingUpi] = useState(false)
  const [bank, setBank] = useState({ bankName: '', accountNumber: '', routingNumber: '' })
  const [upiId, setUpiId] = useState('')

  useEffect(() => {
    if (!user) return
    apiClient('/wallet')
      .then((wallet) => {
        setBank({
          bankName: wallet?.bankName || '',
          accountNumber: wallet?.accountNumber || '',
          routingNumber: wallet?.routingNumber || '',
        })
        setUpiId(wallet?.upiId || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const saveBank = async () => {
    setSavingBank(true)
    try {
      await apiClient('/wallet/payout-details', {
        method: 'PATCH',
        body: JSON.stringify({ ...bank, payoutMethod: 'BANK_TRANSFER' }),
      })
      toast.success('Bank details saved.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save bank details.')
    } finally {
      setSavingBank(false)
    }
  }

  const saveUpi = async () => {
    setSavingUpi(true)
    try {
      await apiClient('/wallet/payout-details', {
        method: 'PATCH',
        body: JSON.stringify({ upiId, payoutMethod: 'UPI' }),
      })
      toast.success('UPI details saved.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save UPI details.')
    } finally {
      setSavingUpi(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role={user.role.toLowerCase() as any}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Payout Settings</h1>
          <p className="text-foreground/60">Manage how you receive your earnings.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : (
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
                  <input
                    value={bank.bankName}
                    onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                    type="text" className="w-full bg-background/50 border border-white/10 rounded-lg p-2" placeholder="e.g., HDFC Bank"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground/60">Account Number</label>
                  <input
                    value={bank.accountNumber}
                    onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                    type="text" className="w-full bg-background/50 border border-white/10 rounded-lg p-2" placeholder="••••••••1234"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground/60">Routing / IFSC Number</label>
                  <input
                    value={bank.routingNumber}
                    onChange={(e) => setBank({ ...bank, routingNumber: e.target.value })}
                    type="text" className="w-full bg-background/50 border border-white/10 rounded-lg p-2" placeholder="HDFC0001234"
                  />
                </div>
                <Button onClick={saveBank} disabled={savingBank} className="w-full">
                  {savingBank ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Bank Details
                </Button>
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
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    type="text" className="w-full bg-background/50 border border-white/10 rounded-lg p-2" placeholder="username@bank"
                  />
                </div>
                <Button onClick={saveUpi} disabled={savingUpi} className="w-full">
                  {savingUpi ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save UPI Details
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
