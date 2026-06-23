'use client'

import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'
import { Users, Globe, Zap, Target } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community First',
      description: 'We believe in empowering students and connecting them with real opportunities',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Innovation',
      description: 'Leveraging AI and smart algorithms to match talent with perfect opportunities',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global Impact',
      description: 'Building a worldwide platform for talent discovery and career growth',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Merit-Based',
      description: 'Success is based on skills and work quality, not background or connections',
    },
  ]

  const team = [
    { name: 'Rahul Sharma', role: 'Founder & CEO', image: 'R' },
    { name: 'Priya Patel', role: 'Co-founder, Product', image: 'P' },
    { name: 'Aditya Verma', role: 'Head of Engineering', image: 'A' },
    { name: 'Sarah Williams', role: 'Head of Partnerships', image: 'S' },
  ]

  const timeline = [
    { year: '2023', title: 'Founded', description: 'TalentMesh AI was founded with a vision to transform talent discovery' },
    { year: '2023', title: 'Beta Launch', description: 'Launched beta with 100 students and 20 companies' },
    { year: '2024', title: 'Growth', description: 'Scaled to 5,000+ students and 500+ projects' },
    { year: '2024', title: 'Series A', description: 'Raised $2M in Series A funding' },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-black via-[#0a0a0a] to-black py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-bold text-white">About TalentMesh</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                We&apos;re on a mission to revolutionize how talent is discovered and connected with opportunities
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-4"
            >
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-lg text-foreground/60">
                To empower students with real-world project experience while helping companies discover verified talent
                through proven work, not just resumes. We believe that opportunity should be based on merit and
                capability, not background or connections.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-card border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              Our Values
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-lg border border-border bg-background"
                >
                  <div className="text-accent mb-4">{value.icon}</div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-foreground/60">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              Our Journey
            </motion.h2>
            <div className="space-y-8">
              {timeline.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex gap-6 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-2xl text-accent mb-2">{event.year}</div>
                    <h3 className="font-semibold mb-2">{event.title}</h3>
                    <p className="text-foreground/60">{event.description}</p>
                  </div>
                  <div className="hidden md:flex items-center">
                    <div className="w-4 h-4 rounded-full bg-accent"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-card border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              Leadership Team
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-purple-500 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
                    {member.image}
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-foreground/60">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-accent/20 to-purple-500/20 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
              <p className="text-lg text-foreground/60 mb-8">
                Be part of the revolution in talent discovery and career growth
              </p>
              <button className="px-8 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">
                Get Started Today
              </button>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}
