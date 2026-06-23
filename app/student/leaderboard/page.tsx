'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'global' | 'college' | 'skill'>('global')

  const tabs = [
    { id: 'global', label: 'Global', icon: '🌍' },
    { id: 'college', label: 'My College', icon: '🏫' },
    { id: 'skill', label: 'Skill-Based', icon: '🎯' },
  ]

  const globalLeaderboard = [
    { rank: 1, name: 'Sarah Johnson', college: 'MIT', reputation: 4.9, earnings: 12500, projects: 18 },
    { rank: 2, name: 'Michael Chen', college: 'Stanford', reputation: 4.8, earnings: 11200, projects: 16 },
    { rank: 3, name: 'Emma Wilson', college: 'Berkeley', reputation: 4.8, earnings: 10800, projects: 15 },
    { rank: 4, name: 'James Rodriguez', college: 'CMU', reputation: 4.7, earnings: 9500, projects: 14 },
    { rank: 5, name: 'Lisa Chen', college: 'Harvard', reputation: 4.7, earnings: 8900, projects: 13 },
    { rank: 6, name: 'Alex Kumar', college: 'IIT Delhi', reputation: 4.6, earnings: 8200, projects: 12 },
    { rank: 7, name: 'Jordan Lee', college: 'NYU', reputation: 4.6, earnings: 7500, projects: 11 },
    { rank: 8, name: 'Casey Morgan', college: 'Oxford', reputation: 4.5, earnings: 6800, projects: 10 },
  ]

  const skillLeaderboard = [
    { skill: 'React', expert: 'Sarah Johnson', count: 24 },
    { skill: 'Node.js', expert: 'Michael Chen', count: 18 },
    { skill: 'TypeScript', expert: 'Emma Wilson', count: 15 },
    { skill: 'Python', expert: 'James Rodriguez', count: 14 },
    { skill: 'AWS', expert: 'Lisa Chen', count: 12 },
    { skill: 'UI/UX Design', expert: 'Alex Kumar', count: 11 },
  ]

  const getRankMedal = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <span className="text-lg font-bold text-foreground/60">{rank}</span>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <DashboardLayout role="student">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Leaderboards</h1>
          <p className="text-foreground/60">See how you rank against other talented students</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Global Leaderboard */}
        {activeTab === 'global' && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            {globalLeaderboard.map((entry, idx) => (
              <motion.div key={entry.rank} variants={itemVariants}>
                <Card
                  className={`hover:border-accent/50 transition-all ${
                    entry.rank <= 3 ? 'border-accent/50 bg-accent/5' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold">
                          {entry.rank <= 3 ? (
                            getRankMedal(entry.rank)
                          ) : (
                            <span className="text-lg">{entry.rank}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{entry.name}</h3>
                          <p className="text-sm text-foreground/60">{entry.college}</p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-8">
                        <div className="text-center">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{entry.reputation}</span>
                          </div>
                          <p className="text-xs text-foreground/60">Reputation</p>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-500">₹{entry.earnings.toLocaleString()}</div>
                          <p className="text-xs text-foreground/60">Earnings</p>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{entry.projects}</div>
                          <p className="text-xs text-foreground/60">Projects</p>
                        </div>
                      </div>

                      <div className="flex sm:hidden gap-4 text-sm text-center">
                        <div>
                          <div className="font-semibold">₹{entry.earnings / 1000}k</div>
                          <p className="text-xs text-foreground/60">Earnings</p>
                        </div>
                        <div>
                          <div className="font-semibold">{entry.projects}</div>
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

        {/* Skill Leaderboard */}
        {activeTab === 'skill' && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            {skillLeaderboard.map((entry, idx) => (
              <motion.div key={entry.skill} variants={itemVariants}>
                <Card className="hover:border-accent/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{entry.skill}</h3>
                          <p className="text-sm text-foreground/60">{entry.count} experts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{entry.expert}</div>
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
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold text-accent">42</div>
                  <p className="text-sm text-foreground/60 mt-1">Global Rank</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">15</div>
                  <p className="text-sm text-foreground/60 mt-1">Your College Rank</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.8</div>
                  <p className="text-sm text-foreground/60 mt-1">Reputation Score</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">$7.2K</div>
                  <p className="text-sm text-foreground/60 mt-1">Total Earnings</p>
                </div>
              </div>
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
                  <p className="font-semibold text-sm">Projects Completed</p>
                  <p className="text-xs text-foreground/60">Number and quality of completed projects</p>
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
      </motion.div>
    </DashboardLayout>
  )
}
