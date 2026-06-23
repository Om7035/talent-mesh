'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, Lock, CheckCircle2, UploadCloud, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function StudentProjectDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useRequireAuth()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submissionLink, setSubmissionLink] = useState('')

  const fetchData = () => {
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

  const handleSubmitWork = async () => {
    if (!submissionLink.trim()) {
      toast.error('Please enter a valid link.')
      return
    }

    try {
      setSubmitting(true)
      await apiClient(`/contracts/${contract.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ submission: submissionLink, notes: 'Please review my work.' })
      })
      toast.success('Work submitted successfully! The client has been notified.')
      setSubmitDialogOpen(false)
      setSubmissionLink('')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit work.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-5xl">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !project && !contract ? (
           <div>Project data not available. (You need to implement the backend GET endpoint for this page)</div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold">Project Workspace</h1>
              <p className="text-foreground/60">Submit your deliverables and track your payments.</p>
            </div>

            <Card glass>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Status: {contract?.status || project?.status || 'APPLIED'}</h2>
                  </div>
                </div>

                {/* ESCROW ACTIONS BASED ON CONTRACT STATUS */}
                {contract?.status === 'ASSIGNED' && (
                  <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <h4 className="font-bold text-amber-500 flex items-center gap-2">
                      <Lock className="w-5 h-5" /> Waiting for Client Escrow Funding
                    </h4>
                    <p className="text-sm text-amber-500/80 mt-1">
                      You have been hired! However, please DO NOT start working yet. Wait until the client deposits ₹{contract.agreedBudget} into the secure escrow.
                    </p>
                  </div>
                )}

                {contract?.status === 'IN_PROGRESS' && (
                  <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                    <div>
                      <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                        <Lock className="w-5 h-5" /> Escrow Funded & Locked
                      </h4>
                      <p className="text-sm text-emerald-400/80 mt-1">
                        ₹{contract.agreedBudget} is safely locked in the platform's escrow. You can safely begin working. Once finished, submit your deliverables below.
                      </p>
                    </div>
                    <Button onClick={() => setSubmitDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full md:w-auto">
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Submit Deliverables
                    </Button>
                  </div>
                )}

                {contract?.status === 'SUBMITTED' && (
                  <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-bold text-blue-400 flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Work Submitted
                    </h4>
                    <p className="text-sm text-blue-400/80 mt-1">
                      Your work is currently being reviewed by the client. The ₹{contract.agreedBudget} is still secured in escrow.
                    </p>
                  </div>
                )}

                {contract?.status === 'RELEASED' && (
                  <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <h4 className="font-bold text-purple-400 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Funds Released!
                    </h4>
                    <p className="text-sm text-purple-400/80 mt-1">
                      The client has approved your work. The funds have been released from escrow and added to your wallet balance!
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>

            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
              <DialogContent className="glass-panel">
                <DialogHeader>
                  <DialogTitle>Submit Deliverables</DialogTitle>
                  <DialogDescription>
                    Provide a link to your completed work (e.g., GitHub, Google Drive, Figma, or a hosted demo).
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    placeholder="https://..." 
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} disabled={submitting}>Cancel</Button>
                  <Button onClick={handleSubmitWork} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Submit Work
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
