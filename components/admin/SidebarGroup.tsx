'use client'

import { useState } from 'react'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarGroupProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarGroup({ title, icon: Icon, children, defaultOpen = true }: SidebarGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>
      <div
        className={cn(
          'mt-1 space-y-0.5 overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  )
}
