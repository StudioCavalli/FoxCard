/**
 * Subscription Management System
 * Handles subscription products, recurring billing, trials, and lifecycle
 */

import { prisma } from '@/lib/prisma'

// Types
export type BillingInterval = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED'

export interface SubscriptionPlan {
  id: string
  productId: string
  name: string
  description?: string
  price: number
  interval: BillingInterval
  intervalCount: number // e.g., 2 months = interval: MONTH, intervalCount: 2
  trialPeriodDays?: number
  features: string[]
  setupFee?: number
  active: boolean
  metadata?: Record<string, unknown>
}

export interface Subscription {
  id: string
  storeId: string
  customerId: string
  customerEmail: string
  planId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialStart?: Date
  trialEnd?: Date
  cancelAtPeriodEnd: boolean
  cancelledAt?: Date
  pausedAt?: Date
  resumeAt?: Date
  createdAt: Date
  updatedAt: Date
  paymentMethodId?: string
  lastPaymentAt?: Date
  nextBillingAt: Date
  failedPayments: number
}

export interface SubscriptionInvoice {
  id: string
  subscriptionId: string
  amount: number
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE'
  periodStart: Date
  periodEnd: Date
  dueDate: Date
  paidAt?: Date
  attemptCount: number
  lastAttemptAt?: Date
  createdAt: Date
}

// Billing interval labels
export const BILLING_INTERVAL_LABELS: Record<BillingInterval, string> = {
  DAY: 'jour',
  WEEK: 'semaine',
  MONTH: 'mois',
  YEAR: 'an',
}

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIALING: 'Période d\'essai',
  ACTIVE: 'Actif',
  PAST_DUE: 'En retard de paiement',
  CANCELLED: 'Annulé',
  PAUSED: 'En pause',
  EXPIRED: 'Expiré',
}

// Plan Management
export async function getSubscriptionPlans(storeId: string): Promise<SubscriptionPlan[]> {
  const products = await prisma.product.findMany({
    where: {
      storeId,
      status: 'ACTIVE',
    },
    orderBy: { name: 'asc' },
  })

  const plans: SubscriptionPlan[] = []

  for (const product of products) {
    const attributes = (product.attributes as Record<string, unknown>) || {}
    const subscriptionPlans = (attributes.subscriptionPlans as SubscriptionPlan[]) || []

    for (const plan of subscriptionPlans) {
      if (plan.active) {
        plans.push({
          ...plan,
          productId: product.id,
        })
      }
    }
  }

  return plans
}

export async function getSubscriptionPlan(
  storeId: string,
  planId: string
): Promise<SubscriptionPlan | null> {
  const plans = await getSubscriptionPlans(storeId)
  return plans.find((p) => p.id === planId) || null
}

export async function createSubscriptionPlan(
  storeId: string,
  productId: string,
  plan: Omit<SubscriptionPlan, 'id' | 'productId'>
): Promise<SubscriptionPlan | null> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
  })

  if (!product) return null

  const attributes = (product.attributes as Record<string, unknown>) || {}
  const plans = (attributes.subscriptionPlans as SubscriptionPlan[]) || []

  const newPlan: SubscriptionPlan = {
    ...plan,
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    productId,
  }

  plans.push(newPlan)

  await prisma.product.update({
    where: { id: productId },
    data: {
      attributes: JSON.parse(JSON.stringify({
        ...attributes,
        subscriptionPlans: plans,
      })),
    },
  })

  return newPlan
}

export async function updateSubscriptionPlan(
  storeId: string,
  productId: string,
  planId: string,
  updates: Partial<SubscriptionPlan>
): Promise<SubscriptionPlan | null> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
  })

  if (!product) return null

  const attributes = (product.attributes as Record<string, unknown>) || {}
  const plans = (attributes.subscriptionPlans as SubscriptionPlan[]) || []

  const index = plans.findIndex((p) => p.id === planId)
  if (index === -1) return null

  plans[index] = { ...plans[index], ...updates }

  await prisma.product.update({
    where: { id: productId },
    data: {
      attributes: JSON.parse(JSON.stringify({
        ...attributes,
        subscriptionPlans: plans,
      })),
    },
  })

  return plans[index]
}

