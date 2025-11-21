import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Loyalty Points Expiration Cron Job
 *
 * This endpoint should be triggered daily by a cron service (e.g., Vercel Cron, GitHub Actions, etc.)
 *
 * It will:
 * 1. Find all loyalty transactions with expiresAt < now that haven't been marked as expired
 * 2. Create EXPIRE transactions for those points
 * 3. Deduct the expired points from customer balances
 * 4. Mark the original transactions as expired
 *
 * Setup for Vercel Cron (add to vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/loyalty-expiration",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 *
 * Or use a manual cron job:
 * 0 0 * * * curl -X POST https://yourdomain.com/api/cron/loyalty-expiration
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()
    console.log(`[Loyalty Expiration] Running cron job at ${now.toISOString()}`)

    // Find all expired loyalty transactions that haven't been processed
    const expiredTransactions = await prisma.loyaltyTransaction.findMany({
      where: {
        type: 'EARN', // Only EARN transactions have expiration dates
        expiresAt: {
          lte: now,
        },
        isExpired: false,
      },
      include: {
        customer: true,
      },
    })

    console.log(`[Loyalty Expiration] Found ${expiredTransactions.length} expired transactions`)

    let processedCount = 0
    let totalPointsExpired = 0

    // Process each expired transaction
    for (const transaction of expiredTransactions) {
      try {
        // Calculate how many points actually expired (can't go below 0)
        const pointsToExpire = Math.min(
          transaction.points,
          transaction.customer.loyaltyPoints
        )

        if (pointsToExpire > 0) {
          // Use a transaction to ensure atomicity
          await prisma.$transaction([
            // Deduct expired points from customer balance
            prisma.customer.update({
              where: { id: transaction.customerId },
              data: {
                loyaltyPoints: {
                  decrement: pointsToExpire,
                },
              },
            }),
            // Create EXPIRE transaction
            prisma.loyaltyTransaction.create({
              data: {
                customerId: transaction.customerId,
                storeId: transaction.storeId,
                type: 'EXPIRE',
                points: -pointsToExpire, // Negative value for expiration
                description: `Points expirés (gagné le ${transaction.createdAt.toLocaleDateString('fr-FR')})`,
                isExpired: true,
              },
            }),
            // Mark original transaction as expired
            prisma.loyaltyTransaction.update({
              where: { id: transaction.id },
              data: {
                isExpired: true,
              },
            }),
          ])

          totalPointsExpired += pointsToExpire
          processedCount++

          console.log(
            `[Loyalty Expiration] Expired ${pointsToExpire} points for customer ${transaction.customer.email}`
          )
        } else {
          // Just mark as expired if customer already has 0 points
          await prisma.loyaltyTransaction.update({
            where: { id: transaction.id },
            data: {
              isExpired: true,
            },
          })
          processedCount++
        }

        // TODO: Send email notification to customer about expired points
        // This would require the email system to be set up
      } catch (err) {
        console.error(
          `[Loyalty Expiration] Error processing transaction ${transaction.id}:`,
          err
        )
        // Continue processing other transactions even if one fails
      }
    }

    const result = {
      success: true,
      processedAt: now.toISOString(),
      transactionsProcessed: processedCount,
      totalPointsExpired,
      message: `Processed ${processedCount} expired transactions, expired ${totalPointsExpired} total points`,
    }

    console.log('[Loyalty Expiration] Cron job completed:', result)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[Loyalty Expiration] Cron job failed:', error)
    return NextResponse.json(
      {
        error: 'Loyalty expiration cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
