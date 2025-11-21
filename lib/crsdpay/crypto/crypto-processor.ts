/**
 * Crypto Payment Processor
 * Gère le cycle de vie complet des paiements cryptocurrency
 */

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { Cryptocurrency, CryptoNetwork, CryptoPaymentRequest, CryptoPaymentResponse } from '../types'
import { generateCryptoAddress, generateQRCode } from './address-generator'
import { convertFiatToCrypto } from './exchange-rates'

/**
 * Crée un paiement cryptocurrency
 */
export async function createCryptoPayment(
  request: CryptoPaymentRequest & { storeId: string; customerId?: string }
): Promise<CryptoPaymentResponse> {
  const {
    storeId,
    cryptocurrency,
    network,
    amountFiat,
    currency,
    orderId,
    customerId,
    metadata,
  } = request

  // 1. Convertir le montant fiat en crypto
  const conversion = await convertFiatToCrypto(amountFiat / 100, currency, cryptocurrency)

  // 2. Générer une adresse de paiement unique
  const { address } = await generateCryptoAddress(cryptocurrency, network, storeId, orderId)

  // 3. Générer le QR code
  const qrCodeUrl = await generateQRCode(address, cryptocurrency, conversion.cryptoAmount)

  // 4. Générer l'ID de paiement
  const paymentId = `crsd_crypto_${crypto.randomBytes(16).toString('hex')}`

  // 5. Calculer l'expiration (15 minutes par défaut)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  // 6. Déterminer le nombre de confirmations requises
  const requiredConfirmations = getRequiredConfirmations(cryptocurrency, network)

  // 7. Créer le paiement en base de données
  const payment = await prisma.crsdpayCryptoPayment.create({
    data: {
      storeId,
      customerId,
      orderId,
      paymentId,
      cryptocurrency,
      network,
      address,
      amount: conversion.cryptoAmount,
      amountFiat,
      currency,
      exchangeRate: conversion.exchangeRate,
      status: 'pending',
      confirmations: 0,
      requiredConfirmations,
      expiresAt,
      qrCodeUrl,
      metadata,
    },
  })

  return {
    id: payment.id,
    paymentId: payment.paymentId,
    cryptocurrency: payment.cryptocurrency as Cryptocurrency,
    network: payment.network as CryptoNetwork,
    address: payment.address,
    amount: payment.amount,
    amountFiat: payment.amountFiat,
    currency: payment.currency,
    exchangeRate: payment.exchangeRate,
    qrCodeUrl: payment.qrCodeUrl || undefined,
    expiresAt: payment.expiresAt,
    status: payment.status as any,
  }
}

/**
 * Détermine le nombre de confirmations requises
 */
function getRequiredConfirmations(cryptocurrency: Cryptocurrency, network: CryptoNetwork): number {
  if (network === 'lightning') {
    return 0 // Instant
  }

  const confirmations: Record<Cryptocurrency, number> = {
    BTC: 3, // 3 confirmations (~30 minutes)
    ETH: 12, // 12 confirmations (~3 minutes)
    USDT: 12, // Dépend du réseau (ETH, TRX, etc.)
    USDC: 12,
    LTC: 6, // 6 confirmations (~15 minutes)
    BCH: 6,
  }

  return confirmations[cryptocurrency] || 3
}

/**
 * Vérifie le paiement sur la blockchain
 *
 * IMPORTANT: En production, intégrer avec:
 * - BlockCypher API
 * - Blockchain.com API
 * - Etherscan API
 * - Ou votre propre node
 */
export async function checkCryptoPayment(paymentId: string): Promise<{
  found: boolean
  confirmations: number
  amount: number
  txHash?: string
  status: 'pending' | 'confirming' | 'confirmed' | 'failed'
}> {
  const payment = await prisma.crsdpayCryptoPayment.findUnique({
    where: { paymentId },
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  // En production, interroger la blockchain
  // Pour l'instant, simuler la vérification
  const blockchainCheck = await queryBlockchain(
    payment.address,
    payment.cryptocurrency as Cryptocurrency,
    payment.network as CryptoNetwork
  )

  if (!blockchainCheck.found) {
    return {
      found: false,
      confirmations: 0,
      amount: 0,
      status: 'pending',
    }
  }

  // Mettre à jour le paiement
  await prisma.crsdpayCryptoPayment.update({
    where: { id: payment.id },
    data: {
      confirmations: blockchainCheck.confirmations,
      txHash: blockchainCheck.txHash,
      status:
        blockchainCheck.confirmations >= payment.requiredConfirmations
          ? 'confirmed'
          : 'confirming',
      confirmedAt:
        blockchainCheck.confirmations >= payment.requiredConfirmations ? new Date() : undefined,
    },
  })

  return {
    found: true,
    confirmations: blockchainCheck.confirmations,
    amount: blockchainCheck.amount,
    txHash: blockchainCheck.txHash,
    status:
      blockchainCheck.confirmations >= payment.requiredConfirmations ? 'confirmed' : 'confirming',
  }
}

/**
 * Interroge la blockchain (simulation)
 */
async function queryBlockchain(
  address: string,
  cryptocurrency: Cryptocurrency,
  network: CryptoNetwork
): Promise<{
  found: boolean
  confirmations: number
  amount: number
  txHash?: string
}> {
  // En production, intégrer avec une vraie API blockchain
  // Exemple pour Bitcoin:
  // const response = await fetch(`https://blockchain.info/rawaddr/${address}`)
  // const data = await response.json()

  // Exemple pour Ethereum:
  // const provider = new ethers.providers.InfuraProvider('mainnet', INFURA_KEY)
  // const balance = await provider.getBalance(address)

  // Pour l'instant, simuler (toujours "not found" pour le développement)
  return {
    found: false,
    confirmations: 0,
    amount: 0,
  }
}

/**
 * Expire les paiements crypto qui ont dépassé leur date limite
 */
export async function expireOldCryptoPayments(): Promise<number> {
  const result = await prisma.crsdpayCryptoPayment.updateMany({
    where: {
      status: {
        in: ['pending', 'confirming'],
      },
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: 'expired',
    },
  })

  return result.count
}

/**
 * Récupère un paiement crypto
 */
export async function getCryptoPayment(paymentId: string): Promise<CryptoPaymentResponse | null> {
  const payment = await prisma.crsdpayCryptoPayment.findUnique({
    where: { paymentId },
  })

  if (!payment) {
    return null
  }

  return {
    id: payment.id,
    paymentId: payment.paymentId,
    cryptocurrency: payment.cryptocurrency as Cryptocurrency,
    network: payment.network as CryptoNetwork,
    address: payment.address,
    amount: payment.amount,
    amountFiat: payment.amountFiat,
    currency: payment.currency,
    exchangeRate: payment.exchangeRate,
    qrCodeUrl: payment.qrCodeUrl || undefined,
    expiresAt: payment.expiresAt,
    status: payment.status as any,
  }
}

/**
 * Liste les paiements crypto d'un store
 */
export async function listCryptoPayments(storeId: string, limit: number = 50) {
  const payments = await prisma.crsdpayCryptoPayment.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      customer: true,
      order: true,
    },
  })

  return payments
}
