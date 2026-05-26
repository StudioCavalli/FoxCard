import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Cron job to expire bank transfer orders
 * This should be called daily via cron service
 *
 * Orders with bank_transfer payment method that are:
 * - Still PENDING
 * - Past their expiration date (paymentExpiresAt)
 * Will be automatically cancelled
 *
 * Authorization: Cron-Secret header must match CRON_SECRET env variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 503 })
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find all expired bank transfer orders that are still pending
    const expiredOrders = await prisma.order.findMany({
      where: {
        paymentMethod: 'bank_transfer',
        paymentStatus: 'PENDING',
        paymentExpiresAt: {
          lte: now,
        },
      },
    })

    const results = {
      expired: 0,
      errors: [] as string[],
    }

    // Cancel expired orders
    for (const order of expiredOrders) {
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
            notes: `${order.notes || ''}\n\nCommande annulée automatiquement - Délai de paiement par virement bancaire expiré (7 jours)`.trim(),
          },
        })

        // TODO: Send cancellation email to customer
        // await emailService.sendEmail({
        //   to: order.customerEmail,
        //   subject: `Commande #${order.orderNumber} annulée`,
        //   template: 'order-cancelled-expired',
        //   data: {
        //     orderNumber: order.orderNumber,
        //     reason: 'Délai de paiement expiré',
        //   },
        // })
        console.log(`[Bank Transfer] Order ${order.orderNumber} expired and cancelled`)

        results.expired++
      } catch (error: any) {
        console.error(`Failed to expire order ${order.orderNumber}:`, error)
        results.errors.push(`Order ${order.orderNumber}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bank transfer expiration completed',
      results,
      timestamp: now.toISOString(),
    })
  } catch (error: any) {
    console.error('Bank transfer expiration cron error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process bank transfer expirations',
      },
      { status: 500 }
    )
  }
}
