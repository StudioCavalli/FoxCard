import { Plugin } from '../types'
import { Card } from '@/components/ui/Card'
import { TrendingUp } from 'lucide-react'

/**
 * Example Plugin: Analytics Widget
 * Adds a custom analytics widget to the admin dashboard
 */
export const analyticsWidgetPlugin: Plugin = {
  metadata: {
    id: 'analytics-widget',
    name: 'Analytics Widget',
    version: '1.0.0',
    description: 'Adds a custom analytics widget to the admin dashboard',
    author: 'FoxCard Team',
    enabled: true,
  },

  config: {
    refreshInterval: 60000, // 1 minute
  },

  registerHooks: (hooks) => {
    // UI Hook: Dashboard Widget
    hooks.onDashboardWidget((data) => {
      if (data.position !== 'top') return null

      return (
        <Card key="analytics-widget" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Analytics Avancées</h3>
              <p className="text-sm text-gray-600">Plugin personnalisé</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">847</p>
              <p className="text-xs text-gray-600">Visiteurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">3.2%</p>
              <p className="text-xs text-gray-600">Taux conversion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">€127</p>
              <p className="text-xs text-gray-600">Panier moyen</p>
            </div>
          </div>
        </Card>
      )
    })
  },
}
