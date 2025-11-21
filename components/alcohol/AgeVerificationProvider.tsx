'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { AgeVerificationModal } from './AgeVerificationModal'
import {
  getAgeVerificationStatus,
  setAgeVerificationStatus,
  clearAgeVerificationStatus,
} from '@/lib/alcohol/age-verification'

interface AgeVerificationContextValue {
  isVerified: boolean
  isModalOpen: boolean
  openModal: (storeName?: string) => void
  closeModal: () => void
  verify: () => void
  clearVerification: () => void
  requiresVerification: (commerceType?: string) => boolean
}

const AgeVerificationContext = createContext<AgeVerificationContextValue | null>(null)

interface AgeVerificationProviderProps {
  children: ReactNode
}

export function AgeVerificationProvider({ children }: AgeVerificationProviderProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStoreName, setCurrentStoreName] = useState<string | undefined>()
  const [isLoaded, setIsLoaded] = useState(false)

  // Load initial verification status
  useEffect(() => {
    const { verified } = getAgeVerificationStatus()
    setIsVerified(verified)
    setIsLoaded(true)
  }, [])

  const openModal = useCallback((storeName?: string) => {
    setCurrentStoreName(storeName)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setCurrentStoreName(undefined)
  }, [])

  const verify = useCallback(() => {
    setAgeVerificationStatus(true)
    setIsVerified(true)
    setIsModalOpen(false)
  }, [])

  const clearVerification = useCallback(() => {
    clearAgeVerificationStatus()
    setIsVerified(false)
  }, [])

  const requiresVerification = useCallback((commerceType?: string) => {
    return commerceType === 'ALCOHOL'
  }, [])

  const value: AgeVerificationContextValue = {
    isVerified,
    isModalOpen,
    openModal,
    closeModal,
    verify,
    clearVerification,
    requiresVerification,
  }

  return (
    <AgeVerificationContext.Provider value={value}>
      {children}
      {isLoaded && (
        <AgeVerificationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onVerified={verify}
          storeName={currentStoreName}
        />
      )}
    </AgeVerificationContext.Provider>
  )
}

export function useAgeVerification() {
  const context = useContext(AgeVerificationContext)
  if (!context) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider')
  }
  return context
}
