import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { prisma } from '@/lib/prisma'
import { TRPCError } from '@trpc/server'
import crypto from 'crypto'

// Helper to generate unique IDs
function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(4).toString('hex')
  return `${prefix}-${timestamp}-${random}`.toUpperCase()
}

// Helper to detect card brand from BIN
function detectCardBrand(cardNumber: string): string {
  const bin = cardNumber.replace(/\s/g, '').substring(0, 6)

  if (/^4/.test(bin)) return 'VISA'
  if (/^5[1-5]/.test(bin) || /^2[2-7]/.test(bin)) return 'MASTERCARD'
  if (/^3[47]/.test(bin)) return 'AMEX'
  if (/^6(?:011|5)/.test(bin)) return 'DISCOVER'
  if (/^3(?:0[0-5]|[68])/.test(bin)) return 'DINERS'
  if (/^35/.test(bin)) return 'JCB'
  if (/^62/.test(bin)) return 'UNIONPAY'

  return 'UNKNOWN'
}

// Luhn algorithm for card number validation
function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '')

  // Check length (13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) return false

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// Get encryption key from environment (for PCI DSS compliance)
function getEncryptionKey(): string {
  const key = process.env.PAYMENT_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY
  if (!key || key.length < 64) {
    console.error('SECURITY WARNING: Encryption key not properly configured')
    // In production, this should throw an error
    // For development, generate a temporary key
    return crypto.randomBytes(32).toString('hex')
  }
  return key
}

// Helper to calculate risk score
function calculateRiskScore(params: {
  amount: number
  ipAddress?: string
  deviceFingerprint?: string
  cardCountry?: string
  billingCountry?: string
  isNewCard: boolean
  transactionCount24h: number
}): { score: number; flags: string[] } {
  let score = 0
  const flags: string[] = []

  // High amount
  if (params.amount > 50000) {
    score += 30
    flags.push('HIGH_AMOUNT')
  } else if (params.amount > 10000) {
    score += 15
    flags.push('ELEVATED_AMOUNT')
  }

  // New card
  if (params.isNewCard) {
    score += 10
    flags.push('NEW_CARD')
  }

  // Velocity check
  if (params.transactionCount24h > 5) {
    score += 25
    flags.push('HIGH_VELOCITY')
  } else if (params.transactionCount24h > 3) {
    score += 10
    flags.push('ELEVATED_VELOCITY')
  }

  // Country mismatch
  if (params.cardCountry && params.billingCountry && params.cardCountry !== params.billingCountry) {
    score += 20
    flags.push('COUNTRY_MISMATCH')
  }

  // Missing data
  if (!params.deviceFingerprint) {
    score += 5
    flags.push('NO_DEVICE_FINGERPRINT')
  }

  return {
    score: Math.min(score, 100),
    flags
  }
}

// Helper to determine risk level
function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 70) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 30) return 'MEDIUM'
  return 'LOW'
}

