import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email/service'

/**
 * Cron job to process abandoned carts and send recovery emails
 * This should be called daily (or every few hours) via cron service
 *
 * Schedule:
 * - First email: 24 hours after abandonment
 * - Second email: 72 hours (3 days) after abandonment
 *
 * Authorization: Cron-Secret header must match CRON_SECRET env variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`

    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 1. Mark old carts as expired
    await prisma.abandonedCart.updateMany({
      where: {
        abandonedAt: { lte: thirtyDaysAgo },
        status: { not: 'EXPIRED' },
        wasRecovered: false,
      },
      data: {
        status: 'EXPIRED',
      },
    })

    // 2. Find carts that need first email (abandoned 24+ hours ago, no email sent)
    const cartsForFirstEmail = await prisma.abandonedCart.findMany({
      where: {
        status: 'PENDING',
        abandonedAt: { lte: oneDayAgo },
        firstEmailSentAt: null,
      },
      take: 50, // Process in batches
    })

    // 3. Find carts that need second email (abandoned 3+ days ago, first email sent, no second email)
    const cartsForSecondEmail = await prisma.abandonedCart.findMany({
      where: {
        status: 'FIRST_EMAIL_SENT',
        abandonedAt: { lte: threeDaysAgo },
        secondEmailSentAt: null,
      },
      take: 50,
    })

    const results = {
      expired: 0,
      firstEmailsSent: 0,
      secondEmailsSent: 0,
      errors: [] as string[],
    }

    // Send first recovery emails
    for (const cart of cartsForFirstEmail) {
      try {
        // Create incentive discount code (10% off, valid for 7 days)
        const discountCode = await prisma.discountCode.create({
          data: {
            storeId: cart.storeId,
            code: `COMEBACK-${cart.id.slice(-8).toUpperCase()}`,
            description: `Récupération de panier abandonné - ${cart.email}`,
            type: 'PERCENTAGE',
            value: 10,
            usageLimit: 1,
            expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            isActive: true,
            usageCount: 0,
          },
        })

        // Send first recovery email
        // TODO: Create abandoned-cart email templates
        // await emailService.sendEmail({
        //   to: cart.email,
        //   subject: 'Vous avez oublié quelque chose dans votre panier 🛒',
        //   template: 'abandoned-cart-first',
        //   data: {
        //     customerName: cart.customerName || 'Cher client',
        //     cartData: cart.cartData,
        //     discountCode: discountCode.code,
        //     discountValue: 10,
        //     expiresInDays: 7,
        //   },
        // })
        console.log(`[Abandoned Cart] Would send first email to ${cart.email} with code ${discountCode.code}`)

        // Update cart
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: {
            status: 'FIRST_EMAIL_SENT',
            firstEmailSentAt: now,
            discountCodeId: discountCode.id,
          },
        })

        results.firstEmailsSent++
      } catch (error: any) {
        console.error(`Failed to send first email to ${cart.email}:`, error)
        results.errors.push(`First email to ${cart.email}: ${error.message}`)
      }
    }

    // Send second recovery emails
    for (const cart of cartsForSecondEmail) {
      try {
        // Get the discount code if exists
        const discountCode = cart.discountCodeId
          ? await prisma.discountCode.findUnique({ where: { id: cart.discountCodeId } })
          : null

        // Send second recovery email (more urgent)
        // TODO: Create abandoned-cart email templates
        // await emailService.sendEmail({
        //   to: cart.email,
        //   subject: 'Dernière chance ! Votre panier expire bientôt 🎁',
        //   template: 'abandoned-cart-second',
        //   data: {
        //     customerName: cart.customerName || 'Cher client',
        //     cartData: cart.cartData,
        //     discountCode: discountCode?.code,
        //     discountValue: discountCode?.value || 10,
        //     expiresInDays: discountCode ? Math.ceil((new Date(discountCode.expiresAt!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0,
        //   },
        // })
        console.log(`[Abandoned Cart] Would send second email to ${cart.email} with code ${discountCode?.code}`)

        // Update cart
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: {
            status: 'SECOND_EMAIL_SENT',
            secondEmailSentAt: now,
          },
        })

        results.secondEmailsSent++
      } catch (error: any) {
        console.error(`Failed to send second email to ${cart.email}:`, error)
        results.errors.push(`Second email to ${cart.email}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Abandoned cart processing completed',
      results,
      timestamp: now.toISOString(),
    })
  } catch (error: any) {
    console.error('Abandoned cart cron error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process abandoned carts',
      },
      { status: 500 }
    )
  }
}
