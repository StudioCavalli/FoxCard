'use client'

import { useState } from 'react'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  FileText,
  Settings,
  Eye
} from 'lucide-react'

interface ComplianceCheck {
  id: string
  name: string
  description: string
  status: 'passed' | 'warning' | 'failed'
  lastChecked: string
  details: string
}

export default function CompliancePage() {
  const { storeId } = useStoreContext()

  const [ageVerification, setAgeVerification] = useState({
    enabled: true,
    minAge: 18,
    requireId: true,
  })

  const complianceChecks: ComplianceCheck[] = [
    {
      id: '1',
      name: 'Vérification d\'âge',
      description: 'Confirmation obligatoire de l\'âge légal',
      status: 'passed',
      lastChecked: '2024-01-15',
      details: 'Pop-up actif sur toutes les pages',
    },
    {
      id: '2',
      name: 'Licence de vente',
      description: 'Licence valide pour la vente d\'alcool',
      status: 'passed',
      lastChecked: '2024-01-10',
      details: 'Expire le 31/12/2024',
    },
    {
      id: '3',
      name: 'Mentions légales',
      description: 'Avertissements sanitaires obligatoires',
      status: 'warning',
      lastChecked: '2024-01-12',
      details: 'Manque sur 3 fiches produit',
    },
    {
      id: '4',
      name: 'Restrictions géographiques',
      description: 'Blocage des zones interdites',
      status: 'passed',
      lastChecked: '2024-01-15',
      details: 'Livraison bloquée dans les pays restreints',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100'
    }
  }

  const passedChecks = complianceChecks.filter(c => c.status === 'passed').length
  const warningChecks = complianceChecks.filter(c => c.status === 'warning').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conformité & Réglementation</h1>
          <p className="text-gray-600">Vérification d'âge et conformité légale</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{passedChecks}/{complianceChecks.length}</p>
              <p className="text-sm text-gray-500">Contrôles validés</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{warningChecks}</p>
              <p className="text-sm text-gray-500">Avertissements</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">Conforme</p>
              <p className="text-sm text-gray-500">Statut global</p>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <h3 className="font-medium text-gray-900 mb-4">Vérification d'âge</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Activer la vérification d'âge</p>
              <p className="text-sm text-gray-500">Pop-up obligatoire à l'entrée du site</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ageVerification.enabled}
                onChange={(e) => setAgeVerification({ ...ageVerification, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Âge minimum</label>
              <select
                value={ageVerification.minAge}
                onChange={(e) => setAgeVerification({ ...ageVerification, minAge: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={18}>18 ans</option>
                <option value={21}>21 ans</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="requireId"
                checked={ageVerification.requireId}
                onChange={(e) => setAgeVerification({ ...ageVerification, requireId: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="requireId" className="text-sm">Exiger pièce d'identité au checkout</label>
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="font-medium text-gray-900 mb-4">Contrôles de conformité</h3>
        <div className="space-y-3">
          {complianceChecks.map((check) => (
            <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-gray-500">{check.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(check.status)}`}>
                  {check.status === 'passed' ? 'Validé' : check.status === 'warning' ? 'Attention' : 'Échec'}
                </span>
                <p className="text-xs text-gray-500 mt-1">{check.details}</p>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="font-medium text-gray-900 mb-4">Message légal obligatoire</h3>
        <textarea
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          defaultValue="L'abus d'alcool est dangereux pour la santé. À consommer avec modération."
        />
        <p className="text-xs text-gray-500 mt-2">
          Ce message sera affiché sur toutes les pages produit et au checkout.
        </p>
      </AdminCard>
    </div>
  )
}
