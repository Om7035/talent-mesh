'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRequireAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { Loader2, Save, User, CreditCard, Bell, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SettingsHub() {
  const { user, isLoading, logout } = useRequireAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', password: '' })

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', password: '' })
  }, [user])

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
          body: JSON.stringify(payload),
        })
        toast.success('Account updated successfully! If you changed your password, please log in again.')
        if (payload.password) {
          logout()
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user) return null

  const profileHref = user.role === 'STUDENT' ? '/student/profile' : '/settings/profile'

  const quickLinks = [
    { label: 'Edit Full Profile', description: 'Bio, skills, links, and public details', href: profileHref, icon: User },
    { label: 'Payout Settings', description: 'Bank account and UPI details for earnings', href: '/settings/payouts', icon: CreditCard },
    { label: 'Notifications', description: 'View and manage your notifications', href: '/notifications', icon: Bell },
  ]

  return (
    <DashboardLayout role={user.role.toLowerCase() as any}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-foreground/60">Manage your account and preferences.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your basic account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Full Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <CardTitle>Security</CardTitle>
              <CardDescription>Theme is managed from the top navigation bar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

        <Card glass>
          <CardHeader>
            <CardTitle>More</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-foreground/50" />
                  <div>
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="text-xs text-foreground/50">{link.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/30" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
