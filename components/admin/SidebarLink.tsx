'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarLinkProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  badge?: number | string
}

export function SidebarLink({ href, icon: Icon, children, badge }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/admin' && pathname?.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between pl-6 pr-3 py-2 rounded-lg transition-colors text-sm',
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{children}</span>
      </div>
      {badge !== undefined && (
        <span className={cn(
          'px-2 py-0.5 text-xs font-semibold rounded-full',
          isActive
            ? 'bg-white/20 text-white'
            : 'bg-gray-700 text-gray-300'
        )}>
          {badge}
        </span>
      )}
    </Link>
  )
}
