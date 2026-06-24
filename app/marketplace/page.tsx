'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Clock, IndianRupee, Eye, Loader2, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export default function MarketplacePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const CATEGORY_LABELS: Record<string, string> = {
    'All': 'all',
    'Web': 'Web Development',
    'Mobile': 'Mobile Development',
    'Design': 'Design',
    'Data': 'Data & Analytics',
    'AI/ML': 'AI/ML',
    'Backend': 'Backend',
    'Gaming': 'Gaming',
    'Other': 'Other',
  }
  const categories = Object.keys(CATEGORY_LABELS)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await apiClient('/projects')
        setProjects(Array.isArray(data) ? data : Array.isArray(data?.projects) ? data.projects : [])
      } catch (err) {
        console.error('Failed to fetch projects', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <section className="bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-background to-background py-16 border-b border-white/5 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">Find Your Next Project</h1>
              <p className="text-base text-foreground/60 max-w-2xl mx-auto sm:mx-0">
                Browse real projects from verified companies. Apply with your profile, build your portfolio, and earn money.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-16 z-20 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                <Filter className="w-4 h-4 text-foreground/40 flex-shrink-0 mr-1 hidden sm:block" />
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(CATEGORY_LABELS[category])}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === CATEGORY_LABELS[category]
                        ? 'bg-foreground text-background shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-105'
                        : 'bg-white/5 border border-white/10 text-foreground/70 hover:text-foreground hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-foreground/30" />
                </div>
                <h3 className="text-lg font-bold mb-2">No projects found</h3>
                <p className="text-foreground/50 text-sm max-w-sm mx-auto">We couldn't find any projects matching your current filters. Try adjusting your search.</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <motion.div key={project.id} variants={itemVariants}>
                    <Card glass className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300 group hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3 gap-4">
                            <h3 className="font-bold text-lg leading-tight tracking-tight text-foreground line-clamp-2 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-bold">
                              {project.client?.companyName?.slice(0, 1) || 'C'}
                            </div>
                            <p className="text-xs text-foreground/60">{project.client?.companyName || 'Verified Client'}</p>
                            {(project.status === 'PUBLISHED' || project.status === 'APPLICATIONS_OPEN') && (
                              <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">HIRING</span>
                            )}
                          </div>

                          <p className="text-sm text-foreground/70 line-clamp-3 mb-5 leading-relaxed">{project.description}</p>

                          <div className="flex flex-wrap items-center gap-3 text-sm bg-black/20 p-3 rounded-xl border border-white/5 mb-5">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                              <IndianRupee className="w-4 h-4" />
                              <span>{project.budget?.toLocaleString() || 'Flexible'}</span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="flex items-center gap-1.5 text-foreground/60">
                              <Clock className="w-4 h-4" />
                              <span>{project.timelineDays ? `${project.timelineDays} days` : 'Flexible'}</span>
                            </div>
                          </div>

                          {project.category && (
                            <span className="inline-block text-[10px] uppercase tracking-wider font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded mb-3">
                              {project.category}
                            </span>
                          )}

                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {(project.skills || []).slice(0, 3).map((s: any) => (
                              <span key={s.skillId} className="text-[10px] uppercase tracking-wider font-semibold bg-white/5 border border-white/10 px-2 py-1 rounded text-foreground/70">
                                {s.skill?.name}
                              </span>
                            ))}
                            {(project.skills?.length || 0) > 3 && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/5 border border-white/10 px-2 py-1 rounded text-foreground/50">
                                +{(project.skills?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 mt-auto">
                          <Link href={`/marketplace/${project.id}`} className="block w-full">
                            <Button className="w-full bg-white/10 hover:bg-white/20 text-foreground border-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-none">
                              Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