export async function deleteSubscriptionPlan(
  storeId: string,
  productId: string,
  planId: string
): Promise<boolean> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
  })

  if (!product) return false

  const attributes = (product.attributes as Record<string, unknown>) || {}
  const plans = (attributes.subscriptionPlans as SubscriptionPlan[]) || []

  const newPlans = plans.filter((p) => p.id !== planId)

  if (newPlans.length === plans.length) return false

  await prisma.product.update({
    where: { id: productId },
    data: {
      attributes: JSON.parse(JSON.stringify({
        ...attributes,
        subscriptionPlans: newPlans,
      })),
    },
  })

  return true
}

// Subscription Management (stored in store.settings)
export async function getSubscriptions(storeId: string): Promise<Subscription[]> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  if (!store?.settings) return []

  const settings = store.settings as Record<string, unknown>
  const subscriptions = (settings.subscriptions as Subscription[]) || []

  return subscriptions.map((s) => ({
    ...s,
    currentPeriodStart: new Date(s.currentPeriodStart),
    currentPeriodEnd: new Date(s.currentPeriodEnd),
    trialStart: s.trialStart ? new Date(s.trialStart) : undefined,
    trialEnd: s.trialEnd ? new Date(s.trialEnd) : undefined,
    cancelledAt: s.cancelledAt ? new Date(s.cancelledAt) : undefined,
    pausedAt: s.pausedAt ? new Date(s.pausedAt) : undefined,
    resumeAt: s.resumeAt ? new Date(s.resumeAt) : undefined,
    lastPaymentAt: s.lastPaymentAt ? new Date(s.lastPaymentAt) : undefined,
    nextBillingAt: new Date(s.nextBillingAt),
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  }))
}

export async function getSubscription(
  storeId: string,
  subscriptionId: string
): Promise<Subscription | null> {
  const subscriptions = await getSubscriptions(storeId)
  return subscriptions.find((s) => s.id === subscriptionId) || null
}

export async function getCustomerSubscriptions(
  storeId: string,
  customerId: string
): Promise<Subscription[]> {
  const subscriptions = await getSubscriptions(storeId)
  return subscriptions.filter((s) => s.customerId === customerId)
}

export async function createSubscription(
  storeId: string,
  data: {
    customerId: string
    customerEmail: string
    planId: string
    paymentMethodId?: string
    startTrial?: boolean
  }
): Promise<Subscription | null> {
  const plan = await getSubscriptionPlan(storeId, data.planId)
  if (!plan) return null

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  if (!store) return null

  const settings = (store.settings as Record<string, unknown>) || {}
  const subscriptions = (settings.subscriptions as Subscription[]) || []

  const now = new Date()
  const hasTrial = data.startTrial && plan.trialPeriodDays && plan.trialPeriodDays > 0
  const trialEnd = hasTrial
    ? new Date(now.getTime() + (plan.trialPeriodDays! * 24 * 60 * 60 * 1000))
    : undefined

  const periodEnd = calculateNextBillingDate(
    hasTrial ? trialEnd! : now,
    plan.interval,
    plan.intervalCount
  )

  const newSubscription: Subscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    storeId,
    customerId: data.customerId,
    customerEmail: data.customerEmail,
    planId: data.planId,
    plan,
    status: hasTrial ? 'TRIALING' : 'ACTIVE',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    trialStart: hasTrial ? now : undefined,
    trialEnd: trialEnd,
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
    paymentMethodId: data.paymentMethodId,
    nextBillingAt: hasTrial ? trialEnd! : periodEnd,
    failedPayments: 0,
  }

  subscriptions.push(newSubscription)

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        subscriptions,
      })),
    },
  })

  return newSubscription
}

