'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  icon?: React.ReactNode
  glass?: boolean
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  glass = false,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card glass interactive className="group overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-[10px] font-semibold text-foreground/50 uppercase tracking-widest group-hover:text-foreground/80 transition-colors">{title}</CardTitle>
          </div>
          {icon && (
            <div className="text-foreground/40 group-hover:text-foreground group-hover:scale-110 transition-all duration-300">
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="text-3xl font-bold tracking-tighter text-foreground">{value}</div>
            {trend && (
              <div
                className={`
                  inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit border
                  ${
                    trend.direction === 'up'
                      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                      : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                  }
                `}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
            {description && (
              <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
