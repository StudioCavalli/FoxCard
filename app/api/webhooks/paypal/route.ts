import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDigitalDownloadsForOrder } from '@/lib/digital/download-manager'

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
          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
            },
          })

          // Award loyalty points if customer exists
          if (order.customerId && order.total > 0) {
            try {
              const pointsToAward = Math.floor(order.total)
              const expiresAt = new Date()
              expiresAt.setMonth(expiresAt.getMonth() + 12)

              // Check if points already awarded
              const existingTransaction = await prisma.loyaltyTransaction.findFirst({
                where: {
                  orderId: order.id,
                  type: 'EARN',
                },
              })

              if (!existingTransaction) {
                await prisma.$transaction([
                  prisma.customer.update({
                    where: { id: order.customerId },
                    data: {
                      loyaltyPoints: {
                        increment: pointsToAward,
                      },
                      totalPointsEarned: {
                        increment: pointsToAward,
                      },
                    },
                  }),
                  prisma.loyaltyTransaction.create({
                    data: {
                      customerId: order.customerId,
                      storeId: order.storeId,
                      type: 'EARN',
                      points: pointsToAward,
                      orderId: order.id,
                      description: `Achat confirmé`,
                      expiresAt,
                    },
                  }),
                ])

                console.log(`[Loyalty] Awarded ${pointsToAward} points for order ${orderId}`)
              }
            } catch (loyaltyError) {
              console.error('[Loyalty] Error awarding points:', loyaltyError)
              // Don't fail the webhook if loyalty fails
            }
          }

          // Create digital downloads for the order
          try {
            await createDigitalDownloadsForOrder(orderId, order.customerId || undefined)
            console.log(`[Digital] Created downloads for order ${orderId}`)
          } catch (digitalError) {
            console.error('[Digital] Error creating downloads:', digitalError)
            // Don't fail the webhook if digital downloads fail
          }

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