export async function updateSubscription(
  storeId: string,
  subscriptionId: string,
  updates: Partial<Pick<Subscription, 'status' | 'cancelAtPeriodEnd' | 'pausedAt' | 'resumeAt' | 'paymentMethodId'>>
): Promise<Subscription | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  if (!store?.settings) return null

  const settings = store.settings as Record<string, unknown>
  const subscriptions = (settings.subscriptions as Subscription[]) || []

  const index = subscriptions.findIndex((s) => s.id === subscriptionId)
  if (index === -1) return null

  subscriptions[index] = {
    ...subscriptions[index],
    ...updates,
    updatedAt: new Date(),
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        subscriptions,
      })),
    },
  })

  return {
    ...subscriptions[index],
    currentPeriodStart: new Date(subscriptions[index].currentPeriodStart),
    currentPeriodEnd: new Date(subscriptions[index].currentPeriodEnd),
    createdAt: new Date(subscriptions[index].createdAt),
    updatedAt: new Date(subscriptions[index].updatedAt),
    nextBillingAt: new Date(subscriptions[index].nextBillingAt),
  }
}

export async function cancelSubscription(
  storeId: string,
  subscriptionId: string,
  immediately: boolean = false
): Promise<Subscription | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  if (!store?.settings) return null

  const settings = store.settings as Record<string, unknown>
  const subscriptions = (settings.subscriptions as Subscription[]) || []

  const index = subscriptions.findIndex((s) => s.id === subscriptionId)
  if (index === -1) return null

  const now = new Date()

  if (immediately) {
    subscriptions[index] = {
      ...subscriptions[index],
      status: 'CANCELLED',
      cancelledAt: now,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    }
  } else {
    subscriptions[index] = {
      ...subscriptions[index],
      cancelAtPeriodEnd: true,
      updatedAt: now,
    }
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        subscriptions,
      })),
    },
  })

  return {
    ...subscriptions[index],
    currentPeriodStart: new Date(subscriptions[index].currentPeriodStart),
    currentPeriodEnd: new Date(subscriptions[index].currentPeriodEnd),
    createdAt: new Date(subscriptions[index].createdAt),
    updatedAt: new Date(subscriptions[index].updatedAt),
    nextBillingAt: new Date(subscriptions[index].nextBillingAt),
  }
}

export async function pauseSubscription(
  storeId: string,
  subscriptionId: string,
  resumeAt?: Date
): Promise<Subscription | null> {
  const now = new Date()

  return updateSubscription(storeId, subscriptionId, {
    status: 'PAUSED',
    pausedAt: now,
    resumeAt,
  })
}

export async function resumeSubscription(
  storeId: string,
  subscriptionId: string
): Promise<Subscription | null> {
  return updateSubscription(storeId, subscriptionId, {
    status: 'ACTIVE',
    pausedAt: undefined,
    resumeAt: undefined,
  })
}

export async function changePlan(
  storeId: string,
  subscriptionId: string,
  newPlanId: string,
  prorate: boolean = true
): Promise<{ subscription: Subscription; proration: number } | null> {
  const subscription = await getSubscription(storeId, subscriptionId)
  if (!subscription) return null

  const newPlan = await getSubscriptionPlan(storeId, newPlanId)
  if (!newPlan) return null

  const oldPlan = subscription.plan
  let proration = 0

  if (prorate) {
    // Calculate proration
    const now = new Date()
    const periodDuration = subscription.currentPeriodEnd.getTime() - subscription.currentPeriodStart.getTime()
    const remaining = subscription.currentPeriodEnd.getTime() - now.getTime()
    const remainingRatio = Math.max(0, remaining / periodDuration)

    // Credit for unused old plan
    const oldCredit = oldPlan.price * remainingRatio

    // Charge for new plan's remaining period
    const newCharge = newPlan.price * remainingRatio

    proration = Math.round((newCharge - oldCredit) * 100) / 100
  }

  // Update subscription
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  if (!store?.settings) return null

  const settings = store.settings as Record<string, unknown>
  const subscriptions = (settings.subscriptions as Subscription[]) || []

  const index = subscriptions.findIndex((s) => s.id === subscriptionId)
  if (index === -1) return null

  subscriptions[index] = {
    ...subscriptions[index],
    planId: newPlanId,
    plan: newPlan,
    updatedAt: new Date(),
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        subscriptions,
      })),
    },
  })

  return {
    subscription: {
      ...subscriptions[index],
      currentPeriodStart: new Date(subscriptions[index].currentPeriodStart),
      currentPeriodEnd: new Date(subscriptions[index].currentPeriodEnd),
      createdAt: new Date(subscriptions[index].createdAt),
      updatedAt: new Date(subscriptions[index].updatedAt),
      nextBillingAt: new Date(subscriptions[index].nextBillingAt),
    },
    proration,
  }
}

