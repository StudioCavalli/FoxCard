'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Save,
  Puzzle,
  RotateCcw,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

// Configuration field types
type FieldType = 'string' | 'password' | 'number' | 'boolean' | 'select' | 'object'

interface ConfigField {
  key: string
  label: string
  type: FieldType
  description?: string
  required?: boolean
  options?: { value: string; label: string }[]
  default?: any
  nested?: ConfigField[]
}

// Generate config schema from config object
function generateConfigSchema(config: Record<string, any>, prefix = ''): ConfigField[] {
  const fields: ConfigField[] = []

  for (const [key, value] of Object.entries(config)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      fields.push({
        key: fullKey,
        label,
        type: 'object',
        nested: generateConfigSchema(value, fullKey),
      })
    } else if (typeof value === 'boolean') {
      fields.push({
        key: fullKey,
        label,
        type: 'boolean',
        default: value,
      })
    } else if (typeof value === 'number') {
      fields.push({
        key: fullKey,
        label,
        type: 'number',
        default: value,
      })
    } else if (
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('apikey') ||
      key.toLowerCase().includes('accesskey')
    ) {
      fields.push({
        key: fullKey,
        label,
        type: 'password',
        required: true,
      })
    } else {
      fields.push({
        key: fullKey,
        label,
        type: 'string',
        default: value,
      })
    }
  }

  return fields
}

// Get nested value from object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

// Set nested value in object
function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.')
  const result = { ...obj }
  let current = result

  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...current[keys[i]] }
    current = current[keys[i]]
  }

  current[keys[keys.length - 1]] = value
  return result
}

export default function PluginSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const pluginId = params.id as string
  const { storeId } = useStoreContext()

  const [config, setConfig] = useState<Record<string, any>>({})
  const [originalConfig, setOriginalConfig] = useState<Record<string, any>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  // Fetch plugin data
  const { data: plugin, isLoading, refetch } = trpc.plugin.getById.useQuery(
    { storeId: storeId!, id: pluginId },
    { enabled: !!pluginId }
  )

  // Mutations
  const updateConfigMutation = trpc.plugin.updateConfig.useMutation()
  const enableMutation = trpc.plugin.enable.useMutation()
  const disableMutation = trpc.plugin.disable.useMutation()

  // Load plugin config
  useEffect(() => {
    if (plugin) {
      const pluginConfig = (plugin.config as Record<string, any>) || {}
      setConfig(pluginConfig)
      setOriginalConfig(pluginConfig)
    }
  }, [plugin])

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig))
  }, [config, originalConfig])

  // Update config value
  const updateValue = (key: string, value: any) => {
    setConfig(setNestedValue(config, key, value))
  }

  // Reset to original
  const handleReset = () => {
    if (confirm('Voulez-vous annuler toutes les modifications ?')) {
      setConfig(originalConfig)
    }
  }

  // Save config
  const handleSave = async () => {
    updateConfigMutation.mutate(
      {
        storeId: storeId!,
        id: pluginId,
        config,
      },
      {
        onSuccess: () => {
          setOriginalConfig(config)
          setHasChanges(false)
          alert('Configuration enregistrée avec succès')
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  // Toggle plugin
  const handleToggle = () => {
    if (plugin?.isEnabled) {
      disableMutation.mutate(
        { storeId: storeId!, id: pluginId },
        {
          onSuccess: () => refetch(),
          onError: (error) => alert(error.message),
        }
      )
    } else {
      enableMutation.mutate(
        { storeId: storeId!, id: pluginId },
        {
          onSuccess: () => refetch(),
          onError: (error) => alert(error.message),
        }
      )
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Render config field
  const renderField = (field: ConfigField, depth = 0) => {
    const value = getNestedValue(config, field.key)

    if (field.type === 'object' && field.nested) {
      return (
        <div key={field.key} className={`${depth > 0 ? 'ml-4 pl-4 border-l-2 border-gray-200' : ''}`}>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{field.label}</h4>
          <div className="space-y-4">
            {field.nested.map((nestedField) => renderField(nestedField, depth + 1))}
          </div>
        </div>
      )
    }

    if (field.type === 'boolean') {
      return (
        <div key={field.key} className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">{field.label}</label>
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => updateValue(field.key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )
    }

    if (field.type === 'password') {
      const isVisible = showPasswords[field.key]
      return (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <input
              type={isVisible ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => updateValue(field.key, e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={`Entrez ${field.label.toLowerCase()}`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(field.key)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {field.description && (
            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
          )}
        </div>
      )
    }

    if (field.type === 'number') {
      return (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <input
            type="number"
            value={value ?? field.default ?? ''}
            onChange={(e) => updateValue(field.key, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {field.description && (
            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
          )}
        </div>
      )
    }

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <select
            value={value || ''}
            onChange={(e) => updateValue(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.description && (
            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
          )}
        </div>
      )
    }

    // Default: string
    return (
      <div key={field.key}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
        </label>
        <input
          type="text"
          value={value ?? field.default ?? ''}
          onChange={(e) => updateValue(field.key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder={`Entrez ${field.label.toLowerCase()}`}
        />
        {field.description && (
          <p className="text-xs text-gray-500 mt-1">{field.description}</p>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!plugin) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Plugin non trouvé</h2>
        <Button variant="primary" onClick={() => router.push('/admin/plugins')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux plugins
        </Button>
      </div>
    )
  }

  const configSchema = generateConfigSchema(config)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/plugins')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
              {plugin.icon || <Puzzle className="w-5 h-5 text-gray-600" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{plugin.name}</h1>
              <p className="text-sm text-gray-500">Configuration du plugin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || updateConfigMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateConfigMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main config */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>

            {configSchema.length > 0 ? (
              <div className="space-y-6">
                {configSchema.map((field) => renderField(field))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Ce plugin ne nécessite pas de configuration.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plugin status */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Statut</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Plugin actif</span>
              <div
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  plugin.isEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {plugin.isEnabled ? 'Oui' : 'Non'}
              </div>
            </div>
            <Button
              variant={plugin.isEnabled ? 'secondary' : 'primary'}
              className="w-full"
              onClick={handleToggle}
              disabled={enableMutation.isPending || disableMutation.isPending}
            >
              {plugin.isEnabled ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Désactiver
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Activer
                </>
              )}
            </Button>
          </Card>

          {/* Plugin info */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Version</span>
                <span className="text-gray-900">{plugin.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-900">{plugin.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Catégorie</span>
                <span className="text-gray-900 capitalize">{plugin.category}</span>
              </div>
              {plugin.installedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Installé le</span>
                  <span className="text-gray-900">
                    {new Date(plugin.installedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {plugin.description && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{plugin.description}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
