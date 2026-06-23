'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, GraduationCap, Plus, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCollegesPage() {
  const { user } = useRequireAuth()
  const [colleges, setColleges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', domain: '', city: '', country: 'India', address: '' })

  const fetchColleges = async () => {
    setLoading(true)
    try {
      const data = await apiClient('/colleges')
      setColleges(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchColleges()
  }, [user])

  const submitAddCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const created = await apiClient('/colleges', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setColleges(prev => [...prev, { ...created, departments: [] }].sort((a, b) => a.name.localeCompare(b.name)))
      setIsAddOpen(false)
      setFormData({ name: '', domain: '', city: '', country: 'India', address: '' })
      toast.success('College added successfully.')
    } catch (err: any) {
      toast.error('Failed to add college: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-500" />
              College Management
            </h1>
            <p className="text-foreground/60">Add colleges so students can select them during signup.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-500">
            <Plus className="w-4 h-4 mr-2" /> Add College
          </Button>
        </div>

        <Card glass>
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5 border-b border-white/10 text-foreground/70">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Domain</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-foreground/40" /></td></tr>
                  ) : colleges.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-foreground/50">No colleges yet.</td></tr>
                  ) : colleges.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-foreground/70">{c.domain}</td>
                      <td className="px-4 py-3 text-foreground/70">{c.city || '—'}</td>
                      <td className="px-4 py-3 text-foreground/70">{c.country}</td>
                      <td className="px-4 py-3">
                        {c.isVerified ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                        ) : (
                          <span className="text-foreground/40 text-xs">Unverified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add College Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Add College</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-foreground/50 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitAddCollege} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. IIT Bombay" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">Email Domain</label>
                <Input value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="e.g. iitb.ac.in" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">City</label>
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">Country</label>
                  <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">Address (optional)</label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500">
                {submitting ? 'Adding...' : 'Add College'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
