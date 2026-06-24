'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard, MessageSquare, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'

const ROLE_COLORS: Record<string, string> = {
  STUDENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CLIENT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  RECRUITER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  TPO: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getDashboardPath(role: string) {
  return `/dashboard/${role.toLowerCase()}`
}

export function Navbar({ userRole }: { userRole?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Poll unread notification count while logged in
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    const fetchUnreadCount = () => {
      apiClient('/notifications?page=1&limit=1')
        .then((data) => setUnreadCount(data?.unreadCount ?? 0))
        .catch(() => {})
    }
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-b border-white/5 z-40 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-blue-500/30 transition-all duration-200">
              T
            </div>
            <span className="font-bold text-lg hidden sm:block text-foreground group-hover:text-blue-400 transition-colors duration-200">
              TalentMesh
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/marketplace" className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-md transition-all duration-200">
              Marketplace
            </Link>
            {!user && (
              <>
                <Link href="/about" className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-md transition-all duration-200">About</Link>
                <Link href="/features" className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-md transition-all duration-200">Features</Link>
              </>
            )}
            {user && (
              <Link href={getDashboardPath(user.role)} className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-md transition-all duration-200">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              /* ── Logged In State ── */
              <div className="flex items-center gap-2">
                {/* Messages */}
                <Link href="/messages" className="relative p-2 hover:bg-white/5 rounded-lg transition-colors text-foreground/70 hover:text-foreground">
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <button
                  onClick={() => router.push('/notifications')}
                  className="relative p-2 hover:bg-white/5 rounded-lg transition-colors text-foreground/70 hover:text-foreground"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    {/* Avatar */}
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-foreground leading-none">{user.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-foreground/50 mt-0.5 capitalize">{user.role.toLowerCase()}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-foreground/50 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {/* User Header */}
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-foreground/50">{user.email}</p>
                            <span className={`mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${ROLE_COLORS[user.role]}`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <Link
                          href={getDashboardPath(user.role)}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        {user.role === 'STUDENT' && (
                          <Link
                            href="/student/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                        )}
                        <Link
                          href="/messages"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Messages
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="p-2 border-t border-white/5">
                        <button
                          onClick={() => { setDropdownOpen(false); logout() }}
                          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Logged Out State ── */
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-200 text-foreground">
                  Sign In
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 shadow-sm hover:shadow-blue-500/30">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-foreground"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-white/5 pt-3 mt-1">
            <Link href="/marketplace" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg">Marketplace</Link>
            {user ? (
              <>
                <Link href={getDashboardPath(user.role)} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg">Dashboard</Link>
                <Link href="/messages" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg">Messages</Link>
                <button onClick={() => { setMobileOpen(false); logout() }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg">About</Link>
                <Link href="/features" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg">Features</Link>
                <div className="flex gap-2 px-4 pt-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-center rounded-lg border border-white/10 hover:bg-white/5">Sign In</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white text-center rounded-lg hover:bg-blue-500">Get Started</Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
