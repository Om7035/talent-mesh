'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, BarChart3, Users, Award, TrendingUp, Sparkles } from 'lucide-react'

export default function Page() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-World Projects',
      description: 'Build portfolio through actual freelance projects from Pune-based companies, not just assignments',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Smart Matching',
      description: 'AI-powered project recommendations based on skills and experience from Pune tech ecosystem',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Reputation Score',
      description: 'Verifiable talent metrics recognized by Pune recruiters and tech companies',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Network Effect',
      description: 'Connect with Pune recruiters, tech companies, and peers building the startup ecosystem',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Skill Growth',
      description: 'Track and showcase your progress across tech skills in demand in Pune',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Campus Analytics',
      description: 'Pune colleges get insights into graduate talent placement and career outcomes',
    },
  ]

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your profile as a student, recruiter, or company',
    },
    {
      number: '2',
      title: 'Browse Projects',
      description: 'Find projects that match your skills and interests',
    },
    {
      number: '3',
      title: 'Build & Earn',
      description: 'Complete projects, earn money, and build your portfolio',
    },
    {
      number: '4',
      title: 'Get Discovered',
      description: 'Recruiters find you based on your verified work history',
    },
  ]

  const stats = [
    { label: 'Active Students', value: '500+' },
    { label: 'Projects Completed', value: '1000+' },
    { label: 'Companies Hiring', value: '50+' },
    { label: 'Avg Earnings', value: '₹40K+' },
  ]

  return (
    <>
      <Navbar />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] via-background to-background">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-48 -right-48 w-96 h-96 bg-white/5 rounded-full blur-[120px] animate-pulse"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28 sm:py-36 text-center">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-12 flex flex-col items-center"
            >
              <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-foreground/80 mb-4">
                <Sparkles className="w-4 h-4 text-white/80" />
                <span>The new standard for talent discovery</span>
              </motion.div>

              <motion.div variants={item} className="space-y-8 max-w-5xl mx-auto">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-balance leading-[1.1] text-foreground">
                  Discover Pune Talent Through{' '}
                  <span className="text-foreground/50">
                    Proven Work
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl leading-relaxed text-foreground/60 max-w-3xl mx-auto font-normal">
                  TalentMesh connects Pune college students with real-world projects. Build your portfolio, earn, and help businesses discover verified talent.
                </p>
              </motion.div>

              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium border-white/10">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-28 sm:py-40 bg-background relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-24 sm:mb-32"
            >
              <motion.h2 variants={item} className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight">
                Why TalentMesh for Pune?
              </motion.h2>
              <motion.p variants={item} className="text-lg sm:text-xl text-foreground/65 max-w-2xl mx-auto leading-relaxed font-normal">
                We&apos;re connecting Pune&apos;s talented students with Pune&apos;s thriving tech ecosystem through real projects and verified opportunities
              </motion.p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 auto-rows-min"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={item}
                  className={`group relative ${idx === 0 || idx === 3 ? 'md:col-span-2' : 'md:col-span-1'}`}
                >
                  <Card glass interactive className="h-full p-8 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-foreground group-hover:scale-110 transition-transform duration-500 mb-6 border border-white/10">
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-semibold mb-3 text-foreground tracking-tight">{feature.title}</h3>
                      <p className="text-foreground/60 leading-relaxed font-normal text-lg">{feature.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-28 sm:py-40 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-24 sm:mb-32"
            >
              <motion.h2 variants={item} className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight">
                How It Works
              </motion.h2>
              <motion.p variants={item} className="text-lg sm:text-xl text-foreground/65 max-w-2xl mx-auto font-normal">
                Get started in 4 simple steps
              </motion.p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            >
              {steps.map((step, idx) => (
                <motion.div key={idx} variants={item} className="relative group">
                  <div className="p-8 sm:p-10 rounded-lg border border-border bg-background hover:shadow-md hover:border-accent/40 transition-all duration-300">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-light text-accent-foreground flex items-center justify-center font-bold mb-6 text-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-foreground leading-tight">{step.title}</h3>
                    <p className="text-base text-foreground/65 leading-relaxed font-normal">{step.description}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-5 w-10 h-10 -translate-y-1/2 items-center justify-center">
                      <div className="w-full h-0.5 bg-gradient-to-r from-border via-border to-transparent absolute"></div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border relative z-10">
                        <ArrowRight className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-28 sm:py-40 bg-background border-t border-border relative overflow-hidden">
          {/* Background Accents */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-light/10 dark:bg-accent-light/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight tracking-tight">Join Pune&apos;s Tech Talent Network</h2>
              <p className="text-lg sm:text-xl text-foreground/65 mb-12 max-w-2xl mx-auto leading-relaxed font-normal">
                Join thousands of Pune students earning and building careers through real projects with Pune tech companies and startups.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-10 py-4 rounded-md bg-accent text-accent-foreground font-semibold shadow-lg hover:shadow-xl hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-200 group text-base"
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-20 sm:py-28 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Footer Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16 mb-16">
              <div className="col-span-1">
                <h4 className="font-semibold mb-6 text-foreground text-sm uppercase tracking-wide">Product</h4>
                <ul className="space-y-4 text-sm">
                  <li>
                    <Link href="/features" className="text-foreground/70 hover:text-accent transition-colors font-normal">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-foreground/70 hover:text-accent transition-colors font-normal">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-1">
                <h4 className="font-semibold mb-6 text-foreground text-sm uppercase tracking-wide">Resources</h4>
                <ul className="space-y-4 text-sm">
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-accent transition-colors font-normal">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-accent transition-colors font-normal">
                      Docs
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-1">
                <h4 className="font-semibold mb-6 text-foreground text-sm uppercase tracking-wide">Company</h4>
                <ul className="space-y-4 text-sm">
                  <li>
                    <Link href="/about" className="text-foreground/70 hover:text-accent transition-colors font-normal">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-accent transition-colors font-normal">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-1">
                <h4 className="font-semibold mb-6 text-foreground text-sm uppercase tracking-wide">Legal</h4>
                <ul className="space-y-4 text-sm">
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-accent transition-colors font-normal">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-accent transition-colors font-normal">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border pt-12 text-center">
              <p className="text-sm text-foreground/50 font-normal">&copy; 2024 TalentMesh AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
