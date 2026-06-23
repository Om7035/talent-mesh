'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfileSettings() {
  const { user, isLoading, logout } = useRequireAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({ name: '', password: '' })

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      router.push('/student/profile')
    } else if (user) {
      setFormData({ name: user.name || '', password: '' })
    }
  }, [user, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = {}
      if (formData.name !== user?.name) payload.name = formData.name
      if (formData.password) payload.password = formData.password
      
      if (Object.keys(payload).length > 0) {
        await apiClient('/users/me', {
          method: 'PATCH',
          body: JSON.stringify(payload)
        })
        toast.success('Profile updated successfully! If you changed your password, please log in again.')
        if (payload.password) {
          logout()
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user) return null
  if (user.role === 'STUDENT') return null

  return (
    <DashboardLayout role={user.role.toLowerCase() as any}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-foreground/60">Manage your account details and preferences.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Full Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 focus:ring-1 focus:ring-blue-500 max-w-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Email Address (Read-only)</label>
                <input
                  readOnly
                  value={user.email}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 opacity-50 cursor-not-allowed max-w-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Role (Read-only)</label>
                <input
                  readOnly
                  value={user.role}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 opacity-50 cursor-not-allowed max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Security Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/60 mb-4">Theme settings are managed from the top navigation bar.</p>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 focus:ring-1 focus:ring-blue-500 max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || (!formData.password && formData.name === user.name)} className="bg-blue-600 hover:bg-blue-500">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
