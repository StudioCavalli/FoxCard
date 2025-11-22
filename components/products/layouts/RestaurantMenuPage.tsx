'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, UtensilsCrossed, Clock, MapPin, Flame, Leaf, AlertCircle,
  Plus, Minus, ShoppingBag, Star, ChevronDown
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

export function RestaurantMenuPage({ product }: RestaurantMenuPageProps) {
  const router = useRouter()
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

  // Mock menu data - would come from product metadata
  const isSpicy = product.metadata?.isSpicy || false
  const isVegetarian = product.metadata?.isVegetarian || false
  const allergens = product.metadata?.allergens || []
  const prepTime = product.metadata?.prepTime || '15-20'
  const calories = product.metadata?.calories || null

  // Options groups (extras, sides, sauces, etc.)
  const optionGroups = product.metadata?.optionGroups || [
    {
      id: 'size',
      name: t('product.restaurant.size'),
      required: true,
      options: [
        { id: 'regular', name: t('product.restaurant.regular'), price: 0 },
        { id: 'large', name: t('product.restaurant.large'), price: 3 },
      ],
    },
    {
      id: 'extras',
      name: t('product.restaurant.extras'),
      required: false,
      multiple: true,
      options: [
        { id: 'cheese', name: t('product.restaurant.extraCheese'), price: 1.5 },
        { id: 'bacon', name: t('product.restaurant.bacon'), price: 2 },
        { id: 'avocado', name: t('product.restaurant.avocado'), price: 2.5 },
      ],
    },
    {
      id: 'sauce',
      name: t('product.restaurant.sauce'),
      required: false,
      options: [
        { id: 'none', name: t('product.restaurant.noSauce'), price: 0 },
        { id: 'bbq', name: 'BBQ', price: 0 },
        { id: 'mayo', name: t('product.restaurant.mayonnaise'), price: 0 },
        { id: 'spicy', name: t('product.restaurant.spicySauce'), price: 0 },
      ],
    },
  ]

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
        options: selectedOptions,
        specialInstructions,
      },
    })
    router.push('/cart')
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Back Button */}
        <Link
          href="/products"
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
              {calories && (
                <div className="flex items-center gap-2 text-theme-text-secondary">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>{calories} kcal</span>
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

            {/* Option Groups */}
            <div className="space-y-6">
              {optionGroups.map((group: any) => (
                <div key={group.id} className="border border-theme-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-theme-text">{group.name}</h3>
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
                  <div className="space-y-2">
                    {group.options.map((option: MenuOption) => {
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
                            <span className="text-theme-text">{option.name}</span>
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
