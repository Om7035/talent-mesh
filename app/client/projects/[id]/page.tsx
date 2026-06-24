'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, ShieldAlert, IndianRupee, Clock, Star, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function ClientProjectDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useRequireAuth()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [contract, setContract] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [tpoRecommendations, setTpoRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [hiringId, setHiringId] = useState<string | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      apiClient(`/projects/${params.id}`).catch(() => null),
      apiClient(`/contracts/project/${params.id}`).catch(() => null),
      apiClient(`/projects/${params.id}/applications`).catch(() => []),
      apiClient(`/recommendations/project/${params.id}/candidates?limit=5`).catch(() => []),
      apiClient(`/projects/${params.id}/tpo-recommendations`).catch(() => []),
    ]).then(([projData, contractData, appsData, candidatesData, tpoRecData]) => {
      setProject(projData)
      setContract(contractData)
      setApplications(Array.isArray(appsData) ? appsData : [])
      setCandidates(Array.isArray(candidatesData) ? candidatesData : [])
      setTpoRecommendations(Array.isArray(tpoRecData) ? tpoRecData : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  const handleSelectStudent = async (applicationId: string) => {
    setHiringId(applicationId)
    try {
      await apiClient(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACCEPTED' }),
      })
      await apiClient(`/contracts/from-application/${applicationId}`, { method: 'POST' })
      toast.success('Student hired! Fund the escrow to get started.')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to hire student.')
    } finally {
      setHiringId(null)
    }
  }

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
        ) : !project ? (
           <div className="text-foreground/60">Project not found.</div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-foreground/60">{project.category} · {project.difficulty}</p>
            </div>

            <Card glass>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{project.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <IndianRupee className="w-4 h-4" /><span>{Number(project.budget).toLocaleString()}</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-1.5 text-foreground/60">
                    <Clock className="w-4 h-4" /><span>{project.timelineDays} days</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <span className="text-foreground/60">Status: {contract?.status || project.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(project.skills || []).map((s: any) => (
                    <span key={s.skillId} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-foreground/70">{s.skill?.name}</span>
                  ))}
                </div>

                {/* ESCROW ACTIONS BASED ON CONTRACT STATUS */}
                {contract?.status === 'ASSIGNED' && (
                  <div className="mt-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
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
                  <div className="mt-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-bold text-blue-400">Escrow Funded</h4>
                    <p className="text-sm text-blue-400/80 mt-1">Funds are safely locked in escrow. The student is currently working.</p>
                  </div>
                )}

                {contract?.status === 'SUBMITTED' && (
                  <div className="mt-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-4">
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

            {/* Applicants — only relevant before a student is hired */}
            {!contract && (
              <Card glass>
                <CardHeader>
                  <CardTitle>Applicants ({applications.length})</CardTitle>
                  <CardDescription>Review students who applied and select one to hire</CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <p className="text-sm text-foreground/50 py-8 text-center">No applications yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app: any) => (
                        <div key={app.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-sm">{app.student?.user?.name}</h4>
                              <p className="text-xs text-foreground/50">{app.student?.college?.name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{app.student?.reputationScore?.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">{app.status}</span>
                              {app.status === 'PENDING' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSelectStudent(app.id)}
                                  disabled={hiringId === app.id}
                                  className="block mt-2 bg-blue-600 hover:bg-blue-500 text-xs"
                                >
                                  {hiringId === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Hire This Student'}
                                </Button>
                              )}
                            </div>
                          </div>
                          {app.coverLetter && <p className="text-xs text-foreground/60 mt-3 italic">"{app.coverLetter}"</p>}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {(app.student?.skills || []).slice(0, 4).map((s: any) => (
                              <span key={s.skillId} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-foreground/60">{s.skill?.name}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* TPO-Recommended Students */}
            {!contract && tpoRecommendations.length > 0 && (
              <Card glass className="border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-emerald-400" /> TPO Recommended</CardTitle>
                  <CardDescription>Students personally vouched for by their college placement officer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tpoRecommendations.map((r: any) => {
                      const hasApplied = applications.some((a: any) => a.student?.id === r.student?.id)
                      return (
                        <div key={r.id} className="p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{r.student?.user?.name}</p>
                              <p className="text-xs text-foreground/50">{r.student?.college?.name} · Recommended by {r.tpo?.user?.name}</p>
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border ${
                              hasApplied ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/5 text-foreground/50 border-white/10'
                            }`}>
                              {hasApplied ? 'Has Applied' : 'Not Yet Applied'}
                            </span>
                          </div>
                          {r.message && <p className="text-xs text-foreground/60 mt-2 italic">"{r.message}"</p>}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI-Matched Candidates */}
            {!contract && candidates.length > 0 && (
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-violet-400" /> AI-Matched Candidates</CardTitle>
                  <CardDescription>Top students matched to this project, even if they haven't applied yet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidates.map((c: any) => (
                      <div key={c.student.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5">
                        <div>
                          <p className="text-sm font-medium">{c.student?.user?.name}</p>
                          <p className="text-xs text-foreground/50">{c.student?.college?.name}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20">
                          {Math.round(c.matchScore)}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
