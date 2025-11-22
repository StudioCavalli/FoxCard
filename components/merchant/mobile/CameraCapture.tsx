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
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

interface CameraCaptureProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
  aspectRatio?: '1:1' | '4:3' | '16:9'
  quality?: number
  title?: string
  className?: string
}

export function CameraCapture({
  isOpen,
  onClose,
  onCapture,
  aspectRatio = '1:1',
  quality = 0.9,
  title,
  className,
}: CameraCaptureProps) {
  const t = useTranslations('merchant')
  const { capabilities, hasCameraPermission, requestCameraPermission } = useMerchantMobile()
  const haptic = useHapticFeedback()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [maxZoom, setMaxZoom] = useState(1)

  // Get aspect ratio dimensions
  const getAspectRatioDimensions = useCallback(() => {
    switch (aspectRatio) {
      case '1:1': return { width: 1080, height: 1080 }
      case '4:3': return { width: 1440, height: 1080 }
      case '16:9': return { width: 1920, height: 1080 }
      default: return { width: 1080, height: 1080 }
    }
  }, [aspectRatio])

  // Initialize camera
  const initCamera = useCallback(async () => {
    if (!isOpen) return

    setIsLoading(true)
    setError(null)
    setCapturedImage(null)

    // Check permission first
    if (!hasCameraPermission) {
      const granted = await requestCameraPermission()
      if (!granted) {
        setError(t('camera.permissionDenied'))
        setIsLoading(false)
        return
      }
    }

    try {
      const { width, height } = getAspectRatioDimensions()

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Check for flash/torch and zoom capabilities
      const track = stream.getVideoTracks()[0]
      const caps = track.getCapabilities() as any
      setHasFlash(!!caps?.torch)
      if (caps?.zoom) {
        setMaxZoom(caps.zoom.max || 1)
      }

      // Attach stream to video
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Camera init error:', err)
      setError(t('camera.error'))
      setIsLoading(false)
    }
  }, [isOpen, facingMode, hasCameraPermission, requestCameraPermission, t, getAspectRatioDimensions])

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

  // Adjust zoom
  const adjustZoom = useCallback(async (newZoom: number) => {
    if (!streamRef.current) return

    const track = streamRef.current.getVideoTracks()[0]
    try {
      await track.applyConstraints({
        advanced: [{ zoom: newZoom } as any],
      })
      setZoom(newZoom)
      haptic.light()
    } catch (err) {
      console.error('Zoom error:', err)
    }
  }, [haptic])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    haptic.heavy()

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = getAspectRatioDimensions()
    canvas.width = width
    canvas.height = height

    // Calculate crop area to match aspect ratio
    const videoAspect = video.videoWidth / video.videoHeight
    const targetAspect = width / height

    let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight

    if (videoAspect > targetAspect) {
      // Video is wider - crop sides
      sWidth = video.videoHeight * targetAspect
      sx = (video.videoWidth - sWidth) / 2
    } else {
      // Video is taller - crop top/bottom
      sHeight = video.videoWidth / targetAspect
      sy = (video.videoHeight - sHeight) / 2
    }

    // Mirror image if using front camera
    if (facingMode === 'user') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height)

    const imageData = canvas.toDataURL('image/jpeg', quality)
    setCapturedImage(imageData)
  }, [haptic, facingMode, quality, getAspectRatioDimensions])

  // Retake photo
  const retakePhoto = useCallback(() => {
    haptic.light()
    setCapturedImage(null)
  }, [haptic])

  // Use captured photo
  const usePhoto = useCallback(() => {
    if (!capturedImage) return
    haptic.success()
    onCapture(capturedImage)
    onClose()
  }, [capturedImage, haptic, onCapture, onClose])

  // Cleanup
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCapturedImage(null)
    setFlashOn(false)
    setZoom(1)
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

  // Re-init when facing mode changes
  useEffect(() => {
    if (isOpen && !capturedImage) {
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
          {title || t('camera.title')}
        </h2>
        <div className="w-10" />
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full flex items-center justify-center">
        {error ? (
          // Error state
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              {t('camera.error')}
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
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
            <p className="text-white text-sm">{t('scanner.loading')}</p>
          </div>
        ) : capturedImage ? (
          // Preview captured image
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <>
            {/* Video feed */}
            <video
              ref={videoRef}
              className={cn(
                "w-full h-full object-cover",
                facingMode === 'user' && "scale-x-[-1]"
              )}
              playsInline
              muted
            />

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Aspect ratio guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={cn(
                  "border-2 border-white/50 rounded-lg",
                  aspectRatio === '1:1' && "w-72 h-72",
                  aspectRatio === '4:3' && "w-80 h-60",
                  aspectRatio === '16:9' && "w-80 h-45"
                )}
              />
            </div>

            {/* Zoom controls */}
            {maxZoom > 1 && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <button
                  onClick={() => adjustZoom(Math.min(zoom + 0.5, maxZoom))}
                  className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
                  disabled={zoom >= maxZoom}
                >
                  <ZoomIn className="w-5 h-5 text-white" />
                </button>
                <div className="text-white text-xs text-center py-1">
                  {zoom.toFixed(1)}x
                </div>
                <button
                  onClick={() => adjustZoom(Math.max(zoom - 0.5, 1))}
                  className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent safe-area-bottom">
        {capturedImage ? (
          // Preview controls
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">{t('camera.retake')}</span>
            </button>

            <button
              onClick={usePhoto}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs">{t('camera.use')}</span>
            </button>
          </div>
        ) : (
          // Capture controls
          <div className="flex items-center justify-center gap-6">
            {/* Flash toggle */}
            {hasFlash && (
              <button
                onClick={toggleFlash}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  flashOn ? "bg-yellow-500" : "bg-white/20"
                )}
              >
                {flashOn ? (
                  <Flashlight className="w-5 h-5 text-black" />
                ) : (
                  <FlashlightOff className="w-5 h-5 text-white" />
                )}
              </button>
            )}

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>

            {/* Switch camera */}
            <button
              onClick={switchCamera}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
            >
              <SwitchCamera className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
