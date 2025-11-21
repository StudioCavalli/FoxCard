import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { triggerAbandonedCartAutomation } from '@/lib/email/automation'

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

    // Trigger abandoned cart automation for carts that haven't received any emails yet
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

        // Parse cart data to get items and total
        const cartData = cart.cartData as any
        const cartItems = cartData?.items || []
        const cartTotal = cartData?.total || 0

        // Trigger abandoned cart automation
        await triggerAbandonedCartAutomation({
          storeId: cart.storeId,
          email: cart.email,
          cartId: cart.id,
          cartItems,
          cartTotal,
          checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cart=${cart.id}&code=${discountCode.code}`,
        })

        console.log(`[Abandoned Cart] Triggered automation for ${cart.email} with code ${discountCode.code}`)

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
        console.error(`Failed to trigger automation for ${cart.email}:`, error)
        results.errors.push(`Automation for ${cart.email}: ${error.message}`)
      }
    }

    // Note: Second and subsequent emails are now handled by the automation system
    // The automation steps (configured in the database) will handle J+3, J+7, etc.
    // This cron only triggers the first automation, which then manages its own schedule

    // We still mark these as processed to avoid re-triggering
    for (const cart of cartsForSecondEmail) {
      try {
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: {
            status: 'SECOND_EMAIL_SENT',
            secondEmailSentAt: now,
          },
        })
        results.secondEmailsSent++
      } catch (error: any) {
        console.error(`Failed to update cart status for ${cart.email}:`, error)
        results.errors.push(`Status update for ${cart.email}: ${error.message}`)
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
