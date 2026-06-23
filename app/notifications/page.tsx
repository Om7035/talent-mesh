'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Loader2, Bell, Check, BellRing } from 'lucide-react'

export default function NotificationsPage() {
  const { user } = useRequireAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const data = await apiClient('/notifications')
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  const markAllRead = async () => {
    try {
      await apiClient('/notifications/read-all', { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const markRead = async (id: string) => {
    try {
      await apiClient(`/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      console.error(err)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout role={user.role.toLowerCase() as any}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-foreground/60">Stay updated on your account activity.</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <Button onClick={markAllRead} variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
              <Check className="w-4 h-4 mr-2" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : notifications.length === 0 ? (
          <Card glass>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="w-12 h-12 text-foreground/20 mb-4" />
              <p className="font-semibold text-lg mb-1">No notifications</p>
              <p className="text-sm text-foreground/50">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`p-4 rounded-xl border transition-colors ${n.isRead ? 'bg-white/5 border-white/5' : 'bg-blue-500/10 border-blue-500/20 cursor-pointer hover:bg-blue-500/15'}`}
              >
                <div className="flex gap-4">
                  <div className={`p-2 rounded-full h-fit flex-shrink-0 ${n.isRead ? 'bg-white/10 text-foreground/50' : 'bg-blue-500/20 text-blue-400'}`}>
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${n.isRead ? 'text-foreground/80' : 'text-foreground'}`}>{n.title}</h4>
                    <p className="text-sm text-foreground/70 mt-0.5">{n.message}</p>
                    <p className="text-xs text-foreground/40 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
