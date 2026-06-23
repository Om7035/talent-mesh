'use client'

import { ThemeProvider } from '@/components/theme-provider'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