// Billing Helpers
export function calculateNextBillingDate(
  fromDate: Date,
  interval: BillingInterval,
  intervalCount: number
): Date {
  const date = new Date(fromDate)

  switch (interval) {
    case 'DAY':
      date.setDate(date.getDate() + intervalCount)
      break
    case 'WEEK':
      date.setDate(date.getDate() + (intervalCount * 7))
      break
    case 'MONTH':
      date.setMonth(date.getMonth() + intervalCount)
      break
    case 'YEAR':
      date.setFullYear(date.getFullYear() + intervalCount)
      break
  }

  return date
}

export function formatBillingInterval(interval: BillingInterval, count: number): string {
  const label = BILLING_INTERVAL_LABELS[interval]
  if (count === 1) {
    return `par ${label}`
  }
  return `tous les ${count} ${label}s`
}

export function calculateSubscriptionPrice(
  plan: SubscriptionPlan,
  includeSetupFee: boolean = false
): { price: number; setupFee: number; total: number } {
  const setupFee = includeSetupFee ? (plan.setupFee || 0) : 0
  return {
    price: plan.price,
    setupFee,
    total: plan.price + setupFee,
  }
}

// Statistics
export async function getSubscriptionStats(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalSubscriptions: number
  activeSubscriptions: number
  trialingSubscriptions: number
  cancelledSubscriptions: number
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  churnRate: number
  averageRevenue: number
  subscriptionsByPlan: { planId: string; planName: string; count: number }[]
  recentCancellations: number
}> {
  const subscriptions = await getSubscriptions(storeId)

  const total = subscriptions.length
  const active = subscriptions.filter((s) => s.status === 'ACTIVE').length
  const trialing = subscriptions.filter((s) => s.status === 'TRIALING').length
  const cancelled = subscriptions.filter((s) => s.status === 'CANCELLED').length

  // Calculate MRR
  let mrr = 0
  for (const sub of subscriptions) {
    if (sub.status === 'ACTIVE' || sub.status === 'TRIALING') {
      const monthlyPrice = convertToMonthly(sub.plan.price, sub.plan.interval, sub.plan.intervalCount)
      mrr += monthlyPrice
    }
  }

  // Count recent cancellations (within date range)
  const recentCancellations = subscriptions.filter((s) => {
    if (s.status !== 'CANCELLED' || !s.cancelledAt) return false
    const cancelDate = new Date(s.cancelledAt)
    return cancelDate >= startDate && cancelDate <= endDate
  }).length

  // Calculate churn rate
  const churnRate = active > 0 ? (recentCancellations / (active + recentCancellations)) * 100 : 0

  // Subscriptions by plan
  const planCounts: Record<string, { count: number; name: string }> = {}
  for (const sub of subscriptions) {
    if (!planCounts[sub.planId]) {
      planCounts[sub.planId] = { count: 0, name: sub.plan.name }
    }
    planCounts[sub.planId].count++
  }

  const subscriptionsByPlan = Object.entries(planCounts).map(([planId, data]) => ({
    planId,
    planName: data.name,
    count: data.count,
  }))

  return {
    totalSubscriptions: total,
    activeSubscriptions: active,
    trialingSubscriptions: trialing,
    cancelledSubscriptions: cancelled,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(mrr * 12 * 100) / 100,
    churnRate: Math.round(churnRate * 100) / 100,
    averageRevenue: active > 0 ? Math.round((mrr / active) * 100) / 100 : 0,
    subscriptionsByPlan,
    recentCancellations,
  }
}

function convertToMonthly(price: number, interval: BillingInterval, intervalCount: number): number {
  switch (interval) {
    case 'DAY':
      return price * (30 / intervalCount)
    case 'WEEK':
      return price * (4.33 / intervalCount)
    case 'MONTH':
      return price / intervalCount
    case 'YEAR':
      return price / (12 * intervalCount)
    default:
      return price
  }
}

