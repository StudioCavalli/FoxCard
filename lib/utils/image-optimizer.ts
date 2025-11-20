/**
 * Image Optimization Utility using Sharp
 *
 * Features:
 * - Automatic compression
 * - WebP/AVIF generation
 * - Multiple thumbnail sizes
 * - Format detection
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

export interface ImageOptimizationOptions {
  quality?: number // 1-100, default 80
  maxWidth?: number // Max width in pixels
  maxHeight?: number // Max height in pixels
  formats?: ('original' | 'webp' | 'avif')[] // Output formats
  thumbnails?: {
    name: string
    width: number
    height?: number
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  }[]
}

export interface OptimizedImage {
  format: string
  path: string
  width: number
  height: number
  size: number // File size in bytes
}

export interface ImageOptimizationResult {
  original: OptimizedImage
  webp?: OptimizedImage
  avif?: OptimizedImage
  thumbnails: {
    [key: string]: {
      original: OptimizedImage
      webp?: OptimizedImage
      avif?: OptimizedImage
    }
  }
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  quality: 80,
  formats: ['original', 'webp', 'avif'],
  thumbnails: [
    { name: 'small', width: 200, height: 200, fit: 'cover' },
    { name: 'medium', width: 600, height: 600, fit: 'cover' },
    { name: 'large', width: 1200, fit: 'inside' },
  ],
}

/**
 * Optimize and process an image with multiple formats and sizes
 */
export async function optimizeImage(
  inputPath: string,
  outputDir: string,
  options: ImageOptimizationOptions = {}
): Promise<ImageOptimizationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true })

  // Load image
  const image = sharp(inputPath)
  const metadata = await image.metadata()

  if (!metadata.format || !metadata.width || !metadata.height) {
    throw new Error('Invalid image file')
  }

  const basename = path.basename(inputPath, path.extname(inputPath))
  const result: ImageOptimizationResult = {
    original: {} as OptimizedImage,
    thumbnails: {},
  }

  // Resize if needed
  let resizedImage = image.clone()
  if (opts.maxWidth || opts.maxHeight) {
    resizedImage = resizedImage.resize(opts.maxWidth, opts.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  // Process main image in all requested formats
  for (const format of opts.formats || []) {
    const outputPath = path.join(outputDir, `${basename}.${format === 'original' ? metadata.format : format}`)

    let processor = resizedImage.clone()

    if (format === 'webp') {
      processor = processor.webp({ quality: opts.quality })
    } else if (format === 'avif') {
      processor = processor.avif({ quality: opts.quality })
    } else if (format === 'original') {
      // Keep original format with compression
      if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        processor = processor.jpeg({ quality: opts.quality, mozjpeg: true })
      } else if (metadata.format === 'png') {
        processor = processor.png({ quality: opts.quality, compressionLevel: 9 })
      }
    }

    await processor.toFile(outputPath)
    const stats = await fs.stat(outputPath)
    const info = await sharp(outputPath).metadata()

    const optimized: OptimizedImage = {
      format: format === 'original' ? metadata.format : format,
      path: outputPath,
      width: info.width || 0,
      height: info.height || 0,
      size: stats.size,
    }

    if (format === 'original') {
      result.original = optimized
    } else if (format === 'webp') {
      result.webp = optimized
    } else if (format === 'avif') {
      result.avif = optimized
    }
  }

  // Process thumbnails
  if (opts.thumbnails && opts.thumbnails.length > 0) {
    for (const thumb of opts.thumbnails) {
      result.thumbnails[thumb.name] = {} as any

      for (const format of opts.formats || []) {
        const thumbPath = path.join(
          outputDir,
          `${basename}_${thumb.name}.${format === 'original' ? metadata.format : format}`
        )

        let processor = image.clone().resize(thumb.width, thumb.height, {
          fit: thumb.fit || 'cover',
          withoutEnlargement: true,
        })

        if (format === 'webp') {
          processor = processor.webp({ quality: opts.quality })
        } else if (format === 'avif') {
          processor = processor.avif({ quality: opts.quality })
        } else if (format === 'original') {
          if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            processor = processor.jpeg({ quality: opts.quality, mozjpeg: true })
          } else if (metadata.format === 'png') {
            processor = processor.png({ quality: opts.quality, compressionLevel: 9 })
          }
        }

        await processor.toFile(thumbPath)
        const stats = await fs.stat(thumbPath)
        const info = await sharp(thumbPath).metadata()

        const optimized: OptimizedImage = {
          format: format === 'original' ? metadata.format : format,
          path: thumbPath,
          width: info.width || 0,
          height: info.height || 0,
          size: stats.size,
        }

        if (format === 'original') {
          result.thumbnails[thumb.name].original = optimized
        } else if (format === 'webp') {
          result.thumbnails[thumb.name].webp = optimized
        } else if (format === 'avif') {
          result.thumbnails[thumb.name].avif = optimized
        }
      }
    }
  }

  return result
}

/**
 * Quick optimize for a single image (original format + WebP)
 */
export async function quickOptimize(
  inputPath: string,
  outputDir: string,
  quality: number = 80
): Promise<{ original: string; webp: string }> {
  await fs.mkdir(outputDir, { recursive: true })

  const image = sharp(inputPath)
  const metadata = await image.metadata()
  const basename = path.basename(inputPath, path.extname(inputPath))

  // Original format
  const originalPath = path.join(outputDir, `${basename}.${metadata.format}`)
  let processor = image.clone()

  if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
    processor = processor.jpeg({ quality, mozjpeg: true })
  } else if (metadata.format === 'png') {
    processor = processor.png({ quality, compressionLevel: 9 })
  }

  await processor.toFile(originalPath)

  // WebP version
  const webpPath = path.join(outputDir, `${basename}.webp`)
  await image.clone().webp({ quality }).toFile(webpPath)

  return {
    original: originalPath,
    webp: webpPath,
  }
}

/**
 * Get image metadata without processing
 */
export async function getImageMetadata(inputPath: string) {
  const image = sharp(inputPath)
  const metadata = await image.metadata()

  return {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    space: metadata.space,
    channels: metadata.channels,
    depth: metadata.depth,
    density: metadata.density,
    hasAlpha: metadata.hasAlpha,
    orientation: metadata.orientation,
  }
}

/**
 * Validate if file is a valid image
 */
export async function isValidImage(inputPath: string): Promise<boolean> {
  try {
    const metadata = await sharp(inputPath).metadata()
    return !!(metadata.format && metadata.width && metadata.height)
  } catch (error) {
    return false
  }
}

/**
 * Convert Buffer to base64 data URL
 */
export function bufferToDataUrl(buffer: Buffer, format: string): string {
  return `data:image/${format};base64,${buffer.toString('base64')}`
}

/**
 * Resize image to fit within dimensions
 */
export async function resizeImage(
  inputPath: string,
  outputPath: string,
  width?: number,
  height?: number,
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' = 'inside'
): Promise<void> {
  await sharp(inputPath)
    .resize(width, height, { fit, withoutEnlargement: true })
    .toFile(outputPath)
}