export const paymentGatewayRouter = router({
  // =====================
  // CONFIGURATION
  // =====================

  // Get gateway configuration
  getConfig: protectedProcedure
    .input(z.object({
      storeId: z.string()
    }))
    .query(async ({ input }) => {
      let config = await prisma.paymentGatewayConfig.findUnique({
        where: { storeId: input.storeId }
      })

      if (!config) {
        // Create default config
        config = await prisma.paymentGatewayConfig.create({
          data: {
            storeId: input.storeId,
            testPublicKey: `pk_test_${crypto.randomBytes(16).toString('hex')}`,
            testSecretKey: `sk_test_${crypto.randomBytes(16).toString('hex')}`
          }
        })
      }

      // Mask secret keys
      return {
        ...config,
        liveSecretKey: config.liveSecretKey ? '••••••••' : null,
        testSecretKey: config.testSecretKey ? '••••••••' : null
      }
    }),

  // Update gateway configuration
  updateConfig: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      isEnabled: z.boolean().optional(),
      testMode: z.boolean().optional(),
      threeDSEnabled: z.boolean().optional(),
      threeDSThreshold: z.number().optional(),
      maxRiskScore: z.number().min(0).max(100).optional(),
      velocityCheck: z.boolean().optional(),
      blockedCountries: z.array(z.string()).optional(),
      transactionFeePercent: z.number().min(0).max(10).optional(),
      transactionFeeFixed: z.number().min(0).optional(),
      payoutSchedule: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
      minimumPayout: z.number().min(0).optional(),
      webhookUrl: z.string().url().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { storeId, ...data } = input

      const config = await prisma.paymentGatewayConfig.upsert({
        where: { storeId },
        create: {
          storeId,
          ...data,
          testPublicKey: `pk_test_${crypto.randomBytes(16).toString('hex')}`,
          testSecretKey: `sk_test_${crypto.randomBytes(16).toString('hex')}`
        },
        update: data
      })

      // Audit log
      await prisma.paymentAuditLog.create({
        data: {
          storeId,
          action: 'CONFIG_UPDATED',
          details: data,
          actorType: 'admin'
        }
      })

      return config
    }),

  // =====================
  // CARD TOKENIZATION
  // =====================

  // Tokenize a card (would use encryption in production)
  // PCI DSS COMPLIANCE NOTE:
  // - CVV is validated but NEVER stored (as required by PCI DSS 3.2)
  // - Card number is hashed for fingerprinting, not stored in plain text
  // - Only last 4 digits are retained for display purposes
  tokenizeCard: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      customerId: z.string(),
      cardNumber: z.string().min(13).max(19),
      expiryMonth: z.number().min(1).max(12),
      expiryYear: z.number().min(2024),
      cvv: z.string().min(3).max(4),
      cardholderName: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Validate card number using Luhn algorithm
      if (!validateCardNumber(input.cardNumber)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Numéro de carte invalide'
        })
      }

      // Detect brand
      const brand = detectCardBrand(input.cardNumber)

      // Validate CVV format based on card brand (AMEX = 4 digits, others = 3)
      // NOTE: CVV is validated here but NEVER stored - this is a PCI DSS requirement
      const expectedCvvLength = brand === 'AMEX' ? 4 : 3
      if (input.cvv.length !== expectedCvvLength) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `CVV invalide pour ${brand}`
        })
      }

      // Get encryption key for secure operations
      const _encryptionKey = getEncryptionKey()

      // Generate fingerprint (hash of card number with salt)
      // Using encryption key as salt for additional security
      const fingerprint = crypto
        .createHash('sha256')
        .update(input.cardNumber + _encryptionKey)
        .digest('hex')

      // Check for existing card with same fingerprint
      const existing = await prisma.cardToken.findFirst({
        where: {
          storeId: input.storeId,
          customerId: input.customerId,
          fingerprint,
          isActive: true
        }
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Cette carte est déjà enregistrée'
        })
      }

      // Create token
      const token = await prisma.cardToken.create({
        data: {
          storeId: input.storeId,
          customerId: input.customerId,
          token: `tok_${crypto.randomBytes(16).toString('hex')}`,
          last4: input.cardNumber.slice(-4),
          brand: brand as any,
          expiryMonth: input.expiryMonth,
          expiryYear: input.expiryYear,
          cardholderName: input.cardholderName,
          fingerprint
        }
      })

      // Audit log
      await prisma.paymentAuditLog.create({
        data: {
          storeId: input.storeId,
          action: 'CARD_TOKENIZED',
          details: {
            tokenId: token.id,
            last4: token.last4,
            brand: token.brand
          },
          actorType: 'customer',
          actorId: input.customerId
        }
      })

      return {
        tokenId: token.id,
        token: token.token,
        last4: token.last4,
        brand: token.brand
      }
    }),

  // Get customer's saved cards
  getCustomerCards: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      customerId: z.string()
    }))
    .query(async ({ input }) => {
      return prisma.cardToken.findMany({
        where: {
          storeId: input.storeId,
          customerId: input.customerId,
          isActive: true
        },
        select: {
          id: true,
          token: true,
          last4: true,
          brand: true,
          expiryMonth: true,
          expiryYear: true,
          cardholderName: true,
          isDefault: true,
          lastUsedAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }),

  // Delete a card token
  deleteCard: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      tokenId: z.string()
    }))
    .mutation(async ({ input }) => {
      await prisma.cardToken.update({
        where: { id: input.tokenId },
        data: { isActive: false }
      })

      // Audit log
      await prisma.paymentAuditLog.create({
        data: {
          storeId: input.storeId,
          action: 'CARD_DELETED',
          details: { tokenId: input.tokenId },
          actorType: 'customer'
        }
      })

      return { success: true }
    }),

  // =====================
  // TRANSACTIONS
  // =====================

  // Create a payment transaction
  createTransaction: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      orderId: z.string().optional(),
      amount: z.number().positive(),
      currency: z.string().default('EUR'),
      paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'CRYPTO', 'WALLET']),
      cardTokenId: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      deviceFingerprint: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Get gateway config
      const config = await prisma.paymentGatewayConfig.findUnique({
        where: { storeId: input.storeId }
      })

      if (!config?.isEnabled) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Le gateway de paiement n\'est pas activé'
        })
      }

      // Check blocked countries
      // (would extract from IP in production)

      // Calculate fees
      const processingFee = (input.amount * config.transactionFeePercent / 100) + config.transactionFeeFixed

      // Check velocity
      const transactionCount24h = await prisma.paymentTransaction.count({
        where: {
          storeId: input.storeId,
          cardTokenId: input.cardTokenId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })

      // Calculate risk
      const { score, flags } = calculateRiskScore({
        amount: input.amount,
        ipAddress: input.ipAddress,
        deviceFingerprint: input.deviceFingerprint,
        isNewCard: !input.cardTokenId,
        transactionCount24h
      })

      // Check if blocked by risk
      if (score > config.maxRiskScore) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Transaction refusée pour raison de sécurité'
        })
      }

      // Check if 3DS required
      const threeDSRequired = config.threeDSEnabled &&
        (!config.threeDSThreshold || input.amount >= config.threeDSThreshold)

      // Create transaction
      const transaction = await prisma.paymentTransaction.create({
        data: {
          storeId: input.storeId,
          orderId: input.orderId,
          transactionId: generateId('TRX'),
          amount: input.amount,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          cardTokenId: input.cardTokenId,
          status: 'PENDING',
          threeDSRequired,
          riskScore: score,
          riskLevel: getRiskLevel(score),
          fraudFlags: flags,
          processingFee,
          netAmount: input.amount - processingFee,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          deviceFingerprint: input.deviceFingerprint
        }
      })

      // Audit log
      await prisma.paymentAuditLog.create({
        data: {
          storeId: input.storeId,
          transactionId: transaction.id,
          action: 'TRANSACTION_CREATED',
          details: {
            amount: input.amount,
            riskScore: score,
            riskLevel: getRiskLevel(score)
          },
          actorType: 'customer',
          ipAddress: input.ipAddress
        }
      })

      return transaction
    }),

  // Authorize transaction (after 3DS if required)
  authorizeTransaction: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
      threeDSResult: z.object({
        status: z.enum(['AUTHENTICATED', 'FAILED', 'REJECTED']),
        version: z.string()
      }).optional()
    }))
    .mutation(async ({ input }) => {
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: input.transactionId }
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction non trouvée'
        })
      }

      if (transaction.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Transaction déjà traitée'
        })
      }

      // Check 3DS result if required
      if (transaction.threeDSRequired && input.threeDSResult?.status !== 'AUTHENTICATED') {
        await prisma.paymentTransaction.update({
          where: { id: input.transactionId },
          data: {
            status: 'FAILED',
            threeDSStatus: input.threeDSResult?.status as any,
            failedAt: new Date()
          }
        })

        await prisma.paymentAuditLog.create({
          data: {
            storeId: transaction.storeId,
            transactionId: transaction.id,
            action: 'TRANSACTION_FAILED',
            details: { reason: '3DS_FAILED' },
            actorType: 'system'
          }
        })

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentification 3D Secure échouée'
        })
      }

      // Simulate bank authorization
      const authCode = crypto.randomBytes(3).toString('hex').toUpperCase()

      const updated = await prisma.paymentTransaction.update({
        where: { id: input.transactionId },
        data: {
          status: 'AUTHORIZED',
          threeDSStatus: input.threeDSResult?.status as any,
          threeDSVersion: input.threeDSResult?.version,
          authCode,
          responseCode: '00',
          responseMessage: 'Approved',
          authorizedAt: new Date()
        }
      })

      // Update card usage if applicable
      if (transaction.cardTokenId) {
        await prisma.cardToken.update({
          where: { id: transaction.cardTokenId },
          data: {
            lastUsedAt: new Date(),
            usageCount: { increment: 1 }
          }
        })
      }

      // Audit log
      await prisma.paymentAuditLog.create({
        data: {
          storeId: transaction.storeId,
          transactionId: transaction.id,
          action: 'TRANSACTION_AUTHORIZED',
          details: { authCode },
          actorType: 'system'
        }
      })

      return updated
    }),

  // Capture authorized transaction
  captureTransaction: protectedProcedure
    .input(z.object({
      transactionId: z.string()
    }))
    .mutation(async ({ input }) => {
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: input.transactionId }
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction non trouvée'
        })
      }

      if (transaction.status !== 'AUTHORIZED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'La transaction doit être autorisée avant capture'
        })
      }

      const updated = await prisma.paymentTransaction.update({
        where: { id: input.transactionId },
        data: {
          status: 'CAPTURED',
          capturedAt: new Date()
        }
      })

      // Audit log
      await prisma.paymentAuditLog.create({
        data: {
          storeId: transaction.storeId,
          transactionId: transaction.id,
          action: 'TRANSACTION_CAPTURED',
          details: { amount: transaction.amount },
          actorType: 'system'
        }
      })

      return updated
    }),

  // Get transaction by ID
  getTransaction: protectedProcedure
    .input(z.object({
      transactionId: z.string()
    }))
    .query(async ({ input }) => {
      return prisma.paymentTransaction.findUnique({
        where: { id: input.transactionId },
        include: {
          refunds: true
        }
      })
    }),

  // List transactions
  listTransactions: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      status: z.enum(['PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'DISPUTED']).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input }) => {
      const where: any = {
        storeId: input.storeId
      }

      if (input.status) where.status = input.status
      if (input.startDate || input.endDate) {
        where.createdAt = {}
        if (input.startDate) where.createdAt.gte = input.startDate
        if (input.endDate) where.createdAt.lte = input.endDate
      }

      const [transactions, total] = await Promise.all([
        prisma.paymentTransaction.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.paymentTransaction.count({ where })
      ])

      return {
        transactions,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit)
        }
      }
    }),

  // =====================
  // REFUNDS
  // =====================

  // Create refund
  createRefund: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
      amount: z.number().positive(),
      reason: z.enum(['CUSTOMER_REQUEST', 'DUPLICATE', 'FRAUDULENT', 'ORDER_CANCELLED', 'PRODUCT_ISSUE', 'OTHER']),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: input.transactionId }
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction non trouvée'
        })
      }

      if (transaction.status !== 'CAPTURED' && transaction.status !== 'PARTIALLY_REFUNDED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Seules les transactions capturées peuvent être remboursées'
        })
      }

      const remainingAmount = transaction.amount - transaction.refundedAmount
      if (input.amount > remainingAmount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Montant max remboursable: ${remainingAmount} ${transaction.currency}`
        })
      }

      // Create refund
      const refund = await prisma.refund.create({
        data: {
          transactionId: input.transactionId,
          refundId: generateId('REF'),
          amount: input.amount,
          reason: input.reason,
          notes: input.notes,
          status: 'PENDING'
        }
      })

      // Update transaction
      const newRefundedAmount = transaction.refundedAmount + input.amount
      const newStatus = newRefundedAmount >= transaction.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED'

      await prisma.paymentTransaction.update({
        where: { id: input.transactionId },
        data: {
          refundedAmount: newRefundedAmount,
          status: newStatus
        }
      })

      // Audit log
      await prisma.paymentAuditLog.create({
        data: {
          storeId: transaction.storeId,
          transactionId: transaction.id,
          action: 'REFUND_INITIATED',
          details: {
            refundId: refund.id,
            amount: input.amount,
            reason: input.reason
          },
          actorType: 'admin',
          actorId: ctx.session.user.id
        }
      })

      return refund
    }),

  // =====================
  // DASHBOARD
  // =====================

  // Get gateway dashboard stats
  getDashboard: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      period: z.enum(['day', 'week', 'month']).default('week')
    }))
    .query(async ({ input }) => {
      const startDate = new Date()
      if (input.period === 'day') {
        startDate.setHours(0, 0, 0, 0)
      } else if (input.period === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else {
        startDate.setMonth(startDate.getMonth() - 1)
      }

      const [
        transactions,
        capturedTransactions,
        refunds,
        disputes
      ] = await Promise.all([
        prisma.paymentTransaction.findMany({
          where: {
            storeId: input.storeId,
            createdAt: { gte: startDate }
          }
        }),
        prisma.paymentTransaction.findMany({
          where: {
            storeId: input.storeId,
            status: 'CAPTURED',
            capturedAt: { gte: startDate }
          }
        }),
        prisma.refund.findMany({
          where: {
            transaction: {
              storeId: input.storeId
            },
            createdAt: { gte: startDate }
          }
        }),
        prisma.dispute.findMany({
          where: {
            storeId: input.storeId,
            createdAt: { gte: startDate }
          }
        })
      ])

      const totalVolume = capturedTransactions.reduce((sum, t) => sum + t.amount, 0)
      const totalFees = capturedTransactions.reduce((sum, t) => sum + t.processingFee, 0)
      const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0)

      return {
        volume: totalVolume,
        transactionCount: capturedTransactions.length,
        averageTransaction: capturedTransactions.length > 0
          ? totalVolume / capturedTransactions.length
          : 0,
        fees: totalFees,
        refunds: totalRefunds,
        refundCount: refunds.length,
        disputes: disputes.length,
        successRate: transactions.length > 0
          ? (capturedTransactions.length / transactions.length) * 100
          : 0,
        byStatus: {
          pending: transactions.filter(t => t.status === 'PENDING').length,
          authorized: transactions.filter(t => t.status === 'AUTHORIZED').length,
          captured: transactions.filter(t => t.status === 'CAPTURED').length,
          failed: transactions.filter(t => t.status === 'FAILED').length,
          refunded: transactions.filter(t => t.status === 'REFUNDED' || t.status === 'PARTIALLY_REFUNDED').length
        }
      }
    })
})
