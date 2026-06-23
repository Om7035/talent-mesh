'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Search, Loader2, Building } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'

export function ClientSearch({ role, title, description }: { role: string; title: string; description: string }) {
  const { user, isLoading: authLoading } = useRequireAuth()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const fetchClients = async () => {
    try {
      const c = await apiClient('/admin/users?role=CLIENT&limit=20')
      setClients(Array.isArray(c?.data) ? c.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchClients()
    } else {
      // If TPO, we can use same API if authorized, or just display empty if TPO doesn't have access.
      // Assuming TPO might not have /admin/users access.
      setLoading(false)
    }
  }, [user])

  const handleSearch = async () => {
    if (user?.role !== 'ADMIN') return
    setSearching(true)
    try {
      const res = await apiClient(`/admin/users?role=CLIENT&search=${encodeURIComponent(searchQuery)}&limit=20`)
      setClients(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  if (authLoading || !user) {
    return (
      <DashboardLayout role={role as any}>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={role as any}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-foreground/60">{description}</p>
          </div>
        </div>

        {/* Search */}
        {user.role === 'ADMIN' && (
          <Card glass>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search clients by name or company..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching} className="h-[46px] px-8 bg-blue-600 hover:bg-blue-500">
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clients Grid */}
        <Card glass>
          <CardHeader>
            <CardTitle>Client Directory</CardTitle>
            <CardDescription>Registered companies and clients</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || searching ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/60 mb-2">No clients found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {clients.map((client) => (
                  <div key={client.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {client.avatarUrl ? (
                          <img src={client.avatarUrl} alt={client.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          client.name?.split(' ').map((n:string) => n[0]).join('').slice(0,2) || 'C'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                        <div className="flex flex-col gap-1 mt-2 text-xs text-foreground/60">
                          <div className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Client Account</div>
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
    </DashboardLayout>
  )
}
