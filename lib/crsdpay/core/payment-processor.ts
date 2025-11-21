/**
 * Payment Processor - Coeur du système de paiement crsdpay
 * Gère la création et le traitement des paiements par carte
 */

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import {
  PaymentIntent,
  TransactionStatus,
  CaptureMethod,
  CrsdpayErrorCode,
  ThreeDSStatus,
  PaymentMethod,
} from '../types'
import { getTokenizedCard } from '../tokenization/tokenizer'
import { performFraudCheck } from '../fraud/fraud-detector'

/**
 * Génère un ID de transaction unique
 * Format: crsd_tx_xxxxxxxxxxxxxxxxxxxxxxxx
 */
function generateTransactionId(): string {
  const randomBytes = crypto.randomBytes(24)
  return `crsd_tx_${randomBytes.toString('hex')}`
}

/**
 * Génère un client secret pour le frontend
 * Format: crsd_secret_xxxxxxxxxxxxxxxxxxxxxxxx
 */
function generateClientSecret(): string {
  const randomBytes = crypto.randomBytes(32)
  return `crsd_secret_${randomBytes.toString('hex')}`
}

/**
 * Options pour créer un paiement
 */
export interface CreatePaymentOptions {
  storeId: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  cardToken?: string
  customerId?: string
  orderId?: string
  captureMethod?: CaptureMethod
  require3DS?: boolean
  description?: string
  statementDescriptor?: string
  metadata?: Record<string, any>

  // Anti-fraud data
  customerIP?: string
  userAgent?: string
  deviceFingerprint?: string
}

/**
 * Crée un Payment Intent
 */
export async function createPaymentIntent(
  options: CreatePaymentOptions
): Promise<PaymentIntent> {
  // 1. Valider les paramètres
  if (options.amount <= 0) {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.INVALID_REQUEST,
        message: 'Amount must be greater than 0',
      })
    )
  }

  // 2. Vérifier la configuration du store
  const storeConfig = await prisma.crsdpayConfig.findUnique({
    where: { storeId: options.storeId },
  })

  if (!storeConfig || !storeConfig.isEnabled) {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.INVALID_REQUEST,
        message: 'crsdpay is not enabled for this store',
      })
    )
  }

  // 3. Si un token de carte est fourni, vérifier qu'il existe
  if (options.cardToken) {
    const card = await getTokenizedCard(options.cardToken)
    if (!card) {
      throw new Error(
        JSON.stringify({
          code: CrsdpayErrorCode.CARD_DECLINED,
          message: 'Invalid or expired card token',
        })
      )
    }
  }

  // 4. Générer les identifiants
  const transactionId = generateTransactionId()
  const clientSecret = generateClientSecret()

  // 5. Déterminer si 3DS est requis
  const require3DS = options.require3DS ?? storeConfig.require3DS

  // 6. Déterminer la méthode de capture
  const captureMethod = options.captureMethod ?? (storeConfig.autoCapture ? 'automatic' : 'manual')

  // 7. Créer la transaction
  const transaction = await prisma.crsdpayTransaction.create({
    data: {
      storeId: options.storeId,
      customerId: options.customerId,
      orderId: options.orderId,
      transactionId,
      amount: options.amount,
      currency: options.currency,
      paymentMethod: options.paymentMethod,
      cardId: options.cardToken
        ? (
            await prisma.crsdpayCard.findUnique({
              where: { token: options.cardToken },
            })
          )?.id
        : undefined,
      status: 'pending',
      captureMethod,
      captured: false,
      require3DS,
      description: options.description,
      statementDescriptor: options.statementDescriptor || storeConfig.statementDescriptor,
      metadata: options.metadata,
      customerIP: options.customerIP,
      userAgent: options.userAgent,
      deviceFingerprint: options.deviceFingerprint,
    },
  })

  // 8. Retourner le Payment Intent
  return {
    id: transaction.id,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    status: transaction.status as TransactionStatus,
    captureMethod: transaction.captureMethod as CaptureMethod,
    clientSecret,
    metadata: (transaction.metadata as Record<string, any>) || {},
  }
}

/**
 * Confirme et traite un paiement
 */
