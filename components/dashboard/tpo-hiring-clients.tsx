'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Loader2, Building, Users } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'

export function TpoHiringClients() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === 'TPO') {
      apiClient('/tpo/hiring-clients')
        .then(res => setClients(Array.isArray(res) ? res : []))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user])

  if (authLoading || !user) {
    return (
      <DashboardLayout role="tpo">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="tpo">
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients Directory</h1>
            <p className="text-sm text-foreground/60">View companies hiring from your college</p>
          </div>
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle>Hiring Companies</CardTitle>
            <CardDescription>Clients who have hired your students</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/60 mb-2">No companies have hired from your college yet.</p>
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
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground truncate">{client.companyName || client.name}</h3>
                          <span className="text-[10px] uppercase font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex-shrink-0 whitespace-nowrap">
                            <Users className="w-3 h-3 inline mr-1" />
                            Hired {client.projectsHired} student{client.projectsHired > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 mt-2 text-xs text-foreground/60">
                          <div className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {client.industry || 'Hiring Talent'}</div>
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
