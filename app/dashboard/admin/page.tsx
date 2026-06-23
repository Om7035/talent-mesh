'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Users, Briefcase, AlertCircle, TrendingUp, Shield, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

const platformData = [
  { date: 'Jun 1', users: 1200, projects: 45, revenue: 5600 },
  { date: 'Jun 5', users: 1850, projects: 68, revenue: 8200 },
  { date: 'Jun 10', users: 2400, projects: 92, revenue: 11500 },
  { date: 'Jun 15', users: 3200, projects: 125, revenue: 15800 },
  { date: 'Jun 20', users: 4100, projects: 158, revenue: 19200 },
  { date: 'Jun 25', users: 4950, projects: 195, revenue: 23500 },
  { date: 'Jun 30', users: 5800, projects: 234, revenue: 28900 },
]

const revenueData = [
  { month: 'Jan', revenue: 12000, fees: 8000 },
  { month: 'Feb', revenue: 15500, fees: 10300 },
  { month: 'Mar', revenue: 18900, fees: 12600 },
  { month: 'Apr', revenue: 22400, fees: 15000 },
  { month: 'May', revenue: 26800, fees: 17900 },
  { month: 'Jun', revenue: 28900, fees: 19300 },
]

const moderationQueue = [
  { id: 1, type: 'Project', title: 'Mobile App Development', status: 'Pending Review', flags: 2 },
  { id: 2, type: 'Review', title: 'Inappropriate language', status: 'Flagged', flags: 3 },
  { id: 3, type: 'User', title: 'Suspicious account activity', status: 'Under Investigation', flags: 5 },
]

const fraudAlerts = [
  { id: 1, alert: 'Multiple chargebacks detected', severity: 'high', date: 'Today' },
  { id: 2, alert: 'Unusual payment pattern', severity: 'medium', date: 'Yesterday' },
  { id: 3, alert: 'Account compromise attempt', severity: 'high', date: '2 days ago' },
]

export default function AdminDashboard() {
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
    <DashboardLayout role="admin">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-foreground/60">Monitor platform health and manage system operations</p>
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
              title="Total Users"
              value="5,800"
              description="Active users"
              icon={<Users className="w-5 h-5" />}
              trend={{ value: 28, direction: 'up' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Active Projects"
              value="234"
              description="On platform"
              icon={<Briefcase className="w-5 h-5" />}
              trend={{ value: 42, direction: 'up' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Platform Revenue"
              value="$28.9K"
              description="This month"
              icon={<TrendingUp className="w-5 h-5" />}
              trend={{ value: 35, direction: 'up' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Security Alerts"
              value="3"
              description="Requires action"
              icon={<AlertCircle className="w-5 h-5" />}
            />
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Growth */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>Users and projects over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={platformData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Total revenue and platform fees</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="fees" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Moderation Queue */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <CardDescription>Items pending review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moderationQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-foreground/60">{item.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-medium">{item.flags} flags</div>
                        <div className="text-xs text-foreground/60">{item.status}</div>
                      </div>
                      <button className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded hover:opacity-90 transition-opacity">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Alerts */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Critical security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fraudAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high'
                        ? 'border-l-red-500 bg-red-500/5'
                        : 'border-l-yellow-500 bg-yellow-500/5'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{alert.alert}</h4>
                      <p className="text-xs text-foreground/60">{alert.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          alert.severity === 'high'
                            ? 'bg-red-500/20 text-red-700'
                            : 'bg-yellow-500/20 text-yellow-700'
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <button className="text-xs border border-border px-3 py-1 rounded hover:bg-muted transition-colors">
                        Investigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health and uptime</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-sm">API Status</span>
                  </div>
                  <p className="text-xs text-foreground/60">All systems operational</p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-sm">Database</span>
                  </div>
                  <p className="text-xs text-foreground/60">99.9% uptime</p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-sm">Services</span>
                  </div>
                  <p className="text-xs text-foreground/60">All running smoothly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
