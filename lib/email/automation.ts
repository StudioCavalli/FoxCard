import { prisma } from '@/lib/prisma'
import { getTransporter, getFromAddress } from './config'
import { AutomationTrigger, AutomationExecutionStatus } from '@prisma/client'

/**
 * Trigger an email automation sequence
 */
export async function triggerAutomation(params: {
  storeId: string
  trigger: AutomationTrigger
  email: string
  customerId?: string
  contextData: Record<string, any>
}) {
  const { storeId, trigger, email, customerId, contextData } = params

  // Find active automations for this trigger
  const automations = await prisma.emailAutomation.findMany({
    where: {
      storeId,
      trigger,
      isActive: true,
    },
    include: {
      emails: {
        orderBy: { stepOrder: 'asc' },
      },
    },
  })

  if (automations.length === 0) {
    console.log(`No active automations found for trigger: ${trigger}`)
    return null
  }

  // Create execution record for each automation
  const executions = await Promise.all(
    automations.map(async (automation) => {
      const firstStep = automation.emails[0]
      if (!firstStep) return null

      const execution = await prisma.automationExecution.create({
        data: {
          automationId: automation.id,
          storeId,
          customerId,
          email,
          contextData,
          currentStep: 0,
          status: AutomationExecutionStatus.PENDING,
          nextStepAt: new Date(Date.now() + firstStep.delayMinutes * 60 * 1000),
        },
      })

      // Increment trigger count
      await prisma.emailAutomation.update({
        where: { id: automation.id },
        data: { triggered: { increment: 1 } },
      })

      return execution
    })
  )

  return executions.filter(Boolean)
}

/**
 * Process pending automation executions
 * This should be called by a cron job regularly
 */
export async function processAutomationExecutions() {
  const now = new Date()

  // Find executions ready to be processed
  const executions = await prisma.automationExecution.findMany({
    where: {
      status: {
        in: [AutomationExecutionStatus.PENDING, AutomationExecutionStatus.RUNNING],
      },
      nextStepAt: {
        lte: now,
      },
    },
  })

  console.log(`Processing ${executions.length} automation executions`)

  for (const execution of executions) {
    try {
      // Fetch the automation with its steps
      const automation = await prisma.emailAutomation.findUnique({
        where: { id: execution.automationId },
        include: {
          emails: {
            orderBy: { stepOrder: 'asc' },
          },
        },
      })

      if (!automation) {
        console.error(`Automation ${execution.automationId} not found for execution ${execution.id}`)
        continue
      }

      await processExecutionStep({ ...execution, automation })
    } catch (error) {
      console.error(`Failed to process execution ${execution.id}:`, error)
      await prisma.automationExecution.update({
        where: { id: execution.id },
        data: { status: AutomationExecutionStatus.FAILED },
      })
    }
  }
}

/**
 * Process a single step in an automation execution
 */
async function processExecutionStep(execution: any) {
  const { automation, currentStep, contextData, email } = execution
  const nextStepNumber = currentStep + 1
  const step = automation.emails.find((s: any) => s.stepOrder === nextStepNumber)

  if (!step) {
    // No more steps, mark as completed
    await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: AutomationExecutionStatus.COMPLETED,
        completedAt: new Date(),
      },
    })

    // Increment completion count
    await prisma.emailAutomation.update({
      where: { id: automation.id },
      data: { completed: { increment: 1 } },
    })

    console.log(`Automation execution ${execution.id} completed`)
    return
  }

  // Check conditions if present
  if (step.conditions && !evaluateConditions(step.conditions, contextData)) {
    console.log(`Step ${step.stepOrder} conditions not met, skipping`)
    // Move to next step without sending
    const nextStep = automation.emails.find((s: any) => s.stepOrder === nextStepNumber + 1)
    if (nextStep) {
      await prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          currentStep: nextStepNumber,
          nextStepAt: new Date(Date.now() + nextStep.delayMinutes * 60 * 1000),
          status: AutomationExecutionStatus.RUNNING,
        },
      })
    } else {
      await prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: AutomationExecutionStatus.COMPLETED,
          completedAt: new Date(),
        },
      })
    }
    return
  }

  // Replace variables in email content
  const subject = replaceVariables(step.subject, contextData)
  const htmlBody = replaceVariables(step.htmlBody, contextData)
  const textBody = step.textBody ? replaceVariables(step.textBody, contextData) : undefined

  // Send the email using transporter directly
  const transporter = getTransporter()
  if (!transporter) {
    throw new Error('Email transporter not configured')
  }

  const fromAddress = getFromAddress()

  await transporter.sendMail({
    from: `${fromAddress.name} <${fromAddress.address}>`,
    to: email,
    subject,
    html: htmlBody,
    text: textBody,
  })

  console.log(`Sent automation email: ${automation.name} - Step ${step.stepOrder} to ${email}`)

  // Schedule next step or mark as completed
  const nextStep = automation.emails.find((s: any) => s.stepOrder === nextStepNumber + 1)

  if (nextStep) {
    await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        currentStep: nextStepNumber,
        nextStepAt: new Date(Date.now() + nextStep.delayMinutes * 60 * 1000),
        status: AutomationExecutionStatus.RUNNING,
      },
    })
  } else {
    await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        currentStep: nextStepNumber,
        status: AutomationExecutionStatus.COMPLETED,
        completedAt: new Date(),
      },
    })

    // Increment completion count
    await prisma.emailAutomation.update({
      where: { id: automation.id },
      data: { completed: { increment: 1 } },
    })
  }
}

