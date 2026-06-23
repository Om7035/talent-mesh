'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export default function PostProjectPage() {
  const [skills, setSkills] = useState<string[]>(['React', 'Node.js', 'MongoDB'])
  const [skillInput, setSkillInput] = useState('')

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

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
    <DashboardLayout role="client">
      <motion.div
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
                  placeholder="e.g., Build an E-commerce Platform"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Description</label>
                <textarea
                  placeholder="Describe your project in detail..."
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Budget</label>
                  <div className="flex items-center">
                    <span className="px-4 py-2 rounded-l-lg border border-r-0 border-border bg-muted">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="5000"
                      className="flex-1 px-4 py-2 rounded-r-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timeline (Days)</label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>Select difficulty level</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
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
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
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
                    <button onClick={() => removeSkill(skill)} className="hover:opacity-70 transition-opacity">
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
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>Select category</option>
                  <option>Web Development</option>
                  <option>Mobile Development</option>
                  <option>Design</option>
                  <option>Data & Analytics</option>
                  <option>AI/ML</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Project Type</label>
                <div className="space-y-2">
                  {['One-time Project', 'Ongoing', 'Part-time'].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input type="radio" name="type" defaultChecked={type === 'One-time Project'} />
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
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Hide my company name from applicants</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">NDA required</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Communication</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent">
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
          <button className="flex-1 px-6 py-3 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/50 font-semibold transition-colors">
            Save as Draft
          </button>
          <button className="flex-1 px-6 py-3 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity font-semibold">
            Post Project
          </button>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
