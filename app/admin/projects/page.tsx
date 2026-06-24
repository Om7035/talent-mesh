'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, Briefcase, Search, Trash2, Archive, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProjects() {
  const { user } = useRequireAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  // Dialog state
  const [actingProject, setActingProject] = useState<{ id: string, title: string, action: 'CANCELLED' | 'ARCHIVED' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const q = []
      if (searchQuery) q.push(`search=${encodeURIComponent(searchQuery)}`)
      if (statusFilter) q.push(`status=${encodeURIComponent(statusFilter)}`)
      const qs = q.length ? `&${q.join('&')}` : ''
      
      const res = await apiClient(`/admin/projects?page=${page}&limit=20${qs}`)
      setProjects(res.projects || [])
      setTotal(res.pagination?.total || 0)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchProjects()
    }
  }, [user, page])

  const handleSearch = () => {
    setPage(1)
    fetchProjects()
  }

  const submitAction = async () => {
    if (!actingProject) return
    setIsSubmitting(true)
    try {
      await apiClient(`/admin/projects/${actingProject.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: actingProject.action })
      })
      toast.success(`Project ${actingProject.action.toLowerCase()} successfully.`)
      setActingProject(null)
      fetchProjects()
    } catch (err: any) {
      toast.error(`Failed to update project: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== 'ADMIN') return null

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-500" />
            Platform Projects
          </h1>
          <p className="text-foreground/60">Overview of all jobs across the marketplace and moderation tools.</p>
        </div>

        <Card glass>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search projects..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full sm:w-48 px-3 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500">Filter</Button>
              </div>
              <div className="text-sm text-foreground/60">
                Showing {projects.length} of {total}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5 border-b border-white/10 text-foreground/70">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Applicants</th>
                    <th className="px-4 py-3 font-medium">Created Date</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-foreground/40" /></td></tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <Briefcase className="w-12 h-12 text-foreground/20 mb-4" />
                          <p className="font-semibold text-lg mb-1">No Projects Found</p>
                          <p className="text-sm text-foreground/50">Try adjusting your search or filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : projects.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground max-w-[200px] truncate" title={p.title}>{p.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground/80 max-w-[150px] truncate" title={p.client?.companyName || p.client?.user?.name || 'Unknown'}>
                          {p.client?.companyName || p.client?.user?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                          p.status === 'CANCELLED' || p.status === 'ARCHIVED' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                          p.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                          'bg-zinc-500/20 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">₹{Number(p.budget).toLocaleString()}</td>
                      <td className="px-4 py-3">{p._count?.applications || 0}</td>
                      <td className="px-4 py-3 text-foreground/60">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status !== 'CANCELLED' && p.status !== 'ARCHIVED' && (
                            <>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-orange-500/20 hover:bg-orange-500/10 text-orange-400" title="Archive" onClick={() => setActingProject({ id: p.id, title: p.title, action: 'ARCHIVED' })}>
                                <Archive className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-500/20 hover:bg-red-500/10 text-red-400" title="Cancel" onClick={() => setActingProject({ id: p.id, title: p.title, action: 'CANCELLED' })}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline" size="sm">Previous</Button>
              <span className="text-sm text-foreground/50">Page {page}</span>
              <Button disabled={projects.length < 20} onClick={() => setPage(p => p + 1)} variant="outline" size="sm">Next</Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Confirmation Dialog */}
        {actingProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-white/10 bg-background shadow-2xl">
              <CardHeader>
                <CardTitle>Confirm {actingProject.action === 'CANCELLED' ? 'Cancellation' : 'Archival'}</CardTitle>
                <CardDescription>
                  Are you sure you want to override and {actingProject.action.toLowerCase()} project "{actingProject.title}"?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => setActingProject(null)}>Go Back</Button>
                  <Button 
                    onClick={submitAction} 
                    className={actingProject.action === 'CANCELLED' ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
