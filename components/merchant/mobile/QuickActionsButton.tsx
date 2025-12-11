'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useHapticFeedback } from '@/hooks/useMerchantMobile'
import { ScannerModal, type ScanResult } from './BarcodeScanner'
import { CameraCapture } from './CameraCapture'
import {
  Plus,
  X,
  Package,
  Tag,
  Percent,
  Camera,
  QrCode,
  Bell,
  FileText
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  action: () => void
}

interface QuickActionsButtonProps {
  className?: string
  onScanResult?: (result: ScanResult) => void
  onPhotoCapture?: (imageData: string) => void
}

export function QuickActionsButton({ className, onScanResult, onPhotoCapture }: QuickActionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('merchant')
  const menuRef = useRef<HTMLDivElement>(null)
  const haptic = useHapticFeedback()

  const basePath = `/${locale}/merchant`

  // Handle scan result
  const handleScanResult = useCallback((result: ScanResult) => {
    haptic.success()
    if (onScanResult) {
      onScanResult(result)
    } else {
      // Default behavior: navigate to product search with barcode
      router.push(`${basePath}/products?barcode=${encodeURIComponent(result.value)}`)
    }
  }, [haptic, onScanResult, router, basePath])

  // Handle photo capture
  const handlePhotoCapture = useCallback((imageData: string) => {
    haptic.success()
    if (onPhotoCapture) {
      onPhotoCapture(imageData)
    } else {
      // Default behavior: navigate to new product with photo
      // Store in sessionStorage temporarily
      sessionStorage.setItem('pendingProductPhoto', imageData)
      router.push(`${basePath}/products/new?hasPhoto=true`)
    }
  }, [haptic, onPhotoCapture, router, basePath])

  const actions: QuickAction[] = [
    {
      id: 'add-product',
      label: t('quickActions.addProduct'),
      icon: Package,
      color: 'bg-blue-500',
      action: () => router.push(`${basePath}/products/new`)
    },
    {
      id: 'add-category',
      label: t('quickActions.addCategory'),
      icon: Tag,
      color: 'bg-green-500',
      action: () => router.push(`${basePath}/categories/new`)
    },
    {
      id: 'add-discount',
      label: t('quickActions.addDiscount'),
      icon: Percent,
      color: 'bg-purple-500',
      action: () => router.push(`${basePath}/discounts/new`)
    },
    {
      id: 'scan-barcode',
      label: t('quickActions.scanBarcode'),
      icon: QrCode,
      color: 'bg-yellow-500',
      action: () => {
        haptic.light()
        setShowScanner(true)
      }
    },
    {
      id: 'take-photo',
      label: t('quickActions.takePhoto'),
      icon: Camera,
      color: 'bg-primary-400',
      action: () => {
        haptic.light()
        setShowCamera(true)
      }
    },
    {
      id: 'create-invoice',
      label: t('quickActions.createInvoice'),
      icon: FileText,
      color: 'bg-cyan-500',
      action: () => router.push(`${basePath}/invoices/new`)
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsAnimating(true)
    setIsOpen(!isOpen)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleAction = (action: QuickAction) => {
    setIsOpen(false)
    action.action()
  }

  return (
    <div ref={menuRef} className={cn("fixed right-4 bottom-20 z-40 md:hidden", className)}>
      {/* Action Items */}
      <div
        className={cn(
          "absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            className={cn(
              "flex items-center gap-3 pr-4 pl-2 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg",
              "transform transition-all duration-300 active:scale-95",
              "hover:shadow-xl"
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              transform: isOpen ? 'translateX(0)' : 'translateX(20px)'
            }}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              action.color
            )}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg",
          "flex items-center justify-center",
          "transform transition-all duration-300 active:scale-90",
          "hover:shadow-xl hover:from-orange-400 hover:to-orange-500",
          isOpen && "rotate-45 from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Pulse Animation */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20 pointer-events-none" />
      )}

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handlePhotoCapture}
      />
    </div>
  )
}
