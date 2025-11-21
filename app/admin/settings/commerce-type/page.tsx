'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'

export default function CommerceTypePage() {
  const { storeId } = useStoreContext()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { data: types, isLoading: loadingTypes } = trpc.commerceType.getTypes.useQuery()
  const { data: currentType, isLoading: loadingCurrent } = trpc.commerceType.getStoreType.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const utils = trpc.useUtils()

  const updateType = trpc.commerceType.updateStoreType.useMutation({
    onSuccess: () => {
      utils.commerceType.getStoreType.invalidate({ storeId: storeId! })
      setShowConfirmModal(false)
      setSelectedType(null)
    }
  })

  const createCategories = trpc.commerceType.createDefaultCategories.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate()
    }
  })

  const handleTypeSelect = (type: string) => {
    if (type !== currentType?.type) {
      setSelectedType(type)
      setShowConfirmModal(true)
    }
  }

  const handleConfirm = async () => {
    if (!selectedType || !storeId) return

    await updateType.mutateAsync({
      storeId,
      commerceType: selectedType as any
    })

    // Optionally create default categories
    await createCategories.mutateAsync({ storeId })
  }

  if (loadingTypes || loadingCurrent) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Type de commerce</h1>
        <p className="mt-2 text-gray-600">
          Sélectionnez le type de commerce qui correspond le mieux à votre activité.
          Cela adaptera l'interface, les attributs produits et les catégories par défaut.
        </p>
      </div>

      {/* Current type indicator */}
      {currentType && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentType.icon}</span>
            <div>
              <p className="text-sm text-blue-600 font-medium">Type actuel</p>
              <p className="text-lg font-semibold text-blue-900">{currentType.label}</p>
            </div>
          </div>
        </div>
      )}

      {/* Type selection grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {types?.map((type) => (
          <button
            key={type.type}
            onClick={() => handleTypeSelect(type.type)}
            className={`
              relative p-6 rounded-xl border-2 text-left transition-all
              hover:shadow-lg hover:border-blue-300
              ${currentType?.type === type.type
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                : 'border-gray-200 bg-white hover:bg-gray-50'
              }
            `}
          >
            {currentType?.type === type.type && (
              <span className="absolute top-2 right-2 text-blue-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}

            <span className="text-4xl mb-3 block">{type.icon}</span>
            <h3 className="font-semibold text-gray-900">{type.label}</h3>

            {/* Quick features */}
            <div className="mt-3 space-y-1">
              {type.config.ageVerification && (
                <span className="inline-flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  🔞 Vérification d'âge
                </span>
              )}
              {type.config.defaultCategories.length > 0 && (
                <p className="text-xs text-gray-500">
                  {type.config.defaultCategories.length} catégories par défaut
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Type details section */}
      {currentType && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configuration : {currentType.label}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Default categories */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Catégories par défaut</h3>
              <div className="flex flex-wrap gap-2">
                {currentType.config.defaultCategories.map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Display options */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Options d'affichage</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {currentType.config.displayOptions.showNutritionalInfo && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Informations nutritionnelles
                  </li>
                )}
                {currentType.config.displayOptions.showAlcoholContent && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Degré d'alcool
                  </li>
                )}
                {currentType.config.displayOptions.showSizeChart && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Guide des tailles
                  </li>
                )}
                {currentType.config.displayOptions.showSpecifications && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Spécifications techniques
                  </li>
                )}
                {currentType.config.displayOptions.showIngredients && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Liste des ingrédients
                  </li>
                )}
              </ul>
            </div>

            {/* Required attributes */}
            {currentType.config.requiredAttributes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Attributs requis</h3>
                <div className="flex flex-wrap gap-2">
                  {currentType.config.requiredAttributes.map((attr) => (
                    <span key={attr} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-200">
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Regulations */}
            {currentType.config.regulations && currentType.config.regulations.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Réglementations</h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  {currentType.config.regulations.map((reg, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5">⚠️</span>
                      {reg}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Changer le type de commerce ?
            </h3>
            <p className="text-gray-600 mb-4">
              Vous allez passer de <strong>{currentType?.label}</strong> à{' '}
              <strong>{types?.find(t => t.type === selectedType)?.label}</strong>.
            </p>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded mb-4">
              ⚠️ Cette action va créer les catégories par défaut du nouveau type.
              Les attributs produits existants ne seront pas supprimés mais pourraient ne plus être affichés.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setSelectedType(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={updateType.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateType.isPending ? 'Changement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
