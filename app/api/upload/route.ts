import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink, rename } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

// MIME types that should go through image optimization
const OPTIMIZABLE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
])

/**
 * POST /api/upload
 * Upload and optimize images
 * Max file size: 10MB (enforced in code)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 20 uploads per minute per user
    const userId = (session.user as any).id
    const { allowed } = checkRateLimit(`upload:${userId}`, 20, 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const storeId = formData.get('storeId') as string | null
    const optimize = formData.get('optimize') !== 'false' // Default true

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
    }

    // Verify user has access to this store
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (store.ownerId !== userId) {
      // Check if user is an active StoreUser
      const storeUser = await prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: userId,
            storeId: storeId,
          },
        },
        select: { status: true },
      })

      if (!storeUser || storeUser.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Access denied to this store' }, { status: 403 })
      }
    }

    // Validate file type (images + common document types)
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
      'application/pdf', 'application/zip', 'application/x-zip-compressed',
    ]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF, GIF, PDF, ZIP.' },
        { status: 400 }
      )
    }

    const isOptimizableImage = OPTIMIZABLE_IMAGE_TYPES.has(file.type)

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Create upload directory structure
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', storeId)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const ext = path.extname(file.name)
    const basename = path.basename(file.name, ext)
    const safeBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_')
    const filename = `${safeBasename}_${timestamp}_${randomStr}${ext}`
    const tempPath = path.join(uploadDir, `temp_${filename}`)

    // Write temp file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(tempPath, buffer)

    // For optimizable images, validate and optionally optimize
    if (isOptimizableImage) {
      // Validate it's a real image using sharp (with fallback)
      let imageIsValid = true
      try {
        const { isValidImage } = await import('@/lib/utils/image-optimizer')
        imageIsValid = await isValidImage(tempPath)
      } catch {
        // If sharp is unavailable, skip validation — file type was already checked
        imageIsValid = true
      }

      if (!imageIsValid) {
        await unlink(tempPath).catch(() => {})
        return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
      }

      if (optimize) {
        try {
          // Dynamically import to handle cases where sharp is not available
          const { optimizeImage } = await import('@/lib/utils/image-optimizer')

          const optimizationDir = path.join(uploadDir, 'optimized')
          const result = await optimizeImage(tempPath, optimizationDir, {
            quality: 80,
            maxWidth: 2048,
            maxHeight: 2048,
            formats: ['original', 'webp', 'avif'],
            thumbnails: [
              { name: 'thumb', width: 200, height: 200, fit: 'cover' },
              { name: 'medium', width: 600, height: 600, fit: 'cover' },
              { name: 'large', width: 1200, fit: 'inside' },
            ],
          })

          // Clean up temp file
          await unlink(tempPath).catch(() => {})

          // Convert absolute paths to relative URLs
          const toUrl = (filePath: string) => {
            return filePath.replace(process.cwd() + '/public', '').replace(/\\/g, '/')
          }

          return NextResponse.json({
            success: true,
            original: {
              ...result.original,
              path: toUrl(result.original.path),
              url: toUrl(result.original.path),
            },
            webp: result.webp
              ? {
                  ...result.webp,
                  path: toUrl(result.webp.path),
                  url: toUrl(result.webp.path),
                }
              : undefined,
            avif: result.avif
              ? {
                  ...result.avif,
                  path: toUrl(result.avif.path),
                  url: toUrl(result.avif.path),
                }
              : undefined,
            thumbnails: Object.entries(result.thumbnails).reduce(
              (acc, [name, thumb]) => {
                acc[name] = {
                  original: {
                    ...thumb.original,
                    path: toUrl(thumb.original.path),
                    url: toUrl(thumb.original.path),
                  },
                  webp: thumb.webp
                    ? {
                        ...thumb.webp,
                        path: toUrl(thumb.webp.path),
                        url: toUrl(thumb.webp.path),
                      }
                    : undefined,
                  avif: thumb.avif
                    ? {
                        ...thumb.avif,
                        path: toUrl(thumb.avif.path),
                        url: toUrl(thumb.avif.path),
                      }
                    : undefined,
                }
                return acc
              },
              {} as any
            ),
          })
        } catch (optimizeError) {
          // Optimization failed (e.g., sharp not available) — fall through to upload original
          console.warn('Image optimization failed, uploading original file:', optimizeError)
        }
      }
    }

    // No optimization path: for non-image files, non-optimizable images, or when optimization failed
    const finalPath = path.join(uploadDir, filename)
    await rename(tempPath, finalPath).catch(async () => {
      // rename can fail across devices; fall back to write + delete
      await writeFile(finalPath, buffer)
      await unlink(tempPath).catch(() => {})
    })

    const url = `/uploads/${storeId}/${filename}`

    return NextResponse.json({
      success: true,
      url,
      path: url,
      filename,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload
 * Get upload configuration
 */
export async function GET() {
  return NextResponse.json({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
    optimizationEnabled: true,
    thumbnailSizes: [
      { name: 'thumb', width: 200, height: 200 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: null },
    ],
  })
}
