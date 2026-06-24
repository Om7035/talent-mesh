'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  FileText,
  MessageSquare,
  Bell,
  User,
  Search,
  CreditCard,
  PieChart,
  Shield,
  GraduationCap,
  Globe
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { memo } from 'react'

interface SidebarLink {
  name: string
  href: string
  icon: React.ReactNode
  badge?: string
}

interface SidebarProps {
  role: 'student' | 'client' | 'recruiter' | 'tpo' | 'admin'
  collapsed?: boolean
}

// Ensure every single route here exists or will be created as MVP
const roleMenus: Record<string, SidebarLink[]> = {
  student: [
    { name: 'Dashboard', href: '/dashboard/student', icon: <Home className="w-5 h-5" /> },
    { name: 'Marketplace', href: '/marketplace', icon: <Zap className="w-5 h-5" /> },
    { name: 'Projects', href: '/student/projects', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Wallet', href: '/student/wallet', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" /> },
  ],
  client: [
    { name: 'Dashboard', href: '/dashboard/client', icon: <Home className="w-5 h-5" /> },
    { name: 'Marketplace', href: '/marketplace', icon: <Zap className="w-5 h-5" /> },
    { name: 'Projects', href: '/client/projects', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Talent Search', href: '/client/talent-search', icon: <Search className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Payments', href: '/client/payments', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Profile', href: '/settings/profile', icon: <User className="w-5 h-5" /> },
  ],
  recruiter: [
    { name: 'Dashboard', href: '/dashboard/recruiter', icon: <Home className="w-5 h-5" /> },
    { name: 'Marketplace', href: '/marketplace', icon: <Zap className="w-5 h-5" /> },
    { name: 'Talent Search', href: '/dashboard/recruiter', icon: <Search className="w-5 h-5" /> }, // Recruiter dashboard acts as talent search
    { name: 'Network', href: '/recruiter/network', icon: <Globe className="w-5 h-5 text-blue-400" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Profile', href: '/settings/profile', icon: <User className="w-5 h-5" /> },
  ],
  tpo: [
    { name: 'Dashboard', href: '/dashboard/tpo', icon: <Home className="w-5 h-5" /> },
    { name: 'Students', href: '/tpo/students', icon: <Users className="w-5 h-5" /> },
    { name: 'Clients', href: '/tpo/clients', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Network', href: '/tpo/network', icon: <Globe className="w-5 h-5 text-purple-400" /> },
    { name: 'Marketplace', href: '/marketplace', icon: <Zap className="w-5 h-5" /> },
    { name: 'Analytics', href: '/tpo/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Reports', href: '/tpo/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Profile', href: '/settings/profile', icon: <User className="w-5 h-5" /> },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: <Home className="w-5 h-5" /> },
    { name: 'Live Users', href: '/admin/users', icon: <Users className="w-5 h-5 text-blue-400" /> },
    { name: 'Projects', href: '/admin/projects', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Disputes', href: '/admin/disputes', icon: <Shield className="w-5 h-5 text-red-400" /> },
    { name: 'Wallets', href: '/admin/wallets', icon: <CreditCard className="w-5 h-5 text-emerald-400" /> },
    { name: 'Verification', href: '/admin/verification', icon: <User className="w-5 h-5" /> },
    { name: 'Colleges', href: '/admin/colleges', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Analytics', href: '/admin/analytics', icon: <PieChart className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings/profile', icon: <Settings className="w-5 h-5" /> },
  ],
}

function SidebarComponent({ role, collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  
  // Use fallback if role is undefined or invalid
  const menu = roleMenus[role?.toLowerCase()] || roleMenus.student

  const handleLogout = async () => {
    await logout() // Use global auth logout to ensure state cleans up
  }

  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0 bg-background border-r border-white/5 
        transition-all duration-300 z-30 flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto hide-scrollbar">
        {menu.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-200 ease-out
                ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 font-medium'
                    : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
                }
              `}
            >
              <div className={isActive ? 'text-blue-400' : 'text-foreground/50'}>
                {item.icon}
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Settings & Logout */}
      <div className="p-4 border-t border-white/5 space-y-1.5 bg-background/50">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-200 ${
            pathname.startsWith('/settings')
              ? 'bg-blue-600/10 text-blue-400 font-medium'
              : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
          }`}
        >
          <Settings className={pathname.startsWith('/settings') ? 'w-5 h-5 text-blue-400' : 'w-5 h-5 text-foreground/50'} />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 opacity-80" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

// Memoize to prevent re-renders when route changes don't affect this role
export const Sidebar = memo(SidebarComponent)
