'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'
import { Loader2, Globe, GraduationCap, CheckCircle2, User, Star } from 'lucide-react'
import { toast } from 'sonner'

export default function RecruiterNetworkPage() {
  const { user } = useRequireAuth()
  const [colleges, setColleges] = useState<any[]>([])
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [talentPushes, setTalentPushes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actingOn, setActingOn] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [colData, partData, pushData] = await Promise.all([
        apiClient('/colleges'), // Uses the public colleges endpoint
        apiClient('/partnerships/my'),
        apiClient('/recruiters/partnered-talent-pushes'),
      ])
      setColleges(Array.isArray(colData) ? colData : [])
      setPartnerships(Array.isArray(partData) ? partData : [])
      setTalentPushes(Array.isArray(pushData) ? pushData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchData()
  }, [user, fetchData])

  const handleRequest = async (collegeId: string) => {
    setActingOn(collegeId)
    try {
      await apiClient('/partnerships/request', {
        method: 'POST',
        body: JSON.stringify({ collegeId })
      })
      toast.success('Partnership request sent!')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request.')
    } finally {
      setActingOn(null)
    }
  }

  const handleAccept = async (partnershipId: string) => {
    setActingOn(partnershipId)
    try {
      await apiClient(`/partnerships/${partnershipId}/accept`, { method: 'PATCH' })
      toast.success('Partnership accepted!')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept.')
    } finally {
      setActingOn(null)
    }
  }

  const handleReject = async (partnershipId: string) => {
    setActingOn(partnershipId)
    try {
      await apiClient(`/partnerships/${partnershipId}/reject`, { method: 'PATCH' })
      toast.success('Partnership rejected.')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject.')
    } finally {
      setActingOn(null)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role="recruiter">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">College Partnerships</h1>
          <p className="text-sm text-foreground/60">Connect with colleges to receive exclusive talent pipelines directly from TPOs.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" /> College Network</CardTitle>
              <CardDescription>Partner with colleges</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
              ) : colleges.length === 0 ? (
                <p className="text-sm text-foreground/50 text-center py-12">No colleges found.</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {colleges.map(c => {
                    const partnership = partnerships.find(p => p.collegeId === c.id)
                    return (
                      <div key={c.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{c.name}</h4>
                            <p className="text-xs text-foreground/60">{c.domain}</p>
                          </div>
                        </div>
                        <div>
                          {!partnership && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs h-8" onClick={() => handleRequest(c.id)} disabled={actingOn === c.id}>
                              {actingOn === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Request'}
                            </Button>
                          )}
                          {partnership?.status === 'PENDING' && partnership.initiatedBy === 'RECRUITER' && (
                            <span className="text-xs px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">Request Sent</span>
                          )}
                          {partnership?.status === 'PENDING' && partnership.initiatedBy === 'TPO' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAccept(partnership.id)} disabled={actingOn === partnership.id} className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-xs">Accept</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(partnership.id)} disabled={actingOn === partnership.id} className="h-8 px-3 text-xs">Reject</Button>
                            </div>
                          )}
                          {partnership?.status === 'ACTIVE' && (
                            <span className="text-xs px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Partnered
                            </span>
                          )}
                          {partnership?.status === 'REJECTED' && (
                            <span className="text-xs px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-red-400">Rejected</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card glass className="bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-purple-400" /> Partnered Talent Pipeline</CardTitle>
              <CardDescription>Top students pushed directly to you by partnered TPOs</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
              ) : talentPushes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-foreground/50">No talent has been pushed to you yet.</p>
                  <p className="text-xs text-foreground/40 mt-1">Partner with colleges to start receiving direct recommendations.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {talentPushes.map(push => (
                    <div key={push.id} className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                      
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">From {push.tpo?.college?.name}</p>
                          <h4 className="font-bold text-lg">{push.student?.user?.name}</h4>
                          <p className="text-sm text-foreground/60">{push.student?.major}</p>
                        </div>
                        {push.student?.clusterTier && (
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${
                            push.student.clusterTier === 'ELITE' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' :
                            push.student.clusterTier === 'RISING_TALENT' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' :
                            'bg-blue-400/10 text-blue-400 border-blue-400/30'
                          }`}>
                            {push.student.clusterTier.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {push.message && (
                        <div className="mb-4 p-3 rounded-lg bg-background/50 border border-white/5 text-sm italic text-foreground/80">
                          "{push.message}"
                          <span className="block text-xs text-foreground/40 mt-1">— {push.tpo?.user?.name} (TPO)</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-foreground/60">
                        {push.student?.reputationScore > 0 && (
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {(push.student.reputationScore / 20).toFixed(1)}</span>
                        )}
                        <span>{push.student?.projectsCompleted} projects</span>
                        <span>{new Date(push.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
