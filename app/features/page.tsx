'use client'

import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'
import {
  Zap,
  BarChart3,
  Users,
  Award,
  TrendingUp,
  Shield,
  Brain,
  Layers,
  Globe,
  Lock,
  Smartphone,
  Code,
} from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-World Projects',
      description: 'Access to actual freelance projects from verified companies, not practice assignments',
      details: [
        'Portfolio-building projects',
        'Client feedback and reviews',
        'Professional experience',
      ],
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Smart-Powered Matching',
      description: 'Smart algorithms that match students with perfect project opportunities',
      details: [
        'Skill-based matching',
        'Difficulty level alignment',
        'Earning potential optimization',
      ],
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Reputation Score',
      description: 'Verifiable talent metrics that showcase your actual capabilities',
      details: [
        'Project completion rate',
        'Quality ratings',
        'Skill endorsements',
      ],
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your growth and performance metrics',
      details: [
        'Earnings tracking',
        'Skill development charts',
        'Progress visualization',
      ],
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Talent Discovery',
      description: 'For recruiters and companies to find verified talent based on proven work',
      details: [
        'Advanced search filters',
        'Performance analytics',
        'Direct messaging',
      ],
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Placement Intelligence',
      description: 'For colleges to track student readiness and placement success',
      details: [
        'College rankings',
        'Skill distribution analysis',
        'Recruiter interest tracking',
      ],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Escrow',
      description: 'Safe payment handling and dispute resolution for all transactions',
      details: [
        'Milestone-based payments',
        'Fraud protection',
        'Dispute resolution',
      ],
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: 'Skill Management',
      description: 'Comprehensive skill tracking and endorsement system',
      details: [
        'Skill verification',
        'Portfolio showcase',
        'Certification tracking',
      ],
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Platform',
      description: 'Connect with opportunities and talent from around the world',
      details: [
        'Multi-currency support',
        'Global marketplace',
        'Time zone flexible',
      ],
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Privacy & Security',
      description: 'Enterprise-grade security to protect your data and transactions',
      details: [
        'End-to-end encryption',
        'Data privacy compliance',
        'Secure authentication',
      ],
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile App',
      description: 'Manage your projects and opportunities on the go',
      details: [
        'iOS and Android',
        'Real-time notifications',
        'Offline functionality',
      ],
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Developer API',
      description: 'Integrate TalentMesh into your own applications',
      details: [
        'REST API',
        'Webhooks',
        'Comprehensive docs',
      ],
    },
  ]

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
              <h1 className="text-5xl font-bold text-white">Powerful Features</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to succeed as a freelancer or discover talent
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-6 rounded-lg border border-border bg-card hover:border-accent/50 transition-all group"
                >
                  <div className="text-accent mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-20 bg-card border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              Why Choose TalentMesh?
            </motion.h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">TalentMesh</th>
                    <th className="text-center py-3 px-4">Fiverr</th>
                    <th className="text-center py-3 px-4">Upwork</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Smart-Powered Matching', true, false, false],
                    ['Real-Time Reputation Score', true, true, true],
                    ['College Integration', true, false, false],
                    ['Recruiter Discovery', true, false, false],
                    ['Skill Verification', true, false, true],
                    ['Portfolio Analytics', true, false, true],
                    ['Global Marketplace', true, true, true],
                    ['Secure Escrow', true, true, true],
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">{row[0]}</td>
                      <td className="text-center py-3 px-4">{row[1] ? '✓' : '✗'}</td>
                      <td className="text-center py-3 px-4">{row[2] ? '✓' : '✗'}</td>
                      <td className="text-center py-3 px-4">{row[3] ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-foreground/60 mb-8">
                Join thousands of students and companies already using TalentMesh
              </p>
              <button className="px-8 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">
                Start Free Today
              </button>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}
