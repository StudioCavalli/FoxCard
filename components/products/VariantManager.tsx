'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, X, Edit2, Check } from 'lucide-react'

export interface ProductVariant {
  id?: string
  name: string
  sku?: string
  price: number
  quantity: number
  image?: string
  options: Record<string, string>
}

interface VariantManagerProps {
  variants: ProductVariant[]
  onChange: (variants: ProductVariant[]) => void
  basePrice: number
}

export function VariantManager({ variants, onChange, basePrice }: VariantManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: '',
    price: basePrice,
    quantity: 0,
    options: {},
  })

  const addVariant = () => {
    if (!newVariant.name) return

    onChange([...variants, newVariant])
    setNewVariant({
      name: '',
      price: basePrice,
      quantity: 0,
      options: {},
    })
    setIsAdding(false)
  }

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, updatedVariant: ProductVariant) => {
    const newVariants = [...variants]
    newVariants[index] = updatedVariant
    onChange(newVariants)
    setEditingIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Variants List */}
      {variants.length > 0 && (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={index}>
              {editingIndex === index ? (
                <Card variant="default" className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Nom de la variante"
                      value={variant.name}
                      onChange={(e) =>
                        updateVariant(index, { ...variant, name: e.target.value })
                      }
                    />
                    <Input
                      label="SKU"
                      value={variant.sku || ''}
                      onChange={(e) =>
                        updateVariant(index, { ...variant, sku: e.target.value })
                      }
                    />
                    <Input
                      label="Prix"
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, { ...variant, price: parseFloat(e.target.value) })
                      }
                    />
                    <Input
                      label="Quantité"
                      type="number"
                      value={variant.quantity}
                      onChange={(e) =>
                        updateVariant(index, { ...variant, quantity: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingIndex(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setEditingIndex(null)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card
                  variant="default"
                  className="p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{variant.name}</h4>
                      {variant.sku && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          SKU: {variant.sku}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Prix: {variant.price.toFixed(2)} €</span>
                      <span>Stock: {variant.quantity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIndex(index)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Variant */}
      {isAdding ? (
        <Card variant="teal" className="p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">Nouvelle variante</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nom de la variante"
              placeholder="Ex: Taille M - Bleu"
              value={newVariant.name}
              onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
            />
            <Input
              label="SKU (optionnel)"
              placeholder="PROD-001-M-BLUE"
              value={newVariant.sku || ''}
              onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
            />
            <Input
              label="Prix"
              type="number"
              step="0.01"
              value={newVariant.price}
              onChange={(e) =>
                setNewVariant({ ...newVariant, price: parseFloat(e.target.value) })
              }
            />
            <Input
              label="Quantité en stock"
              type="number"
              value={newVariant.quantity}
              onChange={(e) =>
                setNewVariant({ ...newVariant, quantity: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={addVariant}>
              <Check className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une variante
        </Button>
      )}

      {/* Info */}
      {variants.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500 text-sm">
          <p>Aucune variante pour ce produit</p>
          <p className="mt-1">Les variantes permettent de gérer différentes options (taille, couleur, etc.)</p>
        </div>
      )}
    </div>
  )
}
