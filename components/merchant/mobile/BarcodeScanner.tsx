'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useMerchantMobile, useHapticFeedback } from '@/hooks/useMerchantMobile'
import {
  X,
  Camera,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  AlertCircle,
  Loader2,
  QrCode,
  Barcode
} from 'lucide-react'

// BarcodeDetector types for TypeScript
declare global {
  interface Window {
    BarcodeDetector: typeof BarcodeDetector
  }

  class BarcodeDetector {
    constructor(options?: { formats: string[] })
    static getSupportedFormats(): Promise<string[]>
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>
  }

  interface DetectedBarcode {
    boundingBox: DOMRectReadOnly
    cornerPoints: { x: number; y: number }[]
    format: string
    rawValue: string
  }
}

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (result: ScanResult) => void
  formats?: string[]
  title?: string
  className?: string
}

export interface ScanResult {
  value: string
  format: string
  timestamp: Date
}

const DEFAULT_FORMATS = [
  'ean_13',
  'ean_8',
  'code_128',
  'code_39',
  'code_93',
  'upc_a',
  'upc_e',
  'qr_code',
  'data_matrix',
]

export function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
  formats = DEFAULT_FORMATS,
  title,
  className,
}: BarcodeScannerProps) {
  const t = useTranslations('merchant')
  const { capabilities, hasCameraPermission, requestCameraPermission } = useMerchantMobile()
  const haptic = useHapticFeedback()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetector | null>(null)
  const animationRef = useRef<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  // Check BarcodeDetector support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('BarcodeDetector' in window)
    }
  }, [])

  // Initialize camera and detector
  const initCamera = useCallback(async () => {
    if (!isOpen) return

    setIsLoading(true)
    setError(null)

    // Check permission first
    if (!hasCameraPermission) {
      const granted = await requestCameraPermission()
      if (!granted) {
        setError(t('scanner.permissionDenied'))
        setIsLoading(false)
        return
      }
    }

    try {
      // Initialize BarcodeDetector
      if ('BarcodeDetector' in window) {
        const supportedFormats = await window.BarcodeDetector.getSupportedFormats()
        const filteredFormats = formats.filter(f => supportedFormats.includes(f))
        detectorRef.current = new window.BarcodeDetector({
          formats: filteredFormats.length > 0 ? filteredFormats : supportedFormats,
        })
      }

      // Get camera stream
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Check for flash/torch capability
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities() as any
      setHasFlash(!!capabilities?.torch)

      // Attach stream to video
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Camera init error:', err)
      setError(t('scanner.cameraError'))
      setIsLoading(false)
    }
  }, [isOpen, facingMode, formats, hasCameraPermission, requestCameraPermission, t])

  // Start scanning loop
  const startScanning = useCallback(() => {
    if (!videoRef.current || !detectorRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scan = async () => {
      if (!detectorRef.current || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(scan)
        return
      }

      // Draw video frame to canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      try {
        const barcodes = await detectorRef.current.detect(canvas)

        if (barcodes.length > 0) {
          const barcode = barcodes[0]

          // Prevent duplicate scans
          if (barcode.rawValue !== lastScannedValue) {
            setLastScannedValue(barcode.rawValue)
            haptic.success()

            onScan({
              value: barcode.rawValue,
              format: barcode.format,
              timestamp: new Date(),
            })

            // Reset after delay to allow re-scanning same code
            setTimeout(() => setLastScannedValue(null), 2000)
          }
        }
      } catch (err) {
        // Detection error, continue scanning
      }

      animationRef.current = requestAnimationFrame(scan)
    }

    animationRef.current = requestAnimationFrame(scan)
  }, [lastScannedValue, haptic, onScan])

  // Toggle flashlight
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current || !hasFlash) return

    const track = streamRef.current.getVideoTracks()[0]
    try {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn } as any],
      })
      setFlashOn(!flashOn)
      haptic.light()
    } catch (err) {
      console.error('Flash toggle error:', err)
    }
  }, [hasFlash, flashOn, haptic])

  // Switch camera
  const switchCamera = useCallback(async () => {
    haptic.light()
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))
  }, [haptic])

  // Cleanup
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    detectorRef.current = null
    setLastScannedValue(null)
    setFlashOn(false)
  }, [])

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      initCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [isOpen, initCamera, stopCamera])

  // Start scanning when video is ready
  useEffect(() => {
    if (!isLoading && !error && isOpen && isSupported) {
      startScanning()
    }
  }, [isLoading, error, isOpen, isSupported, startScanning])

  // Re-init when facing mode changes
  useEffect(() => {
    if (isOpen) {
      stopCamera()
      initCamera()
    }
  }, [facingMode])

  if (!isOpen) return null

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black",
      className
    )}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent safe-area-top">
        <button
          onClick={() => {
            haptic.light()
            onClose()
          }}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-white font-semibold">
          {title || t('scanner.title')}
        </h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full">
        {!isSupported ? (
          // Browser not supported
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              {t('scanner.notSupported')}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {t('scanner.notSupportedDesc')}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-black rounded-xl font-medium"
            >
              {t('common.close')}
            </button>
          </div>
        ) : error ? (
          // Error state
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              {t('scanner.error')}
            </h3>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={initCamera}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : isLoading ? (
          // Loading state
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
            <p className="text-white text-sm">{t('scanner.loading')}</p>
          </div>
        ) : (
          <>
            {/* Video feed */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Darkened corners */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Clear scanning area */}
              <div className="relative w-72 h-72">
                {/* Cutout */}
                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />

                {/* Scanning line animation */}
                <div className="absolute left-4 right-4 h-0.5 bg-orange-500 animate-scan" />

                {/* Clear area (mask) - creates the cutout effect */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  }}
                />
              </div>
            </div>

            {/* Scan hint */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full">
                <QrCode className="w-4 h-4 text-white" />
                <span className="text-white text-sm">{t('scanner.hint')}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {!error && !isLoading && isSupported && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-6 p-6 bg-gradient-to-t from-black/80 to-transparent safe-area-bottom">
          {/* Flash toggle */}
          {hasFlash && (
            <button
              onClick={toggleFlash}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                flashOn ? "bg-yellow-500" : "bg-white/20"
              )}
            >
              {flashOn ? (
                <Flashlight className="w-6 h-6 text-black" />
              ) : (
                <FlashlightOff className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* Switch camera */}
          <button
            onClick={switchCamera}
            className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"
          >
            <SwitchCamera className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Styles for scan animation */}
      <style jsx>{`
        @keyframes scan {
          0%, 100% {
            top: 10%;
            opacity: 1;
          }
          50% {
            top: 90%;
            opacity: 0.5;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Simplified modal wrapper
interface ScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScan: (result: ScanResult) => void
}

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
  const handleScan = (result: ScanResult) => {
    onScan(result)
    onClose()
  }

  return (
    <BarcodeScanner
      isOpen={isOpen}
      onClose={onClose}
      onScan={handleScan}
    />
  )
}
