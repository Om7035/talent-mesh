'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { apiClient, getToken, removeToken, setToken } from './api'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'CLIENT' | 'RECRUITER' | 'TPO' | 'ADMIN'
  avatarUrl: string | null
  student?: any
  client?: any
  recruiter?: any
  tpo?: any
  admin?: any
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string, userData: AuthUser) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    const accessToken = getToken()
    if (!accessToken) {
      setUser(null)
      setTokenState(null)
      setIsLoading(false)
      return
    }
    try {
      const data = await apiClient('/users/me')
      if (data.role === 'RECRUITER') {
        data.client = data.recruiter
      }
      setUser(data)
      setTokenState(accessToken)
    } catch {
      // Token is invalid/expired — clear it
      removeToken()
      setUser(null)
      setTokenState(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback((accessToken: string, refreshToken: string, userData: AuthUser) => {
    setToken(accessToken, refreshToken, userData.role)
    setUser(userData)
    setTokenState(accessToken)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' })
    } catch {
      // Ignore errors — still logout locally
    }
    removeToken()
    setUser(null)
    setTokenState(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useRequireAuth(redirectTo = '/login') {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  return { user, isLoading }
}
