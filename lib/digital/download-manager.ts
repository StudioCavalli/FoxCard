/**
 * Digital Products Download Manager
 * Handles secure download links, validation, and tracking
 */

import { randomBytes, createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'
import { DigitalDownloadStatus } from '@prisma/client'

const DOWNLOAD_TOKEN_BYTES = 32
const HMAC_SECRET = process.env.DOWNLOAD_HMAC_SECRET || 'goldenera-digital-secret'

/**
 * Generate a secure download token
 */
export function generateDownloadToken(): string {
  return randomBytes(DOWNLOAD_TOKEN_BYTES).toString('hex')
}

/**
 * Sign a download token for URL validation
 */
export function signDownloadToken(token: string, timestamp: number): string {
  const data = `${token}:${timestamp}`
  const signature = createHmac('sha256', HMAC_SECRET)
    .update(data)
    .digest('hex')
  return signature
}

/**
 * Verify a signed download URL
 */
export function verifyDownloadSignature(
  token: string,
  timestamp: number,
  signature: string
): boolean {
  const expectedSignature = signDownloadToken(token, timestamp)
  return signature === expectedSignature
}

/**
 * Generate a secure signed download URL
 */
export function generateDownloadUrl(
  token: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || ''
): string {
  const timestamp = Date.now()
  const signature = signDownloadToken(token, timestamp)
  return `${baseUrl}/api/downloads/${token}?t=${timestamp}&s=${signature}`
}

/**
 * Create digital download records for an order
 */
export async function createDigitalDownloadsForOrder(
  orderId: string,
  customerId?: string
): Promise<void> {
  // Get order with items and their products
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              digitalFiles: {
                where: { isActive: true },
              },
            },
          },
        },
      },
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  // Find all digital files from order items
  const digitalFiles = order.items.flatMap(
    (item) => item.product.digitalFiles || []
  )

  if (digitalFiles.length === 0) {
    return // No digital files in this order
  }

  // Create download records for each file
  const downloadRecords = digitalFiles.map((file) => {
    const token = generateDownloadToken()
    const expiresAt = file.expiryDays
      ? new Date(Date.now() + file.expiryDays * 24 * 60 * 60 * 1000)
      : null

    return {
      fileId: file.id,
      orderId: order.id,
      customerId: customerId || null,
      token,
      maxDownloads: file.maxDownloads,
      expiresAt,
      licenseKey: file.licenseKey || generateLicenseKey(),
      status: DigitalDownloadStatus.ACTIVE,
    }
  })

  // Bulk create download records
  await prisma.digitalDownload.createMany({
    data: downloadRecords,
  })
}

/**
 * Validate a download request
 */
export async function validateDownloadAccess(token: string): Promise<{
  valid: boolean
  error?: string
  download?: Awaited<ReturnType<typeof prisma.digitalDownload.findUnique>>
  file?: Awaited<ReturnType<typeof prisma.digitalFile.findUnique>>
}> {
  const download = await prisma.digitalDownload.findUnique({
    where: { token },
    include: {
      file: true,
      order: {
        select: {
          id: true,
          paymentStatus: true,
          customerEmail: true,
        },
      },
    },
  })

  if (!download) {
    return { valid: false, error: 'Download not found' }
  }

  // Check payment status
  if (download.order.paymentStatus !== 'PAID') {
    return { valid: false, error: 'Payment not completed' }
  }

  // Check status
  if (download.status !== DigitalDownloadStatus.ACTIVE) {
    const statusMessages: Record<DigitalDownloadStatus, string> = {
      ACTIVE: '',
      EXPIRED: 'Download link has expired',
      EXHAUSTED: 'Maximum downloads reached',
      REVOKED: 'Download access has been revoked',
    }
    return { valid: false, error: statusMessages[download.status] }
  }

  // Check expiration
  if (download.expiresAt && new Date() > download.expiresAt) {
    await prisma.digitalDownload.update({
      where: { id: download.id },
      data: { status: DigitalDownloadStatus.EXPIRED },
    })
    return { valid: false, error: 'Download link has expired' }
  }

  // Check download count
  if (
    download.maxDownloads !== null &&
    download.downloadCount >= download.maxDownloads
  ) {
    await prisma.digitalDownload.update({
      where: { id: download.id },
      data: { status: DigitalDownloadStatus.EXHAUSTED },
    })
    return { valid: false, error: 'Maximum downloads reached' }
  }

  return { valid: true, download, file: download.file }
}

/**
 * Record a download event
 */
export async function recordDownload(
  downloadId: string,
  ipAddress?: string
): Promise<void> {
  await prisma.digitalDownload.update({
    where: { id: downloadId },
    data: {
      downloadCount: { increment: 1 },
      lastDownloadAt: new Date(),
      lastDownloadIp: ipAddress,
    },
  })
}

/**
 * Get customer's digital downloads
 */
export async function getCustomerDownloads(
  customerEmail: string
): Promise<{
  downloads: Array<{
    id: string
    fileName: string
    fileSize: number
    downloadUrl: string
    downloadCount: number
    maxDownloads: number | null
    expiresAt: Date | null
    status: DigitalDownloadStatus
    orderNumber: string
    purchaseDate: Date
    licenseKey: string | null
  }>
}> {
  const downloads = await prisma.digitalDownload.findMany({
    where: {
      order: {
        customerEmail,
        paymentStatus: 'PAID',
      },
    },
    include: {
      file: true,
      order: {
        select: {
          orderNumber: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    downloads: downloads.map((d) => ({
      id: d.id,
      fileName: d.file.name,
      fileSize: d.file.fileSize,
      downloadUrl: generateDownloadUrl(d.token),
      downloadCount: d.downloadCount,
      maxDownloads: d.maxDownloads,
      expiresAt: d.expiresAt,
      status: d.status,
      orderNumber: d.order.orderNumber,
      purchaseDate: d.order.createdAt,
      licenseKey: d.licenseKey,
    })),
  }
}

/**
 * Generate a license key
 */
function generateLicenseKey(): string {
  const segments = []
  for (let i = 0; i < 4; i++) {
    segments.push(randomBytes(2).toString('hex').toUpperCase())
  }
  return segments.join('-') // e.g., "A1B2-C3D4-E5F6-G7H8"
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Get allowed MIME types for digital files
 */
export const ALLOWED_DIGITAL_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/epub+zip',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'video/mp4',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'text/plain',
]

/**
 * Max file size for digital uploads (100MB)
 */
export const MAX_DIGITAL_FILE_SIZE = 100 * 1024 * 1024
