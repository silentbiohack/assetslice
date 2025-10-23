'use client'

import { Header } from './Header'
import { MobileNavigation } from './MobileNavigation'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Header />
      <main className="pb-16 lg:pb-0">
        {children}
      </main>
      <MobileNavigation />
    </div>
  )
}