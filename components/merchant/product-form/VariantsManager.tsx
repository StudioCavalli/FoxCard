'use client'

import { useState, useEffect, useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { CommerceType } from '@/lib/commerce-types'
import {
  getVariantConfigForCommerceType,
  generateVariantCombinations,
  calculateVariantPrice,
  type VariantOption,
  type VariantTypeConfig,
} from '@/lib/variants/variant-config'
import {
  Layers,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Palette,
  Ruler,
  Package,
  Settings,
} from 'lucide-react'

interface ProductVariant {
  id?: string
  name: string
  sku?: string
  price?: number
  quantity: number
  image?: string
  options: Record<string, string>
}

interface VariantsManagerProps {
  productId?: string
  commerceType: CommerceType
  basePrice: number
  onVariantsChange?: (variants: ProductVariant[]) => void
  initialVariants?: ProductVariant[]
}

function VariantOptionSelector({
  config,
  selectedValues,
  onChange,
}: {
  config: VariantTypeConfig
  selectedValues: string[]
  onChange: (values: string[]) => void
}) {
  const [customValue, setCustomValue] = useState('')

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const addCustomValue = () => {
    if (customValue.trim() && !selectedValues.includes(customValue.trim())) {
      onChange([...selectedValues, customValue.trim()])
      setCustomValue('')
    }
  }

  if (config.inputType === 'color') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {config.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleValue(option.value)}
              className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                selectedValues.includes(option.value)
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: option.color }}
              title={option.label}
            >
              {selectedValues.includes(option.value) && (
                <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
        {config.allowCustom && (
          <div className="flex gap-2">
            <input
              type="color"
              value={customValue || '#000000'}
              onChange={(e) => setCustomValue(e.target.value)}
              className="w-12 h-8 p-0 cursor-pointer rounded-lg"
            />
            <input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Couleur personnalisée (#hex)"
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
            <AdminButton type="button" variant="outline" size="sm" onClick={addCustomValue}>
              <Plus className="w-4 h-4" />
            </AdminButton>
          </div>
        )}
      </div>
    )
  }

  if (config.inputType === 'size') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {config.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleValue(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded border transition-all ${
                selectedValues.includes(option.value)
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {config.allowCustom && (
          <div className="flex gap-2">
            <input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Taille personnalisée (ex: 48, 3XL...)"
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
            <AdminButton type="button" variant="outline" size="sm" onClick={addCustomValue}>
              <Plus className="w-4 h-4" />
            </AdminButton>
          </div>
        )}
      </div>
    )
  }

  // Default select style
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {config.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleValue(option.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all flex items-center gap-1.5 ${
              selectedValues.includes(option.value)
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/50'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600'
            }`}
          >
            {selectedValues.includes(option.value) && <Check className="w-3 h-3" />}
            {option.label}
            {option.priceModifier && option.priceModifier !== 0 && (
              <span className="text-xs text-gray-500">
                {option.priceModifier > 0 ? '+' : ''}{option.priceModifier}€
              </span>
            )}
          </button>
        ))}
      </div>
      {config.allowCustom && (
        <div className="flex gap-2">
          <input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Valeur personnalisée"
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
          <AdminButton type="button" variant="outline" size="sm" onClick={addCustomValue}>
            <Plus className="w-4 h-4" />
          </AdminButton>
        </div>
      )}
    </div>
  )
}

export function VariantsManager({
  productId,
  commerceType,
  basePrice,
  onVariantsChange,
  initialVariants = [],
}: VariantsManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants)
  const [isGenerating, setIsGenerating] = useState(false)

  const variantConfig = useMemo(
    () => getVariantConfigForCommerceType(commerceType),
    [commerceType]
  )

  // Don't show for commerce types that don't support variants
  if (variantConfig.maxVariantCombinations === 0) {
    return null
  }

  const handleOptionChange = (type: string, values: string[]) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [type]: values,
    }))
  }

  const generateVariants = () => {
    setIsGenerating(true)

    const combinations = generateVariantCombinations(selectedOptions, basePrice)

    const newVariants: ProductVariant[] = combinations.map((combo) => ({
      name: combo.name,
      options: combo.options,
      price: calculateVariantPrice(basePrice, combo.options, variantConfig),
      quantity: 0,
    }))

    setVariants(newVariants)
    onVariantsChange?.(newVariants)
    setIsGenerating(false)
  }

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], ...updates }
    setVariants(newVariants)
    onVariantsChange?.(newVariants)
  }

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index)
    setVariants(newVariants)
    onVariantsChange?.(newVariants)
  }

  const totalSelectedOptions = Object.values(selectedOptions).reduce(
    (acc, values) => acc + values.length,
    0
  )

  const estimatedCombinations = Object.values(selectedOptions)
    .filter((arr) => arr.length > 0)
    .reduce((acc, arr) => acc * arr.length, 1)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Variantes du produit
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {variants.length > 0
                ? `${variants.length} variante${variants.length > 1 ? 's' : ''} configurée${variants.length > 1 ? 's' : ''}`
                : 'Configurez les options de votre produit'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Variant Type Selectors */}
          {variantConfig.variantTypes.map((typeConfig) => (
            <div key={typeConfig.type} className="space-y-2">
              <label className="flex items-center gap-2">
                {typeConfig.inputType === 'color' && <Palette className="w-4 h-4" />}
                {typeConfig.inputType === 'size' && <Ruler className="w-4 h-4" />}
                {typeConfig.inputType === 'select' && <Package className="w-4 h-4" />}
                {typeConfig.inputType === 'custom' && <Settings className="w-4 h-4" />}
                {typeConfig.name}
                {typeConfig.required && <span className="text-red-500">*</span>}
              </label>
              <VariantOptionSelector
                config={typeConfig}
                selectedValues={selectedOptions[typeConfig.type] || []}
                onChange={(values) => handleOptionChange(typeConfig.type, values)}
              />
            </div>
          ))}

          {/* Generate Button */}
          {totalSelectedOptions > 0 && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Combinaisons possibles:{' '}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {estimatedCombinations}
                </span>
                {estimatedCombinations > (variantConfig.maxVariantCombinations || 100) && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Maximum recommandé: {variantConfig.maxVariantCombinations}</span>
                  </div>
                )}
              </div>
              <AdminButton
                type="button"
                variant="primary"
                onClick={generateVariants}
                disabled={isGenerating || estimatedCombinations > (variantConfig.maxVariantCombinations || 100)}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 mr-2" />
                    Générer les variantes
                  </>
                )}
              </AdminButton>
            </div>
          )}

          {/* Generated Variants List */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Variantes générées
              </h3>
              <div className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                        Variante
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                        Prix
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                        Stock
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                    {variants.map((variant, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {variant.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(index, { sku: e.target.value })}
                            placeholder="SKU"
                            className="w-32 h-8 px-3 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative w-24">
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price ?? basePrice}
                              onChange={(e) =>
                                updateVariant(index, { price: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full h-8 px-3 pr-6 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">
                              €
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={variant.quantity}
                            onChange={(e) =>
                              updateVariant(index, { quantity: parseInt(e.target.value) || 0 })
                            }
                            className="w-20 h-8 px-3 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AdminButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </AdminButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Stock total:{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {variants.reduce((sum, v) => sum + v.quantity, 0)}
                  </span>
                </span>
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVariants([])
                    onVariantsChange?.([])
                  }}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer toutes les variantes
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
