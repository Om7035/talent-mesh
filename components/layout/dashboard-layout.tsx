'use client'

import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { useState } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'student' | 'client' | 'recruiter' | 'tpo' | 'admin'
  collapsed?: boolean
}

export function DashboardLayout({ children, role, collapsed = false }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(collapsed)

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.03] via-background to-background text-foreground">
      <Navbar userRole={role} />
      <Sidebar role={role} collapsed={sidebarCollapsed} />
      <main
        className={`
          pt-16 transition-all duration-300
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
