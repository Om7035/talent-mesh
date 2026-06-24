'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star, TrendingUp, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useRequireAuth } from '@/lib/auth-context'

export default function LeaderboardPage() {
  const { user } = useRequireAuth()
  const [activeTab, setActiveTab] = useState<'global' | 'college' | 'skill'>('global')
  const [loading, setLoading] = useState(true)
  const [globalEntries, setGlobalEntries] = useState<any[]>([])
  const [collegeEntries, setCollegeEntries] = useState<any[]>([])
  const [skillEntries, setSkillEntries] = useState<any[]>([])
  const [myRank, setMyRank] = useState<any>(null)

  const tabs = [
    { id: 'global', label: 'Global', icon: '🌍' },
    { id: 'college', label: 'My College', icon: '🏫' },
    { id: 'skill', label: 'Skill-Based', icon: '🎯' },
  ]

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [globalRes, skillRes, rankRes, profileRes] = await Promise.all([
          apiClient('/leaderboard/global?limit=20'),
          apiClient('/leaderboard/skills'),
          apiClient('/leaderboard/my-rank'),
          apiClient('/students/me'),
        ])
        setGlobalEntries(globalRes?.entries || [])
        setSkillEntries(Array.isArray(skillRes) ? skillRes : [])
        setMyRank(rankRes)

        if (profileRes?.collegeId) {
          const collegeRes = await apiClient(`/leaderboard/college/${profileRes.collegeId}?limit=20`)
          setCollegeEntries(collegeRes?.entries || [])
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const getRankMedal = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <span className="text-lg font-bold text-foreground/60">{rank}</span>
  }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  const activeEntries = activeTab === 'global' ? globalEntries : activeTab === 'college' ? collegeEntries : []

  if (!user) return null

  return (
    <DashboardLayout role="student">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Leaderboards</h1>
          <p className="text-foreground/60">See how you rank against other talented students</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : (
          <>
            {(activeTab === 'global' || activeTab === 'college') && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                {activeEntries.length === 0 ? (
                  <p className="text-sm text-foreground/50 text-center py-12">No ranked students yet.</p>
                ) : activeEntries.map((entry) => (
                  <motion.div key={entry.student.id} variants={itemVariants}>
                    <Card className={`hover:border-accent/50 transition-all ${entry.rank <= 3 ? 'border-accent/50 bg-accent/5' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold">
                              {entry.rank <= 3 ? getRankMedal(entry.rank) : <span className="text-lg">{entry.rank}</span>}
                            </div>
                            <div>
                              <h3 className="font-semibold">{entry.student.name}</h3>
                              <p className="text-sm text-foreground/60">{entry.student.college || entry.student.department}</p>
                            </div>
                          </div>

                          <div className="hidden sm:flex items-center gap-8">
                            <div className="text-center">
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{entry.student.reputationScore?.toFixed(1)}</span>
                              </div>
                              <p className="text-xs text-foreground/60">Reputation</p>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-green-500">₹{Number(entry.student.totalEarnings).toLocaleString()}</div>
                              <p className="text-xs text-foreground/60">Earnings</p>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{entry.student.projectsCompleted}</div>
                              <p className="text-xs text-foreground/60">Projects</p>
                            </div>
                          </div>

                          <div className="flex sm:hidden gap-4 text-sm text-center">
                            <div>
                              <div className="font-semibold">₹{(Number(entry.student.totalEarnings) / 1000).toFixed(1)}k</div>
                              <p className="text-xs text-foreground/60">Earnings</p>
                            </div>
                            <div>
                              <div className="font-semibold">{entry.student.projectsCompleted}</div>
                              <p className="text-xs text-foreground/60">Projects</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'skill' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                {skillEntries.length === 0 ? (
                  <p className="text-sm text-foreground/50 text-center py-12">No skill data yet.</p>
                ) : skillEntries.map((entry) => (
                  <motion.div key={entry.skill} variants={itemVariants}>
                    <Card className="hover:border-accent/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold">
                              {entry.rank}
                            </div>
                            <div>
                              <h3 className="font-semibold">{entry.skill}</h3>
                              <p className="text-sm text-foreground/60">{entry.expertCount} students</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{entry.topExpert}</div>
                            <p className="text-xs text-foreground/60">Top Expert</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Your Rank */}
            <motion.div variants={itemVariants}>
              <Card className="border-accent/50 bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Your Current Rank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myRank ? (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      <div>
                        <div className="text-3xl font-bold text-accent">#{myRank.globalRank}</div>
                        <p className="text-sm text-foreground/60 mt-1">Global Rank</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">#{myRank.collegeRank}</div>
                        <p className="text-sm text-foreground/60 mt-1">Your College Rank</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{myRank.student?.reputationScore?.toFixed(1)}</div>
                        <p className="text-sm text-foreground/60 mt-1">Reputation Score</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-500">₹{Number(myRank.student?.totalEarnings ?? 0).toLocaleString()}</div>
                        <p className="text-sm text-foreground/60 mt-1">Total Earnings</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/60">You haven't been ranked yet — complete a project to appear on the leaderboard.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* How Rankings Work */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>How Rankings Work</CardTitle>
                  <CardDescription>Our ranking algorithm considers multiple factors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-accent">40%</div>
                      <p className="font-semibold text-sm">Reputation Score</p>
                      <p className="text-xs text-foreground/60">Based on client ratings and reviews</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-accent">35%</div>
                      <p className="font-semibold text-sm">Completion Rate</p>
                      <p className="text-xs text-foreground/60">Share of accepted contracts delivered successfully</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-accent">25%</div>
                      <p className="font-semibold text-sm">Earnings Growth</p>
                      <p className="text-xs text-foreground/60">Earning potential and growth trend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
