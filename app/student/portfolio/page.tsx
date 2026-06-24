'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Eye, Star, Loader2, Briefcase } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'

const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500']

export default function PortfolioPage() {
  const { user } = useRequireAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [contracts, setContracts] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    apiClient('/students/me')
      .then(async (me) => {
        setProfile(me)
        const portfolio = await apiClient(`/students/${me.id}/portfolio`)
        setContracts(Array.isArray(portfolio) ? portfolio : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  if (!user) return null

  return (
    <DashboardLayout role="student">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-foreground/60">Your completed projects, built automatically from delivered contracts</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : contracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="w-12 h-12 text-foreground/20 mb-4" />
              <p className="font-semibold text-lg mb-1">No completed projects yet</p>
              <p className="text-sm text-foreground/50">Finish a contract and it will automatically appear here as a portfolio piece.</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contracts.map((contract, idx) => {
              const review = contract.reviews?.[0]
              return (
                <motion.div key={contract.id} variants={itemVariants}>
                  <Card className="h-full overflow-hidden hover:shadow-lg hover:border-accent/50 transition-all group">
                    <div className={`h-32 ${COLORS[idx % COLORS.length]} relative flex items-center justify-center`}>
                      <span className="text-white/90 font-semibold text-sm px-4 text-center">{contract.project?.client?.companyName || 'Client Project'}</span>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{contract.project?.title}</h3>
                          <p className="text-sm text-foreground/60 line-clamp-2">{contract.project?.description}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {(contract.project?.skills || []).map((s: any) => (
                            <span key={s.skillId} className="text-xs bg-muted px-2 py-1 rounded">{s.skill?.name}</span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-foreground/60 border-t border-border pt-4">
                          <span>₹{Number(contract.agreedBudget).toLocaleString()} · {contract.timelineDays} days</span>
                          {review && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{review.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Portfolio Stats */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Portfolio Performance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-accent">{profile?.profileViews ?? 0}</div>
                  <p className="text-sm text-foreground/60">Profile Views</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{contracts.length}</div>
                  <p className="text-sm text-foreground/60">Completed Projects</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-green-500">{profile?.avgClientRating?.toFixed(1) ?? '0.0'}</div>
                  <p className="text-sm text-foreground/60">Avg Client Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
