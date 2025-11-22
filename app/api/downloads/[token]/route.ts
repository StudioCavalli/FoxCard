/**
 * Digital File Download API
 * Validates access and streams the file
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  validateDownloadAccess,
  recordDownload,
  verifyDownloadSignature,
} from '@/lib/digital/download-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { searchParams } = new URL(request.url)
    const timestamp = parseInt(searchParams.get('t') || '0')
    const signature = searchParams.get('s') || ''

    // Verify URL signature (optional - for additional security)
    if (timestamp && signature) {
      // Allow 1 hour window for the signed URL
      const oneHour = 60 * 60 * 1000
      if (Date.now() - timestamp > oneHour) {
        return NextResponse.json(
          { error: 'Download link has expired' },
          { status: 410 }
        )
      }

      if (!verifyDownloadSignature(token, timestamp, signature)) {
        return NextResponse.json(
          { error: 'Invalid download signature' },
          { status: 403 }
        )
      }
    }

    // Validate download access
    const validation = await validateDownloadAccess(token)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error?.includes('not found') ? 404 : 403 }
      )
    }

    const { download, file } = validation

    if (!download || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Get client IP for tracking
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Record the download
    await recordDownload(download.id, ipAddress)

    // Fetch the file from storage
    const fileResponse = await fetch(file.fileUrl)

    if (!fileResponse.ok) {
      console.error('Failed to fetch file from storage:', file.fileUrl)
      return NextResponse.json(
        { error: 'Failed to retrieve file' },
        { status: 500 }
      )
    }

    // Get file content
    const fileBuffer = await fileResponse.arrayBuffer()

    // Set appropriate headers for download
    const headers = new Headers()
    headers.set('Content-Type', file.mimeType)
    headers.set('Content-Length', file.fileSize.toString())
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.fileName)}"`
    )
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    headers.set('X-Content-Type-Options', 'nosniff')

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing the download' },
      { status: 500 }
    )
  }
}

/**
 * HEAD request to get file info without downloading
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const validation = await validateDownloadAccess(token)

    if (!validation.valid || !validation.file) {
      return new NextResponse(null, { status: 404 })
    }

    const headers = new Headers()
    headers.set('Content-Type', validation.file.mimeType)
    headers.set('Content-Length', validation.file.fileSize.toString())
    headers.set('X-Downloads-Remaining',
      validation.download?.maxDownloads
        ? String(validation.download.maxDownloads - validation.download.downloadCount)
        : 'unlimited'
    )

    return new NextResponse(null, {
      status: 200,
      headers,
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
