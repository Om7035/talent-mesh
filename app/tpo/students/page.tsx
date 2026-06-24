'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'
import { Search, Loader2, Phone, Mail, CheckCircle2, XCircle, ShieldAlert, ShieldCheck, Star, Sparkles, Send } from 'lucide-react'
import { toast } from 'sonner'

const TIER_BADGE: Record<string, string> = {
  BEGINNER: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
  RISING_TALENT: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  PROFESSIONAL: 'bg-violet-400/10 text-violet-400 border-violet-400/20',
  ELITE: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
}

export default function TPOStudentsPage() {
  const { user } = useRequireAuth()
  const [students, setStudents] = useState<any[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('')
  const [clusterTier, setClusterTier] = useState('')
  const [banDialogStudentId, setBanDialogStudentId] = useState<string | null>(null)
  const [banReason, setBanReason] = useState('')
  const [actingOn, setActingOn] = useState<string | null>(null)
  
  // Partnership & Push State
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [pushDialogStudentId, setPushDialogStudentId] = useState<string | null>(null)
  const [selectedRecruiterId, setSelectedRecruiterId] = useState('')
  const [pushMessage, setPushMessage] = useState('')

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (search) params.set('search', search)
      if (departmentId) params.set('departmentId', departmentId)
      if (verificationStatus) params.set('verificationStatus', verificationStatus)
      if (clusterTier) params.set('clusterTier', clusterTier)
      const data = await apiClient(`/tpo/students?${params.toString()}`)
      const list = data?.students || []
      setStudents(list)
      const deps = new Map<string, string>()
      list.forEach((s: any) => { if (s.department) deps.set(s.department.id, s.department.name) })
      setDepartments(Array.from(deps, ([id, name]) => ({ id, name })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, departmentId, verificationStatus, clusterTier])

  const fetchPartnerships = useCallback(async () => {
    try {
      const data = await apiClient('/partnerships/my')
      setPartnerships(data.filter((p: any) => p.status === 'ACTIVE'))
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchStudents()
      fetchPartnerships()
    }
  }, [user, fetchStudents, fetchPartnerships])

  const handleVerify = async (studentId: string) => {
    setActingOn(studentId)
    try {
      await apiClient(`/tpo/verify/${studentId}`, { method: 'PATCH' })
      toast.success('Student verified.')
      fetchStudents()
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify student.')
    } finally {
      setActingOn(null)
    }
  }

  const handleReject = async (studentId: string) => {
    setActingOn(studentId)
    try {
      await apiClient(`/tpo/reject/${studentId}`, { method: 'PATCH', body: JSON.stringify({ reason: 'Profile did not meet verification criteria.' }) })
      toast.success('Verification rejected.')
      fetchStudents()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject student.')
    } finally {
      setActingOn(null)
    }
  }

  const handleUnban = async (studentId: string) => {
    setActingOn(studentId)
    try {
      await apiClient(`/tpo/students/${studentId}/shadow-unban`, { method: 'PATCH' })
      toast.success('Restriction lifted.')
      fetchStudents()
    } catch (err: any) {
      toast.error(err.message || 'Failed to lift restriction.')
    } finally {
      setActingOn(null)
    }
  }

  const submitBan = async () => {
    if (!banDialogStudentId || !banReason.trim()) return
    setActingOn(banDialogStudentId)
    try {
      await apiClient(`/tpo/students/${banDialogStudentId}/shadow-ban`, { method: 'PATCH', body: JSON.stringify({ reason: banReason }) })
      toast.success('Student restricted.')
      setBanDialogStudentId(null)
      setBanReason('')
      fetchStudents()
    } catch (err: any) {
      toast.error(err.message || 'Failed to restrict student.')
    } finally {
      setActingOn(null)
    }
  }

  const handleToggleRecommended = async (studentId: string) => {
    setActingOn(studentId)
    try {
      await apiClient(`/tpo/students/${studentId}/toggle-recommended`, { method: 'PATCH' })
      fetchStudents()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update.')
    } finally {
      setActingOn(null)
    }
  }

  const submitPush = async () => {
    if (!pushDialogStudentId || !selectedRecruiterId) return
    setActingOn(pushDialogStudentId)
    try {
      await apiClient(`/tpo/students/${pushDialogStudentId}/push-to-recruiter/${selectedRecruiterId}`, {
        method: 'POST',
        body: JSON.stringify({ message: pushMessage })
      })
      toast.success('Talent profile pushed to recruiter successfully!')
      setPushDialogStudentId(null)
      setSelectedRecruiterId('')
      setPushMessage('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to push talent.')
    } finally {
      setActingOn(null)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role="tpo">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-foreground/60">Manage, verify, and recommend students from your college</p>
        </div>

        <Card glass>
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm">
              <option value="">Any Status</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select value={clusterTier} onChange={(e) => setClusterTier(e.target.value)} className="px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm">
              <option value="">Any Tier</option>
              <option value="BEGINNER">Beginner</option>
              <option value="RISING_TALENT">Rising Talent</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ELITE">Elite</option>
            </select>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>{students.length} Student{students.length !== 1 ? 's' : ''}</CardTitle>
            <CardDescription>Verify pending profiles, restrict visibility when needed, and flag top talent for recruiters</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
            ) : students.length === 0 ? (
              <p className="text-sm text-foreground/50 text-center py-12">No students match these filters.</p>
            ) : (
              <div className="space-y-3">
                {students.map((s: any) => (
                  <div key={s.id} className={`p-4 rounded-xl border ${s.isShadowBanned ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{s.user?.name}</h4>
                          {s.tpoRecommended && (
                            <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">
                              <Sparkles className="w-3 h-3" /> Recommended
                            </span>
                          )}
                          {s.isShadowBanned && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20 font-medium">Restricted</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-foreground/50">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {s.user?.email}</span>
                          {s.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {s.phone}</span>}
                          {s.department?.name && <span>{s.department.name}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${TIER_BADGE[s.clusterTier] || ''}`}>{s.clusterTier?.replace('_', ' ')}</span>
                          <span className="flex items-center gap-1 text-xs text-foreground/60"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {s.reputationScore?.toFixed(1)}</span>
                          <span className="text-xs text-foreground/60">{s.projectsCompleted} projects</span>
                          <span className="text-xs text-foreground/60">₹{Number(s.totalEarnings).toLocaleString()}</span>
                        </div>
                        {s.isShadowBanned && s.shadowBanReason && (
                          <p className="text-xs text-red-400/80 mt-2">Reason: {s.shadowBanReason}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border ${
                          s.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          s.verificationStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {s.verificationStatus}
                        </span>
                        <div className="flex gap-1.5">
                          {s.verificationStatus === 'PENDING' && (
                            <>
                              <Button size="sm" onClick={() => handleVerify(s.id)} disabled={actingOn === s.id} className="h-7 px-2 bg-emerald-600 hover:bg-emerald-500 text-xs">
                                {actingOn === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(s.id)} disabled={actingOn === s.id} className="h-7 px-2 text-xs">
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleRecommended(s.id)}
                            disabled={actingOn === s.id}
                            className="h-7 px-2 text-xs bg-white/5 border-white/10"
                            title={s.tpoRecommended ? 'Remove recommendation' : 'Mark as recommended'}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </Button>
                          {s.isShadowBanned ? (
                            <Button size="sm" onClick={() => handleUnban(s.id)} disabled={actingOn === s.id} className="h-7 px-2 bg-blue-600 hover:bg-blue-500 text-xs">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="destructive" onClick={() => setBanDialogStudentId(s.id)} disabled={actingOn === s.id} className="h-7 px-2 text-xs" title="Restrict">
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {partnerships.length > 0 && !s.isShadowBanned && s.verificationStatus === 'VERIFIED' && (
                            <Button 
                              size="sm" 
                              onClick={() => setPushDialogStudentId(s.id)} 
                              disabled={actingOn === s.id} 
                              className="h-7 px-2 bg-purple-600 hover:bg-purple-500 text-xs shadow-sm shadow-purple-500/20"
                              title="Push to Partnered Recruiter"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {banDialogStudentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-white/10 bg-background shadow-2xl">
            <CardHeader>
              <CardTitle>Restrict Student Visibility</CardTitle>
              <CardDescription>This hides their profile from search, recommendations, and the leaderboard. They'll be notified with this reason.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                placeholder="Reason for restriction..."
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setBanDialogStudentId(null); setBanReason('') }}>Cancel</Button>
                <Button variant="destructive" onClick={submitBan} disabled={!banReason.trim() || actingOn === banDialogStudentId}>
                  {actingOn === banDialogStudentId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Restrict Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {pushDialogStudentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-white/10 bg-background shadow-2xl">
            <CardHeader>
              <CardTitle>Push Talent to Partner</CardTitle>
              <CardDescription>Send this student's profile directly to a partnered recruiter. The student will not be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1 block">Select Partnered Recruiter</label>
                <select
                  value={selectedRecruiterId}
                  onChange={(e) => setSelectedRecruiterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                >
                  <option value="">-- Choose a partner --</option>
                  {partnerships.map((p) => (
                    <option key={p.recruiter.id} value={p.recruiter.id}>
                      {p.recruiter.companyName} ({p.recruiter.user?.name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1 block">Message (Optional)</label>
                <textarea
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. This student matches your recent hiring criteria for React developers."
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setPushDialogStudentId(null); setSelectedRecruiterId(''); setPushMessage('') }}>Cancel</Button>
                <Button className="bg-purple-600 hover:bg-purple-500" onClick={submitPush} disabled={!selectedRecruiterId || actingOn === pushDialogStudentId}>
                  {actingOn === pushDialogStudentId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Push to Recruiter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
