'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Plus, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

const CATEGORIES = ['Web Development', 'Mobile Development', 'Design', 'Data & Analytics', 'AI/ML', 'Backend', 'Gaming', 'Other']
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

export default function PostProjectPage() {
  const router = useRouter()
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    timelineDays: '',
    difficulty: '',
    category: '',
    projectType: 'One-time Project',
    ndaRequired: false,
    hideClientName: false,
    communicationPref: 'Email',
  })

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const missing: string[] = []
    if (!formData.title) missing.push('Project Title')
    if (!formData.description) missing.push('Project Description')
    if (!formData.budget) missing.push('Budget')
    if (!formData.timelineDays) missing.push('Timeline (Days)')
    if (!formData.difficulty) missing.push('Difficulty Level')
    if (!formData.category) missing.push('Category')

    if (missing.length > 0) {
      const message = `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`
      setError(message)
      toast.error(message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    try {
      await apiClient('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget: Number(formData.budget),
          timelineDays: Number(formData.timelineDays),
          difficulty: formData.difficulty,
          category: formData.category,
          projectType: formData.projectType,
          ndaRequired: formData.ndaRequired,
          hideClientName: formData.hideClientName,
          communicationPref: formData.communicationPref,
          skillNames: skills,
        }),
      })
      toast.success('Project posted successfully!')
      router.push('/client/projects')
    } catch (err: any) {
      const message = err.message || 'Failed to post project.'
      setError(message)
      toast.error(message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <DashboardLayout role="client">
      <motion.form
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-4xl"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Post a New Project</h1>
          <p className="text-foreground/60">Tell talented students about your project</p>
        </motion.div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>
        )}

        {/* Project Details */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Basic information about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Build an E-commerce Platform"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project in detail..."
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Budget</label>
                  <div className="flex items-center">
                    <span className="px-4 py-2 rounded-l-lg border border-r-0 border-border bg-muted">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="5000"
                      className="flex-1 px-4 py-2 rounded-r-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timeline (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.timelineDays}
                    onChange={(e) => setFormData({ ...formData, timelineDays: e.target.value })}
                    placeholder="30"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select difficulty level</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills Required */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>What skills do applicants need?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent"
                  >
                    <span className="text-sm">{skill}</span>
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:opacity-70 transition-opacity">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Category */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Category & Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Project Type</label>
                <div className="space-y-2">
                  {['One-time Project', 'Ongoing', 'Part-time'].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        checked={formData.projectType === type}
                        onChange={() => setFormData({ ...formData, projectType: type })}
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Details */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hideClientName}
                    onChange={(e) => setFormData({ ...formData, hideClientName: e.target.checked })}
                  />
                  <span className="text-sm">Hide my company name from applicants</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.ndaRequired}
                    onChange={(e) => setFormData({ ...formData, ndaRequired: e.target.checked })}
                  />
                  <span className="text-sm">NDA required</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Communication</label>
                <select
                  value={formData.communicationPref}
                  onChange={(e) => setFormData({ ...formData, communicationPref: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option>Email</option>
                  <option>Direct Message</option>
                  <option>Video Call</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Posting...' : 'Post Project'}
          </button>
        </motion.div>
      </motion.form>
    </DashboardLayout>
  )
}
