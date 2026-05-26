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

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const baseUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com'

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Failed to obtain PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

async function verifyPayPalWebhookSignature(
  request: NextRequest,
  body: any
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.error('[PayPal Webhook] PAYPAL_WEBHOOK_ID is not configured')
    return false
  }

  const transmissionId = request.headers.get('PAYPAL-TRANSMISSION-ID')
  const transmissionTime = request.headers.get('PAYPAL-TRANSMISSION-TIME')
  const transmissionSig = request.headers.get('PAYPAL-TRANSMISSION-SIG')
  const certUrl = request.headers.get('PAYPAL-CERT-URL')
  const authAlgo = request.headers.get('PAYPAL-AUTH-ALGO')

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    console.error('[PayPal Webhook] Missing required signature headers')
    return false
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const baseUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com'

    const verifyResponse = await fetch(
      `${baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: body,
        }),
      }
    )

    if (!verifyResponse.ok) {
      console.error('[PayPal Webhook] Verification API returned error:', verifyResponse.status)
      return false
    }

    const verifyData = await verifyResponse.json()
    return verifyData.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('[PayPal Webhook] Signature verification failed:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[PayPal Webhook] Received event:', body.event_type)

    // Verify webhook signature
    const isValid = await verifyPayPalWebhookSignature(request, body)
    if (!isValid) {
      console.error('[PayPal Webhook] Signature verification failed, rejecting event')
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 401 }
      )
    }

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
