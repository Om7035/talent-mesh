'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, TrendingUp, Award, BookOpen, BarChart3, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

const placementData = [
  { month: 'Jan', placements: 8, offers: 12 },
  { month: 'Feb', placements: 12, offers: 18 },
  { month: 'Mar', placements: 15, offers: 22 },
  { month: 'Apr', placements: 18, offers: 28 },
  { month: 'May', placements: 22, offers: 35 },
  { month: 'Jun', placements: 28, offers: 42 },
]

const skillDistribution = [
  { name: 'Full Stack', value: 120 },
  { name: 'Frontend', value: 85 },
  { name: 'Backend', value: 75 },
  { name: 'Data Science', value: 45 },
]

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b']

const topStudents = [
  {
    id: 1,
    name: 'Sarah Johnson',
    major: 'CSE',
    year: '4th',
    reputation: 4.9,
    projectsCompleted: 15,
    earnings: 7500,
  },
  {
    id: 2,
    name: 'Michael Chen',
    major: 'CSE',
    year: '3rd',
    reputation: 4.7,
    projectsCompleted: 12,
    earnings: 5200,
  },
  {
    id: 3,
    name: 'Emma Wilson',
    major: 'IT',
    year: '4th',
    reputation: 4.8,
    projectsCompleted: 18,
    earnings: 8900,
  },
]

export default function TPODashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <DashboardLayout role="tpo">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold">College Analytics & Placement</h1>
          <p className="text-foreground/60">Track student performance and placement metrics</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Students"
              value="450"
              description="Registered on platform"
              icon={<Users className="w-5 h-5" />}
              trend={{ value: 15, direction: 'up' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Placements This Year"
              value="112"
              description="Successfully placed"
              icon={<Trophy className="w-5 h-5" />}
              trend={{ value: 28, direction: 'up' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Avg Reputation Score"
              value="4.2"
              description="Out of 5.0"
              icon={<Award className="w-5 h-5" />}
              trend={{ value: 8, direction: 'up' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Earnings"
              value="$245K"
              description="By all students"
              icon={<BarChart3 className="w-5 h-5" />}
              trend={{ value: 42, direction: 'up' }}
            />
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Placement Trends */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Placement Trends</CardTitle>
                <CardDescription>Student placements and offers received</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={placementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="placements" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="offers" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skill Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
                <CardDescription>Among students</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={skillDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {skillDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {skillDistribution.map((skill, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="font-semibold">{skill.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Top Performers */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>Your college&apos;s star talent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-foreground/60">
                          {student.major} • {student.year} Year
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg text-accent">{student.reputation}/5.0</div>
                        <div className="text-xs text-foreground/60">Reputation</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-foreground/60">Projects: </span>
                          <span className="font-semibold">{student.projectsCompleted}</span>
                        </div>
                        <div>
                          <span className="text-foreground/60">Earnings: </span>
                          <span className="font-semibold">₹{student.earnings.toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="text-xs border border-border px-3 py-1 rounded hover:bg-muted transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Placement Readiness */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Placement Readiness</CardTitle>
              <CardDescription>Students ready for job market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-3xl font-bold text-green-500">85%</div>
                  <div className="text-xs text-foreground/60 mt-2">Fully Ready</div>
                </div>
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-3xl font-bold text-yellow-500">12%</div>
                  <div className="text-xs text-foreground/60 mt-2">Moderately Ready</div>
                </div>
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-3xl font-bold text-orange-500">2%</div>
                  <div className="text-xs text-foreground/60 mt-2">Needs Work</div>
                </div>
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-3xl font-bold text-blue-500">1%</div>
                  <div className="text-xs text-foreground/60 mt-2">Not Started</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recruiter Requests */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Requests</CardTitle>
              <CardDescription>Companies looking for your talent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { company: 'Google', position: 'Software Engineer', count: 5 },
                  { company: 'Microsoft', position: 'Cloud Architect', count: 3 },
                  { company: 'Amazon', position: 'Full Stack Developer', count: 8 },
                ].map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-sm">{req.company}</h4>
                      <p className="text-xs text-foreground/60">{req.position}</p>
                    </div>
                    <button className="text-xs font-medium text-accent hover:underline">
                      {req.count} matches →
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
