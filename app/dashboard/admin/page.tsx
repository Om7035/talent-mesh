'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, IndianRupee, ShieldAlert, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user } = useRequireAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [disputes, setDisputes] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      apiClient('/admin/stats'),
      apiClient('/admin/moderation'),
      apiClient('/admin/audit-logs?limit=8'),
    ])
      .then(([statsRes, moderationRes, logsRes]) => {
        setStats(statsRes)
        setDisputes(Array.isArray(moderationRes) ? moderationRes : [])
        setAuditLogs(Array.isArray(logsRes) ? logsRes : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  if (!user) return null

  return (
    <DashboardLayout role="admin">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-foreground/60">Monitor platform health and manage system operations</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : (
          <>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariants}>
                <StatCard title="Total Users" value={stats?.totalUsers ?? 0} description="All registered accounts" icon={<Users className="w-5 h-5" />} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard title="Total Projects" value={stats?.totalProjects ?? 0} description="Posted on platform" icon={<Briefcase className="w-5 h-5" />} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard title="Platform Revenue" value={`₹${Number(stats?.totalRevenue ?? 0).toLocaleString()}`} description="Total platform fees collected" icon={<IndianRupee className="w-5 h-5" />} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard title="Open Disputes" value={stats?.openDisputes ?? 0} description="Requires action" icon={<ShieldAlert className="w-5 h-5" />} />
              </motion.div>
            </motion.div>

            {/* Moderation Queue (real open disputes) */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Queue</CardTitle>
                  <CardDescription>Open disputes awaiting resolution</CardDescription>
                </CardHeader>
                <CardContent>
                  {disputes.length === 0 ? (
                    <p className="text-sm text-foreground/50 py-8 text-center">No open disputes. 🎉</p>
                  ) : (
                    <div className="space-y-3">
                      {disputes.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.contract?.id ? `Contract ${item.contract.id.slice(0, 8)}…` : 'Dispute'}</h4>
                            <p className="text-xs text-foreground/60">{item.reason}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{item.status}</span>
                            <Link href={`/admin/disputes?id=${item.id}`} className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded hover:opacity-90 transition-opacity">
                              Review
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Audit Log */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Admin Activity</CardTitle>
                  <CardDescription>Latest actions logged on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-foreground/50 py-8 text-center">No activity logged yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{log.action.replace(/_/g, ' ')}</h4>
                            <p className="text-xs text-foreground/60">{log.user?.name || 'System'} · {log.resource}</p>
                          </div>
                          <span className="text-xs text-foreground/40">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
