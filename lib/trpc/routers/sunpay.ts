/**
 * SunPay tRPC Router
 * API for the GoldenEra Blockchain (GEB) payment system
 */

import { router, publicProcedure, requireStoreAccess } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import {
  createPaymentRequest,
  verifyTransaction,
  getExchangeRate,
} from '@/lib/sunpay/provider'
import { isValidGEBAddress, fiatToSCGE } from '@/lib/sunpay/utils'

export const sunpayRouter = router({
  // ==========================================
  // CONFIGURATION (store owner/member only)
  // ==========================================

  /**
   * Get SunPay configuration for a store
   * Creates a default config if none exists
   */
  getConfig: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ input }) => {
      let config = await prisma.sunPayConfig.findUnique({
        where: { storeId: input.storeId },
      })

      // Create default config if it doesn't exist
      if (!config) {
        config = await prisma.sunPayConfig.create({
          data: {
            storeId: input.storeId,
          },
        })
      }

      return config
    }),

  /**
   * Update SunPay configuration for a store
   */
  updateConfig: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        isEnabled: z.boolean().optional(),
        walletAddress: z.string().nullable().optional(),
        autoConvert: z.boolean().optional(),
        minAmount: z.number().nullable().optional(),
        displayName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { storeId, walletAddress, ...data } = input

      // Validate wallet address if provided
      if (walletAddress && !isValidGEBAddress(walletAddress)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid GoldenEra Blockchain address. Must be 0x followed by 40 hex characters.',
        })
      }

      const config = await prisma.sunPayConfig.upsert({
        where: { storeId },
        create: {
          storeId,
          walletAddress,
          ...data,
        },
        update: {
          walletAddress,
          ...data,
        },
      })

      return config
    }),

  // ==========================================
  // PAYMENTS (public - called by checkout)
  // ==========================================

  /**
   * Create a new SunPay payment
   * Called during checkout to initiate a SCGE payment
   */
  createPayment: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        orderId: z.string().optional(),
        amountFiat: z.number().positive(),
        fiatCurrency: z.string().default('EUR'),
      })
    )
    .mutation(async ({ input }) => {
      // Get store's SunPay config
      const config = await prisma.sunPayConfig.findUnique({
        where: { storeId: input.storeId },
      })

      if (!config || !config.isEnabled) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'SunPay is not enabled for this store',
        })
      }

      if (!config.walletAddress) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Store has not configured a SunPay wallet address',
        })
      }

      // Check minimum amount
      if (config.minAmount && input.amountFiat < config.minAmount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Minimum payment amount is ${config.minAmount} ${input.fiatCurrency}`,
        })
      }

      // Create payment request via provider
      const paymentRequest = await createPaymentRequest({
        amountFiat: input.amountFiat,
        fiatCurrency: input.fiatCurrency,
        merchantWallet: config.walletAddress,
      })

      // Store transaction in database
      const transaction = await prisma.sunPayTransaction.create({
        data: {
          storeId: input.storeId,
          orderId: input.orderId,
          status: 'PENDING',
          amountSCGE: paymentRequest.amountSCGE,
          amountFiat: input.amountFiat,
          fiatCurrency: input.fiatCurrency,
          exchangeRate: paymentRequest.exchangeRate,
          receiverAddress: config.walletAddress,
          expiresAt: paymentRequest.expiresAt,
        },
      })

      return {
        transactionId: transaction.id,
        paymentAddress: paymentRequest.paymentAddress,
        amountSCGE: paymentRequest.amountSCGE,
        exchangeRate: paymentRequest.exchangeRate,
        expiresAt: paymentRequest.expiresAt,
        isMock: paymentRequest.isMock,
      }
    }),

  /**
   * Check the status of a SunPay payment
   */
  checkPaymentStatus: publicProcedure
    .input(
      z.object({
        transactionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const transaction = await prisma.sunPayTransaction.findUnique({
        where: { id: input.transactionId },
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      // If already in a terminal state, return as-is
      if (['CONFIRMED', 'FAILED', 'EXPIRED', 'REFUNDED'].includes(transaction.status)) {
        return {
          id: transaction.id,
          status: transaction.status,
          amountSCGE: transaction.amountSCGE,
          amountFiat: transaction.amountFiat,
          fiatCurrency: transaction.fiatCurrency,
          confirmations: transaction.confirmations,
          txHash: transaction.txHash,
          confirmedAt: transaction.confirmedAt,
        }
      }

      // Check if payment has expired
      if (transaction.expiresAt && new Date() > transaction.expiresAt) {
        const updated = await prisma.sunPayTransaction.update({
          where: { id: transaction.id },
          data: { status: 'EXPIRED' },
        })

        return {
          id: updated.id,
          status: updated.status,
          amountSCGE: updated.amountSCGE,
          amountFiat: updated.amountFiat,
          fiatCurrency: updated.fiatCurrency,
          confirmations: updated.confirmations,
          txHash: updated.txHash,
          confirmedAt: updated.confirmedAt,
        }
      }

      // If we have a txHash, verify it on-chain
      if (transaction.txHash) {
        try {
          const verification = await verifyTransaction(transaction.txHash)

          const updateData: any = {
            confirmations: verification.confirmations,
            blockHeight: verification.blockHeight,
          }

          if (verification.status === 'CONFIRMED' && verification.confirmations >= 6) {
            updateData.status = 'CONFIRMED'
            updateData.confirmedAt = new Date()
          } else if (verification.status === 'FAILED') {
            updateData.status = 'FAILED'
          } else if (verification.confirmations > 0) {
            updateData.status = 'CONFIRMING'
          }

          const updated = await prisma.sunPayTransaction.update({
            where: { id: transaction.id },
            data: updateData,
          })

          return {
            id: updated.id,
            status: updated.status,
            amountSCGE: updated.amountSCGE,
            amountFiat: updated.amountFiat,
            fiatCurrency: updated.fiatCurrency,
            confirmations: updated.confirmations,
            txHash: updated.txHash,
            confirmedAt: updated.confirmedAt,
          }
        } catch {
          // If verification fails, return current state
        }
      }

      return {
        id: transaction.id,
        status: transaction.status,
        amountSCGE: transaction.amountSCGE,
        amountFiat: transaction.amountFiat,
        fiatCurrency: transaction.fiatCurrency,
        confirmations: transaction.confirmations,
        txHash: transaction.txHash,
        confirmedAt: transaction.confirmedAt,
      }
    }),

  // ==========================================
  // TRANSACTIONS (store owner/member only)
  // ==========================================

  /**
   * List SunPay transactions for a store with pagination
   */
  getTransactions: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        status: z.enum(['PENDING', 'CONFIRMING', 'CONFIRMED', 'FAILED', 'EXPIRED', 'REFUNDED']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
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
        prisma.sunPayTransaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.sunPayTransaction.count({ where }),
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
  // STATS (store owner/member only)
  // ==========================================

  /**
   * Get aggregate SunPay statistics for a store
   */
  getStats: requireStoreAccess
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

      const [
        totalTransactions,
        confirmedTransactions,
        volumeSCGE,
        volumeFiat,
      ] = await Promise.all([
        prisma.sunPayTransaction.count({ where }),
        prisma.sunPayTransaction.count({
          where: { ...where, status: 'CONFIRMED' },
        }),
        prisma.sunPayTransaction.aggregate({
          where: { ...where, status: 'CONFIRMED' },
          _sum: { amountSCGE: true },
        }),
        prisma.sunPayTransaction.aggregate({
          where: { ...where, status: 'CONFIRMED' },
          _sum: { amountFiat: true },
          _avg: { amountFiat: true },
        }),
      ])

      return {
        totalTransactions,
        confirmedTransactions,
        totalVolumeSCGE: volumeSCGE._sum.amountSCGE ?? 0,
        totalVolumeFiat: volumeFiat._sum.amountFiat ?? 0,
        averageAmountFiat: volumeFiat._avg.amountFiat ?? 0,
      }
    }),
})
