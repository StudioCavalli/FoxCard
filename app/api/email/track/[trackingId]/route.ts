import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 1x1 transparent pixel GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  const trackingId = params.trackingId

  try {
    // Find email log by tracking ID (we'll store this in a new field)
    // For now, we'll decode trackingId as base64 emailLogId
    const emailLogId = Buffer.from(trackingId, 'base64').toString('utf-8')

    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
    })

    if (emailLog) {
      // Update email log with open tracking
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          opened: true,
          openedAt: emailLog.openedAt || new Date(), // Only set if not already set
          openCount: {
            increment: 1,
          },
        },
      })
    }
  } catch (error) {
    console.error('Error tracking email open:', error)
    // Don't fail - still return pixel
  }

  // Always return 1x1 transparent pixel
  return new NextResponse(TRACKING_PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
