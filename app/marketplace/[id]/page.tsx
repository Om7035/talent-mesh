'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { IndianRupee, Clock, Loader2, ArrowLeft, CheckCircle, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedBudget, setProposedBudget] = useState('')
  const [error, setError] = useState('')

  // TPO recommend-a-student flow
  const [tpoStudents, setTpoStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [recommendMessage, setRecommendMessage] = useState('')
  const [recommending, setRecommending] = useState(false)
  const [recommended, setRecommended] = useState(false)

  useEffect(() => {
    apiClient(`/projects/${params.id}`)
      .then(setProject)
      .catch((err) => setError(err.message || 'Project not found'))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (user?.role !== 'STUDENT') return
    apiClient('/applications/my')
      .then((apps) => {
        const list = apps?.applications || apps || []
        if (list.some((a: any) => a.projectId === params.id)) setApplied(true)
      })
      .catch(() => {})
  }, [user, params.id])

  useEffect(() => {
    if (user?.role !== 'TPO') return
    apiClient('/tpo/students?limit=100&verificationStatus=VERIFIED')
      .then((data) => setTpoStudents(data?.students || []))
      .catch(() => {})
  }, [user])

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId) return
    setRecommending(true)
    setError('')
    try {
      await apiClient(`/tpo/students/${selectedStudentId}/recommend/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ message: recommendMessage || undefined }),
      })
      setRecommended(true)
      toast.success('Student recommended to the client!')
    } catch (err: any) {
      setError(err.message || 'Failed to recommend student.')
    } finally {
      setRecommending(false)
    }
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplying(true)
    setError('')
    try {
      await apiClient(`/projects/${params.id}/applications`, {
        method: 'POST',
        body: JSON.stringify({
          coverLetter: coverLetter || undefined,
          proposedBudget: proposedBudget ? Number(proposedBudget) : undefined,
        }),
      })
      setApplied(true)
      toast.success('Application submitted!')
    } catch (err: any) {
      setError(err.message || 'Failed to apply.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center text-foreground/60">{error || 'Project not found.'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card glass>
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded whitespace-nowrap">
                  {project.category}
                </span>
              </div>

              <p className="text-sm text-foreground/60 mb-2">
                Posted by {project.hideClientName ? 'a verified client' : (project.client?.companyName || project.client?.user?.name || 'Client')}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm bg-black/20 p-4 rounded-xl border border-white/5 my-6">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <IndianRupee className="w-4 h-4" /><span>{Number(project.budget).toLocaleString()}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5 text-foreground/60">
                  <Clock className="w-4 h-4" /><span>{project.timelineDays} days</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5 text-foreground/60">
                  <Users className="w-4 h-4" /><span>{project._count?.applications ?? 0} applicants</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-foreground/60 capitalize">{project.difficulty?.toLowerCase()}</span>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-2">
                {(project.skills || []).map((s: any) => (
                  <span key={s.skillId} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-foreground/70">{s.skill?.name}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {!user ? (
            <Card glass>
              <CardContent className="p-6 text-center space-y-3">
                <p className="text-sm text-foreground/70">Sign in as a student to apply to this project.</p>
                <Link href="/login"><Button className="bg-blue-600 hover:bg-blue-500">Sign In</Button></Link>
              </CardContent>
            </Card>
          ) : user.role === 'TPO' ? (
            recommended ? (
              <Card glass className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-6 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <p className="text-sm text-emerald-400 font-medium">You've recommended a student for this project. The client has been notified.</p>
                </CardContent>
              </Card>
            ) : (
              <Card glass>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> Recommend a Student</h3>
                  <p className="text-xs text-foreground/50 mb-4">The client decides who to hire — this just puts your verified student in front of them.</p>
                  {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>}
                  <form onSubmit={handleRecommend} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Student</label>
                      <select
                        required
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select a verified student</option>
                        {tpoStudents.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.user?.name} — {s.clusterTier?.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Note to client (optional)</label>
                      <textarea
                        value={recommendMessage}
                        onChange={(e) => setRecommendMessage(e.target.value)}
                        rows={3}
                        placeholder="Why this student is a good fit..."
                        className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      />
                    </div>
                    <Button type="submit" disabled={recommending || !selectedStudentId} className="w-full bg-blue-600 hover:bg-blue-500">
                      {recommending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {recommending ? 'Submitting...' : 'Recommend Student'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
          ) : user.role !== 'STUDENT' ? (
            <Card glass>
              <CardContent className="p-6 text-center text-sm text-foreground/60">
                Only student accounts can apply to projects.
              </CardContent>
            </Card>
          ) : applied ? (
            <Card glass className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-6 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-emerald-400 font-medium">You've already applied to this project.</p>
              </CardContent>
            </Card>
          ) : (
            <Card glass>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Apply to this project</h3>
                {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>}
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cover Letter (optional)</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={4}
                      placeholder="Tell the client why you're a good fit..."
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Proposed Budget (optional)</label>
                    <div className="flex items-center">
                      <span className="px-4 py-2 rounded-l-lg border border-r-0 border-border bg-muted">₹</span>
                      <input
                        type="number"
                        value={proposedBudget}
                        onChange={(e) => setProposedBudget(e.target.value)}
                        placeholder={String(project.budget)}
                        className="flex-1 px-4 py-2 rounded-r-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={applying} className="w-full bg-blue-600 hover:bg-blue-500">
                    {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  )
}