export async function confirmPayment(
  transactionId: string,
  options?: {
    cardToken?: string
    customerIP?: string
    userAgent?: string
    deviceFingerprint?: string
  }
): Promise<PaymentIntent> {
  // 1. Récupérer la transaction
  const transaction = await prisma.crsdpayTransaction.findUnique({
    where: { transactionId },
    include: {
      store: {
        include: {
          crsdpayConfig: true,
        },
      },
    },
  })

  if (!transaction) {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.PAYMENT_NOT_FOUND,
        message: 'Transaction not found',
      })
    )
  }

  if (transaction.status !== 'pending') {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.INVALID_REQUEST,
        message: 'Transaction is not pending',
      })
    )
  }

  try {
    // 2. Mettre à jour le status en "processing"
    await prisma.crsdpayTransaction.update({
      where: { id: transaction.id },
      data: { status: 'processing' },
    })

    // 3. Si un nouveau token de carte est fourni, l'associer
    let cardId = transaction.cardId
    if (options?.cardToken) {
      const card = await prisma.crsdpayCard.findUnique({
        where: { token: options.cardToken },
      })
      if (card) {
        cardId = card.id
        await prisma.crsdpayTransaction.update({
          where: { id: transaction.id },
          data: { cardId: card.id },
        })
      }
    }

    // 4. Effectuer les vérifications anti-fraude
    const fraudCheckEnabled = transaction.store.crsdpayConfig?.fraudDetectionEnabled ?? true
    if (fraudCheckEnabled) {
      const fraudResult = await performFraudCheck({
        transactionId: transaction.id,
        amount: transaction.amount,
        customerIP: options?.customerIP || transaction.customerIP || '',
        userAgent: options?.userAgent || transaction.userAgent || '',
        deviceFingerprint: options?.deviceFingerprint || transaction.deviceFingerprint || undefined,
        customerId: transaction.customerId,
      })

      // Si le paiement est bloqué par la détection de fraude
      if (fraudResult.decision === 'decline') {
        await prisma.crsdpayTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'failed',
            fraudStatus: 'block',
            fraudScore: fraudResult.riskScore,
            failureCode: CrsdpayErrorCode.FRAUD_DETECTED,
            failureMessage: 'Payment blocked by fraud detection',
          },
        })

        throw new Error(
          JSON.stringify({
            code: CrsdpayErrorCode.FRAUD_DETECTED,
            message: 'Payment blocked by fraud detection',
          })
        )
      }

      // Si le paiement nécessite une revue manuelle
      if (fraudResult.decision === 'review') {
        await prisma.crsdpayTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'processing',
            fraudStatus: 'review',
            fraudScore: fraudResult.riskScore,
          },
        })
      }
    }

    // 5. Simuler le traitement du paiement
    // En production, ici on intégrerait avec un vrai processeur de paiement
    // Pour l'instant, on simule un paiement réussi

    // 6. Si 3DS est requis, le status reste "processing" en attendant l'authentification
    if (transaction.require3DS) {
      await prisma.crsdpayTransaction.update({
        where: { id: transaction.id },
        data: {
          threeDSStatus: 'required',
        },
      })

      return {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod: transaction.paymentMethod as PaymentMethod,
        status: 'processing',
        captureMethod: transaction.captureMethod as CaptureMethod,
        clientSecret: `crsd_secret_${transactionId}`,
        metadata: (transaction.metadata as Record<string, any>) || {},
      }
    }

    // 7. Paiement réussi
    const updateData: any = {
      status: 'succeeded',
      threeDSStatus: 'not_applicable',
    }

    // Si capture automatique
    if (transaction.captureMethod === 'automatic') {
      updateData.captured = true
      updateData.capturedAt = new Date()
      updateData.amountCaptured = transaction.amount
    }

    const updatedTransaction = await prisma.crsdpayTransaction.update({
      where: { id: transaction.id },
      data: updateData,
    })

    // 8. Créer un événement webhook
    await createWebhookEvent(transaction.storeId, transaction.id, 'payment.succeeded')

    return {
      id: updatedTransaction.id,
      amount: updatedTransaction.amount,
      currency: updatedTransaction.currency,
      paymentMethod: updatedTransaction.paymentMethod as PaymentMethod,
      status: updatedTransaction.status as TransactionStatus,
      captureMethod: updatedTransaction.captureMethod as CaptureMethod,
      clientSecret: `crsd_secret_${transactionId}`,
      metadata: (updatedTransaction.metadata as Record<string, any>) || {},
    }
  } catch (error: any) {
    // En cas d'erreur, mettre le paiement en échec
    await prisma.crsdpayTransaction.update({
      where: { id: transaction.id },
      data: {
        status: 'failed',
        failureCode: error.code || CrsdpayErrorCode.INTERNAL_ERROR,
        failureMessage: error.message || 'Payment processing failed',
      },
    })

    throw error
  }
}

