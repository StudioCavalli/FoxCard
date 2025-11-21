'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'

interface ProductAttributesFormProps {
  attributes: Record<string, unknown>
  onChange: (attributes: Record<string, unknown>) => void
}

export default function ProductAttributesForm({
  attributes,
  onChange
}: ProductAttributesFormProps) {
  const { storeId } = useStoreContext()
  const [localAttributes, setLocalAttributes] = useState(attributes)

  const { data: schema } = trpc.commerceType.getProductFormSchema.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  useEffect(() => {
    setLocalAttributes(attributes)
  }, [attributes])

  const handleChange = (key: string, value: unknown) => {
    const updated = { ...localAttributes, [key]: value }
    setLocalAttributes(updated)
    onChange(updated)
  }

  const handleArrayChange = (key: string, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean)
    handleChange(key, items)
  }

  const handleObjectChange = (key: string, subKey: string, value: unknown) => {
    const obj = (localAttributes[key] as Record<string, unknown>) || {}
    handleChange(key, { ...obj, [subKey]: value })
  }

  if (!schema || schema.optionalAttributes.length === 0) {
    return null
  }

  const renderField = (attr: {
    key: string
    label: string
    type: string
    description?: string
  }) => {
    const value = localAttributes[attr.key]
    const isRequired = schema.requiredAttributes.includes(attr.key)

    switch (attr.type) {
      case 'string':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => handleChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={attr.description}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => handleChange(attr.key, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={attr.description}
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) => handleChange(attr.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">{attr.description}</span>
          </label>
        )

      case 'array':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? (value as string[]).join(', ') : ''}
            onChange={(e) => handleArrayChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={attr.description || 'Valeurs séparées par des virgules'}
          />
        )

      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => handleChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner...</option>
            {getSelectOptions(attr.key).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="flex flex-wrap gap-2">
            {getSelectOptions(attr.key).map((opt) => (
              <label key={opt.value} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter((v: string) => v !== opt.value)
                    handleChange(attr.key, newValues)
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        )

      case 'object':
        if (attr.key === 'nutritionalInfo') {
          return <NutritionalInfoField value={value as Record<string, number>} onChange={(v) => handleChange(attr.key, v)} />
        }
        if (attr.key === 'dimensions') {
          return <DimensionsField value={value as Record<string, number>} onChange={(v) => handleChange(attr.key, v)} />
        }
        if (attr.key === 'specifications') {
          return <SpecificationsField value={value as Record<string, string>} onChange={(v) => handleChange(attr.key, v)} />
        }
        return null

      case 'date':
        return (
          <input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => handleChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      default:
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => handleChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Attributs {schema.label}
        </h3>
        {schema.requiredAttributes.length > 0 && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {schema.requiredAttributes.length} requis
          </span>
        )}
      </div>

      <div className="grid gap-4">
        {schema.optionalAttributes.map((attr) => {
          const isRequired = schema.requiredAttributes.includes(attr.key)
          return (
            <div key={attr.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {attr.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(attr)}
              {attr.description && attr.type !== 'boolean' && (
                <p className="mt-1 text-xs text-gray-500">{attr.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper to get select options for specific fields
function getSelectOptions(key: string): { value: string; label: string }[] {
  switch (key) {
    case 'fit':
      return [
        { value: 'slim', label: 'Slim' },
        { value: 'regular', label: 'Regular' },
        { value: 'loose', label: 'Loose' },
        { value: 'oversized', label: 'Oversized' }
      ]
    case 'gender':
      return [
        { value: 'men', label: 'Homme' },
        { value: 'women', label: 'Femme' },
        { value: 'unisex', label: 'Unisexe' },
        { value: 'kids', label: 'Enfant' }
      ]
    case 'season':
      return [
        { value: 'spring', label: 'Printemps' },
        { value: 'summer', label: 'Été' },
        { value: 'fall', label: 'Automne' },
        { value: 'winter', label: 'Hiver' }
      ]
    case 'level':
      return [
        { value: 'beginner', label: 'Débutant' },
        { value: 'intermediate', label: 'Intermédiaire' },
        { value: 'advanced', label: 'Avancé' },
        { value: 'professional', label: 'Professionnel' }
      ]
    case 'assembly':
      return [
        { value: 'none', label: 'Aucun' },
        { value: 'minimal', label: 'Minimal' },
        { value: 'full', label: 'Complet' }
      ]
    case 'skinType':
      return [
        { value: 'normal', label: 'Normale' },
        { value: 'dry', label: 'Sèche' },
        { value: 'oily', label: 'Grasse' },
        { value: 'combination', label: 'Mixte' },
        { value: 'sensitive', label: 'Sensible' }
      ]
    case 'certifications':
      return [
        { value: 'cruelty-free', label: 'Cruelty-free' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'organic', label: 'Bio' },
        { value: 'dermatologist-tested', label: 'Testé dermatologiquement' }
      ]
    case 'concerns':
      return [
        { value: 'aging', label: 'Anti-âge' },
        { value: 'acne', label: 'Acné' },
        { value: 'hydration', label: 'Hydratation' },
        { value: 'brightening', label: 'Éclat' },
        { value: 'pores', label: 'Pores' }
      ]
    case 'roomType':
      return [
        { value: 'living', label: 'Salon' },
        { value: 'bedroom', label: 'Chambre' },
        { value: 'kitchen', label: 'Cuisine' },
        { value: 'bathroom', label: 'Salle de bain' },
        { value: 'office', label: 'Bureau' },
        { value: 'outdoor', label: 'Extérieur' }
      ]
    default:
      return []
  }
}

// Nutritional info sub-component
function NutritionalInfoField({
  value,
  onChange
}: {
  value: Record<string, number> | undefined
  onChange: (value: Record<string, number>) => void
}) {
  const fields = [
    { key: 'calories', label: 'Calories (kcal)' },
    { key: 'protein', label: 'Protéines (g)' },
    { key: 'carbs', label: 'Glucides (g)' },
    { key: 'fat', label: 'Lipides (g)' },
    { key: 'fiber', label: 'Fibres (g)' },
    { key: 'sodium', label: 'Sodium (mg)' }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="text-xs text-gray-500">{field.label}</label>
          <input
            type="number"
            value={value?.[field.key] || ''}
            onChange={(e) => onChange({ ...value, [field.key]: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>
      ))}
    </div>
  )
}

// Dimensions sub-component
function DimensionsField({
  value,
  onChange
}: {
  value: Record<string, number> | undefined
  onChange: (value: Record<string, number>) => void
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <label className="text-xs text-gray-500">Largeur (cm)</label>
        <input
          type="number"
          value={value?.width || ''}
          onChange={(e) => onChange({ ...value, width: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs text-gray-500">Hauteur (cm)</label>
        <input
          type="number"
          value={value?.height || ''}
          onChange={(e) => onChange({ ...value, height: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs text-gray-500">Profondeur (cm)</label>
        <input
          type="number"
          value={value?.depth || ''}
          onChange={(e) => onChange({ ...value, depth: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        />
      </div>
    </div>
  )
}

// Specifications sub-component (key-value pairs)
function SpecificationsField({
  value,
  onChange
}: {
  value: Record<string, string> | undefined
  onChange: (value: Record<string, string>) => void
}) {
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    Object.entries(value || {}).map(([k, v]) => ({ key: k, value: v }))
  )

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }])
  }

  const removeSpec = (index: number) => {
    const newSpecs = specs.filter((_, i) => i !== index)
    setSpecs(newSpecs)
    updateParent(newSpecs)
  }

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = val
    setSpecs(newSpecs)
    updateParent(newSpecs)
  }

  const updateParent = (newSpecs: { key: string; value: string }[]) => {
    const obj: Record<string, string> = {}
    newSpecs.forEach((spec) => {
      if (spec.key) {
        obj[spec.key] = spec.value
      }
    })
    onChange(obj)
  }

  return (
    <div className="space-y-2">
      {specs.map((spec, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            placeholder="Clé"
            value={spec.key}
            onChange={(e) => updateSpec(index, 'key', e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Valeur"
            value={spec.value}
            onChange={(e) => updateSpec(index, 'value', e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <button
            type="button"
            onClick={() => removeSpec(index)}
            className="px-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addSpec}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + Ajouter une spécification
      </button>
    </div>
  )
}
