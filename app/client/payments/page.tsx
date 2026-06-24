'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, CreditCard, ArrowUpRight, ArrowDownLeft, Lock, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function ClientPaymentsPage() {
  const { user } = useRequireAuth()
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [depositing, setDepositing] = useState(false)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')

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

  const handleDeposit = async () => {
    const amount = Number(depositAmount)
    if (!amount || isNaN(amount) || amount <= 0) return

    try {
      setDepositing(true)
      await apiClient('/wallet/direct-deposit', {
        method: 'POST',
        body: JSON.stringify({ amount })
      })
      toast.success('Funds deposited successfully!')
      setDepositDialogOpen(false)
      setDepositAmount('')
      fetchWallet()
    } catch (err: any) {
      toast.error(err.message || 'Failed to deposit funds')
    } finally {
      setDepositing(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role={user.role.toLowerCase() as any}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Payments & Escrow</h1>
            <p className="text-foreground/60">Manage your deposits and view funds currently locked in escrow.</p>
          </div>
          <Button 
            onClick={() => setDepositDialogOpen(true)} 
            disabled={loading || depositing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
          >
            {depositing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Funds
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Balance Cards (Left Column) */}
            <div className="md:col-span-1 space-y-6">
              
              <Card glass className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/20 shadow-xl">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                  <CreditCard className="w-8 h-8 text-emerald-400 mb-3" />
                  <p className="text-sm text-foreground/70 font-medium uppercase tracking-wider mb-1">Available Balance</p>
                  <h2 className="text-4xl font-bold text-white">₹{wallet?.balance?.toLocaleString() || '0.00'}</h2>
                </CardContent>
              </Card>

              <Card glass className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 border-blue-500/20 shadow-xl">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                  <Lock className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="text-xs text-foreground/70 font-medium uppercase tracking-wider mb-1">Locked in Escrow</p>
                  <h2 className="text-2xl font-bold text-blue-400">₹{wallet?.lockedBalance?.toLocaleString() || '0.00'}</h2>
                </CardContent>
              </Card>

            </div>

            {/* Transactions List */}
            <Card glass className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>A complete history of your deposits and escrow locks.</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-foreground/50 text-sm border border-white/5 rounded-xl bg-white/[0.02]">
                    No transactions found. Deposit funds to start hiring!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map(tx => {
                      const isCredit = tx.type === 'DEPOSIT' || tx.type === 'REFUND'
                      
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

        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogContent className="glass-panel max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Funds</DialogTitle>
              <DialogDescription>
                Enter the amount you wish to deposit to your wallet.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2 block">Amount (INR)</label>
              <Input 
                type="number"
                min="1"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDepositDialogOpen(false)} disabled={depositing}>Cancel</Button>
              <Button onClick={handleDeposit} disabled={depositing || !depositAmount} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {depositing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Deposit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
