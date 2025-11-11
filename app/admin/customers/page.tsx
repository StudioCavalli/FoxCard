'use client'

import { Card } from '@/components/ui/Card'
import { Mail, Calendar } from 'lucide-react'

export default function AdminCustomersPage() {
  // TODO: Implement customers management
  // For now, showing placeholder

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600">Gérez votre base de clients</p>
      </div>

      {/* Placeholder */}
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Gestion des clients</h3>
          <p className="text-gray-600">
            La liste des clients sera automatiquement générée lorsque des commandes seront passées sur votre boutique.
          </p>
        </div>
      </Card>
    </div>
  )
}
