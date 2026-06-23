'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit2, Eye, ExternalLink, Star } from 'lucide-react'

export default function PortfolioPage() {
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

  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce platform with React, Node.js, and MongoDB',
      image: 'bg-blue-500',
      link: '#',
      github: '#',
      views: 234,
      featured: true,
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
    },
    {
      id: 2,
      title: 'AI Chat Application',
      description: 'Real-time chat app with AI-powered responses',
      image: 'bg-purple-500',
      link: '#',
      github: '#',
      views: 156,
      featured: true,
      skills: ['Next.js', 'OpenAI API', 'WebSockets'],
    },
    {
      id: 3,
      title: 'Analytics Dashboard',
      description: 'Interactive data visualization dashboard',
      image: 'bg-cyan-500',
      link: '#',
      github: '#',
      views: 89,
      featured: false,
      skills: ['React', 'D3.js', 'Python'],
    },
    {
      id: 4,
      title: 'Mobile Fitness App',
      description: 'Cross-platform fitness tracking application',
      image: 'bg-green-500',
      link: '#',
      github: '#',
      views: 123,
      featured: false,
      skills: ['React Native', 'Firebase', 'Redux'],
    },
  ]

  return (
    <DashboardLayout role="student">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-foreground/60">Showcase your best work</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
            <span>Add Project</span>
          </button>
        </motion.div>

        {/* Portfolio Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {projects.map((project, idx) => (
            <motion.div key={project.id} variants={itemVariants}>
              <Card className="h-full overflow-hidden hover:shadow-lg hover:border-accent/50 transition-all group">
                {/* Project Image */}
                <div className={`h-48 ${project.image} relative overflow-hidden`}>
                  {project.featured && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-semibold">
                      Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={project.link}
                      className="p-2 rounded-full bg-white text-black hover:scale-110 transition-transform"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <a
                      href={project.github}
                      className="p-2 rounded-full bg-white text-black hover:scale-110 transition-transform"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                      <p className="text-sm text-foreground/60">{project.description}</p>
                    </div>

                    {/* Skills */}
                    <div className="flex gap-2 flex-wrap">
                      {project.skills.map((skill) => (
                        <span key={skill} className="text-xs bg-muted px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-foreground/60 border-t border-border pt-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{project.views} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-muted rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Portfolio Stats */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Portfolio Performance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-accent">847</div>
                  <p className="text-sm text-foreground/60">Total Views</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-sm text-foreground/60">Project Clicks</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-green-500">12%</div>
                  <p className="text-sm text-foreground/60">Click Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Share Portfolio */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Share Your Portfolio</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-2">Portfolio URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="https://talentmesh.app/sarah-johnson"
                      readOnly
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-sm"
                    />
                    <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm hover:opacity-90 transition-opacity">
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['LinkedIn', 'Twitter', 'Email'].map((platform) => (
                    <button
                      key={platform}
                      className="flex-1 px-3 py-2 rounded-lg border border-border hover:border-accent/50 text-sm transition-colors"
                    >
                      Share on {platform}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
