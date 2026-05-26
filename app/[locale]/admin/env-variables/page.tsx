'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { Settings, Database, Mail, CreditCard, Cloud, Lock, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

type EnvCategory = 'DATABASE' | 'SMTP' | 'STRIPE' | 'R2' | 'AUTH' | 'GENERAL'

const categoryConfig = {
  DATABASE: { icon: Database, label: 'Base de données', color: 'blue' },
  SMTP: { icon: Mail, label: 'SMTP / Email', color: 'green' },
  STRIPE: { icon: CreditCard, label: 'Stripe', color: 'purple' },
  R2: { icon: Cloud, label: 'Cloudflare R2', color: 'orange' },
  AUTH: { icon: Lock, label: 'Authentification', color: 'red' },
  GENERAL: { icon: Settings, label: 'Général', color: 'gray' },
}

export default function EnvVariablesPage() {
  const { storeId } = useStoreContext()
  const [selectedCategory, setSelectedCategory] = useState<EnvCategory>('DATABASE')
  const [showNewForm, setShowNewForm] = useState(false)
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    isSecret: false,
  })

  const { data: variables, refetch } = trpc.envVariable.getAll.useQuery({
    storeId: storeId!,
  }, { enabled: !!storeId })

  const upsertVariable = trpc.envVariable.upsert.useMutation({
    onSuccess: () => {
      refetch()
      setShowNewForm(false)
      setFormData({ key: '', value: '', description: '', isSecret: false })
    },
  })

  const deleteVariable = trpc.envVariable.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const testConnection = trpc.envVariable.testConnection.useMutation()

  const filteredVariables = variables?.filter((v) => v.category === selectedCategory) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    upsertVariable.mutate({
      storeId: storeId!,
      category: selectedCategory,
      ...formData,
    })
  }

  const toggleSecretVisibility = (id: string) => {
    const newSet = new Set(visibleSecrets)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setVisibleSecrets(newSet)
  }

  const handleTestConnection = () => {
    const categoryVariables = filteredVariables.reduce((acc, v) => {
      acc[v.key] = v.value
      return acc
    }, {} as Record<string, string>)

    testConnection.mutate({
      category: selectedCategory,
      variables: categoryVariables,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Variables d'environnement</h1>
        <p className="text-gray-600 mt-1">Gérez les configurations de votre boutique</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <Card variant="default" className="p-4 lg:col-span-1 h-fit">
          <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">Catégories</h2>
          <div className="space-y-1">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon
              const isActive = selectedCategory === key
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key as EnvCategory)
                    setShowNewForm(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{config.label}</span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Variables List */}
        <div className="lg:col-span-3 space-y-4">
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = categoryConfig[selectedCategory].icon
                  return <Icon className="w-6 h-6 text-primary-600" />
                })()}
                <h2 className="text-xl font-bold text-gray-900">
                  {categoryConfig[selectedCategory].label}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {filteredVariables.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    isLoading={testConnection.isPending}
                  >
                    Tester la connexion
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowNewForm(!showNewForm)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Test Result */}
            {testConnection.data && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  testConnection.data.success
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {testConnection.data.message}
              </div>
            )}

            {/* New Variable Form */}
            {showNewForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
                <Input
                  label="Nom de la variable"
                  placeholder="DATABASE_URL"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  required
                />
                <Input
                  label="Valeur"
                  type={formData.isSecret ? 'password' : 'text'}
                  placeholder="Valeur de la variable"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
                <Input
                  label="Description (optionnel)"
                  placeholder="Description de la variable"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isSecret}
                    onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Variable secrète (masquée)</span>
                </label>
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" isLoading={upsertVariable.isPending}>
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewForm(false)
                      setFormData({ key: '', value: '', description: '', isSecret: false })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}

            {/* Variables List */}
            {filteredVariables.length > 0 ? (
              <div className="space-y-3">
                {filteredVariables.map((variable) => (
                  <div key={variable.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-semibold text-gray-900">{variable.key}</span>
                          {variable.isSecret && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Secret
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-600">
                            {variable.isSecret && !visibleSecrets.has(variable.id)
                              ? variable.value
                              : variable.value}
                          </span>
                          {variable.isSecret && (
                            <button
                              onClick={() => toggleSecretVisibility(variable.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {visibleSecrets.has(variable.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        {variable.description && (
                          <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Supprimer la variable ${variable.key} ?`)) {
                            deleteVariable.mutate({ id: variable.id })
                          }
                        }}
                        isLoading={deleteVariable.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucune variable configurée pour cette catégorie</p>
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card variant="default" className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">À propos des variables d'environnement</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Les variables secrètes sont stockées de manière sécurisée</li>
                  <li>• Redémarrez l'application après modification pour appliquer les changements</li>
                  <li>• Ne partagez jamais vos clés API ou secrets</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
