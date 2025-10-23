'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, TrendingUp, Briefcase, User } from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Assets', href: '/assets', icon: Building2 },
  { name: 'Trade', href: '/trade', icon: TrendingUp },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Profile', href: '/profile', icon: User },
]

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-gray-800 lg:hidden">
      <div className="grid grid-cols-5 py-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-solana-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              <Icon className={clsx('h-5 w-5 mb-1', isActive && 'scale-110')} />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}