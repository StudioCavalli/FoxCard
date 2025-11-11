import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { stripe, formatAmountForStripe, CURRENCY } from '@/lib/stripe'
import { TRPCError } from '@trpc/server'

export const paymentRouter = router({
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the order with items
        const order = await ctx.prisma.order.findUnique({
          where: { id: input.orderId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        })

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          })
        }

        // Create line items for Stripe
        const lineItems = order.items.map((item) => ({
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: item.name,
              description: item.variantName || undefined,
              images: item.product.images.slice(0, 1), // Stripe allows max 8 images
            },
            unit_amount: formatAmountForStripe(item.price),
          },
          quantity: item.quantity,
        }))

        // Add shipping as a line item if applicable
        if (order.shipping > 0) {
          lineItems.push({
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: 'Frais de livraison',
              },
              unit_amount: formatAmountForStripe(order.shipping),
            },
            quantity: 1,
          })
        }

        // Add discount as a negative line item if applicable
        if (order.discount > 0) {
          lineItems.push({
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: 'Reduction',
              },
              unit_amount: -formatAmountForStripe(order.discount),
            },
            quantity: 1,
          })
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: lineItems,
          customer_email: order.customerEmail,
          client_reference_id: order.id,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          shipping_address_collection: {
            allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
          },
        })

        // Update order with payment intent ID
        await ctx.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentIntentId: session.id,
            paymentMethod: 'card',
          },
        })

        return {
          sessionId: session.id,
          url: session.url,
        }
      } catch (error) {
        console.error('Error creating checkout session:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
          cause: error,
        })
      }
    }),

  getPaymentStatus: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId)

        return {
          status: session.payment_status,
          customerEmail: session.customer_email,
          amountTotal: session.amount_total,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve payment status',
          cause: error,
        })
      }
    }),
})