/**
 * Capture un paiement (pour les paiements avec capture manuelle)
 */
export async function capturePayment(
  transactionId: string,
  amount?: number
): Promise<PaymentIntent> {
  const transaction = await prisma.crsdpayTransaction.findUnique({
    where: { transactionId },
  })

  if (!transaction) {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.PAYMENT_NOT_FOUND,
        message: 'Transaction not found',
      })
    )
  }

  if (transaction.status !== 'succeeded') {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.INVALID_REQUEST,
        message: 'Cannot capture a payment that is not succeeded',
      })
    )
  }

  if (transaction.captured) {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.PAYMENT_ALREADY_CAPTURED,
        message: 'Payment already captured',
      })
    )
  }

  const captureAmount = amount || transaction.amount

  if (captureAmount > transaction.amount) {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.INVALID_REQUEST,
        message: 'Capture amount cannot exceed payment amount',
      })
    )
  }

  const updatedTransaction = await prisma.crsdpayTransaction.update({
    where: { id: transaction.id },
    data: {
      captured: true,
      capturedAt: new Date(),
      amountCaptured: captureAmount,
    },
  })

  // Créer un événement webhook
  await createWebhookEvent(transaction.storeId, transaction.id, 'payment.captured')

  return {
    id: updatedTransaction.id,
    amount: updatedTransaction.amount,
    currency: updatedTransaction.currency,
    paymentMethod: updatedTransaction.paymentMethod as PaymentMethod,
    status: updatedTransaction.status as TransactionStatus,
    captureMethod: updatedTransaction.captureMethod as CaptureMethod,
    clientSecret: `crsd_secret_${transactionId}`,
    metadata: (updatedTransaction.metadata as Record<string, any>) || {},
  }
}

/**
 * Annule un paiement
 */
export async function cancelPayment(transactionId: string): Promise<PaymentIntent> {
  const transaction = await prisma.crsdpayTransaction.findUnique({
    where: { transactionId },
  })

  if (!transaction) {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.PAYMENT_NOT_FOUND,
        message: 'Transaction not found',
      })
    )
  }

  if (transaction.captured) {
    throw new Error(
      JSON.stringify({
        code: CrsdpayErrorCode.INVALID_REQUEST,
        message: 'Cannot cancel a captured payment. Use refund instead.',
      })
    )
  }

  const updatedTransaction = await prisma.crsdpayTransaction.update({
    where: { id: transaction.id },
    data: {
      status: 'canceled',
    },
  })

  // Créer un événement webhook
  await createWebhookEvent(transaction.storeId, transaction.id, 'payment.canceled')

  return {
    id: updatedTransaction.id,
    amount: updatedTransaction.amount,
    currency: updatedTransaction.currency,
    paymentMethod: updatedTransaction.paymentMethod as PaymentMethod,
    status: 'canceled',
    captureMethod: updatedTransaction.captureMethod as CaptureMethod,
    clientSecret: `crsd_secret_${transactionId}`,
    metadata: (updatedTransaction.metadata as Record<string, any>) || {},
  }
}

/**
 * Crée un événement webhook
 */
async function createWebhookEvent(
  storeId: string,
  transactionId: string,
  eventType: string
) {
  const config = await prisma.crsdpayConfig.findUnique({
    where: { storeId },
  })

  if (!config || !config.webhookUrl) {
    return
  }

  const eventId = `crsd_evt_${crypto.randomBytes(16).toString('hex')}`

  await prisma.crsdpayWebhookEvent.create({
    data: {
      storeId,
      transactionId,
      eventId,
      eventType,
      webhookUrl: config.webhookUrl,
      status: 'pending',
      payload: {
        eventId,
        type: eventType,
        createdAt: new Date().toISOString(),
      },
    },
  })
}
