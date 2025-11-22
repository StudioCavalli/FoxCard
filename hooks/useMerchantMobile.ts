'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useIsMobile, useMediaQuery } from './useIsMobile'

interface DeviceCapabilities {
  hasCamera: boolean
  hasVibration: boolean
  hasShare: boolean
  hasBarcodeDetector: boolean
  hasGeolocation: boolean
  hasTouchScreen: boolean
}

interface ScreenInfo {
  orientation: 'portrait' | 'landscape'
  isSmallScreen: boolean
  isMediumScreen: boolean
  isLargeScreen: boolean
}

interface UseMerchantMobileReturn {
  // Device detection
  isMobile: boolean
  isTablet: boolean
  isTouch: boolean
  isStandalone: boolean

  // Capabilities
  capabilities: DeviceCapabilities

  // Screen info
  screen: ScreenInfo

  // Actions
  vibrate: (pattern?: number | number[]) => void
  share: (data: ShareData) => Promise<boolean>

  // Camera/Scanner
  canScan: boolean
  requestCameraPermission: () => Promise<boolean>
  hasCameraPermission: boolean

  // Scroll helpers
  scrollToTop: () => void
  isScrolled: boolean
  scrollPosition: number
}

export function useMerchantMobile(): UseMerchantMobileReturn {
  const isMobile = useIsMobile(768)
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
  const isLandscape = useMediaQuery('(orientation: landscape)')

  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    hasCamera: false,
    hasVibration: false,
    hasShare: false,
    hasBarcodeDetector: false,
    hasGeolocation: false,
    hasTouchScreen: false,
  })

  const [isStandalone, setIsStandalone] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollRef = useRef<number>(0)

  // Detect device capabilities
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkCapabilities = async () => {
      // Check camera
      const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

      // Check vibration
      const hasVibration = 'vibrate' in navigator

      // Check Web Share API
      const hasShare = 'share' in navigator

      // Check BarcodeDetector API (Chrome 83+)
      const hasBarcodeDetector = 'BarcodeDetector' in window

      // Check geolocation
      const hasGeolocation = 'geolocation' in navigator

      // Check touch screen
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setCapabilities({
        hasCamera,
        hasVibration,
        hasShare,
        hasBarcodeDetector,
        hasGeolocation,
        hasTouchScreen,
      })

      // Check if running as PWA
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      setIsStandalone(standalone)

      // Check existing camera permission
      if (hasCamera && navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
          setHasCameraPermission(result.state === 'granted')
        } catch {
          // Permission query not supported
        }
      }
    }

    checkCapabilities()
  }, [])

  // Track scroll position
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const position = window.scrollY
      scrollRef.current = position
      setScrollPosition(position)
      setIsScrolled(position > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Vibration helper
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (capabilities.hasVibration) {
      try {
        navigator.vibrate(pattern)
      } catch {
        // Vibration not available
      }
    }
  }, [capabilities.hasVibration])

  // Share helper
  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    if (!capabilities.hasShare) {
      // Fallback: copy to clipboard
      if (data.url) {
        try {
          await navigator.clipboard.writeText(data.url)
          return true
        } catch {
          return false
        }
      }
      return false
    }

    try {
      await navigator.share(data)
      return true
    } catch (error) {
      // User cancelled or error
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error)
      }
      return false
    }
  }, [capabilities.hasShare])

  // Request camera permission
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (!capabilities.hasCamera) return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Stop all tracks immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      setHasCameraPermission(true)
      return true
    } catch (error) {
      console.error('Camera permission denied:', error)
      setHasCameraPermission(false)
      return false
    }
  }, [capabilities.hasCamera])

  // Scroll to top helper
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Screen info
  const screen: ScreenInfo = {
    orientation: isLandscape ? 'landscape' : 'portrait',
    isSmallScreen: isMobile && !isTablet,
    isMediumScreen: isTablet,
    isLargeScreen: !isMobile && !isTablet,
  }

  // Can scan = has camera + (has BarcodeDetector OR can use fallback library)
  const canScan = capabilities.hasCamera && (capabilities.hasBarcodeDetector || true) // fallback always available

  return {
    isMobile,
    isTablet,
    isTouch: capabilities.hasTouchScreen,
    isStandalone,
    capabilities,
    screen,
    vibrate,
    share,
    canScan,
    requestCameraPermission,
    hasCameraPermission,
    scrollToTop,
    isScrolled,
    scrollPosition,
  }
}

// Haptic feedback patterns for different actions
export const HapticPatterns = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [50, 30, 50],
  error: [100, 50, 100],
  warning: [30, 20, 30, 20, 30],
  notification: [50, 100, 50],
} as const

// Helper hook for haptic feedback
export function useHapticFeedback() {
  const { vibrate, capabilities } = useMerchantMobile()

  return {
    light: () => vibrate(HapticPatterns.light),
    medium: () => vibrate(HapticPatterns.medium),
    heavy: () => vibrate(HapticPatterns.heavy),
    success: () => vibrate([...HapticPatterns.success]),
    error: () => vibrate([...HapticPatterns.error]),
    warning: () => vibrate([...HapticPatterns.warning]),
    notification: () => vibrate([...HapticPatterns.notification]),
    isAvailable: capabilities.hasVibration,
  }
}

// Helper hook for scroll-based UI changes (e.g., hide header on scroll down)
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const direction = scrollY > lastScrollY ? 'down' : 'up'

      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
        setScrollDirection(direction)
      }
      setLastScrollY(scrollY > 0 ? scrollY : 0)
    }

    window.addEventListener('scroll', updateScrollDirection, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollDirection)
  }, [scrollDirection, lastScrollY])

  return scrollDirection
}
