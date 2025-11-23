import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { stripe, formatAmountForStripe, CURRENCY } from '@/lib/stripe'
import { paypalClient, formatAmountForPayPal, PAYPAL_CURRENCY } from '@/lib/paypal'
import {
  OrdersController,
  CheckoutPaymentIntent,
  OrderApplicationContextLandingPage,
  OrderApplicationContextShippingPreference,
  OrderApplicationContextUserAction,
} from '@paypal/paypal-server-sdk'
import { TRPCError } from '@trpc/server'

// Validate redirect URLs to prevent open redirects
const validateRedirectUrl = (url: string, allowedHost: string) => {
  try {
    const parsedUrl = new URL(url)
    const allowedUrl = new URL(allowedHost)

    // Allow same hostname or localhost for development
    if (parsedUrl.hostname === allowedUrl.hostname ||
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1') {
      return url
    }

    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid redirect URL: must match application domain',
    })
  } catch (error) {
    if (error instanceof TRPCError) throw error
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid URL format',
    })
  }
}

export const paymentRouter = router({
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if Stripe is configured
      if (!stripe) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Payment provider not configured. Please contact the store administrator.',
        })
      }

      // Validate redirect URLs
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const successUrl = validateRedirectUrl(input.successUrl, appUrl)
      const cancelUrl = validateRedirectUrl(input.cancelUrl, appUrl)

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
                description: undefined,
                images: [],
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
                description: undefined,
                images: [],
              },
              unit_amount: -formatAmountForStripe(order.discount),
            },
            quantity: 1,
          })
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card', 'paypal'], // Stripe also supports PayPal
          line_items: lineItems,
          customer_email: order.customerEmail,
          client_reference_id: order.id,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
          shipping_address_collection: {
            allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
          },
          // Enable Apple Pay / Google Pay / Link
          payment_method_options: {
            card: {
              request_three_d_secure: 'automatic',
            },
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
      // Check if Stripe is configured
      if (!stripe) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Payment provider not configured.',
        })
      }

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

  // PayPal Integration
  createPayPalOrder: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        returnUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if PayPal is configured
      if (!paypalClient) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'PayPal not configured. Please contact the store administrator.',
        })
      }

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

        // Build PayPal order items
        const purchaseUnits = [
          {
            referenceId: order.orderNumber,
            description: `Order #${order.orderNumber}`,
            customId: order.id,
            softDescriptor: 'GoldenEra',
            amount: {
              currencyCode: PAYPAL_CURRENCY as any,
              value: formatAmountForPayPal(order.total),
              breakdown: {
                itemTotal: {
                  currencyCode: PAYPAL_CURRENCY as any,
                  value: formatAmountForPayPal(order.subtotal),
                },
                shipping: order.shipping > 0 ? {
                  currencyCode: PAYPAL_CURRENCY as any,
                  value: formatAmountForPayPal(order.shipping),
                } : undefined,
                discount: order.discount > 0 ? {
                  currencyCode: PAYPAL_CURRENCY as any,
                  value: formatAmountForPayPal(order.discount),
                } : undefined,
              },
            },
            items: order.items.map((item) => ({
              name: item.name,
              description: item.variantName || undefined,
              sku: item.productId.substring(0, 127), // PayPal SKU max 127 chars
              unitAmount: {
                currencyCode: PAYPAL_CURRENCY as any,
                value: formatAmountForPayPal(item.price),
              },
              quantity: item.quantity.toString(),
              category: 'PHYSICAL_GOODS' as any,
            })),
            shippingDetail: order.shippingAddress ? {
              name: {
                fullName: order.customerName || 'Customer',
              },
              addressPortable: {
                addressLine1: (order.shippingAddress as any).address,
                addressLine2: undefined,
                adminArea2: (order.shippingAddress as any).city,
                adminArea1: undefined,
                postalCode: (order.shippingAddress as any).postalCode,
                countryCode: getCountryCode((order.shippingAddress as any).country),
              },
            } : undefined,
          },
        ]

        // Create PayPal order
        const ordersController = new OrdersController(paypalClient)
        const { result: paypalOrder } = await ordersController.createOrder({
          body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits,
            applicationContext: {
              brandName: 'GoldenEra',
              landingPage: OrderApplicationContextLandingPage.Billing,
              shippingPreference: OrderApplicationContextShippingPreference.SetProvidedAddress,
              userAction: OrderApplicationContextUserAction.PayNow,
              returnUrl: input.returnUrl,
              cancelUrl: input.cancelUrl,
            },
          },
          prefer: 'return=representation',
        })

        // Update order with PayPal order ID
        await ctx.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentIntentId: paypalOrder.id,
            paymentMethod: 'paypal',
          },
        })

        // Find approval URL
        const approvalUrl = paypalOrder.links?.find(
          (link: any) => link.rel === 'approve'
        )?.href

        return {
          orderId: paypalOrder.id,
          approvalUrl,
        }
      } catch (error: any) {
        console.error('Error creating PayPal order:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create PayPal order',
          cause: error,
        })
      }
    }),

  capturePayPalOrder: publicProcedure
    .input(
      z.object({
        paypalOrderId: z.string(),
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if PayPal is configured
      if (!paypalClient) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'PayPal not configured.',
        })
      }

      try {
        // Capture the PayPal order
        const ordersController = new OrdersController(paypalClient)
        const { result: captureResult } = await ordersController.captureOrder({
          id: input.paypalOrderId,
        })

        // Update order status
        if (captureResult.status === 'COMPLETED') {
          await ctx.prisma.order.update({
            where: { id: input.orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
            },
          })
        }

        return {
          status: captureResult.status,
          captureId: captureResult.id,
        }
      } catch (error: any) {
        console.error('Error capturing PayPal order:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to capture PayPal payment',
          cause: error,
        })
      }
    }),

  getPayPalOrderStatus: publicProcedure
    .input(z.object({ paypalOrderId: z.string() }))
    .query(async ({ input }) => {
      if (!paypalClient) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'PayPal not configured.',
        })
      }

      try {
        const ordersController = new OrdersController(paypalClient)
        const { result } = await ordersController.getOrder({
          id: input.paypalOrderId,
        })

        return {
          status: result.status,
          payerEmail: result.payer?.emailAddress,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve PayPal order status',
          cause: error,
        })
      }
    }),

  // Bank Transfer
  generateBankTransferInstructions: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the order
        const order = await ctx.prisma.order.findUnique({
          where: { id: input.orderId },
          include: { store: true },
        })

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          })
        }

        // Set expiration date (7 days from now)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // Update order payment method to bank transfer
        await ctx.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentMethod: 'bank_transfer',
            paymentStatus: 'PENDING',
            status: 'PENDING',
            paymentExpiresAt: expiresAt,
          },
        })

        // Get bank details from environment variables or store settings
        // In production, this should be configured per store
        const bankDetails = {
          accountHolder: order.store.name || 'GoldenEra Store',
          iban: 'FR76 1234 5678 9012 3456 7890 123', // TODO: Get from store settings
          bic: 'ABCDEFGHXXX', // TODO: Get from store settings
          bankName: 'Banque Example',
          reference: order.orderNumber,
          amount: order.total,
          currency: 'EUR',
          expiresAt: expiresAt.toISOString(),
        }

        // TODO: Send email with bank transfer instructions
        // await emailService.sendEmail({
        //   to: order.customerEmail,
        //   subject: `Instructions de paiement - Commande #${order.orderNumber}`,
        //   template: 'bank-transfer-instructions',
        //   data: {
        //     orderNumber: order.orderNumber,
        //     bankDetails,
        //     expiresAt,
        //   },
        // })
        console.log(`[Bank Transfer] Would send instructions to ${order.customerEmail} for order ${order.orderNumber}`)

        return bankDetails
      } catch (error: any) {
        console.error('Error generating bank transfer instructions:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate bank transfer instructions',
          cause: error,
        })
      }
    }),

  confirmBankTransferPayment: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        transactionReference: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Mark order as awaiting bank transfer confirmation
        await ctx.prisma.order.update({
          where: { id: input.orderId },
          data: {
            paymentStatus: 'PENDING',
            status: 'PENDING',
            notes: input.transactionReference
              ? `Référence de virement : ${input.transactionReference}`
              : 'En attente de confirmation de virement bancaire',
          },
        })

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm bank transfer',
          cause: error,
        })
      }
    }),

  // Admin: Manually confirm payment
  adminConfirmPayment: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const order = await ctx.prisma.order.update({
          where: { id: input.orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            notes: input.notes || 'Paiement confirmé manuellement par un administrateur',
          },
        })

        return order
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm payment',
          cause: error,
        })
      }
    }),

  // Admin: Get payment statistics
  getPaymentStats: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const [pending, paid, failed, total] = await Promise.all([
          ctx.prisma.order.count({
            where: { storeId: input.storeId, paymentStatus: 'PENDING' },
          }),
          ctx.prisma.order.count({
            where: { storeId: input.storeId, paymentStatus: 'PAID' },
          }),
          ctx.prisma.order.count({
            where: { storeId: input.storeId, paymentStatus: 'FAILED' },
          }),
          ctx.prisma.order.count({
            where: { storeId: input.storeId },
          }),
        ])

        const totalRevenue = await ctx.prisma.order.aggregate({
          where: { storeId: input.storeId, paymentStatus: 'PAID' },
          _sum: { total: true },
        })

        return {
          pending,
          paid,
          failed,
          total,
          revenue: totalRevenue._sum.total || 0,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get payment stats',
          cause: error,
        })
      }
    }),

  // Admin: Refund payment
  refundPayment: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        amount: z.number().positive().optional(), // Optional for partial refund
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the order
        const order = await ctx.prisma.order.findUnique({
          where: { id: input.orderId },
        })

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          })
        }

        if (order.paymentStatus !== 'PAID') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Order is not paid, cannot refund',
          })
        }

        if (!order.paymentIntentId) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'No payment intent ID found for this order',
          })
        }

        const isPartialRefund = input.amount !== undefined && input.amount < order.total
        const refundAmount = input.amount || order.total

        let refundId: string | undefined

        // Process refund based on payment method
        if (order.paymentMethod === 'card' && stripe) {
          // Stripe refund
          const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId, {
            expand: ['charges'],
          })

          const charges = (paymentIntent as any).charges?.data
          if (!charges || charges.length === 0) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'No charge found for this payment',
            })
          }

          const chargeId = charges[0].id

          const refund = await stripe.refunds.create({
            charge: chargeId,
            amount: input.amount ? formatAmountForStripe(input.amount) : undefined,
            reason: input.reason as any,
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
            },
          })

          refundId = refund.id
        } else if (order.paymentMethod === 'paypal' && paypalClient) {
          // PayPal refund
          const ordersController = new OrdersController(paypalClient)

          // Get the PayPal order to find the capture ID
          const { result: paypalOrder } = await ordersController.getOrder({
            id: order.paymentIntentId,
          })

          const captureId = paypalOrder.purchaseUnits?.[0]?.payments?.captures?.[0]?.id

          if (!captureId) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'No capture found for this PayPal order',
            })
          }

          // Refund the capture via API call
          const refundBody: any = {}
          if (input.amount) {
            refundBody.amount = {
              value: formatAmountForPayPal(input.amount),
              currency_code: PAYPAL_CURRENCY,
            }
          }
          if (input.reason) {
            refundBody.note_to_payer = input.reason
          }

          // Make direct API call for refund (SDK might not have captures controller)
          const accessToken = await (paypalClient as any).clientCredentialsAuthManager.fetchToken()
          const apiUrl = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com'

          const refundResponse = await fetch(`${apiUrl}/v2/payments/captures/${captureId}/refund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(refundBody),
          })

          if (!refundResponse.ok) {
            throw new Error(`PayPal refund failed: ${await refundResponse.text()}`)
          }

          const refund = await refundResponse.json()
          refundId = refund.id
        } else {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Cannot refund ${order.paymentMethod} payments automatically. Please process manually.`,
          })
        }

        // Update order status
        const updateData: any = {
          paymentStatus: isPartialRefund ? 'PARTIALLY_REFUNDED' : 'REFUNDED',
          notes: `${order.notes || ''}\n\nRemboursement ${
            isPartialRefund ? 'partiel' : 'total'
          } de ${refundAmount}€${input.reason ? ` - Raison: ${input.reason}` : ''} - Ref: ${refundId}`.trim(),
        }

        // Only update status if full refund
        if (!isPartialRefund) {
          updateData.status = 'REFUNDED'
        }

        await ctx.prisma.order.update({
          where: { id: order.id },
          data: updateData,
        })

        // TODO: Send refund confirmation email to customer

        return {
          success: true,
          refundId,
          amount: refundAmount,
          isPartial: isPartialRefund,
        }
      } catch (error: any) {
        console.error('Error processing refund:', error)

        // Check if it's already a TRPCError
        if (error.code) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to process refund',
          cause: error,
        })
      }
    }),
})

/**
 * Helper: Convert country name to ISO 3166-1 alpha-2 code
 */
function getCountryCode(countryName: string): string {
  const countryMap: Record<string, string> = {
    France: 'FR',
    Belgium: 'BE',
    Belgique: 'BE',
    Switzerland: 'CH',
    Suisse: 'CH',
    Luxembourg: 'LU',
    Monaco: 'MC',
  }
  return countryMap[countryName] || 'FR'
}
