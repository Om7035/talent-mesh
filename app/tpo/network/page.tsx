'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'
import { Search, Loader2, Globe, Building2, Briefcase, CheckCircle2, XCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function TPONetworkPage() {
  const { user } = useRequireAuth()
  const [recruiters, setRecruiters] = useState<any[]>([])
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actingOn, setActingOn] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [recData, partData] = await Promise.all([
        apiClient('/recruiters'),
        apiClient('/partnerships/my'),
      ])
      setRecruiters(Array.isArray(recData) ? recData : [])
      setPartnerships(Array.isArray(partData) ? partData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchData()
  }, [user, fetchData])

  const handleRequest = async (recruiterId: string) => {
    setActingOn(recruiterId)
    try {
      await apiClient('/partnerships/request', {
        method: 'POST',
        body: JSON.stringify({ recruiterId })
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

  const filteredRecruiters = recruiters.filter(r => 
    r.companyName?.toLowerCase().includes(search.toLowerCase()) || 
    r.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (!user) return null

  return (
    <DashboardLayout role="tpo">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Network</h1>
          <p className="text-sm text-foreground/60">Connect with companies to establish direct talent pipelines for your students.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card glass>
              <CardContent className="p-4 sm:p-6 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search companies or recruiters..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle>Discover Recruiters</CardTitle>
                <CardDescription>Verified recruiters active on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
                ) : filteredRecruiters.length === 0 ? (
                  <p className="text-sm text-foreground/50 text-center py-12">No recruiters found.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredRecruiters.map(r => {
                      const partnership = partnerships.find(p => p.recruiterId === r.id)
                      return (
                        <div key={r.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {r.user?.avatarUrl ? <img src={r.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : r.companyName?.[0] || '?'}
                            </div>
                            <div>
                              <h4 className="font-semibold">{r.companyName}</h4>
                              <p className="text-xs text-foreground/60 flex items-center gap-2">
                                <span>{r.user?.name}</span>
                                {r.industry && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {r.industry}</span>}
                              </p>
                            </div>
                          </div>
                          <div>
                            {!partnership && (
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-xs h-8" onClick={() => handleRequest(r.id)} disabled={actingOn === r.id}>
                                {actingOn === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Request Partnership'}
                              </Button>
                            )}
                            {partnership?.status === 'PENDING' && partnership.initiatedBy === 'TPO' && (
                              <span className="text-xs px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">Request Sent</span>
                            )}
                            {partnership?.status === 'PENDING' && partnership.initiatedBy === 'RECRUITER' && (
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
          </div>

          <div className="space-y-6">
            <Card glass className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400"><Globe className="w-5 h-5" /> Your Network</CardTitle>
                <CardDescription>Your active partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partnerships.filter(p => p.status === 'ACTIVE').length === 0 ? (
                    <p className="text-sm text-foreground/50 italic py-4">No active partnerships yet.</p>
                  ) : (
                    partnerships.filter(p => p.status === 'ACTIVE').map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.recruiter?.companyName}</p>
                          <p className="text-xs text-foreground/60">{p.recruiter?.user?.name}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
