'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, Users, Search, Edit2, Trash2, UserPlus, Shield, Ban, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminUsersDashboard() {
  const { user } = useRequireAuth()
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  
  // Forms state
  const [formData, setFormData] = useState({ name: '', email: '', role: 'STUDENT', password: '', collegeId: '' })
  const [colleges, setColleges] = useState<any[]>([])

  useEffect(() => {
    if (isAddOpen && colleges.length === 0) {
      apiClient('/colleges').then(setColleges).catch(() => setColleges([]))
    }
  }, [isAddOpen, colleges.length])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const q = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      const res = await apiClient(`/admin/users?page=${page}&limit=20${q}`)
      setUsers(res.users || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers()
    }
  }, [user, page])

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const handleDelete = async () => {
    if (!deletingUserId) return
    try {
      await apiClient(`/admin/users/${deletingUserId}`, { method: 'DELETE' })
      setUsers(prev => prev.filter(u => u.id !== deletingUserId))
      setTotal(t => t - 1)
      toast.success('User deleted successfully.')
    } catch (err) {
      toast.error('Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleToggleStatus = async (targetUser: any) => {
    try {
      const updated = await apiClient(`/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !targetUser.isActive, role: targetUser.role, name: targetUser.name })
      })
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, isActive: updated.isActive } : u))
      toast.success('Status updated.')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const submitAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient('/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setIsAddOpen(false)
      setFormData({ name: '', email: '', role: 'STUDENT', password: '', collegeId: '' })
      fetchUsers()
      toast.success('User added successfully.')
    } catch (err: any) {
      toast.error('Failed to add user: ' + err.message)
    }
  }

  const submitEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      const updated = await apiClient(`/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editingUser.name, role: editingUser.role, isActive: editingUser.isActive })
      })
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updated } : u))
      setEditingUser(null)
      toast.success('User updated successfully.')
    } catch (err: any) {
      toast.error('Failed to update user: ' + err.message)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-500" />
              Live User Management
            </h1>
            <p className="text-foreground/60">Full database access. Add, remove, and manage all users across the platform.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-500">
            <UserPlus className="w-4 h-4 mr-2" /> Add New User
          </Button>
        </div>

        <Card glass>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search users by name or email..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
              <div className="text-sm text-foreground/60">
                Showing {users.length} of {total} users
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5 border-b border-white/10 text-foreground/70">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name & Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-foreground/40" /></td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{u.name}</div>
                        <div className="text-foreground/60 text-xs">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                          u.role === 'CLIENT' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium"><Ban className="w-3.5 h-3.5" /> Suspended</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground/60">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleToggleStatus(u)}>
                            {u.isActive ? <Ban className="w-4 h-4 text-orange-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setEditingUser(u)}>
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-500/20 hover:bg-red-500/10" onClick={() => setDeletingUserId(u.id)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
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
              <Button disabled={users.length < 20} onClick={() => setPage(p => p + 1)} variant="outline" size="sm">Next</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals overlay */}
      {(isAddOpen || editingUser || deletingUserId) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-white/10 bg-background shadow-2xl">
            <CardHeader>
              <CardTitle>
                {deletingUserId ? 'Confirm Deletion' : isAddOpen ? 'Add New User' : 'Edit User'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deletingUserId ? (
                <div className="space-y-4">
                  <p className="text-foreground/70">Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.</p>
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                    <Button type="button" variant="outline" onClick={() => setDeletingUserId(null)}>Cancel</Button>
                    <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-500">Delete User</Button>
                  </div>
                </div>
              ) : (
              <form onSubmit={isAddOpen ? submitAddUser : submitEditUser} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Full Name</label>
                  <input required
                    value={isAddOpen ? formData.name : editingUser.name}
                    onChange={e => isAddOpen ? setFormData({...formData, name: e.target.value}) : setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {isAddOpen && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Email</label>
                      <input required type="email"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Password</label>
                      <input required type="password" placeholder="Min 8 characters"
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Role</label>
                  <select
                    value={isAddOpen ? formData.role : editingUser.role}
                    onChange={e => isAddOpen ? setFormData({...formData, role: e.target.value}) : setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-zinc-900 text-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="CLIENT">Client</option>
                    <option value="RECRUITER">Recruiter</option>
                    <option value="TPO">TPO</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {isAddOpen && (formData.role === 'STUDENT' || formData.role === 'TPO') && (
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">College</label>
                    <select required
                      value={formData.collegeId}
                      onChange={e => setFormData({ ...formData, collegeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-zinc-900 text-white focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="" disabled>Select a college</option>
                      {colleges.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setEditingUser(null) }}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Save User</Button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
