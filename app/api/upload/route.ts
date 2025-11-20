import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { optimizeImage, isValidImage } from '@/lib/utils/image-optimizer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Configure max file size (10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

/**
 * POST /api/upload
 * Upload and optimize images
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.' },
        { status: 400 }
      )
    }

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

    // Validate it's a real image
    const isValid = await isValidImage(tempPath)
    if (!isValid) {
      // Clean up temp file
      await import('fs/promises').then((fs) => fs.unlink(tempPath).catch(() => {}))
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
    }

    if (optimize) {
      // Optimize image with all formats and thumbnails
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
      await import('fs/promises').then((fs) => fs.unlink(tempPath).catch(() => {}))

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
    } else {
      // No optimization, just save the file
      const finalPath = path.join(uploadDir, filename)
      await import('fs/promises').then((fs) => fs.rename(tempPath, finalPath))

      const url = `/uploads/${storeId}/${filename}`

      return NextResponse.json({
        success: true,
        url,
        path: url,
        filename,
      })
    }
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
