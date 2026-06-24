'use client'

import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'
import { Users, Globe, Zap, Target } from 'lucide-react'
import Link from 'next/link'

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
              <Link href="/signup" className="inline-block px-8 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">
                Get Started Today
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}
