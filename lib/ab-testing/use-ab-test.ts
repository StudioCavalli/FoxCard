'use client'

import { useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc/client'

// Generate or retrieve visitor ID from localStorage
function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  const key = 'foxcard_visitor_id'
  let visitorId = localStorage.getItem(key)

  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(key, visitorId)
  }

  return visitorId
}

// Store variant assignments to ensure consistency across page loads
function getStoredAssignment(testId: string): string | null {
  if (typeof window === 'undefined') return null
  const key = `foxcard_ab_${testId}`
  return localStorage.getItem(key)
}

function storeAssignment(testId: string, variantId: string): void {
  if (typeof window === 'undefined') return
  const key = `foxcard_ab_${testId}`
  localStorage.setItem(key, variantId)
}

export interface ABTestAssignment {
  testId: string
  variantId: string
  config: Record<string, any>
  isControl: boolean
}

export interface UseABTestResult {
  assignments: ABTestAssignment[]
  isLoading: boolean
  getVariantConfig: (testId: string) => Record<string, any> | null
  recordConversion: (testId: string, revenue?: number) => void
}

export function useABTest(storeId: string, targetPage: string): UseABTestResult {
  const [visitorId, setVisitorId] = useState<string>('')
  const [localAssignments, setLocalAssignments] = useState<ABTestAssignment[]>([])

  useEffect(() => {
    setVisitorId(getVisitorId())
  }, [])

  const { data, isLoading } = trpc.abtest.getVariantAssignment.useQuery(
    {
      storeId,
      targetPage,
      visitorId,
    },
    {
      enabled: !!storeId && !!targetPage && !!visitorId,
      staleTime: Infinity, // Assignment shouldn't change during session
    }
  )

  const recordVisitor = trpc.abtest.recordVisitor.useMutation()
  const recordConversionMutation = trpc.abtest.recordConversion.useMutation()

  // Process assignments and record visitors
  useEffect(() => {
    if (!data?.assignments || data.assignments.length === 0) return

    const processedAssignments: ABTestAssignment[] = []

    data.assignments.forEach((assignment) => {
      // Check if we already have a stored assignment for this test
      const storedVariantId = getStoredAssignment(assignment.testId)

      if (storedVariantId && storedVariantId !== assignment.variantId) {
        // Use stored assignment for consistency
        // In a real scenario, you'd fetch the config for the stored variant
        // For now, we'll use the new assignment but this could be improved
        processedAssignments.push(assignment)
      } else {
        // Store the new assignment
        storeAssignment(assignment.testId, assignment.variantId)
        processedAssignments.push(assignment)

        // Record the visitor
        recordVisitor.mutate({
          testId: assignment.testId,
          variantId: assignment.variantId,
          storeId,
        })
      }
    })

    setLocalAssignments(processedAssignments)
  }, [data, storeId, recordVisitor])

  const getVariantConfig = (testId: string): Record<string, any> | null => {
    const assignment = localAssignments.find((a) => a.testId === testId)
    return assignment?.config || null
  }

  const recordConversion = (testId: string, revenue?: number) => {
    const assignment = localAssignments.find((a) => a.testId === testId)
    if (!assignment) return

    // Check if conversion was already recorded for this test
    const conversionKey = `foxcard_ab_conv_${testId}`
    if (localStorage.getItem(conversionKey)) return

    recordConversionMutation.mutate({
      testId,
      variantId: assignment.variantId,
      storeId,
      revenue,
    })

    // Mark conversion as recorded
    localStorage.setItem(conversionKey, '1')
  }

  return {
    assignments: localAssignments,
    isLoading,
    getVariantConfig,
    recordConversion,
  }
}

// Helper hook to apply variant configuration to an element
export function useABTestVariant(
  storeId: string,
  targetPage: string,
  testId: string
): {
  config: Record<string, any> | null
  isControl: boolean
  isLoading: boolean
} {
  const { assignments, isLoading, getVariantConfig } = useABTest(storeId, targetPage)

  const assignment = assignments.find((a) => a.testId === testId)
  const config = getVariantConfig(testId)

  return {
    config,
    isControl: assignment?.isControl ?? true,
    isLoading,
  }
}

// HOC to wrap components with A/B test variants
export function withABTest<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  storeId: string,
  targetPage: string,
  testId: string
) {
  return function ABTestWrapper(props: P) {
    const { config, isControl, isLoading } = useABTestVariant(storeId, targetPage, testId)

    if (isLoading) {
      return <WrappedComponent {...props} />
    }

    // Merge config into props
    const enhancedProps = {
      ...props,
      abTestConfig: config,
      isControl,
    }

    return <WrappedComponent {...enhancedProps} />
  }
}
