'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { Plus, Trash2, Globe, MapPin, BookOpen, User, Loader2, CheckCircle, Link as LinkIcon, Save, Code2, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }

function Input({ label, icon, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30">{icon}</div>}
        <input
          {...props}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all`}
        />
      </div>
    </div>
  )
}

export default function StudentProfilePage() {
  const { user } = useRequireAuth()
  const [profile, setProfile] = useState<any>(null)
  const [availableSkills, setAvailableSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)
  const [formData, setFormData] = useState({
    bio: '', location: '', major: '', yearOfStudy: '',
    githubUrl: '', linkedinUrl: '', portfolioUrl: '',
  })

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [p, skills] = await Promise.all([
          apiClient('/students/me'),
          apiClient('/skills'),
        ])
        setProfile(p)
        setAvailableSkills(skills?.skills || skills || [])
        setFormData({
          bio: p?.bio || '',
          location: p?.location || '',
          major: p?.major || '',
          yearOfStudy: p?.yearOfStudy?.toString() || '',
          githubUrl: p?.githubUrl || '',
          linkedinUrl: p?.linkedinUrl || '',
          portfolioUrl: p?.portfolioUrl || '',
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await apiClient('/students/me', {
        method: 'PATCH',
        body: JSON.stringify({
          ...formData,
          yearOfStudy: formData.yearOfStudy ? parseInt(formData.yearOfStudy) : undefined,
        }),
      })
      setProfile(prev => ({ ...prev, ...updated }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return
    setAddingSkill(true)
    try {
      await apiClient('/students/me/skills', {
        method: 'POST',
        body: JSON.stringify({ skillName: newSkillName.trim(), level: 'Intermediate' }),
      })
      const p = await apiClient('/students/me')
      setProfile(p)
      setNewSkillName('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add skill.')
    } finally {
      setAddingSkill(false)
    }
  }

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await apiClient(`/students/me/skills/${skillId}`, { method: 'DELETE' })
      setProfile((prev: any) => ({
        ...prev,
        skills: prev.skills.filter((s: any) => s.skillId !== skillId),
      }))
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="student">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-3xl">

        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="text-sm text-foreground/60 mt-1">Manage your public profile and skills</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </motion.div>

        {/* Basic Info */}
        <motion.div variants={itemVariants}>
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-4 h-4" /> Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.name}</p>
                  <p className="text-sm text-foreground/50">{user?.email}</p>
                  {profile?.verificationStatus === 'VERIFIED' && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                      <CheckCircle className="w-3 h-3" /> Verified Student
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Location" icon={<MapPin className="w-4 h-4" />} value={formData.location} onChange={(e: any) => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. New Delhi, India" />
                <Input label="Major / Field of Study" icon={<BookOpen className="w-4 h-4" />} value={formData.major} onChange={(e: any) => setFormData(p => ({ ...p, major: e.target.value }))} placeholder="e.g. Computer Science" />
                <Input label="Year of Study" type="number" min={1} max={6} value={formData.yearOfStudy} onChange={(e: any) => setFormData(p => ({ ...p, yearOfStudy: e.target.value }))} placeholder="e.g. 3" />
                <div>
                  <label className="block text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">College</label>
                  <div className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-foreground/50">
                    {profile?.college?.name || '—'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Links */}
        <motion.div variants={itemVariants}>
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4" /> Links & Portfolio</CardTitle>
              <CardDescription>Help clients and recruiters find your work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="GitHub" icon={<Code2 className="w-4 h-4" />} value={formData.githubUrl} onChange={(e: any) => setFormData(p => ({ ...p, githubUrl: e.target.value }))} placeholder="https://github.com/username" />
              <Input label="LinkedIn" icon={<Briefcase className="w-4 h-4" />} value={formData.linkedinUrl} onChange={(e: any) => setFormData(p => ({ ...p, linkedinUrl: e.target.value }))} placeholder="https://linkedin.com/in/username" />
              <Input label="Portfolio / Website" icon={<Globe className="w-4 h-4" />} value={formData.portfolioUrl} onChange={(e: any) => setFormData(p => ({ ...p, portfolioUrl: e.target.value }))} placeholder="https://yourportfolio.com" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills */}
        <motion.div variants={itemVariants}>
          <Card glass>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add skills to appear in relevant project recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Skills */}
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {(profile?.skills || []).map((s: any) => (
                  <div key={s.skillId || s.skill?.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-sm text-blue-400 group">
                    <span>{s.skill?.name}</span>
                    <span className="text-[10px] text-blue-400/50 capitalize ml-0.5">· {s.level}</span>
                    <button
                      onClick={() => handleRemoveSkill(s.skillId || s.skill?.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 text-blue-400/60 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(profile?.skills || []).length === 0 && (
                  <p className="text-sm text-foreground/40">No skills added yet. Add your first skill below.</p>
                )}
              </div>

              {/* Add Skill */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                  <input
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    list="skill-suggestions"
                    placeholder="Type a skill name (e.g. React, Python...)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
                  />
                  <datalist id="skill-suggestions">
                    {availableSkills.map((s: any) => <option key={s.id} value={s.name} />)}
                  </datalist>
                </div>
                <Button onClick={handleAddSkill} disabled={addingSkill || !newSkillName.trim()} className="bg-blue-600 hover:bg-blue-500">
                  {addingSkill ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add
                </Button>
              </div>

              {/* Suggestions */}
              {availableSkills.length > 0 && (
                <div>
                  <p className="text-xs text-foreground/40 mb-2">Popular skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSkills.slice(0, 12).map((s: any) => {
                      const hasSkill = (profile?.skills || []).some((ps: any) => ps.skill?.name === s.name)
                      if (hasSkill) return null
                      return (
                        <button
                          key={s.id}
                          onClick={() => setNewSkillName(s.name)}
                          className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-foreground/60 hover:text-foreground hover:border-white/20 transition-all"
                        >
                          + {s.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  )
}
