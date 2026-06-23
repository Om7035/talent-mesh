'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function ClientProjectDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useRequireAuth()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')

  const fetchData = () => {
    // In a real implementation, you would fetch project and contract details.
    // For this simulation, we'll hit endpoints that would exist.
    apiClient(`/projects/${params.id}`)
      .then(projData => setProject(projData))
      .catch(() => {})

    apiClient(`/contracts/project/${params.id}`)
      .then(contractData => setContract(contractData))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  const handleFundEscrow = async () => {
    try {
      setProcessing(true)
      await apiClient(`/contracts/${contract.id}/fund`, { method: 'POST' })
      toast.success('Escrow funded successfully! The student can now begin work.')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to fund escrow. Please check your wallet balance.')
      if (err.message?.includes('balance')) {
        router.push('/client/payments')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleApprove = async () => {
    try {
      setProcessing(true)
      await apiClient(`/contracts/${contract.id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ feedback: 'Great work!' })
      })
      toast.success('Work approved! Funds have been released to the student.')
      setApproveDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Approval failed.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute.')
      return
    }

    try {
      setProcessing(true)
      await apiClient(`/contracts/${contract.id}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ reason: disputeReason })
      })
      toast.success('Dispute filed. Admin will review the case shortly.')
      setDisputeDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Dispute filing failed.')
    } finally {
      setProcessing(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role="client">
      <div className="space-y-6 max-w-5xl">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !project && !contract ? (
           <div>Project data not available. (You need to implement the backend GET endpoint for this page)</div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold">Project Details</h1>
              <p className="text-foreground/60">Manage your project and escrow status.</p>
            </div>

            <Card glass>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Status: {contract?.status || project?.status || 'POSTED'}</h2>
                  </div>
                </div>

                {/* ESCROW ACTIONS BASED ON CONTRACT STATUS */}
                {contract?.status === 'ASSIGNED' && (
                  <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-amber-500 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Action Required: Fund Escrow
                      </h4>
                      <p className="text-sm text-amber-500/80 mt-1">
                        You have hired a student. You must fund the escrow (₹{contract.agreedBudget}) before they can begin working.
                      </p>
                    </div>
                    <Button onClick={handleFundEscrow} disabled={processing} className="bg-amber-500 hover:bg-amber-600 text-white">
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fund Escrow'}
                    </Button>
                  </div>
                )}

                {contract?.status === 'IN_PROGRESS' && (
                  <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-bold text-blue-400">Escrow Funded</h4>
                    <p className="text-sm text-blue-400/80 mt-1">Funds are safely locked in escrow. The student is currently working.</p>
                  </div>
                )}

                {contract?.status === 'SUBMITTED' && (
                  <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-4">
                    <div>
                      <h4 className="font-bold text-purple-400">Work Submitted for Review</h4>
                      <p className="text-sm text-purple-400/80 mt-1">The student has submitted their deliverables. Please review and approve to release funds.</p>
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={() => setApproveDialogOpen(true)} disabled={processing} className="bg-emerald-600 hover:bg-emerald-500 text-white flex-1">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Release Funds
                      </Button>
                      <Button onClick={() => setDisputeDialogOpen(true)} disabled={processing} variant="destructive" className="flex-1">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Open Dispute
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </>
        )}

        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Approve Deliverables</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this work? The funds currently in escrow will be immediately released to the student. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={processing}>Cancel</Button>
              <Button onClick={handleApprove} disabled={processing} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Approve & Release Funds
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Open Dispute</DialogTitle>
              <DialogDescription>
                Please provide a reason for opening a dispute. An admin will review the case and make a decision regarding the escrowed funds.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="Reason for dispute..." 
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisputeDialogOpen(false)} disabled={processing}>Cancel</Button>
              <Button onClick={handleDispute} disabled={processing || !disputeReason.trim()} variant="destructive">
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Dispute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
