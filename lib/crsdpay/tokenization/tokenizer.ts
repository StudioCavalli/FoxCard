/**
 * Card Tokenizer - PCI DSS Compliant
 *
 * IMPORTANT: Ce système ne stocke JAMAIS les données complètes de carte.
 * Seuls les tokens sont stockés en base de données.
 *
 * Les données brutes de carte sont uniquement utilisées pendant la tokenization,
 * puis immédiatement détruites de la mémoire.
 */

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { RawCardData, TokenizedCard, CardBrand, CrsdpayErrorCode } from '../types'
import {
  validateCard,
  detectCardBrand,
  getLast4,
  generateCardFingerprint,
  validateExpiry,
} from './card-validator'

/**
 * Génère un token sécurisé pour une carte
 * Format: crsd_card_xxxxxxxxxxxxxxxxxxxxxxxx
 */
function generateSecureToken(): string {
  const randomBytes = crypto.randomBytes(32)
  const token = randomBytes.toString('hex')
  return `crsd_card_${token}`
}

/**
 * Options de tokenization
 */
interface TokenizeOptions {
  customerId: string
  storeId: string
  isDefault?: boolean
}

/**
 * Tokenize une carte bancaire
 *
 * SÉCURITÉ:
 * - Les données brutes ne sont JAMAIS stockées
 * - Seul le token, last4, marque et expiration sont stockés
 * - Les données brutes sont effacées de la mémoire après tokenization
 */
export async function tokenizeCard(
  cardData: RawCardData,
  options: TokenizeOptions
): Promise<TokenizedCard> {
  try {
    // 1. Valider les données de carte
    const validation = validateCard(cardData)
    if (!validation.valid) {
      throw new Error(
        JSON.stringify({
          code: CrsdpayErrorCode.INVALID_CARD_NUMBER,
          errors: validation.errors,
        })
      )
    }

    // 2. Détecter la marque de la carte
    const brand = detectCardBrand(cardData.number)

    // 3. Extraire les informations safe
    const last4 = getLast4(cardData.number)
    const fingerprint = generateCardFingerprint(
      cardData.number,
      cardData.expMonth,
      cardData.expYear
    )

    // 4. Vérifier si cette carte existe déjà (via fingerprint)
    const existingCard = await prisma.crsdpayCard.findFirst({
      where: {
        customerId: options.customerId,
        fingerprint,
      },
    })

    if (existingCard) {
      // Si la carte existe déjà, la réactiver si nécessaire
      if (!existingCard.isActive) {
        await prisma.crsdpayCard.update({
          where: { id: existingCard.id },
          data: { isActive: true },
        })
      }

      return {
        token: existingCard.token,
        brand: existingCard.brand as CardBrand,
        last4: existingCard.last4,
        expMonth: existingCard.expMonth,
        expYear: existingCard.expYear,
        holderName: existingCard.holderName || undefined,
        fingerprint: existingCard.fingerprint || undefined,
        country: existingCard.country || undefined,
      }
    }

    // 5. Générer un token sécurisé
    const token = generateSecureToken()

    // 6. Si isDefault, désactiver les autres cartes par défaut
    if (options.isDefault) {
      await prisma.crsdpayCard.updateMany({
        where: {
          customerId: options.customerId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    // 7. Créer la carte tokenisée dans la base de données
    const tokenizedCard = await prisma.crsdpayCard.create({
      data: {
        customerId: options.customerId,
        token,
        brand,
        last4,
        expMonth: cardData.expMonth,
        expYear: cardData.expYear,
        holderName: cardData.holderName,
        fingerprint,
        isDefault: options.isDefault || false,
        isActive: true,
      },
    })

    // 8. IMPORTANT: Effacer les données brutes de la mémoire
    // @ts-ignore - Overwrite sensitive data
    cardData.number = '0'.repeat(16)
    // @ts-ignore
    cardData.cvc = '0'.repeat(4)

    // 9. Retourner la carte tokenisée (sans données sensibles)
    return {
      token: tokenizedCard.token,
      brand: tokenizedCard.brand as CardBrand,
      last4: tokenizedCard.last4,
      expMonth: tokenizedCard.expMonth,
      expYear: tokenizedCard.expYear,
      holderName: tokenizedCard.holderName || undefined,
      fingerprint: tokenizedCard.fingerprint || undefined,
      country: tokenizedCard.country || undefined,
    }
  } catch (error: any) {
    // Effacer les données sensibles même en cas d'erreur
    // @ts-ignore
    if (cardData.number) cardData.number = '0'.repeat(16)
    // @ts-ignore
    if (cardData.cvc) cardData.cvc = '0'.repeat(4)

    throw error
  }
}

/**
 * Récupère une carte tokenisée (sans données sensibles)
 */
export async function getTokenizedCard(token: string): Promise<TokenizedCard | null> {
  const card = await prisma.crsdpayCard.findUnique({
    where: { token },
  })

  if (!card || !card.isActive) {
    return null
  }

  // Vérifier que la carte n'est pas expirée
  if (!validateExpiry(card.expMonth, card.expYear)) {
    // Désactiver la carte expirée
    await prisma.crsdpayCard.update({
      where: { id: card.id },
      data: { isActive: false },
    })
    return null
  }

  return {
    token: card.token,
    brand: card.brand as CardBrand,
    last4: card.last4,
    expMonth: card.expMonth,
    expYear: card.expYear,
    holderName: card.holderName || undefined,
    fingerprint: card.fingerprint || undefined,
    country: card.country || undefined,
  }
}

/**
 * Liste les cartes d'un customer
 */
export async function listCustomerCards(customerId: string): Promise<TokenizedCard[]> {
  const cards = await prisma.crsdpayCard.findMany({
    where: {
      customerId,
      isActive: true,
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return cards.map((card) => ({
    token: card.token,
    brand: card.brand as CardBrand,
    last4: card.last4,
    expMonth: card.expMonth,
    expYear: card.expYear,
    holderName: card.holderName || undefined,
    fingerprint: card.fingerprint || undefined,
    country: card.country || undefined,
  }))
}

/**
 * Supprime une carte (soft delete)
 */
export async function deleteCard(token: string, customerId: string): Promise<boolean> {
  const card = await prisma.crsdpayCard.findFirst({
    where: {
      token,
      customerId,
    },
  })

  if (!card) {
    return false
  }

  await prisma.crsdpayCard.update({
    where: { id: card.id },
    data: { isActive: false },
  })

  return true
}

/**
 * Définit une carte comme carte par défaut
 */
export async function setDefaultCard(token: string, customerId: string): Promise<boolean> {
  const card = await prisma.crsdpayCard.findFirst({
    where: {
      token,
      customerId,
      isActive: true,
    },
  })

  if (!card) {
    return false
  }

  // Désactiver toutes les autres cartes par défaut
  await prisma.crsdpayCard.updateMany({
    where: {
      customerId,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  })

  // Activer la nouvelle carte par défaut
  await prisma.crsdpayCard.update({
    where: { id: card.id },
    data: { isDefault: true },
  })

  return true
}
