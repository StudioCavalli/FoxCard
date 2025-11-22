'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, Download, Wifi, WifiOff, Bell, Share, MoreVertical } from 'lucide-react'
import { useMerchantPWA, useOfflineDetector } from '@/hooks/useMerchantPWA'

interface InstallBannerProps {
  className?: string
}

export function PWAInstallBanner({ className }: InstallBannerProps) {
  const { isInstallable, showInstallBanner, installApp, dismissInstallBanner } = useMerchantPWA()
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)
  }, [])

  if (!showInstallBanner && !isIOS) return null
  if (isInstallable && !showInstallBanner) return null

  // iOS install instructions
  if (isIOS && !isInstallable) {
    return (
      <>
        {/* iOS Install Hint */}
        <button
          onClick={() => setShowIOSInstructions(true)}
          className={cn(
            "fixed bottom-20 left-4 right-4 z-40 md:hidden",
            "bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4",
            "shadow-lg shadow-orange-500/30",
            "flex items-center gap-3",
            "transform transition-all duration-300",
            showInstallBanner ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
            className
          )}
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-white">Install FoxCard</p>
            <p className="text-sm text-white/80">Get the full app experience</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              dismissInstallBanner()
            }}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </button>

        {/* iOS Instructions Modal */}
        {showIOSInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:hidden">
            <div className="w-full bg-white dark:bg-gray-900 rounded-t-3xl p-6 safe-area-bottom animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Install FoxCard
                </h3>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Tap the Share button
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Share className="w-4 h-4" /> at the bottom of your browser
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Scroll down and tap
                    </p>
                    <p className="text-sm text-gray-500">
                      "Add to Home Screen"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Tap "Add"
                    </p>
                    <p className="text-sm text-gray-500">
                      FoxCard will be added to your home screen
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full mt-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // Android/Desktop install banner
  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-40 md:hidden",
        "bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4",
        "shadow-lg shadow-orange-500/30",
        "flex items-center gap-3",
        "transform transition-all duration-300",
        showInstallBanner ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        className
      )}
    >
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
        <Download className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">Install FoxCard</p>
        <p className="text-sm text-white/80">Quick access from home screen</p>
      </div>
      <button
        onClick={installApp}
        className="px-4 py-2 bg-white rounded-xl font-semibold text-orange-600 text-sm"
      >
        Install
      </button>
      <button
        onClick={dismissInstallBanner}
        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  )
}

interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const { isOffline, showOfflineBanner } = useOfflineDetector()

  if (!showOfflineBanner) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 md:hidden safe-area-top",
        "transform transition-all duration-300",
        showOfflineBanner ? "translate-y-0" : "-translate-y-full",
        isOffline
          ? "bg-red-500"
          : "bg-green-500",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 py-2 px-4">
        {isOffline ? (
          <>
            <WifiOff className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              You're offline. Some features may be limited.
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Back online!
            </span>
          </>
        )}
      </div>
    </div>
  )
}

interface NotificationPromptProps {
  onRequestPermission?: () => Promise<boolean>
  className?: string
}

export function NotificationPrompt({ onRequestPermission, className }: NotificationPromptProps) {
  const { hasNotificationPermission, requestNotificationPermission } = useMerchantPWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show prompt after 5 seconds if permission not granted
    const timer = setTimeout(() => {
      if (!hasNotificationPermission && !dismissed) {
        const wasDismissed = localStorage.getItem('notification-prompt-dismissed')
        if (!wasDismissed) {
          setShowPrompt(true)
        }
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [hasNotificationPermission, dismissed])

  const handleRequestPermission = async () => {
    const granted = onRequestPermission
      ? await onRequestPermission()
      : await requestNotificationPermission()

    setShowPrompt(false)
    if (!granted) {
      setDismissed(true)
      localStorage.setItem('notification-prompt-dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('notification-prompt-dismissed', 'true')
  }

  if (!showPrompt || hasNotificationPermission) return null

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-40 md:hidden",
        "bg-white dark:bg-gray-800 rounded-2xl p-4",
        "border border-gray-200 dark:border-gray-700",
        "shadow-lg",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            Enable notifications
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Get instant alerts for new orders and important updates
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRequestPermission}
              className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add CSS for animations
const styles = `
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}
