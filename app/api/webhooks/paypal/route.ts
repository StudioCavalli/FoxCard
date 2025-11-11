import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PayPal Webhook Handler
 * Handles PayPal IPN (Instant Payment Notification) events
 *
 * Setup: Add this URL to your PayPal webhook settings:
 * https://yourdomain.com/api/webhooks/paypal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[PayPal Webhook] Received event:', body.event_type)

    // Verify webhook signature (recommended for production)
    // TODO: Implement webhook signature verification
    // See: https://developer.paypal.com/api/rest/webhooks/#verify-webhook-signature

    const eventType = body.event_type
    const resource = body.resource

    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED':
        // Customer approved the payment
        console.log('[PayPal] Order approved:', resource.id)
        break

      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was captured successfully
        const orderId = resource.custom_id || resource.supplementary_data?.related_ids?.order_id

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
            },
          })
          console.log('[PayPal] Payment captured for order:', orderId)
        }
        break

      case 'PAYMENT.CAPTURE.DENIED':
        // Payment was denied
        const deniedOrderId = resource.custom_id

        if (deniedOrderId) {
          await prisma.order.update({
            where: { id: deniedOrderId },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED',
            },
          })
          console.log('[PayPal] Payment denied for order:', deniedOrderId)
        }
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        // Payment was refunded
        const refundedOrderId = resource.custom_id

        if (refundedOrderId) {
          await prisma.order.update({
            where: { id: refundedOrderId },
            data: {
              paymentStatus: 'REFUNDED',
              status: 'REFUNDED',
            },
          })
          console.log('[PayPal] Payment refunded for order:', refundedOrderId)
        }
        break

      default:
        console.log('[PayPal] Unhandled event type:', eventType)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[PayPal Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
