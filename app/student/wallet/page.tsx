'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, CreditCard, ArrowUpRight, ArrowDownLeft, Lock, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function WalletPage() {
  const { user } = useRequireAuth()
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const fetchWallet = () => {
    Promise.all([
      apiClient('/wallet'),
      apiClient('/wallet/transactions')
    ])
      .then(([walletData, txData]) => {
        setWallet(walletData)
        setTransactions(txData?.transactions || txData?.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) return
    fetchWallet()
  }, [user])

  const openWithdrawDialog = () => {
    if (!wallet || wallet.balance <= 0) return toast.error('No funds available to withdraw.')
    setWithdrawAmount(wallet.balance.toString())
    setWithdrawDialogOpen(true)
  }

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount)
    if (!amount || isNaN(amount) || amount <= 0) return

    if (amount > wallet.balance) return toast.error('Insufficient balance.')

    try {
      setWithdrawing(true)
      
      // TODO: RAZORPAY INTEGRATION HERE
      // 1. You would call Razorpay Route / Payouts API or your backend to initiate bank transfer
      // 2. Currently, we just simulate the withdrawal using the internal backend endpoint
      
      await apiClient('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) })
      })

      toast.success('Withdrawal request successful! Funds will be transferred to your bank shortly.')
      setWithdrawDialogOpen(false)
      setWithdrawAmount('')
      fetchWallet()
    } catch (err: any) {
      toast.error(err.message || 'Withdrawal failed')
    } finally {
      setWithdrawing(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role={user.role.toLowerCase() as any}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Wallet & Earnings</h1>
            <p className="text-foreground/60">Manage your earnings, pending escrows, and payouts.</p>
          </div>
          <Button 
            onClick={openWithdrawDialog} 
            disabled={loading || withdrawing || !wallet?.balance}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          >
            {withdrawing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Request Payout
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Balance Cards (Left Column) */}
            <div className="md:col-span-1 space-y-6">
              
              <Card glass className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 border-blue-500/20 shadow-xl">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                  <CreditCard className="w-8 h-8 text-blue-400 mb-3" />
                  <p className="text-sm text-foreground/70 font-medium uppercase tracking-wider mb-1">Available to Withdraw</p>
                  <h2 className="text-4xl font-bold text-white">₹{wallet?.balance?.toLocaleString() || '0.00'}</h2>
                </CardContent>
              </Card>

              <Card glass className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                  <Lock className="w-6 h-6 text-amber-400 mb-2" />
                  <p className="text-xs text-foreground/70 font-medium uppercase tracking-wider mb-1">In Escrow (Pending Approval)</p>
                  <h2 className="text-2xl font-bold text-amber-400">₹{wallet?.lockedBalance?.toLocaleString() || '0.00'}</h2>
                </CardContent>
              </Card>

            </div>

            {/* Transactions List */}
            <Card glass className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>A complete history of your earnings and payouts.</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-foreground/50 text-sm border border-white/5 rounded-xl bg-white/[0.02]">
                    No transactions found. Apply to projects to start earning!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map(tx => {
                      const isCredit = tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE'
                      
                      return (
                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isCredit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{tx.description || tx.type.replace('_', ' ')}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-foreground/50">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-foreground/60">{tx.status}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`font-bold text-lg ${isCredit ? 'text-emerald-400' : 'text-foreground'}`}>
                            {isCredit ? '+' : '-'}₹{tx.amount}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent className="glass-panel max-w-sm">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Enter the amount you wish to withdraw to your linked bank account.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2 block">Amount (INR)</label>
              <Input 
                type="number"
                min="1"
                step="0.01"
                max={wallet?.balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-foreground/50 mt-2">Available: ₹{wallet?.balance?.toLocaleString() || '0.00'}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)} disabled={withdrawing}>Cancel</Button>
              <Button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount} className="bg-blue-600 hover:bg-blue-500 text-white">
                {withdrawing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Withdraw
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
