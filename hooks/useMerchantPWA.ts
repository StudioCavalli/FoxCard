'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAState {
  isInstalled: boolean
  isInstallable: boolean
  isOnline: boolean
  isStandalone: boolean
  hasNotificationPermission: boolean
  hasBadgeSupport: boolean
}

interface UseMerchantPWAReturn extends PWAState {
  installApp: () => Promise<boolean>
  requestNotificationPermission: () => Promise<boolean>
  showInstallBanner: boolean
  dismissInstallBanner: () => void
  setBadge: (count?: number) => Promise<void>
  clearBadge: () => Promise<void>
}

export function useMerchantPWA(): UseMerchantPWAReturn {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: true,
    isStandalone: false,
    hasNotificationPermission: false,
    hasBadgeSupport: false
  })

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // Check if app is installed
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    // Check notification permission
    const hasNotificationPermission =
      'Notification' in window && Notification.permission === 'granted'

    // Check badge API support (Chrome 81+, Edge 84+)
    const hasBadgeSupport = 'setAppBadge' in navigator

    setState(prev => ({
      ...prev,
      isStandalone,
      isInstalled: isStandalone,
      isOnline: navigator.onLine,
      hasNotificationPermission,
      hasBadgeSupport
    }))

    // Check if install was dismissed recently
    const dismissedAt = localStorage.getItem('pwa-install-dismissed')
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      const oneWeek = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < oneWeek) {
        setBannerDismissed(true)
      }
    }
  }, [])

  // Listen for beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState(prev => ({ ...prev, isInstallable: true }))

      // Show install banner if not dismissed
      if (!bannerDismissed) {
        setShowInstallBanner(true)
      }
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        isStandalone: true
      }))
      setShowInstallBanner(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [bannerDismissed])

  // Listen for online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('No install prompt available')
      return false
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallBanner(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Error installing app:', error)
      return false
    }
  }, [deferredPrompt])

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      setState(prev => ({ ...prev, hasNotificationPermission: granted }))
      return granted
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }, [])

  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false)
    setBannerDismissed(true)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }, [])

  // Set app badge count (for notifications, pending orders, etc.)
  const setBadge = useCallback(async (count?: number): Promise<void> => {
    if (typeof window === 'undefined' || !('setAppBadge' in navigator)) {
      return
    }

    try {
      if (count === undefined || count === 0) {
        await (navigator as any).clearAppBadge()
      } else {
        await (navigator as any).setAppBadge(count)
      }
    } catch (error) {
      // Badge API may fail silently on some browsers
      console.debug('Badge API error:', error)
    }
  }, [])

  // Clear app badge
  const clearBadge = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined' || !('clearAppBadge' in navigator)) {
      return
    }

    try {
      await (navigator as any).clearAppBadge()
    } catch (error) {
      console.debug('Clear badge error:', error)
    }
  }, [])

  return {
    ...state,
    installApp,
    requestNotificationPermission,
    showInstallBanner,
    dismissInstallBanner,
    setBadge,
    clearBadge
  }
}

// Offline status indicator component helper
export function useOfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOffline(!navigator.onLine)

    const handleOnline = () => {
      setIsOffline(false)
      // Show brief "back online" message
      setShowOfflineBanner(true)
      setTimeout(() => setShowOfflineBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setShowOfflineBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOffline, showOfflineBanner }
}

// Hook for managing merchant notification badge
export function useMerchantBadge() {
  const { hasBadgeSupport, setBadge, clearBadge } = useMerchantPWA()
  const [badgeCount, setBadgeCount] = useState(0)

  // Update badge when count changes
  useEffect(() => {
    if (hasBadgeSupport) {
      setBadge(badgeCount)
    }
  }, [badgeCount, hasBadgeSupport, setBadge])

  // Set badge with pending orders count
  const updatePendingOrders = useCallback((count: number) => {
    setBadgeCount(prev => {
      const newCount = count
      return newCount
    })
  }, [])

  // Set badge with unread messages count
  const updateUnreadMessages = useCallback((count: number) => {
    setBadgeCount(count)
  }, [])

  // Set badge with total notification count
  const updateTotalNotifications = useCallback((orders: number, messages: number) => {
    setBadgeCount(orders + messages)
  }, [])

  // Clear all badges
  const clearAllBadges = useCallback(() => {
    setBadgeCount(0)
    clearBadge()
  }, [clearBadge])

  return {
    hasBadgeSupport,
    badgeCount,
    updatePendingOrders,
    updateUnreadMessages,
    updateTotalNotifications,
    clearAllBadges,
    setBadgeCount
  }
}
