import { NextRequest, NextResponse } from 'next/server'
import { processAutomationExecutions } from '@/lib/email/automation'
import { processScheduledCampaigns } from '@/lib/email/campaigns'

/**
 * Cron job to process automation executions and scheduled campaigns
 * Should be called every 5-15 minutes
 *
 * Example cron schedule:
 * - Every 5 minutes
 * - Every 10 minutes
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Processing automation executions and scheduled campaigns')

    // Process automation executions
    await processAutomationExecutions()

    // Process scheduled campaigns
    await processScheduledCampaigns()

    return NextResponse.json({
      success: true,
      message: 'Automation executions and campaigns processed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[CRON] Error processing automations:', error)
    return NextResponse.json(
      {
        error: 'Failed to process automations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
