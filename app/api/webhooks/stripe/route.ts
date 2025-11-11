import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get order ID from metadata
        const orderId = session.metadata?.orderId

        if (!orderId) {
          console.error('No orderId in session metadata')
          return NextResponse.json({ error: 'No orderId' }, { status: 400 })
        }

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PROCESSING',
            paymentStatus: 'PAID',
            paymentIntentId: session.payment_intent as string,
          },
        })

        // Create or update customer
        if (session.customer_details) {
          const email = session.customer_details.email
          const name = session.customer_details.name

          if (email) {
            const order = await prisma.order.findUnique({
              where: { id: orderId },
            })

            if (order) {
              // Check if customer exists
              const existingCustomer = await prisma.customer.findUnique({
                where: {
                  storeId_email: {
                    storeId: order.storeId,
                    email: email,
                  },
                },
              })

              if (!existingCustomer) {
                // Create new customer
                const [firstName, ...lastNameParts] = (name || '').split(' ')
                await prisma.customer.create({
                  data: {
                    storeId: order.storeId,
                    email: email,
                    firstName: firstName || undefined,
                    lastName: lastNameParts.join(' ') || undefined,
                  },
                })
              }
            }
          }
        }

        console.log(`Payment successful for order ${orderId}`)
        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PROCESSING',
              paymentStatus: 'PAID',
            },
          })
        }
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
              paymentStatus: 'FAILED',
            },
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        // Find order by payment intent
        const order = await prisma.order.findFirst({
          where: {
            paymentIntentId: charge.payment_intent as string,
          },
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'REFUNDED',
              paymentStatus: 'REFUNDED',
            },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Error processing webhook:', err)
    return NextResponse.json(
      { error: `Webhook handler failed: ${err.message}` },
      { status: 500 }
    )
  }
}
