/**
 * crsdpay tRPC Router
 * API interne pour le système de paiement crsdpay
 */

import { router, protectedProcedure } from '../../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { tokenizeCard, listCustomerCards, deleteCard, setDefaultCard } from '@/lib/crsdpay/tokenization/tokenizer'
import {
  createPaymentIntent,
  confirmPayment,
  capturePayment,
  cancelPayment,
} from '@/lib/crsdpay/core/payment-processor'
import { performFraudCheck } from '@/lib/crsdpay/fraud/fraud-detector'
import { createCryptoPayment, getCryptoPayment, checkCryptoPayment, listCryptoPayments } from '@/lib/crsdpay/crypto/crypto-processor'
import { getExchangeRate, convertFiatToCrypto } from '@/lib/crsdpay/crypto/exchange-rates'
import { performReconciliation } from '@/lib/crsdpay/reconciliation/reconcile'

export const crsdpayRouter = router({
  // ==========================================
  // CONFIGURATION
  // ==========================================

  /**
   * Récupère la configuration crsdpay d'un store
   */
  getConfig: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = await prisma.crsdpayConfig.findUnique({
        where: { storeId: input.storeId },
      })

      return config
    }),

  /**
   * Met à jour la configuration crsdpay
   */
  updateConfig: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        isEnabled: z.boolean().optional(),
        mode: z.enum(['test', 'live']).optional(),
        enabledMethods: z.array(z.string()).optional(),
        require3DS: z.boolean().optional(),
        autoCapture: z.boolean().optional(),
        btcEnabled: z.boolean().optional(),
        ethEnabled: z.boolean().optional(),
        usdtEnabled: z.boolean().optional(),
        lightningEnabled: z.boolean().optional(),
        fraudDetectionEnabled: z.boolean().optional(),
        riskScoreThreshold: z.number().optional(),
        webhookUrl: z.string().optional(),
        webhookSecret: z.string().optional(),
        brandName: z.string().optional(),
        brandLogoUrl: z.string().optional(),
        brandColor: z.string().optional(),
        statementDescriptor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { storeId, ...data } = input

      const config = await prisma.crsdpayConfig.upsert({
        where: { storeId },
        create: {
          storeId,
          ...data,
        },
        update: data,
      })

      return config
    }),

  // ==========================================
  // TOKENIZATION
  // ==========================================

  /**
   * Tokenize une carte
   */
  tokenizeCard: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        customerId: z.string(),
        cardData: z.object({
          number: z.string(),
          expMonth: z.number(),
          expYear: z.number(),
          cvc: z.string(),
          holderName: z.string().optional(),
        }),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const tokenized = await tokenizeCard(input.cardData, {
          customerId: input.customerId,
          storeId: input.storeId,
          isDefault: input.isDefault,
        })

        return {
          success: true,
          data: tokenized,
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }
    }),

  /**
   * Liste les cartes d'un customer
   */
  listCards: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const cards = await listCustomerCards(input.customerId)
      return cards
    }),

  /**
   * Supprime une carte
   */
  deleteCard: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        customerId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const deleted = await deleteCard(input.token, input.customerId)
      return { success: deleted }
    }),

  /**
   * Définit une carte par défaut
   */
  setDefaultCard: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        customerId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await setDefaultCard(input.token, input.customerId)
      return { success }
    }),

  // ==========================================
  // PAYMENTS
  // ==========================================

  /**
   * Crée un payment intent
   */
  createPayment: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        amount: z.number(),
        currency: z.string(),
        paymentMethod: z.enum(['card', 'crypto', 'bank_transfer']),
        cardToken: z.string().optional(),
        customerId: z.string().optional(),
        orderId: z.string().optional(),
        captureMethod: z.enum(['automatic', 'manual']).optional(),
        require3DS: z.boolean().optional(),
        description: z.string().optional(),
        statementDescriptor: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
        customerIP: z.string().optional(),
        userAgent: z.string().optional(),
        deviceFingerprint: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const paymentIntent = await createPaymentIntent(input)
        return {
          success: true,
          data: paymentIntent,
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }
    }),

  /**
   * Confirme un paiement
   */
  confirmPayment: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        cardToken: z.string().optional(),
        customerIP: z.string().optional(),
        userAgent: z.string().optional(),
        deviceFingerprint: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { transactionId, ...options } = input
        const paymentIntent = await confirmPayment(transactionId, options)
        return {
          success: true,
          data: paymentIntent,
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }
    }),

  /**
   * Capture un paiement
   */
  capturePayment: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        amount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const paymentIntent = await capturePayment(input.transactionId, input.amount)
        return {
          success: true,
          data: paymentIntent,
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }
    }),

  /**
   * Annule un paiement
   */
  cancelPayment: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const paymentIntent = await cancelPayment(input.transactionId)
        return {
          success: true,
          data: paymentIntent,
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }
    }),

  /**
   * Récupère une transaction
   */
  getTransaction: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const transaction = await prisma.crsdpayTransaction.findUnique({
        where: { transactionId: input.transactionId },
        include: {
          customer: true,
          card: true,
          refunds: true,
          fraudChecks: true,
        },
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      return transaction
    }),

  /**
   * Liste les transactions d'un store
   */
  listTransactions: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'canceled']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const where: any = {
        storeId: input.storeId,
      }

      if (input.status) {
        where.status = input.status
      }

      const [transactions, total] = await Promise.all([
        prisma.crsdpayTransaction.findMany({
          where,
          include: {
            customer: true,
            card: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.crsdpayTransaction.count({ where }),
      ])

      return {
        data: transactions,
        pagination: {
          total,
          limit: input.limit,
          offset: input.offset,
        },
      }
    }),

  // ==========================================
  // REFUNDS
  // ==========================================

  /**
   * Crée un remboursement
   */
  createRefund: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        amount: z.number().optional(),
        reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer', 'other']).optional(),
        description: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const transaction = await prisma.crsdpayTransaction.findFirst({
        where: {
          transactionId: input.transactionId,
        },
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      if (transaction.status !== 'succeeded') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only refund succeeded transactions',
        })
      }

      const refundAmount = input.amount || transaction.amountCaptured
      const availableForRefund = transaction.amountCaptured - transaction.amountRefunded

      if (refundAmount > availableForRefund) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Refund amount exceeds available amount',
        })
      }

      const crypto = require('crypto')
      const refundId = `crsd_rf_${crypto.randomBytes(16).toString('hex')}`

      const refund = await prisma.crsdpayRefund.create({
        data: {
          transactionId: transaction.id,
          refundId,
          amount: refundAmount,
          currency: transaction.currency,
          reason: input.reason || 'other',
          description: input.description,
          status: 'succeeded',
          metadata: input.metadata,
          processedAt: new Date(),
        },
      })

      // Mettre à jour le montant remboursé de la transaction
      await prisma.crsdpayTransaction.update({
        where: { id: transaction.id },
        data: {
          amountRefunded: {
            increment: refundAmount,
          },
        },
      })

      return {
        success: true,
        data: refund,
      }
    }),

  /**
   * Liste les remboursements d'une transaction
   */
  listRefunds: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const transaction = await prisma.crsdpayTransaction.findFirst({
        where: {
          transactionId: input.transactionId,
        },
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      const refunds = await prisma.crsdpayRefund.findMany({
        where: {
          transactionId: transaction.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return refunds
    }),

  // ==========================================
  // CUSTOMERS
  // ==========================================

  /**
   * Crée ou récupère un customer crsdpay
   */
  getOrCreateCustomer: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        email: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const customer = await prisma.crsdpayCustomer.upsert({
        where: {
          storeId_email: {
            storeId: input.storeId,
            email: input.email,
          },
        },
        create: {
          storeId: input.storeId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          metadata: input.metadata,
        },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          metadata: input.metadata,
        },
      })

      return customer
    }),

  /**
   * Récupère un customer spécifique
   */
  getCustomer: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const customer = await prisma.crsdpayCustomer.findUnique({
        where: { id: input.customerId },
        include: {
          cards: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          _count: {
            select: {
              transactions: true,
              cards: true,
            },
          },
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      return customer
    }),

  /**
   * Liste les customers d'un store
   */
  listCustomers: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const [customers, total] = await Promise.all([
        prisma.crsdpayCustomer.findMany({
          where: {
            storeId: input.storeId,
          },
          include: {
            _count: {
              select: {
                transactions: true,
                cards: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.crsdpayCustomer.count({
          where: {
            storeId: input.storeId,
          },
        }),
      ])

      return {
        data: customers,
        pagination: {
          total,
          limit: input.limit,
          offset: input.offset,
        },
      }
    }),

  // ==========================================
  // ANALYTICS
  // ==========================================

  /**
   * Récupère les statistiques de paiement
   */
  getStats: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: any = {
        storeId: input.storeId,
      }

      if (input.startDate || input.endDate) {
        where.createdAt = {}
        if (input.startDate) where.createdAt.gte = input.startDate
        if (input.endDate) where.createdAt.lte = input.endDate
      }

      const [totalTransactions, succeededTransactions, totalAmount, totalRefunded] =
        await Promise.all([
          prisma.crsdpayTransaction.count({ where }),
          prisma.crsdpayTransaction.count({ where: { ...where, status: 'succeeded' } }),
          prisma.crsdpayTransaction.aggregate({
            where: { ...where, status: 'succeeded' },
            _sum: { amountCaptured: true },
          }),
          prisma.crsdpayTransaction.aggregate({
            where: { ...where, status: 'succeeded' },
            _sum: { amountRefunded: true },
          }),
        ])

      const successRate =
        totalTransactions > 0 ? (succeededTransactions / totalTransactions) * 100 : 0

      return {
        totalTransactions,
        succeededTransactions,
        totalAmount: totalAmount._sum.amountCaptured || 0,
        totalRefunded: totalRefunded._sum.amountRefunded || 0,
        successRate,
      }
    }),

  /**
   * Récupère les données pour les graphiques (revenue, transactions par jour)
   */
  getChartData: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      const transactions = await prisma.crsdpayTransaction.findMany({
        where: {
          storeId: input.storeId,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
          status: true,
          amountCaptured: true,
          currency: true,
        },
      })

      // Group by day
      const dailyData: Record<
        string,
        { date: string; revenue: number; transactions: number; succeeded: number }
      > = {}

      transactions.forEach((t) => {
        const dateKey = t.createdAt.toISOString().split('T')[0]
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { date: dateKey, revenue: 0, transactions: 0, succeeded: 0 }
        }
        dailyData[dateKey].transactions++
        if (t.status === 'succeeded') {
          dailyData[dateKey].revenue += t.amountCaptured
          dailyData[dateKey].succeeded++
        }
      })

      // Fill in missing days with zero values
      const result = []
      for (let i = 0; i < input.days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (input.days - 1 - i))
        const dateKey = date.toISOString().split('T')[0]
        result.push(
          dailyData[dateKey] || { date: dateKey, revenue: 0, transactions: 0, succeeded: 0 }
        )
      }

      return result
    }),

  /**
   * Récupère les statistiques par méthode de paiement
   */
  getPaymentMethodStats: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      const transactions = await prisma.crsdpayTransaction.findMany({
        where: {
          storeId: input.storeId,
          createdAt: {
            gte: startDate,
          },
          status: 'succeeded',
        },
        select: {
          paymentMethod: true,
          amountCaptured: true,
        },
      })

      const methodStats: Record<string, { count: number; amount: number }> = {}

      transactions.forEach((t) => {
        if (!methodStats[t.paymentMethod]) {
          methodStats[t.paymentMethod] = { count: 0, amount: 0 }
        }
        methodStats[t.paymentMethod].count++
        methodStats[t.paymentMethod].amount += t.amountCaptured
      })

      return Object.entries(methodStats).map(([method, stats]) => ({
        method,
        count: stats.count,
        amount: stats.amount,
      }))
    }),

  // ==========================================
  // CRYPTOCURRENCY
  // ==========================================

  /**
   * Récupère le taux de change crypto/fiat
   */
  getExchangeRate: protectedProcedure
    .input(
      z.object({
        cryptocurrency: z.enum(['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'BCH']),
        fiatCurrency: z.string().default('EUR'),
      })
    )
    .query(async ({ input }) => {
      const rate = await getExchangeRate(input.cryptocurrency, input.fiatCurrency)
      return rate
    }),

  /**
   * Convertit un montant fiat en crypto
   */
  convertFiatToCrypto: protectedProcedure
    .input(
      z.object({
        fiatAmount: z.number(),
        fiatCurrency: z.string().default('EUR'),
        cryptocurrency: z.enum(['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'BCH']),
      })
    )
    .query(async ({ input }) => {
      const conversion = await convertFiatToCrypto(
        input.fiatAmount,
        input.fiatCurrency,
        input.cryptocurrency
      )
      return conversion
    }),

  /**
   * Crée un paiement cryptocurrency
   */
  createCryptoPayment: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        cryptocurrency: z.enum(['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'BCH']),
        network: z.enum(['bitcoin', 'ethereum', 'lightning', 'polygon', 'bsc', 'tron']),
        amountFiat: z.number(),
        currency: z.string().default('EUR'),
        orderId: z.string().optional(),
        customerId: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const payment = await createCryptoPayment(input)
        return {
          success: true,
          data: payment,
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }
    }),

  /**
   * Récupère un paiement crypto
   */
  getCryptoPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const payment = await getCryptoPayment(input.paymentId)

      if (!payment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found',
        })
      }

      return payment
    }),

  /**
   * Vérifie le statut d'un paiement crypto sur la blockchain
   */
  checkCryptoPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await checkCryptoPayment(input.paymentId)
        return {
          success: true,
          data: result,
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }
    }),

  /**
   * Liste les paiements crypto d'un store
   */
  listCryptoPayments: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const payments = await listCryptoPayments(input.storeId, input.limit)
      return payments
    }),

  // ==========================================
  // RECONCILIATION
  // ==========================================

  /**
   * Effectue la réconciliation automatique des transactions
   */
  performReconciliation: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await performReconciliation(
          input.storeId,
          input.startDate,
          input.endDate
        )
        return {
          success: true,
          data: result,
        }
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
    }),
})
