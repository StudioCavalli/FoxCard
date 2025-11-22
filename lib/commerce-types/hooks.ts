'use client'

import { useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  commerceTypeConfigs,
  getCommerceTypeConfig,
  getAllCommerceTypes,
  getCommerceTypesByCategory,
  type CommerceType,
  type CommerceTypeConfig,
  type CommerceTypeFeatures,
} from './index'
import { getTerminology, type CommerceTerminology } from './terminology'

// Hook to get all commerce types
export function useCommerceTypes() {
  const allTypes = useMemo(() => {
    return getAllCommerceTypes().map((type) => commerceTypeConfigs[type])
  }, [])

  const byCategory = useMemo(() => getCommerceTypesByCategory(), [])

  return {
    types: allTypes,
    byCategory,
    physical: byCategory.physical.map((t) => commerceTypeConfigs[t]),
    digital: byCategory.digital.map((t) => commerceTypeConfigs[t]),
    services: byCategory.services.map((t) => commerceTypeConfigs[t]),
  }
}

// Hook to get commerce type configuration
export function useCommerceTypeConfig(type: CommerceType | undefined) {
  const config = useMemo(() => {
    if (!type) return null
    return getCommerceTypeConfig(type)
  }, [type])

  return config
}

// Hook to get store's commerce type and config
export function useStoreCommerceType(storeId: string | undefined) {
  const { data, isLoading, error, refetch } = trpc.commerceType.getStoreType.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  return {
    type: data?.type as CommerceType | undefined,
    label: data?.label,
    icon: data?.icon,
    config: data?.config as CommerceTypeConfig | undefined,
    storeConfig: data?.storeConfig,
    isLoading,
    error,
    refetch,
  }
}

// Hook to check commerce type features
export function useCommerceTypeFeatures(type: CommerceType | undefined): CommerceTypeFeatures | null {
  return useMemo(() => {
    if (!type) return null
    return commerceTypeConfigs[type]?.features || null
  }, [type])
}

// Hook to get product form schema for a store
export function useProductFormSchema(storeId: string | undefined) {
  const { data, isLoading, error } = trpc.commerceType.getProductFormSchema.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  return {
    type: data?.type as CommerceType | undefined,
    label: data?.label,
    requiredAttributes: data?.requiredAttributes || [],
    optionalAttributes: data?.optionalAttributes || [],
    displayOptions: data?.displayOptions || {},
    isLoading,
    error,
  }
}

// Hook to validate product attributes
export function useValidateProductAttributes(storeId: string | undefined) {
  const mutation = trpc.commerceType.validateAttributes.useMutation()

  const validate = async (attributes: Record<string, unknown>) => {
    if (!storeId) {
      return { valid: false, errors: ['Store ID is required'], warnings: [] }
    }
    return mutation.mutateAsync({ storeId, attributes })
  }

  return {
    validate,
    isValidating: mutation.isPending,
    error: mutation.error,
  }
}

// Hook to update store's commerce type
export function useUpdateStoreCommerceType() {
  const utils = trpc.useUtils()
  const mutation = trpc.commerceType.updateStoreType.useMutation({
    onSuccess: (_, variables) => {
      utils.commerceType.getStoreType.invalidate({ storeId: variables.storeId })
    },
  })

  return {
    updateCommerceType: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}

// Hook to create default categories for a store
export function useCreateDefaultCategories() {
  const utils = trpc.useUtils()
  const mutation = trpc.commerceType.createDefaultCategories.useMutation({
    onSuccess: () => {
      utils.category.invalidate()
    },
  })

  return {
    createDefaultCategories: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}

// Hook to check if age verification is required
export function useAgeVerification(storeId: string | undefined) {
  const { data, isLoading } = trpc.commerceType.requiresAgeVerification.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  return {
    required: data?.required || false,
    minAge: data?.minAge || null,
    regulations: data?.regulations || [],
    isLoading,
  }
}

// Hook to get checkout steps for commerce type
export function useCheckoutSteps(type: CommerceType | undefined) {
  return useMemo(() => {
    if (!type) return ['cart', 'shipping', 'payment', 'confirmation']
    return commerceTypeConfigs[type]?.checkoutSteps || ['cart', 'shipping', 'payment', 'confirmation']
  }, [type])
}

// Hook to get variant types for commerce type
export function useVariantTypes(type: CommerceType | undefined) {
  return useMemo(() => {
    if (!type) return []
    return commerceTypeConfigs[type]?.variantTypes || []
  }, [type])
}

// Hook to get default categories for commerce type
export function useDefaultCategories(type: CommerceType | undefined) {
  return useMemo(() => {
    if (!type) return []
    return commerceTypeConfigs[type]?.defaultCategories || []
  }, [type])
}

// Hook to get commerce type terminology
export function useCommerceTypeTerminology(type: CommerceType | undefined): CommerceTerminology {
  return useMemo(() => {
    return getTerminology(type || 'GENERAL')
  }, [type])
}

// Hook to get terminology for a store (combines store lookup with terminology)
export function useStoreTerminology(storeId: string | undefined) {
  const { type, isLoading } = useStoreCommerceType(storeId)
  const terminology = useCommerceTypeTerminology(type)

  return {
    terminology,
    isLoading,
  }
}