// Webhook Handlers for Payment Integration
export async function handlePaymentSuccess(
  storeId: string,
  subscriptionId: string
): Promise<Subscription | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  if (!store?.settings) return null

  const settings = store.settings as Record<string, unknown>
  const subscriptions = (settings.subscriptions as Subscription[]) || []

  const index = subscriptions.findIndex((s) => s.id === subscriptionId)
  if (index === -1) return null

  const sub = subscriptions[index]
  const now = new Date()
  const newPeriodEnd = calculateNextBillingDate(
    new Date(sub.currentPeriodEnd),
    sub.plan.interval,
    sub.plan.intervalCount
  )

  subscriptions[index] = {
    ...sub,
    status: 'ACTIVE',
    currentPeriodStart: sub.currentPeriodEnd,
    currentPeriodEnd: newPeriodEnd,
    nextBillingAt: newPeriodEnd,
    lastPaymentAt: now,
    failedPayments: 0,
    updatedAt: now,
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        subscriptions,
      })),
    },
  })

  return {
    ...subscriptions[index],
    currentPeriodStart: new Date(subscriptions[index].currentPeriodStart),
    currentPeriodEnd: new Date(subscriptions[index].currentPeriodEnd),
    createdAt: new Date(subscriptions[index].createdAt),
    updatedAt: new Date(subscriptions[index].updatedAt),
    nextBillingAt: new Date(subscriptions[index].nextBillingAt),
  }
}

export async function handlePaymentFailure(
  storeId: string,
  subscriptionId: string
): Promise<Subscription | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  if (!store?.settings) return null

  const settings = store.settings as Record<string, unknown>
  const subscriptions = (settings.subscriptions as Subscription[]) || []

  const index = subscriptions.findIndex((s) => s.id === subscriptionId)
  if (index === -1) return null

  const sub = subscriptions[index]
  const failedPayments = (sub.failedPayments || 0) + 1
  const now = new Date()

  // Mark as past due after 3 failures
  const newStatus = failedPayments >= 3 ? 'PAST_DUE' : sub.status

  subscriptions[index] = {
    ...sub,
    status: newStatus,
    failedPayments,
    updatedAt: now,
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        subscriptions,
      })),
    },
  })

  return {
    ...subscriptions[index],
    currentPeriodStart: new Date(subscriptions[index].currentPeriodStart),
    currentPeriodEnd: new Date(subscriptions[index].currentPeriodEnd),
    createdAt: new Date(subscriptions[index].createdAt),
    updatedAt: new Date(subscriptions[index].updatedAt),
    nextBillingAt: new Date(subscriptions[index].nextBillingAt),
  }
}

// Process due subscriptions (to be called by cron job)
export async function processDueSubscriptions(storeId: string): Promise<{
  processed: number
  renewed: number
  cancelled: number
  failed: number
}> {
  const subscriptions = await getSubscriptions(storeId)
  const now = new Date()

  let processed = 0
  let renewed = 0
  let cancelled = 0
  let failed = 0

  for (const sub of subscriptions) {
    if (sub.nextBillingAt <= now) {
      processed++

      // Check if trial ended
      if (sub.status === 'TRIALING' && sub.trialEnd && sub.trialEnd <= now) {
        // Trial ended, needs first payment
        // In real implementation, would attempt charge here
        renewed++
        continue
      }

      // Check if should be cancelled at period end
      if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd <= now) {
        await cancelSubscription(storeId, sub.id, true)
        cancelled++
        continue
      }

      // Check if paused and should resume
      if (sub.status === 'PAUSED' && sub.resumeAt && sub.resumeAt <= now) {
        await resumeSubscription(storeId, sub.id)
        renewed++
        continue
      }

      // Normal renewal - in real implementation, would attempt charge
      // For now, just mark as renewed
      if (sub.status === 'ACTIVE') {
        await handlePaymentSuccess(storeId, sub.id)
        renewed++
      }
    }
  }

  return { processed, renewed, cancelled, failed }
}
