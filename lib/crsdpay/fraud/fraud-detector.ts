/**
 * Fraud Detector - Système de détection de fraude
 * Analyse les transactions pour détecter les comportements suspects
 */

import { prisma } from '@/lib/prisma'
import { FraudCheckResult, FraudDecision } from '../types'

/**
 * Options pour la vérification anti-fraude
 */
export interface FraudCheckOptions {
  transactionId: string
  amount: number
  customerIP?: string
  userAgent?: string
  deviceFingerprint?: string
  customerId?: string | null
}

/**
 * Effectue une vérification anti-fraude sur une transaction
 */
export async function performFraudCheck(
  options: FraudCheckOptions
): Promise<FraudCheckResult> {
  const riskFactors: string[] = []
  let riskScore = 0

  // 1. Vérifier l'IP
  if (options.customerIP) {
    const ipRisk = await checkIPRisk(options.customerIP)
    if (ipRisk.isRisky) {
      riskScore += 30
      riskFactors.push(...ipRisk.factors)
    }
  }

  // 2. Vérifier la vélocité des transactions (combien de transactions récentes)
  if (options.customerId) {
    const velocityRisk = await checkVelocity(options.customerId)
    if (velocityRisk.isRisky) {
      riskScore += 40
      riskFactors.push(...velocityRisk.factors)
    }
  } else {
    // Pas de customer ID = risque accru
    riskScore += 10
    riskFactors.push('no_customer_id')
  }

  // 3. Vérifier le montant (les gros montants sont plus risqués)
  if (options.amount > 100000) {
    // > 1000 EUR
    riskScore += 20
    riskFactors.push('high_amount')
  }

  // 4. Vérifier si plusieurs tentatives avec le même device fingerprint
  if (options.deviceFingerprint) {
    const deviceRisk = await checkDeviceFingerprint(options.deviceFingerprint)
    if (deviceRisk.isRisky) {
      riskScore += 25
      riskFactors.push(...deviceRisk.factors)
    }
  }

  // 5. Déterminer la décision finale
  let decision: FraudDecision
  const transaction = await prisma.crsdpayTransaction.findUnique({
    where: { id: options.transactionId },
    include: {
      store: {
        include: {
          crsdpayConfig: true,
        },
      },
    },
  })

  const threshold = transaction?.store.crsdpayConfig?.riskScoreThreshold || 75

  if (riskScore >= threshold) {
    decision = 'decline'
  } else if (riskScore >= threshold * 0.7) {
    decision = 'review'
  } else {
    decision = 'approve'
  }

  // 6. Enregistrer le fraud check
  await prisma.crsdpayFraudCheck.create({
    data: {
      transactionId: options.transactionId,
      riskScore,
      decision,
      riskFactors,
      ipAddress: options.customerIP,
      metadata: {
        userAgent: options.userAgent,
        deviceFingerprint: options.deviceFingerprint,
      },
    },
  })

  return {
    riskScore,
    decision,
    riskFactors,
    metadata: {
      threshold,
    },
  }
}

/**
 * Vérifie le risque lié à une IP
 */
async function checkIPRisk(ip: string): Promise<{ isRisky: boolean; factors: string[] }> {
  const factors: string[] = []

  // 1. Vérifier si l'IP est dans une blacklist
  // En production, intégration avec des services comme MaxMind, IPQualityScore, etc.

  // 2. Vérifier le nombre de transactions échouées avec cette IP
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const failedTransactions = await prisma.crsdpayTransaction.count({
    where: {
      customerIP: ip,
      status: 'failed',
      createdAt: {
        gte: last24h,
      },
    },
  })

  if (failedTransactions >= 5) {
    factors.push('high_failure_rate_ip')
  }

  // 3. Vérifier si c'est un proxy/VPN
  // En production, utiliser un service de détection de proxy
  if (isKnownProxyIP(ip)) {
    factors.push('proxy_ip')
  }

  return {
    isRisky: factors.length > 0,
    factors,
  }
}

/**
 * Vérifie la vélocité des transactions d'un customer
 */
async function checkVelocity(
  customerId: string
): Promise<{ isRisky: boolean; factors: string[] }> {
  const factors: string[] = []
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const last1h = new Date(Date.now() - 60 * 60 * 1000)

  // 1. Compter les transactions des dernières 24h
  const transactionsLast24h = await prisma.crsdpayTransaction.count({
    where: {
      customerId,
      createdAt: {
        gte: last24h,
      },
    },
  })

  if (transactionsLast24h >= 10) {
    factors.push('velocity_abuse_24h')
  }

  // 2. Compter les transactions de la dernière heure
  const transactionsLast1h = await prisma.crsdpayTransaction.count({
    where: {
      customerId,
      createdAt: {
        gte: last1h,
      },
    },
  })

  if (transactionsLast1h >= 5) {
    factors.push('velocity_abuse_1h')
  }

  // 3. Calculer le montant total des 24 dernières heures
  const result = await prisma.crsdpayTransaction.aggregate({
    where: {
      customerId,
      createdAt: {
        gte: last24h,
      },
    },
    _sum: {
      amount: true,
    },
  })

  const totalAmount = result._sum.amount || 0
  if (totalAmount > 500000) {
    // > 5000 EUR
    factors.push('high_amount_24h')
  }

  return {
    isRisky: factors.length > 0,
    factors,
  }
}

/**
 * Vérifie le risque lié à un device fingerprint
 */
async function checkDeviceFingerprint(
  fingerprint: string
): Promise<{ isRisky: boolean; factors: string[] }> {
  const factors: string[] = []
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // 1. Vérifier le nombre de transactions avec ce device
  const transactionCount = await prisma.crsdpayTransaction.count({
    where: {
      deviceFingerprint: fingerprint,
      createdAt: {
        gte: last24h,
      },
    },
  })

  if (transactionCount >= 10) {
    factors.push('device_velocity_abuse')
  }

  // 2. Vérifier le nombre de customers différents avec ce device
  const customers = await prisma.crsdpayTransaction.findMany({
    where: {
      deviceFingerprint: fingerprint,
      createdAt: {
        gte: last24h,
      },
    },
    select: {
      customerId: true,
    },
    distinct: ['customerId'],
  })

  if (customers.length >= 5) {
    factors.push('multiple_customers_same_device')
  }

  return {
    isRisky: factors.length > 0,
    factors,
  }
}

/**
 * Vérifie si une IP est un proxy/VPN connu
 * En production, intégrer avec un service de détection
 */
function isKnownProxyIP(ip: string): boolean {
  // Liste de base de proxies connus
  const knownProxies = ['127.0.0.1', '::1']
  return knownProxies.includes(ip)
}

/**
 * Calcule un score de risque pour un email
 */
export async function calculateEmailRiskScore(email: string): Promise<number> {
  let score = 0

  // 1. Vérifier si c'est un email jetable
  const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com']
  const domain = email.split('@')[1]

  if (disposableDomains.includes(domain)) {
    score += 50
  }

  // 2. Vérifier le nombre de transactions échouées avec cet email
  const failedTransactions = await prisma.crsdpayTransaction.count({
    where: {
      customer: {
        email,
      },
      status: 'failed',
    },
  })

  if (failedTransactions >= 3) {
    score += 30
  }

  return Math.min(score, 100)
}
