'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState, Suspense } from 'react'
import { Loader2, ShieldAlert, CheckCircle2, Search, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

function DisputesContent() {
  const { user } = useRequireAuth()
  const searchParams = useSearchParams()
  const initialDisputeId = searchParams.get('id')

  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Resolution Dialog state
  const [resolvingDispute, setResolvingDispute] = useState<any>(null)
  const [resolutionText, setResolutionText] = useState('')
  const [outcome, setOutcome] = useState<'RELEASE' | 'REFUND' | 'SPLIT'>('SPLIT')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const res = await apiClient('/disputes')
      setDisputes(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDisputes().then(() => {
        if (initialDisputeId) {
          // We need to wait for state to update, but since we just fetched it we can find it in the response
          // or just rely on another effect. Let's rely on a separate effect.
        }
      })
    }
  }, [user])

  useEffect(() => {
    if (initialDisputeId && disputes.length > 0 && !resolvingDispute) {
      const target = disputes.find(d => d.id === initialDisputeId && d.status !== 'RESOLVED')
      if (target) {
        setResolvingDispute(target)
      }
    }
  }, [initialDisputeId, disputes])

  const submitResolution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvingDispute) return
    setIsSubmitting(true)
    try {
      await apiClient(`/disputes/${resolvingDispute.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution: resolutionText, outcome })
      })
      toast.success('Dispute resolved successfully.')
      setResolvingDispute(null)
      setResolutionText('')
      setOutcome('SPLIT')
      fetchDisputes()
    } catch (err: any) {
      toast.error('Failed to resolve dispute: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          Escrow Disputes
        </h1>
        <p className="text-foreground/60">Resolve conflicts between clients and students and manage escrows.</p>
      </div>

      <Card glass>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10 text-foreground/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Amount in Escrow</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-foreground/40" /></td></tr>
                ) : disputes.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400/50 mb-4" />
                        <p className="font-semibold text-lg mb-1">No Active Disputes</p>
                        <p className="text-sm text-foreground/50">All escrows are currently operating smoothly.</p>
                      </div>
                    </td>
                  </tr>
                ) : disputes.map(d => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground max-w-xs truncate" title={d.contract?.project?.title || 'Unknown Project'}>
                        {d.contract?.project?.title || 'Unknown Project'}
                      </div>
                      <div className="text-foreground/60 text-xs truncate max-w-xs" title={d.reason}>{d.reason}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₹{d.contract?.escrow?.amount ? Number(d.contract.escrow.amount).toLocaleString() : '0'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        d.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                        d.status === 'OPEN' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                      }`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/60">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {d.status !== 'RESOLVED' && (
                          <Button size="sm" variant="outline" className="h-8 border-red-500/20 hover:bg-red-500/10 text-red-400" onClick={() => setResolvingDispute(d)}>
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Dialog */}
      {resolvingDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-white/10 bg-background shadow-2xl">
            <CardHeader>
              <CardTitle>Resolve Dispute</CardTitle>
              <CardDescription>
                Project: {resolvingDispute.contract?.project?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitResolution} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Outcome</label>
                  <select required
                    value={outcome}
                    onChange={e => setOutcome(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-zinc-900 text-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="SPLIT">SPLIT (50/50 between student and client)</option>
                    <option value="RELEASE">RELEASE (Pay student full amount)</option>
                    <option value="REFUND">REFUND (Return full amount to client)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Resolution Details</label>
                  <textarea required
                    rows={4}
                    value={resolutionText}
                    onChange={e => setResolutionText(e.target.value)}
                    placeholder="Explain the reasoning for this resolution..."
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => { setResolvingDispute(null); setResolutionText('') }}>Cancel</Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-500" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm Resolution
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function AdminDisputes() {
  return (
    <DashboardLayout role="admin">
      <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>}>
        <DisputesContent />
      </Suspense>
    </DashboardLayout>
  )
}
