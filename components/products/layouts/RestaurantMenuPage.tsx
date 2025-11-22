'use client'

import { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import {
  ArrowLeft, UtensilsCrossed, Clock, MapPin, Flame, Leaf, AlertCircle,
  Plus, Minus, ShoppingBag, Star, ChevronDown, Loader2
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface RestaurantMenuPageProps {
  product: any
}

interface MenuOption {
  id: string
  name: string
  price: number
  required?: boolean
}

interface ModifierFromDB {
  id: string
  name: string
  description?: string | null
  priceAdjustment: number
  isDefault: boolean
  isAvailable: boolean
  calories?: number | null
  allergens: string[]
}

interface ModifierGroupFromDB {
  id: string
  name: string
  description?: string | null
  selectionType: 'SINGLE' | 'MULTIPLE' | 'QUANTITY'
  minSelections: number
  maxSelections?: number | null
  isRequired: boolean
  isActive: boolean
  modifiers: ModifierFromDB[]
}

export function RestaurantMenuPage({ product }: RestaurantMenuPageProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const t = useTranslations()
  const addItem = useCartStore((state) => state.addItem)

  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const images = product.images?.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-food.png']
  const mainImage = images[0] || '/placeholder-food.png'

  // Get product attributes (stored restaurant-specific data)
  const attributes = (product.attributes as Record<string, unknown>) || {}
  const modifierGroupIds = (attributes.modifierGroupIds as string[]) || []

  // Restaurant-specific attributes from product
  const isSpicy = attributes.spicyLevel ? (attributes.spicyLevel as number) > 0 : false
  const isVegetarian = attributes.vegetarian as boolean || false
  const productAllergens = (attributes.allergens as string[]) || []
  const prepTime = attributes.prepTime as number || 15
  const productCalories = attributes.calories as number || null

  // Fetch real modifier groups from database
  const { data: allModifierGroups, isLoading: isLoadingModifiers } = trpc.restaurant.getModifierGroups.useQuery(
    { storeId: product.storeId },
    { enabled: !!product.storeId && modifierGroupIds.length > 0 }
  )

  // Filter and transform modifier groups for this product
  const optionGroups = useMemo(() => {
    if (!allModifierGroups || modifierGroupIds.length === 0) {
      return []
    }

    // Filter groups that are assigned to this product
    const assignedGroups = allModifierGroups.filter((group: ModifierGroupFromDB) =>
      modifierGroupIds.includes(group.id) && group.isActive
    )

    // Transform to the format expected by the UI
    return assignedGroups.map((group: ModifierGroupFromDB) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      required: group.isRequired,
      multiple: group.selectionType === 'MULTIPLE',
      minSelections: group.minSelections,
      maxSelections: group.maxSelections,
      options: group.modifiers
        .filter((mod: ModifierFromDB) => mod.isAvailable)
        .map((mod: ModifierFromDB) => ({
          id: mod.id,
          name: mod.name,
          price: mod.priceAdjustment,
          calories: mod.calories,
          allergens: mod.allergens,
          isDefault: mod.isDefault,
        })),
    }))
  }, [allModifierGroups, modifierGroupIds])

  // Collect all allergens (from product + selected modifiers)
  const allergens = useMemo(() => {
    const allAllergens = new Set<string>(productAllergens)

    // Add allergens from selected modifiers
    Object.entries(selectedOptions).forEach(([groupId, optionIds]) => {
      const group = optionGroups.find((g: any) => g.id === groupId)
      if (group) {
        optionIds.forEach(optId => {
          const option = group.options.find((o: any) => o.id === optId)
          if (option?.allergens) {
            option.allergens.forEach((a: string) => allAllergens.add(a))
          }
        })
      }
    })

    return Array.from(allAllergens)
  }, [productAllergens, selectedOptions, optionGroups])

  // Calculate extras price
  const extrasPrice = Object.entries(selectedOptions).reduce((total, [groupId, optionIds]) => {
    const group = optionGroups.find((g: any) => g.id === groupId)
    if (!group) return total
    return total + optionIds.reduce((sum, optId) => {
      const option = group.options.find((o: MenuOption) => o.id === optId)
      return sum + (option?.price || 0)
    }, 0)
  }, 0)

  const unitPrice = product.price + extrasPrice
  const totalPrice = unitPrice * quantity

  const toggleOption = (groupId: string, optionId: string, multiple: boolean) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || []
      if (multiple) {
        return {
          ...prev,
          [groupId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        }
      } else {
        return {
          ...prev,
          [groupId]: [optionId],
        }
      }
    })
  }

  const canAddToCart = () => {
    for (const group of optionGroups) {
      if (group.required && (!selectedOptions[group.id] || selectedOptions[group.id].length === 0)) {
        return false
      }
    }
    return true
  }

  const handleAddToCart = () => {
    if (!canAddToCart()) return

    // Build full modifier data for order processing
    const fullModifierData: Array<{
      groupId: string
      groupName: string
      modifierId: string
      modifierName: string
      price: number
      quantity: number
    }> = []

    Object.entries(selectedOptions).forEach(([groupId, optionIds]) => {
      const group = optionGroups.find(g => g.id === groupId)
      if (!group) return

      optionIds.forEach(optionId => {
        const modifier = group.options.find(m => m.id === optionId)
        if (modifier) {
          fullModifierData.push({
            groupId: group.id,
            groupName: group.name,
            modifierId: modifier.id,
            modifierName: modifier.name,
            price: modifier.price,
            quantity: 1,
          })
        }
      })
    })

    addItem({
      id: product.id,
      productId: product.id,
      storeId: product.storeId,
      storeName: product.store?.name,
      name: product.name,
      slug: product.slug,
      price: unitPrice,
      image: mainImage,
      quantity,
      maxQuantity: 99,
      commerceType: 'RESTAURANT',
      attributes: {
        options: fullModifierData,
        specialInstructions,
      },
    })
    router.push(`/${locale}/cart`)
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Back Button */}
        <Link
          href={`/${locale}/products`}
          className="group inline-flex items-center text-theme-text-secondary hover:text-theme-primary mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          {t('product.backToProducts')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Image */}
          <div>
            <div className="relative aspect-square bg-theme-surface border border-theme-border rounded-2xl overflow-hidden">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {isSpicy && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {t('product.restaurant.spicy')}
                  </span>
                )}
                {isVegetarian && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    {t('product.restaurant.vegetarian')}
                  </span>
                )}
                {product.featured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    {t('product.restaurant.popular')}
                  </span>
                )}
              </div>
            </div>

            {/* Info badges below image */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-theme-text-secondary">
                <Clock className="w-5 h-5 text-theme-primary" />
                <span>{prepTime} min</span>
              </div>
              {productCalories && (
                <div className="flex items-center gap-2 text-theme-text-secondary">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>{productCalories} kcal</span>
                </div>
              )}
              {product.store && (
                <div className="flex items-center gap-2 text-theme-text-secondary">
                  <MapPin className="w-5 h-5 text-theme-primary" />
                  <span>{product.store.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right - Order Form */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              {product.category && (
                <span className="inline-block px-3 py-1 bg-theme-primary/10 text-theme-primary font-medium rounded-full text-sm mb-3">
                  {product.category.name}
                </span>
              )}
              <h1
                className="text-3xl md:text-4xl font-bold text-theme-text mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {product.name}
              </h1>
              <div className="text-3xl font-bold text-theme-primary" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-theme-text-secondary leading-relaxed">{product.description}</p>
            )}

            {/* Allergens Warning */}
            {allergens.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-800 dark:text-amber-200">
                    {t('product.restaurant.allergens')}
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    {allergens.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Option Groups / Modifiers */}
            {isLoadingModifiers && modifierGroupIds.length > 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-theme-primary" />
                <span className="ml-2 text-theme-text-secondary">{t('common.loading')}</span>
              </div>
            ) : optionGroups.length > 0 ? (
              <div className="space-y-6">
                {optionGroups.map((group: any) => (
                  <div key={group.id} className="border border-theme-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-theme-text">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-theme-text-secondary">{group.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {group.required && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                            {t('product.restaurant.required')}
                          </span>
                        )}
                        {group.multiple && (
                          <span className="text-xs text-theme-text-muted">
                            {t('product.restaurant.selectMultiple')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {group.options.map((option: any) => {
                        const isSelected = selectedOptions[group.id]?.includes(option.id)
                        return (
                          <button
                            key={option.id}
                            onClick={() => toggleOption(group.id, option.id, group.multiple)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-theme-primary bg-theme-primary/5'
                                : 'border-theme-border hover:border-theme-border-light'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-${group.multiple ? 'md' : 'full'} border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'border-theme-primary bg-theme-primary'
                                    : 'border-theme-border'
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                  </svg>
                                )}
                              </div>
                              <div className="text-left">
                                <span className="text-theme-text">{option.name}</span>
                                {option.calories && (
                                  <span className="ml-2 text-xs text-theme-text-muted">
                                    ({option.calories} kcal)
                                  </span>
                                )}
                              </div>
                            </div>
                            {option.price > 0 && (
                              <span className="text-theme-text-secondary">+{formatPrice(option.price)}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Special Instructions */}
            <div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-primary transition-colors"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
                {t('product.restaurant.specialInstructions')}
              </button>
              {showInstructions && (
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t('product.restaurant.instructionsPlaceholder')}
                  className="mt-3 w-full px-4 py-3 border border-theme-border rounded-xl bg-theme-background text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/50 resize-none"
                  rows={3}
                />
              )}
            </div>

            {/* Quantity & Total */}
            <div className="border-t border-theme-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-theme-text">{t('product.quantity')}</span>
                <div className="flex items-center gap-4 bg-theme-surface border border-theme-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-theme-text hover:bg-theme-primary/5 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-4 font-semibold text-lg text-theme-text">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-theme-text hover:bg-theme-primary/5 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {extrasPrice > 0 && (
                <div className="flex justify-between text-theme-text-secondary mb-2">
                  <span>{t('product.restaurant.extras')}</span>
                  <span>+{formatPrice(extrasPrice)}</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold text-theme-text mb-4">
                <span>{t('product.total')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart()}
                className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                <ShoppingBag className="w-5 h-5" />
                {t('product.restaurant.addToOrder')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
