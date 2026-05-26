import { memo } from 'react'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  colorVariant?: 'teal' | 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange'
}

export const StatCard = memo(function StatCard({ title, value, icon: Icon, trend, colorVariant = 'teal' }: StatCardProps) {
  return (
    <Card variant={colorVariant} className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% vs mois dernier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${
          colorVariant === 'teal' ? 'bg-primary-500' :
          colorVariant === 'pink' ? 'bg-secondary-500' :
          colorVariant === 'yellow' ? 'bg-yellow-400' :
          colorVariant === 'blue' ? 'bg-blue-500' :
          'bg-green-500'
        }`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  )
})

StatCard.displayName = 'StatCard'
