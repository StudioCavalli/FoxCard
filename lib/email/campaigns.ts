import { prisma } from '@/lib/prisma'
import { getTransporter } from './config'
import { CampaignStatus } from '@prisma/client'

/**
 * Send a marketing campaign to subscribers
 */
export async function sendCampaign(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      store: true,
    },
  })

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`)
  }

  if (campaign.status !== CampaignStatus.SCHEDULED && campaign.status !== CampaignStatus.DRAFT) {
    throw new Error(`Campaign ${campaignId} cannot be sent (status: ${campaign.status})`)
  }

  // Update status to SENDING
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.SENDING },
  })

  try {
    // Get subscribers based on segment tags
    const subscribers = await getSubscribers(campaign.storeId, campaign.segmentTags)

    // Update total recipients
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { totalRecipients: subscribers.length },
    })

    console.log(`Sending campaign ${campaign.name} to ${subscribers.length} subscribers`)

    let sent = 0
    let bounced = 0

    // Send emails in batches to avoid overwhelming the email server
    const batchSize = 50
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      await Promise.allSettled(
        batch.map(async (subscriber) => {
          try {
            // Replace variables in content
            const htmlBody = replaceVariables(campaign.htmlBody, {
              firstName: subscriber.firstName || '',
              lastName: subscriber.lastName || '',
              email: subscriber.email,
              unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.id}`,
            })

            const textBody = campaign.textBody
              ? replaceVariables(campaign.textBody, {
                  firstName: subscriber.firstName || '',
                  lastName: subscriber.lastName || '',
                  email: subscriber.email,
                  unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.id}`,
                })
              : undefined

            const transporter = getTransporter()
            if (!transporter) {
              throw new Error('Email transporter not configured')
            }

            await transporter.sendMail({
              from: `${campaign.fromName} <${campaign.fromEmail}>`,
              to: subscriber.email,
              subject: campaign.subject,
              html: htmlBody,
              text: textBody,
              replyTo: campaign.replyTo || undefined,
            })

            sent++
          } catch (error) {
            console.error(`Failed to send campaign email to ${subscriber.email}:`, error)
            bounced++
          }
        })
      )

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Update campaign status and statistics
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.SENT,
        sent,
        bounced,
        sentAt: new Date(),
      },
    })

    console.log(`Campaign ${campaign.name} sent successfully. Sent: ${sent}, Bounced: ${bounced}`)

    return { sent, bounced, totalRecipients: subscribers.length }
  } catch (error) {
    // Revert to DRAFT on error
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.DRAFT },
    })
    throw error
  }
}

/**
 * Get active subscribers based on segment tags
 */
async function getSubscribers(storeId: string, segmentTags: string[]) {
  const where: any = {
    storeId,
    status: 'ACTIVE',
  }

  // Filter by tags if specified
  if (segmentTags.length > 0) {
    where.tags = {
      hasSome: segmentTags,
    }
  }

  return prisma.newsletterSubscriber.findMany({ where })
}

/**
 * Replace variables in text
 */
function replaceVariables(text: string, context: Record<string, any>): string {
  let result = text

  // Replace {{variable}} patterns
  const variablePattern = /\{\{([^}]+)\}\}/g
  result = result.replace(variablePattern, (match, key) => {
    const trimmedKey = key.trim()
    const value = context[trimmedKey]
    return value !== undefined ? String(value) : match
  })

  return result
}

/**
 * Schedule a campaign for later sending
 */
export async function scheduleCampaign(campaignId: string, scheduledAt: Date) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`)
  }

  if (campaign.status !== CampaignStatus.DRAFT) {
    throw new Error(`Campaign ${campaignId} cannot be scheduled (status: ${campaign.status})`)
  }

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: CampaignStatus.SCHEDULED,
      scheduledAt,
    },
  })

  console.log(`Campaign ${campaign.name} scheduled for ${scheduledAt}`)
}

/**
 * Process scheduled campaigns
 * This should be called by a cron job regularly
 */
export async function processScheduledCampaigns() {
  const now = new Date()

  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      status: CampaignStatus.SCHEDULED,
      scheduledAt: {
        lte: now,
      },
    },
  })

  console.log(`Processing ${campaigns.length} scheduled campaigns`)

  for (const campaign of campaigns) {
    try {
      await sendCampaign(campaign.id)
    } catch (error) {
      console.error(`Failed to send campaign ${campaign.id}:`, error)
    }
  }
}

/**
 * Track campaign open
 */
export async function trackCampaignOpen(campaignId: string) {
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { opened: { increment: 1 } },
  })
}

/**
 * Track campaign click
 */
export async function trackCampaignClick(campaignId: string) {
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { clicked: { increment: 1 } },
  })
}

/**
 * Track campaign unsubscribe
 */
export async function trackCampaignUnsubscribe(campaignId: string) {
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { unsubscribed: { increment: 1 } },
  })
}