/**
 * Replace variables in text with context data
 */
function replaceVariables(text: string, context: Record<string, any>): string {
  let result = text

  // Replace {{variable}} patterns
  const variablePattern = /\{\{([^}]+)\}\}/g
  result = result.replace(variablePattern, (match, key) => {
    const trimmedKey = key.trim()
    const value = getNestedValue(context, trimmedKey)
    return value !== undefined ? String(value) : match
  })

  return result
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Evaluate conditions (simple implementation)
 */
function evaluateConditions(conditions: any, context: Record<string, any>): boolean {
  // Simple condition evaluation
  // Example: { "field": "order.total", "operator": "gt", "value": 10000 }
  if (conditions.field && conditions.operator && conditions.value !== undefined) {
    const fieldValue = getNestedValue(context, conditions.field)

    switch (conditions.operator) {
      case 'eq':
        return fieldValue === conditions.value
      case 'ne':
        return fieldValue !== conditions.value
      case 'gt':
        return fieldValue > conditions.value
      case 'gte':
        return fieldValue >= conditions.value
      case 'lt':
        return fieldValue < conditions.value
      case 'lte':
        return fieldValue <= conditions.value
      case 'contains':
        return String(fieldValue).includes(String(conditions.value))
      default:
        return true
    }
  }

  return true
}

/**
 * Trigger welcome series automation
 */
export async function triggerWelcomeSeries(params: {
  storeId: string
  email: string
  customerId?: string
  customerName?: string
}) {
  return triggerAutomation({
    storeId: params.storeId,
    trigger: AutomationTrigger.WELCOME_SERIES,
    email: params.email,
    customerId: params.customerId,
    contextData: {
      customerName: params.customerName || 'Customer',
      email: params.email,
    },
  })
}

/**
 * Trigger abandoned cart automation
 */
export async function triggerAbandonedCartAutomation(params: {
  storeId: string
  customerId?: string
  email: string
  cartId: string
  cartItems: any[]
  cartTotal: number
  checkoutUrl: string
}) {
  return triggerAutomation({
    storeId: params.storeId,
    trigger: AutomationTrigger.ABANDONED_CART,
    email: params.email,
    customerId: params.customerId,
    contextData: {
      cartId: params.cartId,
      items: params.cartItems,
      total: params.cartTotal,
      checkoutUrl: params.checkoutUrl,
      email: params.email,
    },
  })
}

/**
 * Trigger post-purchase automation
 */
export async function triggerPostPurchaseAutomation(params: {
  storeId: string
  customerId?: string
  email: string
  orderNumber: string
  orderTotal: number
  orderItems: any[]
}) {
  return triggerAutomation({
    storeId: params.storeId,
    trigger: AutomationTrigger.POST_PURCHASE,
    email: params.email,
    customerId: params.customerId,
    contextData: {
      orderNumber: params.orderNumber,
      orderTotal: params.orderTotal,
      items: params.orderItems,
      email: params.email,
    },
  })
}

/**
 * Trigger re-engagement automation
 */
export async function triggerReEngagementAutomation(params: {
  storeId: string
  customerId: string
  email: string
  customerName?: string
  lastOrderDate?: Date
}) {
  return triggerAutomation({
    storeId: params.storeId,
    trigger: AutomationTrigger.RE_ENGAGEMENT,
    email: params.email,
    customerId: params.customerId,
    contextData: {
      customerName: params.customerName || 'Customer',
      email: params.email,
      lastOrderDate: params.lastOrderDate,
      daysSinceLastOrder: params.lastOrderDate
        ? Math.floor((Date.now() - params.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    },
  })
}
