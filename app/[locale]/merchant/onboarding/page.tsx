'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Store,
  Palette,
  Package,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'store', icon: Store },
  { id: 'theme', icon: Palette },
  { id: 'product', icon: Package },
  { id: 'complete', icon: CheckCircle },
]

const THEME_PRESETS = [
  { id: 'modern', nameKey: 'themeModern', descKey: 'themeModernDesc', primary: '#6366f1', secondary: '#ec4899' },
  { id: 'nature', nameKey: 'themeNature', descKey: 'themeNatureDesc', primary: '#10b981', secondary: '#3b82f6' },
  { id: 'warm', nameKey: 'themeWarm', descKey: 'themeWarmDesc', primary: '#f97316', secondary: '#eab308' },
  { id: 'minimal', nameKey: 'themeMinimal', descKey: 'themeMinimalDesc', primary: '#111827', secondary: '#6b7280' },
  { id: 'luxury', nameKey: 'themeLuxury', descKey: 'themeLuxuryDesc', primary: '#8b5cf6', secondary: '#c084fc' },
  { id: 'playful', nameKey: 'themePlayful', descKey: 'themePlayfulDesc', primary: '#f43f5e', secondary: '#06b6d4' },
]

export default function MerchantOnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale || 'fr'
  const { data: session } = useSession()
  const t = useTranslations('merchant.onboarding')
  const tCommon = useTranslations('common')

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    slug: '',
  })
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
  })

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setStoreData({
      ...storeData,
      name,
      slug: generateSlug(name),
    })
  }

  // Mutations
  const createStore = trpc.store.create.useMutation()
  const createTheme = trpc.theme.create.useMutation()
  const createProduct = trpc.product.create.useMutation()
  const seedThemes = trpc.theme.seedSystemThemes.useMutation()

  const handleNext = async () => {
    if (currentStep === 0) {
      // Validate store data
      if (!storeData.name || !storeData.slug) {
        return
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)

    try {
      // 1. Create the store
      const store = await createStore.mutateAsync({
        name: storeData.name,
        slug: storeData.slug,
        description: storeData.description,
      })

      // 2. Seed default themes and create custom theme
      await seedThemes.mutateAsync({ storeId: store.id })

      const themePreset = THEME_PRESETS.find((tp) => tp.id === selectedTheme)
      if (themePreset) {
        await createTheme.mutateAsync({
          storeId: store.id,
          name: `${themePreset.id.charAt(0).toUpperCase() + themePreset.id.slice(1)} Theme`,
          config: {
            colors: {
              primary: themePreset.primary,
              secondary: themePreset.secondary,
              accent: '#f59e0b',
              background: '#ffffff',
              surface: '#fafafa',
              text: '#111827',
              textSecondary: '#6b7280',
              textMuted: '#9ca3af',
              border: '#e5e5e5',
              borderLight: '#f5f5f5',
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
            },
            spacing: {
              containerMaxWidth: '1280px',
              sectionPadding: '4rem',
            },
            borderRadius: '0.5rem',
          },
        })
      }

      // 3. Create first product if data provided
      if (productData.name && productData.price) {
        await createProduct.mutateAsync({
          storeId: store.id,
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price) * 100, // Convert to cents
          slug: generateSlug(productData.name),
          status: 'DRAFT',
          type: 'SIMPLE',
          images: [],
        })
      }

      // 4. Redirect to dashboard
      router.push(`/${locale}/merchant`)
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {t('title')}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t(`steps.${currentStepData.id}`)}
          </h1>
          <p className="text-gray-600">
            {currentStep + 1} / {STEPS.length}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-16 h-1 mx-2 rounded transition-all',
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Store Setup */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('createStore')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {t('createStoreDesc')}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storeName')} *
                  </label>
                  <Input
                    type="text"
                    placeholder={t('storeNamePlaceholder')}
                    value={storeData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storeUrl')}
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                      foxcard.app/stores/
                    </span>
                    <Input
                      type="text"
                      value={storeData.slug}
                      onChange={(e) =>
                        setStoreData({ ...storeData, slug: e.target.value })
                      }
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storeDescription')}
                  </label>
                  <textarea
                    placeholder={t('storeDescriptionPlaceholder')}
                    value={storeData.description}
                    onChange={(e) =>
                      setStoreData({ ...storeData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Theme Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('steps.theme')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {t('selectTheme')}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {THEME_PRESETS.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      selectedTheme === theme.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div
                      className="w-full h-16 rounded-lg mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      }}
                    />
                    <p className="font-medium text-gray-900">{t(theme.nameKey)}</p>
                    <p className="text-sm text-gray-500">{t(theme.descKey)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: First Product */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('addFirstProduct')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {t('addFirstProductDesc')}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('productName')}
                  </label>
                  <Input
                    type="text"
                    placeholder={t('productNamePlaceholder')}
                    value={productData.name}
                    onChange={(e) =>
                      setProductData({ ...productData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('productPrice')} (€)
                  </label>
                  <Input
                    type="number"
                    placeholder="29.99"
                    step="0.01"
                    value={productData.price}
                    onChange={(e) =>
                      setProductData({ ...productData, price: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('storeDescription')}
                  </label>
                  <textarea
                    placeholder={t('storeDescriptionPlaceholder')}
                    value={productData.description}
                    onChange={(e) =>
                      setProductData({ ...productData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={() => setProductData({ name: '', price: '', description: '' })}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('skipStep')} →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('storeReady')}
                </h2>
                <p className="text-gray-600">
                  {t('storeReadyDesc')}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4">{t('summary')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{storeData.name}</p>
                      <p className="text-sm text-gray-500">foxcard.app/stores/{storeData.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-gray-400" />
                    <p className="text-gray-700">
                      {t('steps.theme')}: {t(THEME_PRESETS.find((preset) => preset.id === selectedTheme)?.nameKey || 'themeModern')}
                    </p>
                  </div>
                  {productData.name && (
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-700">
                        {t('firstProduct')}: {productData.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {tCommon('back')}
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={currentStep === 0 && !storeData.name}
                className="gap-2"
              >
                {tCommon('next')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {t('goToDashboard')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
