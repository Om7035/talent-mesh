'use client'

import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      description: 'For students just starting out',
      price: 'Free',
      period: 'forever',
      features: [
        'Access to projects',
        'Basic profile',
        'Skill endorsements',
        'Project completion tracking',
        'Community support',
        'Standard checkout (20% fee)',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      description: 'For serious freelancers',
      price: '₹799',
      period: 'per month',
      features: [
        'Everything in Starter',
        'Advanced analytics',
        'Priority support',
        'Custom portfolio',
        'Skill verification badges',
        'Reduced fees (10%)',
        'Direct messaging priority',
        'Early access to projects',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      description: 'For companies & recruiters',
      price: 'Custom',
      period: 'based on needs',
      features: [
        'Unlimited searches',
        'Advanced filtering',
        'Talent analytics',
        'Team management',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Priority support',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ]

  const faqs = [
    {
      question: 'Can I use TalentMesh for free?',
      answer:
        'Yes! The Starter plan is completely free. You can browse projects, build your profile, and earn money. Pro features are optional.',
    },
    {
      question: 'What are the fees?',
      answer:
        'Free plan charges 20% per completed project. Pro plan reduces this to 10%. Enterprise plans have custom pricing.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your Pro subscription anytime. No lock-in contracts.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Refunds are handled on a case-by-case basis. We prioritize customer satisfaction.',
    },
    {
      question: 'Is there a credit card required for free plan?',
      answer: 'No credit card is required to sign up for the free plan.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards, debit cards, PayPal, and wire transfers for payouts.',
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
              <h1 className="text-5xl font-bold text-white">Simple, Transparent Pricing</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Start free and upgrade as you grow. No hidden fees.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {plans.map((plan, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`rounded-2xl p-8 transition-all ${
                    plan.highlighted
                      ? 'border-2 border-accent bg-accent/5 ring-1 ring-accent/20 transform scale-105'
                      : 'border border-border bg-card hover:border-accent/50'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-foreground/60 text-sm mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-foreground/60 ml-2">{plan.period}</span>}
                  </div>

                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-colors mb-8 ${
                      plan.highlighted
                        ? 'bg-accent text-accent-foreground hover:opacity-90'
                        : 'border border-border hover:border-accent/50 hover:bg-muted/50'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-card border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              Frequently Asked Questions
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-6 rounded-lg border border-border hover:border-accent/50 transition-colors"
                >
                  <h3 className="font-semibold mb-3">{faq.question}</h3>
                  <p className="text-foreground/60 text-sm">{faq.answer}</p>
                </motion.div>
              ))}
            </motion.div>
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
              <h2 className="text-3xl font-bold mb-4">Start Your Journey Today</h2>
              <p className="text-lg text-foreground/60 mb-8">
                Join thousands of students earning money through real-world projects
              </p>
              <button className="px-8 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">
                Get Started Free
              </button>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}
